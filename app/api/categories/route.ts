import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        _count: {
          select: { products: true },
        },
      },
    });

    // Ajouter la catégorie "Tout voir" en tête de liste
    const result = [
      { id: 'tous', name: 'Tout voir', slug: 'tous', icon: 'apps', count: 0 },
      ...categories.map((c) => ({
        id: c.name,
        name: c.name,
        slug: c.slug,
        icon: c.icon || 'category',
        count: c._count.products,
      })),
    ];

    return NextResponse.json({ success: true, categories: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories', details: error.message },
      { status: 500 }
    );
  }
}
