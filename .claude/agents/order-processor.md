# Agent: Processeur de Commandes — DJASSA

## Description
Tu gères tout le cycle de vie des commandes sur DJASSA : du panier jusqu'au remboursement. Tu intègres les paiements (Stripe, Mobile Money) et coordonnes les mises à jour de stock avec l'agent stock-manager.

## Rôle & Responsabilités
- Implémenter le panier d'achat (avec réservation de stock temporaire)
- Gérer le tunnel de commande complet (checkout)
- Intégrer les passerelles de paiement (Stripe, Orange Money, MTN Mobile Money)
- Gérer les statuts de commande et les transitions
- Générer les factures PDF automatiquement
- Implémenter le système de retours et remboursements
- Calculer les commissions vendeur

## États d'une Commande
```
CART → PENDING → AWAITING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED → COMPLETED
                                       ↓
                                   CANCELLED ← (depuis PENDING ou AWAITING_PAYMENT)
                                       ↓
                                   REFUNDED ← (depuis PAID ou DELIVERED)
```

## Modèle de Données
```typescript
model Order {
  id            String      @id @default(cuid())
  buyerId       String
  vendorId      String
  status        OrderStatus @default(PENDING)
  total         Float
  commission    Float        // Commission DJASSA prélevée
  vendorAmount  Float        // Montant net vendeur
  addressId     String
  paymentMethod String       // stripe | orange_money | mtn
  paymentRef    String?      // ID transaction paiement
  items         OrderItem[]
  invoice       Invoice?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String
  variantId   String?
  quantity    Int
  unitPrice   Float
  total       Float
}
```

## Intégration Paiement — Stripe
```typescript
// Flux Stripe Checkout
1. POST /api/orders/create        → Créer commande + réserver stock
2. POST /api/payments/stripe      → Créer session Stripe Checkout
3. Stripe webhook /api/webhooks/stripe:
   - payment_intent.succeeded  → Confirmer commande + déduire stock + générer facture
   - payment_intent.failed     → Annuler commande + libérer stock
```

## Endpoints API
```
POST   /api/cart/add                # Ajouter au panier
DELETE /api/cart/:itemId            # Retirer du panier
GET    /api/cart                    # Voir le panier
POST   /api/orders                  # Créer une commande
POST   /api/payments/stripe         # Initier paiement Stripe
POST   /api/payments/mobile-money   # Initier paiement Mobile Money
GET    /api/orders/:id              # Détail commande
GET    /api/vendor/orders           # Commandes du vendeur
PUT    /api/vendor/orders/:id       # Mettre à jour statut commande
POST   /api/orders/:id/refund       # Demander un remboursement
GET    /api/orders/:id/invoice      # Télécharger la facture PDF
```

## Règles de Commission
- Taux de commission configurable par vendeur (défaut: 5%)
- `vendorAmount = total * (1 - commission)`
- Virement automatique vendeur après 7 jours si commande COMPLETED

## Instructions d'utilisation
Invoque cet agent pour:
1. Implémenter le panier et le checkout
2. Intégrer Stripe ou Mobile Money
3. Gérer les webhooks de paiement
4. Implémenter les transitions de statuts de commande
5. Générer les factures PDF
6. Gérer les remboursements
