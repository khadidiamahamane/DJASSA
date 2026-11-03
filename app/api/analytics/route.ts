import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/analytics?vendorId=xxx&days=30
 * Retourne les KPIs, série temporelle et top produits d'un vendeur
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') ?? '30')));

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId est requis' }, { status: 400 });
    }

    // Vérifier que le vendeur existe
    const vendor = await db.vendorProfile.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendeur introuvable' }, { status: 404 });
    }

    const now = new Date();
    const startCurrent = new Date(now);
    startCurrent.setDate(startCurrent.getDate() - days);

    const startPrevious = new Date(startCurrent);
    startPrevious.setDate(startPrevious.getDate() - days);

    // --- KPIs période courante ---
    const [currentAgg, previousAgg, currentOrders, allOrders] = await Promise.all([
      db.order.aggregate({
        where: {
          vendorId,
          status: 'Livrée',
          createdAt: { gte: startCurrent },
        },
        _sum: { vendorAmount: true },
        _count: true,
      }),
      db.order.aggregate({
        where: {
          vendorId,
          status: 'Livrée',
          createdAt: { gte: startPrevious, lt: startCurrent },
        },
        _sum: { vendorAmount: true },
        _count: true,
      }),
      // Toutes les commandes de la période (tous statuts)
      db.order.findMany({
        where: {
          vendorId,
          createdAt: { gte: startCurrent },
        },
        select: {
          status: true,
          total: true,
          vendorAmount: true,
          createdAt: true,
          items: {
            select: {
              productId: true,
              quantity: true,
              total: true,
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      // Pour les stats de statut
      db.order.groupBy({
        by: ['status'],
        where: { vendorId, createdAt: { gte: startCurrent } },
        _count: true,
      }),
    ]);

    const currentRevenue = currentAgg._sum.vendorAmount ?? 0;
    const previousRevenue = previousAgg._sum.vendorAmount ?? 0;
    const growthRate =
      previousRevenue === 0
        ? currentRevenue > 0 ? 100 : 0
        : Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);

    // --- Série temporelle (revenu par jour) ---
    const revenueByDay: Record<string, { revenue: number; orders: number }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      revenueByDay[key] = { revenue: 0, orders: 0 };
    }

    for (const order of currentOrders) {
      if (order.status === 'Livrée') {
        const key = order.createdAt.toISOString().split('T')[0];
        if (revenueByDay[key] !== undefined) {
          revenueByDay[key].revenue += order.vendorAmount;
          revenueByDay[key].orders += 1;
        }
      }
    }

    const revenueSeries = Object.entries(revenueByDay).map(([date, v]) => ({
      date,
      revenue: Math.round(v.revenue),
      orders: v.orders,
    }));

    // --- Top produits ---
    const productMap: Record<string, { name: string; units: number; revenue: number }> = {};
    for (const order of currentOrders) {
      if (order.status === 'Livrée') {
        for (const item of order.items) {
          if (!productMap[item.productId]) {
            productMap[item.productId] = { name: item.product.name, units: 0, revenue: 0 };
          }
          productMap[item.productId].units += item.quantity;
          productMap[item.productId].revenue += item.total;
        }
      }
    }

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue) }));

    // --- Répartition des statuts ---
    const statusBreakdown: Record<string, number> = {};
    for (const row of allOrders) {
      statusBreakdown[row.status] = (row._count ?? 0);
    }

    // --- Stock santé ---
    const stockHealth = await db.stock.findMany({
      where: { vendorId },
      select: {
        quantity: true,
        reserved: true,
        lowAlert: true,
        product: { select: { name: true } },
      },
    });

    const stockSummary = {
      total: stockHealth.length,
      outOfStock: stockHealth.filter((s) => Math.max(0, s.quantity - s.reserved) === 0).length,
      lowStock: stockHealth.filter((s) => {
        const avail = Math.max(0, s.quantity - s.reserved);
        return avail > 0 && avail <= s.lowAlert;
      }).length,
      healthy: stockHealth.filter((s) => {
        const avail = Math.max(0, s.quantity - s.reserved);
        return avail > s.lowAlert;
      }).length,
    };

    return NextResponse.json({
      success: true,
      period: { days, startDate: startCurrent.toISOString(), endDate: now.toISOString() },
      kpis: {
        revenue: Math.round(currentRevenue),
        previousRevenue: Math.round(previousRevenue),
        growthRate,
        orders: currentAgg._count,
        avgOrderValue:
          currentAgg._count > 0 ? Math.round(currentRevenue / currentAgg._count) : 0,
      },
      revenueSeries,
      topProducts,
      statusBreakdown,
      stockSummary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors du calcul des analytics', details: error.message },
      { status: 500 }
    );
  }
}
