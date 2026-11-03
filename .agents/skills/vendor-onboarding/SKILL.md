---
name: vendor-onboarding
description: >-
  Use this skill when implementing the vendor registration, verification, and onboarding
  flow for DJASSA. Triggers on: "create vendor registration", "vendor signup", "become a
  seller", "vendor verification", "vendor dashboard layout", "protect vendor routes",
  "vendor middleware", or "vendor profile page". Covers the multi-step onboarding form,
  NextAuth role management, middleware route protection, and the vendor dashboard shell.
---

# Vendor Onboarding Flow — DJASSA

## Overview
This skill implements the complete flow for a user to become a verified vendor on DJASSA:
from signup to admin approval and first product creation.

## Step 1 — Add Role to NextAuth Session

```typescript
// lib/auth/config.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.vendorId = user.vendor?.id ?? null;
        token.vendorStatus = user.vendor?.status ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.vendorId = token.vendorId as string | null;
      session.user.vendorStatus = token.vendorStatus as string | null;
      return session;
    },
  },
};
```

## Step 2 — Vendor Route Middleware

```typescript
// middleware.ts (racine du projet)
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isVendorRoute = nextUrl.pathname.startsWith("/vendor");
  const isOnboardingRoute = nextUrl.pathname === "/devenir-vendeur";

  if (isVendorRoute) {
    if (!session) return NextResponse.redirect(new URL("/connexion", nextUrl));
    if (session.user.role !== "VENDOR") return NextResponse.redirect(new URL("/devenir-vendeur", nextUrl));
    if (session.user.vendorStatus !== "VERIFIED") return NextResponse.redirect(new URL("/vendor/pending", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/vendor/:path*", "/devenir-vendeur"],
};
```

## Step 3 — Onboarding Multi-Step Form

Créer `app/(auth)/devenir-vendeur/page.tsx` avec 3 étapes :

**Étape 1 — Infos boutique**
- Nom de la boutique (unique, slugifié automatiquement)
- Description (textarea, max 500 chars)
- Catégorie principale

**Étape 2 — Contact & Localisation**
- Téléphone (format international)
- Adresse complète
- Ville / Pays

**Étape 3 — Paiement**
- IBAN ou numéro Mobile Money
- Confirmation CGU/Politique de confidentialité

```typescript
// app/api/vendor/register/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const vendorSchema = z.object({
  shopName: z.string().min(3).max(60),
  description: z.string().max(500).optional(),
  phone: z.string().min(8),
  address: z.string().min(10),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = vendorSchema.parse(body);
  const slug = data.shopName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const vendor = await db.vendorProfile.create({
    data: {
      userId: session.user.id,
      shopName: data.shopName,
      shopSlug: slug,
      description: data.description,
      phone: data.phone,
      address: data.address,
      status: "PENDING",
    },
  });

  // Mettre à jour le rôle utilisateur
  await db.user.update({ where: { id: session.user.id }, data: { role: "VENDOR" } });

  return Response.json({ vendor });
}
```

## Step 4 — Vendor Dashboard Layout

```typescript
// app/(vendor)/layout.tsx
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { requireVerifiedVendor } from "@/lib/auth/guards";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await requireVerifiedVendor(); // redirige si non autorisé

  return (
    <div className="flex h-screen bg-neutral-950">
      <VendorSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

### Navigation Sidebar Items
- 📊 Dashboard (`/vendor/dashboard`)
- 📦 Produits (`/vendor/products`)
- 🗃️ Stock (`/vendor/stock`)
- 🛒 Commandes (`/vendor/orders`)
- 📈 Analytics (`/vendor/analytics`)
- ⚙️ Paramètres (`/vendor/settings`)

## Step 5 — Admin Validation Endpoint

```typescript
// app/api/admin/vendors/[id]/verify/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Vérifier rôle ADMIN
  // db.vendorProfile.update({ where: { id: params.id }, data: { status: "VERIFIED" } })
  // Envoyer email de confirmation au vendeur (Resend)
}
```

## ✅ Validation Checklist
- [ ] Un user BUYER peut soumettre le formulaire d'onboarding
- [ ] La route `/vendor/dashboard` redirige si non connecté
- [ ] La route `/vendor/dashboard` redirige si statut PENDING
- [ ] Un ADMIN peut valider un vendeur depuis `/admin/vendors`
- [ ] Après validation, le vendeur peut accéder au dashboard
- [ ] L'IBAN n'est jamais renvoyé dans les réponses API
