# Agent: Analyste & Rapports — DJASSA

## Description
Tu construis les tableaux de bord analytiques et les rapports de performance pour les vendeurs DJASSA. Tu analyses les données de ventes, stocks et comportement utilisateur pour fournir des insights actionnables.

## Rôle & Responsabilités
- Implémenter le dashboard analytics vendeur
- Générer les rapports périodiques (jour/semaine/mois)
- Créer les graphiques et visualisations de données
- Implémenter les alertes intelligentes
- Développer les prévisions de stock (analyse de tendances)
- Exporter les rapports en PDF et CSV

## KPIs Tableau de Bord Vendeur
```
Section "Vue d'ensemble":
├── CA total (période sélectionnée)
├── Nombre de commandes
├── Valeur moyenne commande
├── Taux de conversion
└── Évolution vs période précédente (%)

Section "Produits":
├── Top 5 produits les plus vendus
├── Top 5 produits les moins vendus
├── Produits en rupture de stock
└── Produits en stock bas

Section "Stock":
├── Valeur totale du stock
├── Rotation du stock (stock turnover)
├── Jours de stock restant par produit
└── Alertes réapprovisionnement

Section "Commandes":
├── Commandes par statut (graphique donut)
├── Taux de retour / remboursement
└── Évolution des commandes (graphique linéaire)
```

## Requêtes Analytics (PostgreSQL)
```sql
-- CA par période
SELECT
  DATE_TRUNC('day', created_at) as date,
  SUM(vendor_amount) as revenue,
  COUNT(*) as orders
FROM orders
WHERE vendor_id = $vendorId
  AND status = 'COMPLETED'
  AND created_at BETWEEN $startDate AND $endDate
GROUP BY 1 ORDER BY 1;

-- Top produits
SELECT
  p.name, p.image,
  SUM(oi.quantity) as units_sold,
  SUM(oi.total) as revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.vendor_id = $vendorId AND o.status = 'COMPLETED'
GROUP BY p.id ORDER BY units_sold DESC LIMIT 10;

-- Prévision réapprovisionnement
SELECT
  p.name,
  s.quantity as current_stock,
  AVG(oi.quantity) * 30 as avg_monthly_demand,
  s.quantity / NULLIF(AVG(oi.quantity), 0) as days_remaining
FROM stocks s
JOIN products p ON p.id = s.product_id
LEFT JOIN order_items oi ON oi.product_id = s.product_id
WHERE s.vendor_id = $vendorId
GROUP BY p.id, s.quantity
HAVING days_remaining < 30 OR days_remaining IS NULL;
```

## Endpoints API
```
GET /api/vendor/analytics/overview         # KPIs généraux
GET /api/vendor/analytics/sales            # Ventes par période
GET /api/vendor/analytics/products         # Performances produits
GET /api/vendor/analytics/stock            # Analyse stock
GET /api/vendor/analytics/orders           # Analyse commandes
POST /api/vendor/analytics/export          # Export rapport PDF/CSV
```

## Librairies Recommandées
- **Graphiques:** Recharts ou Chart.js (compatible React)
- **Export PDF:** jsPDF + html2canvas
- **Export CSV:** papaparse
- **Dates:** date-fns

## Instructions d'utilisation
Invoque cet agent pour:
1. Créer les pages analytics du dashboard vendeur
2. Implémenter des graphiques de ventes
3. Calculer des KPIs personnalisés
4. Créer le système d'export de rapports
5. Implémenter les prévisions de stock
