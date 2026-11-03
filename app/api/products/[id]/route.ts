import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/products/[id] — Détail d'un produit avec stock
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        vendor: true,
        stock: {
          include: {
            movements: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    const qty = product.stock?.quantity ?? 0;
    const reserved = product.stock?.reserved ?? 0;
    const available = Math.max(0, qty - reserved);

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        titre: product.name,
        description: product.description || '',
        prixFCFA: product.basePrice,
        categorie: product.category.name,
        ville: product.city,
        quartier: product.neighborhood || 'Centre',
        vendeurNom: product.vendor.shopName,
        vendeurTelephone: product.vendor.phone || '',
        vendeurVerifie: product.vendor.status === 'VERIFIED',
        photo: product.image,
        enStock: available > 0,
        quantiteDisponible: qty,
        stockReserve: reserved,
        seuilAlerte: product.stock?.lowAlert ?? 5,
        sku: product.stock?.sku || null,
        etat: product.condition,
        delaiLivraison: product.deliveryEstimate || 'Livraison rapide disponible',
        estFavori: false,
        mouvementsRecents: product.stock?.movements.map((m) => ({
          id: m.id,
          type: m.type,
          quantite: m.quantity,
          raison: m.reason,
          createdAt: m.createdAt,
        })) ?? [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id] — Mise à jour partielle d'un produit
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { titre, description, prixFCFA, ville, quartier, photo, isPublished } = body;

    const updated = await db.product.update({
      where: { id: params.id },
      data: {
        ...(titre !== undefined && { name: titre }),
        ...(description !== undefined && { description }),
        ...(prixFCFA !== undefined && { basePrice: Number(prixFCFA) }),
        ...(ville !== undefined && { city: ville }),
        ...(quartier !== undefined && { neighborhood: quartier }),
        ...(photo !== undefined && { image: photo }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id] — Suppression d'un produit (cascade sur stock + mouvements)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit', details: error.message },
      { status: 500 }
    );
  }
}
