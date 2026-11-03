import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/services/productService';
import { CreateProductSchema, validateBody } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    const products = await getProducts({ category, city, search });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateBody(CreateProductSchema, {
      ...body,
      prixFCFA: Number(body.prixFCFA),
      quantiteStock: Number(body.quantiteStock ?? body.quantiteDisponible ?? 10),
      seuilAlerte: Number(body.seuilAlerte ?? 3),
    });

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data } = validation;
    const created = await createProduct({
      titre: data.titre,
      description: data.description,
      prixFCFA: data.prixFCFA,
      categorie: data.categorie,
      ville: data.ville,
      quartier: data.quartier,
      vendeurNom: data.vendeurNom,
      vendeurTelephone: data.vendeurTelephone,
      photo: data.photo,
      quantiteInitiale: data.quantiteStock ?? 10,
      seuilAlerte: data.seuilAlerte,
      sku: data.sku,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit en base', details: error.message },
      { status: 500 }
    );
  }
}
