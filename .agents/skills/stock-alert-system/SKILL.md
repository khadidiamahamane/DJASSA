---
name: stock-alert-system
description: >-
  Use this skill when implementing the low-stock alert system for DJASSA vendors.
  Triggers on: "stock bas", "alerte stock", "low stock notification", "stock alert",
  "réapprovisionnement automatique", "stock warning", "notify vendor", "stock badge",
  or "stock dashboard alert". Covers real-time alert detection, email notifications
  via Resend, in-app alert banners, and the stock health dashboard widget.
---

# Stock Alert System — DJASSA

## Overview
This skill implements a multi-channel alert system that notifies vendors when
their product stock falls below the configured threshold (`lowAlert`).

## Step 1 — Alert Detection Query

```typescript
// lib/stock/alerts.ts
import { db } from "@/lib/db";

export interface StockAlert {
  productId: string;
  productName: string;
  sku: string | null;
  quantity: number;
  reserved: number;
  available: number;
  lowAlert: number;
  severity: "LOW" | "CRITICAL" | "OUT";
}

export async function getVendorStockAlerts(vendorId: string): Promise<StockAlert[]> {
  const stocks = await db.stock.findMany({
    where: {
      vendorId,
      OR: [
        { quantity: { lte: db.stock.fields.lowAlert } }, // quantity <= lowAlert
      ],
    },
    include: {
      product: { select: { name: true } },
      variant: { select: { sku: true } },
    },
  });

  return stocks
    .map((s) => {
      const available = Math.max(0, s.quantity - s.reserved);
      return {
        productId: s.productId ?? s.variantId ?? "",
        productName: s.product?.name ?? "Variante",
        sku: s.variant?.sku ?? null,
        quantity: s.quantity,
        reserved: s.reserved,
        available,
        lowAlert: s.lowAlert,
        severity: available === 0 ? "OUT" : available <= 2 ? "CRITICAL" : "LOW",
      };
    })
    .filter((s) => s.available <= s.lowAlert);
}
```

## Step 2 — Email Notification (Resend)

```typescript
// lib/stock/notify.ts
import { Resend } from "resend";
import { StockAlert } from "./alerts";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLowStockEmail(vendorEmail: string, vendorName: string, alerts: StockAlert[]) {
  const criticalItems = alerts.filter((a) => a.severity === "OUT" || a.severity === "CRITICAL");
  if (criticalItems.length === 0) return;

  await resend.emails.send({
    from: "DJASSA <alertes@djassa.com>",
    to: vendorEmail,
    subject: `⚠️ ${criticalItems.length} produit(s) en rupture ou stock critique`,
    html: `
      <h2>Alerte Stock — ${vendorName}</h2>
      <p>Les produits suivants nécessitent votre attention :</p>
      <table border="1" cellpadding="8" style="border-collapse:collapse">
        <tr><th>Produit</th><th>Stock dispo</th><th>Seuil</th><th>Statut</th></tr>
        ${criticalItems
          .map(
            (a) => `
          <tr>
            <td>${a.productName}${a.sku ? ` (${a.sku})` : ""}</td>
            <td>${a.available}</td>
            <td>${a.lowAlert}</td>
            <td style="color:${a.severity === "OUT" ? "red" : "orange"}">${a.severity === "OUT" ? "RUPTURE" : "CRITIQUE"}</td>
          </tr>`
          )
          .join("")}
      </table>
      <p><a href="${process.env.NEXTAUTH_URL}/vendor/stock">Gérer mon stock →</a></p>
    `,
  });
}
```

## Step 3 — Cron Job (vérification quotidienne)

```typescript
// app/api/cron/stock-alerts/route.ts
// Protéger avec CRON_SECRET pour Vercel Cron Jobs
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getVendorStockAlerts } from "@/lib/stock/alerts";
import { sendLowStockEmail } from "@/lib/stock/notify";

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendors = await db.vendorProfile.findMany({
    where: { status: "VERIFIED" },
    include: { user: { select: { email: true, name: true } } },
  });

  let notified = 0;
  for (const vendor of vendors) {
    const alerts = await getVendorStockAlerts(vendor.id);
    if (alerts.length > 0) {
      await sendLowStockEmail(vendor.user.email!, vendor.shopName, alerts);
      notified++;
    }
  }

  return Response.json({ success: true, vendorsNotified: notified });
}
```

Ajouter dans `vercel.json` :
```json
{
  "crons": [{ "path": "/api/cron/stock-alerts", "schedule": "0 8 * * *" }]
}
```

## Step 4 — Composant UI AlertBanner

```tsx
// components/vendor/StockAlertBanner.tsx
import { getVendorStockAlerts } from "@/lib/stock/alerts";
import { AlertTriangle, XCircle } from "lucide-react";

export async function StockAlertBanner({ vendorId }: { vendorId: string }) {
  const alerts = await getVendorStockAlerts(vendorId);
  const outOfStock = alerts.filter((a) => a.severity === "OUT").length;
  const critical = alerts.filter((a) => a.severity === "CRITICAL").length;

  if (alerts.length === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
      <AlertTriangle className="h-4 w-4 shrink-0 text-orange-400" />
      <span>
        {outOfStock > 0 && <><span className="font-semibold text-red-400">{outOfStock} produit(s) en rupture</span> · </>}
        {critical > 0 && <><span className="font-semibold">{critical} en stock critique</span> · </>}
        <a href="/vendor/stock" className="underline hover:text-white">Gérer le stock →</a>
      </span>
    </div>
  );
}
```

## Step 5 — Badge Stock dans les Tableaux

```tsx
// components/vendor/StockBadge.tsx
import { cn } from "@/lib/utils";

type StockBadgeProps = { quantity: number; reserved: number; lowAlert: number };

export function StockBadge({ quantity, reserved, lowAlert }: StockBadgeProps) {
  const available = Math.max(0, quantity - reserved);
  const status = available === 0 ? "out" : available <= lowAlert ? "low" : "ok";

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      status === "out" && "bg-red-500/20 text-red-400",
      status === "low" && "bg-orange-500/20 text-orange-400",
      status === "ok"  && "bg-green-500/20 text-green-400"
    )}>
      {status === "out" ? "Rupture" : status === "low" ? `Stock bas (${available})` : available}
    </span>
  );
}
```

## ✅ Validation Checklist
- [ ] `getVendorStockAlerts()` retourne uniquement les produits sous le seuil
- [ ] L'email d'alerte est envoyé avec Resend sans erreur
- [ ] Le cron `/api/cron/stock-alerts` est protégé par `CRON_SECRET`
- [ ] Le `StockAlertBanner` s'affiche dans le dashboard quand il y a des alertes
- [ ] Le `StockBadge` affiche la bonne couleur selon le niveau
- [ ] Le cron est planifié à 8h chaque matin dans `vercel.json`
