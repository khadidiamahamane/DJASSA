import { db } from '@/lib/db';

export interface GetProductsFilter {
  category?: string | null;
  city?: string | null;
  search?: string | null;
}

export async function getProducts(filter: GetProductsFilter = {}) {
  const whereClause: any = {
    isPublished: true,
  };

  if (filter.category && filter.category !== 'tous') {
    whereClause.category = {
      name: filter.category,
    };
  }

  if (filter.city && filter.city !== 'Toutes les villes') {
    whereClause.city = filter.city;
  }

  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    whereClause.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { city: { contains: q } },
      { vendor: { shopName: { contains: q } } },
    ];
  }

  const products = await db.product.findMany({
    where: whereClause,
    include: {
      category: true,
      vendor: true,
      stock: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return products.map((p) => {
    const qty = p.stock?.quantity ?? 0;
    const reserved = p.stock?.reserved ?? 0;
    const available = Math.max(0, qty - reserved);

    return {
      id: p.id,
      titre: p.name,
      description: p.description || '',
      prixFCFA: p.basePrice,
      categorie: p.category.name as any,
      ville: p.city,
      quartier: p.neighborhood || 'Centre',
      vendeurNom: p.vendor.shopName,
      vendeurTelephone: p.vendor.phone || '',
      vendeurVerifie: p.vendor.status === 'VERIFIED',
      photo: p.image,
      enStock: available > 0,
      quantiteDisponible: qty,
      stockReserve: reserved,
      seuilAlerte: p.stock?.lowAlert ?? 5,
      sku: p.stock?.sku || undefined,
      etat: p.condition as any,
      delaiLivraison: p.deliveryEstimate || 'Livraison rapide disponible',
      estFavori: false,
    };
  });
}

export async function createProduct(input: {
  titre: string;
  description?: string;
  prixFCFA: number;
  categorie: string;
  ville: string;
  quartier?: string;
  vendeurNom?: string;
  vendeurTelephone?: string;
  photo?: string;
  quantiteInitiale: number;
  seuilAlerte?: number;
  sku?: string;
}) {
  return db.$transaction(async (tx) => {
    // 1. Trouver ou créer le vendeur
    let vendor = await tx.vendorProfile.findFirst({
      where: { shopName: input.vendeurNom || 'Mon Commerce' },
    });

    if (!vendor) {
      // Trouver ou créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: `vendeur_${Date.now()}@djassa.ci`,
          name: input.vendeurNom || 'Commerçant DJASSA',
          role: 'VENDOR',
        },
      });

      vendor = await tx.vendorProfile.create({
        data: {
          userId: user.id,
          shopName: input.vendeurNom || 'Mon Commerce',
          shopSlug: `shop-${Date.now()}`,
          phone: input.vendeurTelephone || '+225 07 00 00 00 00',
          city: input.ville,
          address: input.quartier || 'Abidjan',
        },
      });
    }

    // 2. Trouver ou créer la catégorie
    let category = await tx.category.findFirst({
      where: { name: input.categorie },
    });

    if (!category) {
      category = await tx.category.create({
        data: {
          name: input.categorie,
          slug: input.categorie.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
      });
    }

    // 3. Créer le produit
    const slug = `${input.titre.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const product = await tx.product.create({
      data: {
        name: input.titre,
        slug,
        description: input.description,
        basePrice: input.prixFCFA,
        categoryId: category.id,
        vendorId: vendor.id,
        city: input.ville,
        neighborhood: input.quartier || 'Centre',
        image: input.photo || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
      },
    });

    // 4. Créer le stock initial
    const stock = await tx.stock.create({
      data: {
        productId: product.id,
        vendorId: vendor.id,
        sku: input.sku || `SKU-${Date.now().toString().slice(-6)}`,
        quantity: Math.max(0, input.quantiteInitiale),
        reserved: 0,
        lowAlert: input.seuilAlerte || 3,
      },
    });

    // 5. Enregistrer le mouvement initial
    await tx.stockMovement.create({
      data: {
        stockId: stock.id,
        type: 'IN',
        quantity: stock.quantity,
        reason: 'Création du produit & stock initial',
        createdBy: vendor.shopName,
      },
    });

    return {
      id: product.id,
      titre: product.name,
      description: product.description || '',
      prixFCFA: product.basePrice,
      categorie: category.name as any,
      ville: product.city,
      quartier: product.neighborhood || 'Centre',
      vendeurNom: vendor.shopName,
      vendeurTelephone: vendor.phone || '',
      vendeurVerifie: vendor.status === 'VERIFIED',
      photo: product.image,
      enStock: stock.quantity > 0,
      quantiteDisponible: stock.quantity,
      stockReserve: 0,
      seuilAlerte: stock.lowAlert,
      sku: stock.sku || undefined,
      etat: product.condition as any,
      delaiLivraison: product.deliveryEstimate || 'Livraison rapide disponible',
      estFavori: false,
    };
  });
}
