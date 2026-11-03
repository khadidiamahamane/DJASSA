---
name: security-middleware
description: >-
  Use this skill when adding security layers to DJASSA APIs and routes. Triggers on:
  "sécuriser un endpoint", "rate limiting", "validation des inputs", "middleware auth",
  "protéger une route API", "injection SQL", "XSS", "CSRF", "chiffrer des données",
  "audit de sécurité", "permissions RBAC", or "vérifier les droits". Covers input
  validation with Zod, rate limiting with Upstash, RBAC guards, and data encryption.
---

# Security Middleware — DJASSA

## Overview
This skill adds hardened security layers to all DJASSA API routes. Apply in this order:
**Authentication → Authorization (RBAC) → Rate Limiting → Input Validation → Output Sanitization**.

## Step 1 — Universal API Handler Wrapper

Créer un helper qui chaîne automatiquement tous les contrôles de sécurité :

```typescript
// lib/api/handler.ts
import { auth } from "@/lib/auth";
import { ratelimit } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

type HandlerOptions<T> = {
  requireAuth?: boolean;
  requireRoles?: string[];
  requireVendorStatus?: string;
  rateLimit?: boolean;
  schema?: ZodSchema<T>;
};

export function apiHandler<T = unknown>(
  handler: (req: NextRequest, ctx: { session: any; body: T }) => Promise<Response>,
  options: HandlerOptions<T> = {}
) {
  return async (req: NextRequest) => {
    try {
      // 1. Rate Limiting
      if (options.rateLimit !== false) {
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
        const { success } = await ratelimit.limit(ip);
        if (!success) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
      }

      // 2. Authentication
      let session = null;
      if (options.requireAuth) {
        session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // 3. Authorization (RBAC)
      if (options.requireRoles?.length && session) {
        if (!options.requireRoles.includes(session.user.role)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
      if (options.requireVendorStatus && session?.user.vendorStatus !== options.requireVendorStatus) {
        return NextResponse.json({ error: "Vendor not verified" }, { status: 403 });
      }

      // 4. Input Validation
      let body = {} as T;
      if (options.schema && req.method !== "GET") {
        const raw = await req.json();
        const result = options.schema.safeParse(raw);
        if (!result.success) {
          return NextResponse.json({ error: "Validation Error", details: result.error.flatten() }, { status: 422 });
        }
        body = result.data;
      }

      return await handler(req, { session, body });
    } catch (err: any) {
      console.error("[API Error]", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
```

**Utilisation :**
```typescript
// app/api/vendor/stock/route.ts
import { apiHandler } from "@/lib/api/handler";
import { z } from "zod";

const updateStockSchema = z.object({
  quantity: z.number().int().min(0).max(1_000_000),
  reason: z.string().max(200).optional(),
});

export const PUT = apiHandler(
  async (req, { session, body }) => {
    // Logique métier — session et body sont sûrs ici
    return Response.json({ success: true });
  },
  {
    requireAuth: true,
    requireRoles: ["VENDOR"],
    requireVendorStatus: "VERIFIED",
    schema: updateStockSchema,
    rateLimit: true,
  }
);
```

## Step 2 — Rate Limiter (Upstash Redis)

```typescript
// lib/security/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),  // 100 req/min par IP
  analytics: true,
  prefix: "djassa:rl",
});

// Rate limiter strict pour les paiements
export const paymentRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),    // 5 req/min pour paiements
  prefix: "djassa:payment:rl",
});
```

## Step 3 — Chiffrement Données Sensibles (IBAN)

```typescript
// lib/security/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex"); // 64 hex chars = 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, encHex] = ciphertext.split(":");
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}
```

Générer la clé de chiffrement :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → Copier dans ENCRYPTION_KEY dans .env.local
```

## Step 4 — Schémas Zod Communs

```typescript
// lib/validations/common.ts
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const cuidSchema = z.string().cuid();

export const productSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  description: z.string().max(2000).optional(),
  basePrice: z.number().positive().max(10_000_000),
  categoryId: z.string().cuid(),
  images: z.array(z.string().url()).min(1).max(8),
});

export const stockUpdateSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(0).max(999_999),
  lowAlert: z.number().int().min(0).max(1000).optional(),
  reason: z.string().max(200).optional(),
});
```

## Step 5 — Headers de Sécurité (next.config.js)

```javascript
// next.config.js
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' js.stripe.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: *.supabase.co",
      "connect-src 'self' api.stripe.com *.supabase.co",
      "frame-src js.stripe.com",
    ].join("; "),
  },
];

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

## ✅ Validation Checklist
- [ ] `apiHandler` refuse les requêtes non authentifiées sur les routes protégées
- [ ] Un rôle BUYER ne peut pas accéder aux routes `/api/vendor/*`
- [ ] Le rate limiter renvoie 429 après 100 requêtes/minute
- [ ] L'IBAN est stocké chiffré (AES-256-GCM) et jamais retourné en clair
- [ ] Tous les inputs sont validés avec Zod avant traitement
- [ ] Les headers de sécurité sont présents (vérifier avec https://securityheaders.com)
- [ ] Les webhooks Stripe vérifient la signature HMAC
