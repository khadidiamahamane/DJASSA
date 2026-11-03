---
name: stripe-checkout
description: >-
  Use this skill when integrating Stripe payment into DJASSA marketplace orders.
  Triggers on: "intégrer Stripe", "paiement en ligne", "checkout", "Stripe webhook",
  "payment intent", "session de paiement", "confirmer le paiement", "remboursement Stripe",
  or any request about processing payments for marketplace orders. Covers Stripe Checkout
  session creation, webhook handling, stock confirmation, and refund flows.
---

# Stripe Checkout Integration — DJASSA

## Overview
This skill integrates Stripe Checkout into DJASSA. The flow: Cart → Create Order (reserve stock) →
Stripe Session → Payment → Webhook → Confirm Sale + Generate Invoice.

> ⚠️ Always validate amounts server-side. Never trust client-side totals.

## Step 1 — Install & Configure Stripe

```bash
npm install stripe @stripe/stripe-js
```

```typescript
// lib/payments/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});
```

## Step 2 — Create Checkout Session

```typescript
// app/api/payments/stripe/route.ts
import { stripe } from "@/lib/payments/stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();

  // Récupérer la commande depuis la BDD (JAMAIS faire confiance au client pour les montants)
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId, buyerId: session.user.id, status: "PENDING" },
    include: { items: { include: { product: true } } },
  });

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "xof", // Franc CFA
      product_data: {
        name: item.product.name,
        images: item.product.images.slice(0, 1),
      },
      unit_amount: Math.round(item.unitPrice * 100), // Centimes
    },
    quantity: item.quantity,
  }));

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    metadata: { orderId: order.id, userId: session.user.id },
    success_url: `${process.env.NEXTAUTH_URL}/commandes/${orderId}?status=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/panier?status=cancelled`,
  });

  // Associer la session Stripe à la commande
  await db.order.update({
    where: { id: orderId },
    data: { paymentRef: checkoutSession.id, status: "AWAITING_PAYMENT" },
  });

  return Response.json({ url: checkoutSession.url });
}
```

## Step 3 — Webhook Handler (critique)

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from "@/lib/payments/stripe";
import { db } from "@/lib/db";
import { confirmSale } from "@/lib/stock";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId } = session.metadata!;

      const order = await db.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });

      // Confirmer le stock pour chaque item
      for (const item of order.items) {
        await confirmSale(item.productId, item.quantity, orderId, "system");
      }

      // Passer la commande en PAID
      await db.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      // TODO: générer la facture PDF + notifier le vendeur
      break;
    }

    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId } = session.metadata ?? {};
      if (orderId) {
        // Annuler la commande + libérer le stock réservé
        await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
        // TODO: releaseReservation pour chaque item
      }
      break;
    }
  }

  return Response.json({ received: true });
}

// Désactiver le body parser Next.js pour les webhooks Stripe
export const config = { api: { bodyParser: false } };
```

## Step 4 — Tester les Webhooks en Local

```bash
# Installer Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Dans un autre terminal, déclencher un événement test
stripe trigger checkout.session.completed
```

## Step 5 — Bouton de Paiement (Client Component)

```tsx
// components/marketplace/CheckoutButton.tsx
"use client";
import { useState } from "react";

export function CheckoutButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/payments/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const { url } = await res.json();
    window.location.href = url; // Rediriger vers Stripe Checkout
  }

  return (
    <button onClick={handleCheckout} disabled={loading} className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
      {loading ? "Redirection..." : "Payer maintenant"}
    </button>
  );
}
```

## ✅ Validation Checklist
- [ ] La Checkout Session est créée avec les montants de la BDD (pas du client)
- [ ] Le webhook valide la signature Stripe avant traitement
- [ ] `checkout.session.completed` → stock confirmé + commande PAID
- [ ] `checkout.session.expired` → commande CANCELLED + stock libéré
- [ ] Les webhooks Stripe sont testés avec Stripe CLI en local
- [ ] `STRIPE_WEBHOOK_SECRET` est configuré dans `.env.local`
- [ ] La route webhook a `bodyParser: false`
