import { db } from './db';

// Types de mouvement de stock (mirrors schema String field)
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVATION' | 'RELEASE';

export interface StockCalculation {
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

/**
 * Calcule la quantité nette disponible d'un article
 */
export function getAvailableStock(quantity: number, reserved: number = 0): number {
  return Math.max(0, quantity - reserved);
}

/**
 * Vérifie si le stock disponible a atteint ou franchi le seuil d'alerte
 */
export function isLowStock(quantity: number, reserved: number = 0, lowAlert: number = 5): boolean {
  const available = getAvailableStock(quantity, reserved);
  return available > 0 && available <= lowAlert;
}

/**
 * Vérifie si le produit est complètement en rupture
 */
export function isOutOfStock(quantity: number, reserved: number = 0): boolean {
  return getAvailableStock(quantity, reserved) === 0;
}

/**
 * Réserve temporairement du stock pour une commande en cours
 */
export async function reserveStockForOrder(
  productId: string,
  quantityToReserve: number,
  orderId: string,
  actorId: string = 'system'
) {
  return db.$transaction(async (tx) => {
    const stock = await tx.stock.findUniqueOrThrow({
      where: { productId },
    });

    const available = getAvailableStock(stock.quantity, stock.reserved);
    if (available < quantityToReserve) {
      throw new Error(`Stock insuffisant : ${available} disponible(s), ${quantityToReserve} demandé(s)`);
    }

    const updated = await tx.stock.update({
      where: { productId },
      data: {
        reserved: { increment: quantityToReserve },
      },
    });

    await tx.stockMovement.create({
      data: {
        stockId: stock.id,
        type: 'RESERVATION',
        quantity: quantityToReserve,
        orderId,
        reason: `Réservation pour commande ${orderId}`,
        createdBy: actorId,
      },
    });

    return updated;
  });
}

/**
 * Confirme la vente et décrémente définitivement le stock (après paiement ou validation)
 */
export async function confirmSaleStock(
  productId: string,
  quantitySold: number,
  orderId: string,
  actorId: string = 'system'
) {
  return db.$transaction(async (tx) => {
    const stock = await tx.stock.findUniqueOrThrow({
      where: { productId },
    });

    const updated = await tx.stock.update({
      where: { productId },
      data: {
        quantity: { decrement: quantitySold },
        reserved: { decrement: quantitySold },
      },
    });

    await tx.stockMovement.create({
      data: {
        stockId: stock.id,
        type: 'OUT',
        quantity: quantitySold,
        orderId,
        reason: `Sortie de stock finale pour commande ${orderId}`,
        createdBy: actorId,
      },
    });

    return updated;
  });
}

/**
 * Libère la réservation si une commande est annulée ou expire
 */
export async function releaseStockReservation(
  productId: string,
  quantityToRelease: number,
  orderId: string,
  actorId: string = 'system'
) {
  return db.$transaction(async (tx) => {
    const stock = await tx.stock.findUniqueOrThrow({
      where: { productId },
    });

    const updated = await tx.stock.update({
      where: { productId },
      data: {
        reserved: { decrement: Math.min(stock.reserved, quantityToRelease) },
      },
    });

    await tx.stockMovement.create({
      data: {
        stockId: stock.id,
        type: 'RELEASE',
        quantity: quantityToRelease,
        orderId,
        reason: `Libération réservation commande annulée ${orderId}`,
        createdBy: actorId,
      },
    });

    return updated;
  });
}
