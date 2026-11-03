import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const vendors = await db.vendorProfile.findMany({
      where: { status: 'VERIFIED' },
      select: {
        id: true,
        shopName: true,
        shopSlug: true,
        description: true,
        logo: true,
        banner: true,
        status: true,
        phone: true,
        city: true,
        address: true,
        createdAt: true,
        _count: {
          select: { products: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: vendors.length,
      vendors: vendors.map((v) => ({
        ...v,
        productCount: v._count.products,
        orderCount: v._count.orders,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des vendeurs', details: error.message },
      { status: 500 }
    );
  }
}
