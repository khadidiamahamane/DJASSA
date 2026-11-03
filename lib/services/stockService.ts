import { db } from '@/lib/db';

export async function getStockOverview(vendorId?: string) {
  const whereClause = vendorId ? { vendorId } : {};

  const stocks = await db.stock.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          image: true,
        },
      },
      movements: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  const movementsWhere = vendorId ? { stock: { vendorId } } : {};

  const movements = await db.stockMovement.findMany({
    where: movementsWhere,
    include: {
      stock: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  const formattedMovements = movements.map((m) => ({
    id: m.id,
    articleId: m.stock.productId,
    nomArticle: m.stock.product.name,
    type: m.type as any,
    quantite: m.quantity,
    raison: m.reason || 'Mouvement de stock',
    dateHeure: new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(m.createdAt),
  }));

  return {
    stocks: stocks.map((s) => ({
      id: s.id,
      productId: s.productId,
      productName: s.product.name,
      basePrice: s.product.basePrice,
      image: s.product.image,
      sku: s.sku,
      totalQuantity: s.quantity,
      reservedQuantity: s.reserved,
      availableQuantity: Math.max(0, s.quantity - s.reserved),
      lowAlert: s.lowAlert,
      isLowStock: Math.max(0, s.quantity - s.reserved) <= s.lowAlert && Math.max(0, s.quantity - s.reserved) > 0,
      isOutOfStock: Math.max(0, s.quantity - s.reserved) === 0,
      updatedAt: s.updatedAt,
    })),
    movements: formattedMovements,
  };
}

export async function adjustProductStock(
  productId: string,
  newQuantity: number,
  reason: string = 'Ajustement manuel de stock'
) {
  return db.$transaction(async (tx) => {
    const stock = await tx.stock.findUniqueOrThrow({
      where: { productId },
    });

    const diff = newQuantity - stock.quantity;
    const type = diff >= 0 ? 'IN' : 'ADJUSTMENT';

    const updatedStock = await tx.stock.update({
      where: { productId },
      data: {
        quantity: Math.max(0, newQuantity),
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        stockId: stock.id,
        type,
        quantity: Math.abs(diff),
        reason,
        createdBy: 'vendeur',
      },
    });

    return {
      updatedStock,
      movement,
    };
  });
}

export async function updateProductAlertThreshold(productId: string, newLowAlert: number) {
  return db.stock.update({
    where: { productId },
    data: {
      lowAlert: Math.max(1, newLowAlert),
    },
  });
}
