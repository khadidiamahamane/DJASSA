---
name: bootstrap-marketplace
description: >-
  Use this skill to scaffold the DJASSA Next.js 14 marketplace project from scratch.
  Triggers when the user asks to "initialize the project", "bootstrap", "set up Next.js",
  "create the project structure", or "start the marketplace app". Installs all required
  dependencies, creates the folder structure, configures Tailwind, shadcn/ui, Prisma,
  and NextAuth.js for the DJASSA stack.
---

# Bootstrap DJASSA Marketplace

## Overview
This skill initializes the complete Next.js 14 project for DJASSA with all required
tooling pre-configured. Follow steps in order — each depends on the previous.

## Step 1 — Create Next.js App

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Validate: `package.json` exists and contains `"next": "^14"`.

## Step 2 — Install Core Dependencies

```bash
npm install @prisma/client prisma next-auth @auth/prisma-adapter
npm install zustand @tanstack/react-query zod react-hook-form @hookform/resolvers
npm install lucide-react date-fns clsx tailwind-merge
npm install @upstash/redis @upstash/ratelimit
npm install stripe resend
npm install -D @types/node
```

## Step 3 — Install shadcn/ui

```bash
npx shadcn@latest init
```
When prompted, choose: **Default style**, **Slate base color**, **CSS variables: Yes**.

Then install core components:
```bash
npx shadcn@latest add button card badge table dialog sheet form input label select textarea toast separator skeleton avatar dropdown-menu
```

## Step 4 — Configure Prisma

```bash
npx prisma init --datasource-provider postgresql
```

Then copy the full schema from `.claude/agents/database-modeler.md` into `prisma/schema.prisma`.

## Step 5 — Create Folder Structure

```bash
mkdir -p app/(auth) app/(marketplace) app/(vendor) app/(admin) app/api
mkdir -p components/ui components/marketplace components/vendor components/shared
mkdir -p lib/auth lib/db lib/payments lib/validations
mkdir -p hooks types
```

## Step 6 — Create Environment File

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# Stripe
STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Email (Resend)
RESEND_API_KEY=""
```

## Step 7 — Create lib/db.ts (Prisma Singleton)

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

## Step 8 — Run Dev Server

```bash
npm run dev
```

Validate: browser opens at `http://localhost:3000` without errors.

## ✅ Validation Checklist
- [ ] `npm run dev` starts without errors
- [ ] `.env.local` exists with all required keys
- [ ] `prisma/schema.prisma` contains all DJASSA models
- [ ] `components/ui/` contains shadcn components
- [ ] TypeScript strict mode is enabled in `tsconfig.json`
