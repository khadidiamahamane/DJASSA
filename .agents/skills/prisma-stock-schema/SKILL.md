---
name: prisma-stock-schema
description: >-
  Use this skill when creating or updating the Prisma schema for DJASSA stock management.
  Triggers on: "update the schema", "add a model", "create migration", "modify stock table",
  "add a field to product", or any request involving Prisma models, relations, or database
  migrations. Covers schema authoring, migrations, index creation, and seed data for
  the Stock, StockMovement, Product, ProductVariant, and related models.
---

# Prisma Stock Schema — DJASSA

## Overview
This skill covers authoring, migrating, and seeding the DJASSA database schema
with a focus on the stock management domain.

## Step 1 — Verify Current Schema

```bash
cat prisma/schema.prisma
```

Read existing models before making changes to avoid breaking relations.

## Step 2 — Core Stock Models to Implement

Ensure these models exist in `prisma/schema.prisma`:

```prisma
model Stock {
  id        String          @id @default(cuid())
  productId String?         @unique
  product   Product?        @relation(fields: [productId], references: [id], onDelete: Cascade)
  variantId String?         @unique
  variant   ProductVariant? @relation(fields: [variantId], references: [id], onDelete: Cascade)
  vendorId  String
  quantity  Int             @default(0)
  reserved  Int             @default(0)
  lowAlert  Int             @default(5)
  movements StockMovement[]
  updatedAt DateTime        @updatedAt

  @@index([vendorId])
}

model StockMovement {
  id        String       @id @default(cuid())
  stockId   String
  stock     Stock        @relation(fields: [stockId], references: [id], onDelete: Cascade)
  type      MovementType
  quantity  Int
  reason    String?
  orderId   String?
  createdBy String
  createdAt DateTime     @default(now())

  @@index([stockId])
  @@index([createdAt])
}

enum MovementType {
  IN           // Réception marchandise
  OUT          // Vente confirmée
  ADJUSTMENT   // Correction manuelle
  RESERVATION  // Stock réservé (commande en attente)
  RELEASE      // Libération réservation (commande annulée)
}
```

## Step 3 — Run Migration

After every schema change:

```bash
# Développement (crée et applique la migration)
npx prisma migrate dev --name <description_courte>

# Exemple:
npx prisma migrate dev --name add_stock_low_alert_field
```

Validate: migration file created in `prisma/migrations/`.

## Step 4 — Regenerate Prisma Client

```bash
npx prisma generate
```

Validate: no TypeScript errors on `import { db } from "@/lib/db"`.

## Step 5 — Critical Business Logic (implement in lib/stock.ts)

```typescript
// lib/stock.ts
import { db } from "@/lib/db";
import { MovementType } from "@prisma/client";

/** Quantité réellement disponible (exclut le stock réservé) */
export function getAvailableQty(stock: { quantity: number; reserved: number }) {
  return Math.max(0, stock.quantity - stock.reserved);
}

/** Réserver du stock pour une commande (transaction atomique) */
export async function reserveStock(productId: string, qty: number, orderId: string, userId: string) {
  return db.$transaction(async (tx) => {
    const stock = await tx.stock.findUniqueOrThrow({ where: { productId } });
    if (getAvailableQty(stock) < qty) throw new Error("INSUFFICIENT_STOCK");

    await tx.stock.update({
      where: { productId },
      data: { reserved: { increment: qty } },
    });
    await tx.stockMovement.create({
      data: { stockId: stock.id, type: MovementType.RESERVATION, quantity: qty, orderId, createdBy: userId },
    });
  });
}

/** Confirmer une vente (après paiement réussi) */
export async function confirmSale(productId: string, qty: number, orderId: string, userId: string) {
  return db.$transaction(async (tx) => {
    const stock = await tx.stock.findUniqueOrThrow({ where: { productId } });
    await tx.stock.update({
      where: { productId },
      data: { quantity: { decrement: qty }, reserved: { decrement: qty } },
    });
    await tx.stockMovement.create({
      data: { stockId: stock.id, type: MovementType.OUT, quantity: qty, orderId, createdBy: userId },
    });
    // Vérifier seuil d'alerte
    const updated = await tx.stock.findUniqueOrThrow({ where: { productId } });
    if (getAvailableQty(updated) <= updated.lowAlert) {
      // TODO: déclencher notification (voir skill stock-alert-system)
    }
  });
}
```

## Step 6 — Seed Data (développement)

```bash
npx prisma db seed
```

Le fichier `prisma/seed.ts` doit créer :
- 1 admin, 3 vendeurs vérifiés, 5 acheteurs
- 10 produits par vendeur avec stock initial
- Quelques commandes et mouvements de stock

## ✅ Validation Checklist
- [ ] `npx prisma migrate status` affiche "Database schema is up to date"
- [ ] `npx prisma studio` montre les données de seed
- [ ] `getAvailableQty` retourne toujours >= 0
- [ ] Les transactions de stock sont atomiques (tester avec concurrence)
- [ ] Les index existent sur `vendorId`, `stockId`, `createdAt`
