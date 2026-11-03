import { db } from '@/lib/db';

export async function getOrders() {
  const orders = await db.order.findMany({
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders.map((o) => ({
    id: o.id,
    numero: o.orderNumber,
    clientNom: o.clientName,
    clientTelephone: o.clientPhone,
    clientVille: o.clientCity,
    articles: o.items.map((i) => ({
      articleId: i.productId,
      titre: i.product.name,
      quantite: i.quantity,
      prixFCFA: i.unitPrice,
    })),
    totalFCFA: o.total,
    dateHeure: new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(o.createdAt),
    statut: o.status as any,
    messageClient: o.customerNote || undefined,
    modePaiement: o.paymentMethod as any,
  }));
}

export async function createOrder(data: {
  clientNom: string;
  clientTelephone: string;
  clientVille: string;
  articles: { articleId?: string; titre: string; quantite: number; prixFCFA: number }[];
  totalFCFA: number;
  modePaiement?: string;
  messageClient?: string;
}) {
  return db.$transaction(async (tx) => {
    // Trouver le vendeur par défaut
    const vendor = await tx.vendorProfile.findFirstOrThrow();
    const orderNumber = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await tx.order.create({
      data: {
        orderNumber,
        vendorId: vendor.id,
        clientName: data.clientNom,
        clientPhone: data.clientTelephone,
        clientCity: data.clientVille,
        paymentMethod: data.modePaiement || 'Espèces à la livraison',
        customerNote: data.messageClient,
        status: 'Nouvelle demande',
        total: data.totalFCFA,
        commission: Math.round(data.totalFCFA * 0.05),
        vendorAmount: Math.round(data.totalFCFA * 0.95),
      },
    });

    // Créer les items de commande et réserver le stock
    for (const item of data.articles) {
      if (item.articleId) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.articleId,
            quantity: item.quantite,
            unitPrice: item.prixFCFA,
            total: item.prixFCFA * item.quantite,
          },
        });

        // Réserver le stock
        const stock = await tx.stock.findUnique({
          where: { productId: item.articleId },
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              reserved: { increment: item.quantite },
            },
          });

          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              type: 'RESERVATION',
              quantity: item.quantite,
              reason: `Réservation commande ${order.orderNumber}`,
              orderId: order.id,
              createdBy: 'client',
            },
          });
        }
      }
    }

    return order;
  });
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    // Si on passe à "Livrée", déduire définitivement le stock réservé
    if (newStatus === 'Livrée' && order.status !== 'Livrée') {
      for (const item of order.items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: { decrement: item.quantity },
              reserved: { decrement: Math.min(stock.reserved, item.quantity) },
            },
          });

          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              type: 'OUT',
              quantity: item.quantity,
              reason: `Sortie de stock finale pour commande ${order.orderNumber}`,
              orderId: order.id,
              createdBy: 'vendeur',
            },
          });
        }
      }
    }

    // Si la commande est annulée, libérer la réservation de stock
    if (newStatus === 'Annulée' && order.status !== 'Annulée') {
      for (const item of order.items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              reserved: { decrement: Math.min(stock.reserved, item.quantity) },
            },
          });

          await tx.stockMovement.create({
            data: {
              stockId: stock.id,
              type: 'RELEASE',
              quantity: item.quantity,
              reason: `Libération réservation commande annulée ${order.orderNumber}`,
              orderId: order.id,
              createdBy: 'vendeur',
            },
          });
        }
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return updated;
  });
}
