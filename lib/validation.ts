import { z } from 'zod';

// ─── Produit ───────────────────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  titre: z.string().min(3, 'Le titre doit faire au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  prixFCFA: z.number().positive('Le prix doit être positif'),
  categorie: z.string().min(1, 'La catégorie est requise'),
  ville: z.string().min(1, 'La ville est requise'),
  quartier: z.string().optional(),
  vendeurNom: z.string().optional(),
  vendeurTelephone: z.string().optional(),
  photo: z.string().url().optional(),
  quantiteStock: z.number().int().min(0).default(10),
  seuilAlerte: z.number().int().min(1).default(3),
  sku: z.string().optional(),
});

export const UpdateProductSchema = z.object({
  titre: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  prixFCFA: z.number().positive().optional(),
  ville: z.string().optional(),
  quartier: z.string().optional(),
  photo: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

// ─── Commande ──────────────────────────────────────────────────────────────
export const OrderItemSchema = z.object({
  articleId: z.string().optional(),
  titre: z.string(),
  quantite: z.number().int().positive(),
  prixFCFA: z.number().positive(),
});

export const CreateOrderSchema = z.object({
  clientNom: z.string().min(2, 'Le nom du client est requis'),
  clientTelephone: z.string().min(8, 'Le numéro de téléphone est requis'),
  clientVille: z.string().min(1, 'La ville est requise'),
  clientAdresse: z.string().optional(),
  articles: z.array(OrderItemSchema).min(1, 'Au moins un article est requis'),
  totalFCFA: z.number().positive(),
  modePaiement: z.string().optional().default('Espèces à la livraison'),
  messageClient: z.string().max(500).optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['Nouvelle demande', 'En préparation', 'Livrée', 'Annulée']),
});

// ─── Stock ─────────────────────────────────────────────────────────────────
export const AdjustStockSchema = z.object({
  productId: z.string().min(1, 'productId est requis'),
  newQuantity: z.number().int().min(0).optional(),
  reason: z.string().max(200).optional(),
  alertThreshold: z.number().int().min(1).max(1000).optional(),
});

// ─── Helper de validation ──────────────────────────────────────────────────
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { error: messages };
  }
  return { data: result.data };
}
