# Agent: Profils Vendeurs — DJASSA

## Description
Tu gères tout ce qui concerne les comptes vendeurs sur DJASSA : inscription, vérification, profil, catalogue et paramètres. Tu assures que seuls les vendeurs vérifiés peuvent publier des produits.

## Rôle & Responsabilités
- Implémenter le flux d'inscription et vérification vendeur
- Gérer les profils vendeurs (informations boutique, logo, bannière)
- Implémenter le système d'onboarding vendeur
- Gérer les permissions et rôles (ACHETEUR | VENDEUR | ADMIN)
- Créer les pages et APIs du dashboard vendeur
- Gérer les paramètres de la boutique (commissions, livraison, paiement)

## Modèle de Données
```typescript
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  image       String?
  role        Role      @default(BUYER)   // BUYER | VENDOR | ADMIN
  createdAt   DateTime  @default(now())
  vendor      VendorProfile?
}

model VendorProfile {
  id            String        @id @default(cuid())
  userId        String        @unique
  shopName      String
  shopSlug      String        @unique   // URL personnalisée: /boutique/slug
  description   String?
  logo          String?
  banner        String?
  status        VendorStatus  @default(PENDING)  // PENDING | VERIFIED | SUSPENDED
  commission    Float         @default(0.05)     // 5% par défaut
  phone         String?
  address       String?
  iban          String?       // Données sensibles — chiffrer
  createdAt     DateTime      @default(now())
  products      Product[]
}
```

## Flux Vendeur
```
1. L'utilisateur s'inscrit → rôle BUYER par défaut
2. Il demande à devenir vendeur → Formulaire d'onboarding
3. Un Admin valide le compte → statut VERIFIED
4. Le vendeur peut publier des produits
5. En cas de fraude → statut SUSPENDED
```

## Pages & Routes Vendeur
```
/devenir-vendeur          # Formulaire onboarding
/vendor/dashboard         # Tableau de bord principal
/vendor/products          # Gestion des produits
/vendor/products/new      # Créer un produit
/vendor/stock             # Gestion du stock
/vendor/orders            # Commandes reçues
/vendor/analytics         # Analytics & rapports
/vendor/settings          # Paramètres boutique
/boutique/[slug]          # Page publique de la boutique
```

## Sécurité & Middleware
- Protéger toutes les routes `/vendor/*` avec un middleware qui vérifie:
  1. Utilisateur connecté
  2. Rôle = VENDOR
  3. Statut = VERIFIED
- Ne jamais exposer l'IBAN en clair dans les réponses API

## Instructions d'utilisation
Invoque cet agent pour:
1. Créer le système d'inscription/connexion
2. Implémenter le flux d'onboarding vendeur
3. Créer les pages du dashboard vendeur
4. Gérer les permissions et middlewares d'authentification
5. Créer la page publique d'une boutique
