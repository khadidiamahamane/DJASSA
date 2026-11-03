# 🛒 DJASSA — Marketplace & Gestion de Stock

> Plateforme marketplace multi-vendeurs avec gestion de stock intégrée

---

## 📋 Cahier des Charges

### 1. Présentation du Projet

**Nom du projet :** DJASSA  
**Type :** Application Web — Marketplace Multi-Vendeurs  
**Objectif :** Créer une plateforme marketplace où les vendeurs peuvent gérer leur catalogue produits et leur stock en temps réel, et où les acheteurs peuvent parcourir et commander des produits.

---

### 2. Contexte & Problématique

Les vendeurs indépendants manquent d'outils centralisés pour :
- Gérer leur inventaire en temps réel
- Publier et mettre à jour leurs produits en ligne
- Suivre leurs commandes et flux de stock
- Analyser leurs performances de vente

**DJASSA** répond à ce besoin en proposant une marketplace avec un tableau de bord vendeur complet.

---

### 3. Acteurs du Système

| Acteur | Rôle |
|--------|------|
| **Visiteur** | Parcourir le catalogue, consulter les produits |
| **Acheteur** | Créer un compte, passer des commandes, suivre ses achats |
| **Vendeur** | Gérer son profil, son stock, ses produits et ses commandes |
| **Administrateur** | Modérer la plateforme, valider les vendeurs, gérer les utilisateurs |

---

### 4. Fonctionnalités Principales

#### 4.1 — Authentification & Profils

- [ ] Inscription / Connexion (Email, Google OAuth)
- [ ] Double profil : Acheteur & Vendeur
- [ ] Vérification de compte vendeur (KYC simplifié)
- [ ] Gestion du profil (photo, bio, coordonnées, IBAN)
- [ ] Tableau de bord personnalisé selon le rôle

#### 4.2 — Catalogue Produits

- [ ] Création de fiche produit (nom, description, catégorie, tags, images)
- [ ] Gestion des variantes (taille, couleur, référence SKU)
- [ ] Moteur de recherche avec filtres
- [ ] Système de notation et avis produits
- [ ] Mise en avant produits (promotions, best-sellers)

#### 4.3 — Gestion de Stock

- [ ] Stock en temps réel par produit et variante
- [ ] Seuil d'alerte stock bas configurable
- [ ] Historique des mouvements de stock (entrées/sorties)
- [ ] Import/Export de stock (CSV/Excel)
- [ ] Réapprovisionnement manuel ou automatique

#### 4.4 — Commandes

- [ ] Panier d'achat avec réservation temporaire de stock
- [ ] Tunnel de commande (adresse, paiement, confirmation)
- [ ] Paiement (Stripe / Mobile Money)
- [ ] Suivi de commande en temps réel
- [ ] Facturation automatique (PDF)
- [ ] Gestion des retours et remboursements

#### 4.5 — Analytics & Rapports

- [ ] Dashboard vendeur : CA, commandes, stock, top produits
- [ ] Rapports périodiques (journalier, hebdomadaire, mensuel)
- [ ] Alertes intelligentes (stock critique, baisse de ventes)
- [ ] Prévisions de réapprovisionnement (IA)
- [ ] Export des rapports (PDF, CSV)

#### 4.6 — Notifications

- [ ] Notifications temps réel (in-app)
- [ ] Emails transactionnels
- [ ] Centre de notifications personnalisable

#### 4.7 — Administration

- [ ] Gestion des utilisateurs & rôles
- [ ] Validation/Suspension des comptes vendeurs
- [ ] Modération des produits et avis
- [ ] Gestion des commissions et frais de plateforme

---

### 5. Architecture Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Next.js API Routes / Express |
| **Base de données** | PostgreSQL (Supabase + Prisma ORM) |
| **Auth** | NextAuth.js / Supabase Auth |
| **Stockage fichiers** | Supabase Storage / Cloudinary |
| **Paiements** | Stripe + Mobile Money |
| **Cache** | Redis |
| **Temps réel** | Supabase Realtime / Socket.io |
| **Déploiement** | Vercel (Frontend) + Railway (Backend) |

---

### 6. Phases de Développement

```
Phase 1 — MVP (2 mois)
├── Auth & Profils Vendeur/Acheteur
├── Catalogue Produits (CRUD)
├── Gestion Stock basique
└── Commandes simples

Phase 2 — Beta (1 mois)
├── Paiements intégrés
├── Notifications
├── Analytics Dashboard
└── Recherche avancée

Phase 3 — Production (1 mois)
├── Optimisation performances
├── Multi-entrepôts
├── IA Prévisions Stock
└── PWA Mobile
```

---

### 7. Agents IA du Projet

Voir le dossier `.claude/agents/` pour la définition complète de chaque agent.

| Agent | Fichier | Rôle |
|-------|---------|------|
| Architecte Fullstack | `fullstack-architect.md` | Architecture globale & décisions techniques |
| Gestionnaire de Stock | `stock-manager.md` | Logique métier gestion de stock |
| Profils Vendeurs | `vendor-profile.md` | Gestion profils vendeurs & auth |
| Processeur de Commandes | `order-processor.md` | Traitement commandes & paiements |
| Analyste & Rapports | `analytics-reporter.md` | Analytics & tableaux de bord |
| Designer UI | `ui-designer.md` | Interface utilisateur & composants |
| Modélisateur BDD | `database-modeler.md` | Schéma BDD & migrations |
| Auditeur Sécurité | `security-auditor.md` | Sécurité & protection données |

---

### 8. Critères d'Acceptation

- Code testé (couverture > 80%)
- Documentation technique à jour
- Performance validée (Lighthouse > 90)
- Tests de sécurité passés
- Déploiement staging validé

---

*Document — Version 1.0 — DJASSA 2026*
