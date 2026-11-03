import { NextRequest, NextResponse } from 'next/server';
import { getStockOverview, adjustProductStock, updateProductAlertThreshold } from '@/lib/services/stockService';
import { AdjustStockSchema, validateBody } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId') || undefined;

    const overview = await getStockOverview(vendorId);

    return NextResponse.json({
      success: true,
      totalProducts: overview.stocks.length,
      alertsCount: overview.stocks.filter((s) => s.isLowStock || s.isOutOfStock).length,
      stock: overview.stocks,
      recentMovements: overview.movements,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données de stock', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateBody(AdjustStockSchema, {
      ...body,
      newQuantity: body.newQuantity !== undefined ? Number(body.newQuantity) : undefined,
      alertThreshold: body.alertThreshold !== undefined ? Number(body.alertThreshold) : undefined,
    });

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { productId, newQuantity, reason, alertThreshold } = validation.data;
    let result: any = {};

    if (newQuantity !== undefined) {
      result = await adjustProductStock(productId, newQuantity, reason);
    }

    if (alertThreshold !== undefined) {
      await updateProductAlertThreshold(productId, alertThreshold);
      result.alertThreshold = alertThreshold;
    }

    return NextResponse.json({
      success: true,
      message: 'Stock mis à jour avec succès en base de données',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du stock', details: error.message },
      { status: 500 }
    );
  }
}
