---
name: vendor-analytics-dashboard
description: >-
  Use this skill when building the vendor analytics dashboard for DJASSA. Triggers on:
  "tableau de bord analytics", "graphique de ventes", "KPI vendeur", "chiffre d affaires",
  "top produits", "rapport de performance", "dashboard vendeur", "statistiques ventes",
  "evolution des commandes", or "export rapport". Covers data fetching queries, Recharts
  graphs, KPI cards, period selector, and CSV/PDF export.
---

# Vendor Analytics Dashboard — DJASSA

## Overview
This skill builds the `/vendor/analytics` page with revenue charts, top products,
stock health, and order analytics. Uses React Server Components for data fetching
and Recharts for visualizations.

## Step 1 — Install Dependencies

```bash
npm install recharts
npm install jspdf html2canvas papaparse
npm install -D @types/papaparse
```

## Step 2 — Analytics Data Layer

```typescript
// lib/analytics/vendor.ts
import { db } from "@/lib/db";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function getRevenueSeries(vendorId: string, days: number) {
  const startDate = subDays(new Date(), days);

  const result = await db.$queryRaw<{ date: Date; revenue: number; orders: number }[]>`
    SELECT
      DATE_TRUNC('day', created_at) as date,
      SUM(vendor_amount)::float as revenue,
      COUNT(*)::int as orders
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND status = 'COMPLETED'
      AND created_at >= ${startDate}
    GROUP BY 1
    ORDER BY 1
  `;
  return result;
}

export async function getTopProducts(vendorId: string, days: number, limit = 5) {
  const startDate = subDays(new Date(), days);
  return db.$queryRaw<{ name: string; units: number; revenue: number }[]>`
    SELECT
      p.name,
      SUM(oi.quantity)::int as units,
      SUM(oi.total)::float as revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.vendor_id = ${vendorId}
      AND o.status = 'COMPLETED'
      AND o.created_at >= ${startDate}
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;
}

export async function getOverviewKPIs(vendorId: string, days: number) {
  const [current, previous] = await Promise.all([
    db.order.aggregate({
      where: { vendorId, status: "COMPLETED", createdAt: { gte: subDays(new Date(), days) } },
      _sum: { vendorAmount: true },
      _count: true,
    }),
    db.order.aggregate({
      where: { vendorId, status: "COMPLETED", createdAt: { gte: subDays(new Date(), days * 2), lt: subDays(new Date(), days) } },
      _sum: { vendorAmount: true },
      _count: true,
    }),
  ]);

  const currentRevenue = current._sum.vendorAmount ?? 0;
  const previousRevenue = previous._sum.vendorAmount ?? 0;
  const growth = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

  return {
    revenue: currentRevenue,
    orders: current._count,
    avgOrderValue: current._count > 0 ? currentRevenue / current._count : 0,
    growth: Math.round(growth),
  };
}
```

## Step 3 — KPI Cards Component

```tsx
// components/vendor/analytics/KPICard.tsx
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  growth?: number;
  icon: React.ReactNode;
}

export function KPICard({ title, value, growth, icon }: KPICardProps) {
  const isPositive = (growth ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{title}</p>
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {growth !== undefined && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(growth)}% vs période précédente
        </p>
      )}
    </div>
  );
}
```

## Step 4 — Revenue Chart (Recharts)

```tsx
// components/vendor/analytics/RevenueChart.tsx
"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 font-semibold text-white">Chiffre d'affaires</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(new Date(d), "dd MMM", { locale: fr })}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v: number) => [`${v.toLocaleString("fr-FR")} FCFA`, "CA"]}
            contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff20", borderRadius: 12 }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## Step 5 — Export CSV

```typescript
// lib/analytics/export.ts
import Papa from "papaparse";

export function exportToCSV(data: object[], filename: string) {
  const csv = Papa.unparse(data, { header: true });
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }); // BOM pour Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}
```

## Step 6 — Page Analytics Complète

```tsx
// app/(vendor)/vendor/analytics/page.tsx
import { auth } from "@/lib/auth";
import { getOverviewKPIs, getRevenueSeries, getTopProducts } from "@/lib/analytics/vendor";
import { KPICard } from "@/components/vendor/analytics/KPICard";
import { RevenueChart } from "@/components/vendor/analytics/RevenueChart";
import { ShoppingCart, TrendingUp, Package, DollarSign } from "lucide-react";

export default async function AnalyticsPage({ searchParams }: { searchParams: { days?: string } }) {
  const session = await auth();
  const vendorId = session!.user.vendorId!;
  const days = parseInt(searchParams.days ?? "30");

  const [kpis, series, topProducts] = await Promise.all([
    getOverviewKPIs(vendorId, days),
    getRevenueSeries(vendorId, days),
    getTopProducts(vendorId, days),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard title="CA Net" value={`${kpis.revenue.toLocaleString()} FCFA`} growth={kpis.growth} icon={<DollarSign />} />
        <KPICard title="Commandes" value={kpis.orders.toString()} icon={<ShoppingCart />} />
        <KPICard title="Panier moyen" value={`${Math.round(kpis.avgOrderValue).toLocaleString()} FCFA`} icon={<TrendingUp />} />
        <KPICard title="Top produit" value={topProducts[0]?.name ?? "—"} icon={<Package />} />
      </div>
      <RevenueChart data={series.map((s) => ({ ...s, date: s.date.toISOString() }))} />
    </div>
  );
}
```

## ✅ Validation Checklist
- [ ] Les requêtes SQL retournent des données correctes (tester avec Prisma Studio)
- [ ] Le graphique Recharts s'affiche sans erreur côté client
- [ ] Les KPI cards affichent la variation vs période précédente
- [ ] Le sélecteur de période (7j / 30j / 90j) filtre les données
- [ ] L'export CSV génère un fichier avec BOM Excel
- [ ] La page charge en < 1.5s (Server Components + mise en cache)
