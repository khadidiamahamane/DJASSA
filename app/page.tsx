'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OngletNavigation, Article, ArticlePanier, DemandeOuCommande, MouvementStock } from '@/types';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { NewProductModal } from '@/components/NewProductModal';
import { MarketplaceView } from '@/views/MarketplaceView';
import { VendorPortalView } from '@/views/VendorPortalView';

export default function HomePage() {
  const [ongletActif, setOngletActif] = useState<OngletNavigation>('accueil');
  const [articles, setArticles] = useState<Article[]>([]);
  const [demandes, setDemandes] = useState<DemandeOuCommande[]>([]);
  const [mouvementsStock, setMouvementsStock] = useState<MouvementStock[]>([]);
  const [articlesPanier, setArticlesPanier] = useState<ArticlePanier[]>([]);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [articleSelectionne, setArticleSelectionne] = useState<Article | null>(null);
  const [modalPublicationOuverte, setModalPublicationOuverte] = useState(false);
  const [villeSelectionnee, setVilleSelectionnee] = useState('Toutes les villes');
  const [chargement, setChargement] = useState(true);

  // 1. Charger les données réelles depuis le backend SQLite / API
  const rechargerDonnees = useCallback(async () => {
    try {
      const [resProducts, resStock, resOrders] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/stock').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
      ]);

      if (resProducts.success) {
        setArticles(resProducts.data);
      }
      if (resStock.success && resStock.recentMovements) {
        setMouvementsStock(resStock.recentMovements);
      }
      if (resOrders.success) {
        setDemandes(resOrders.orders);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données réelles:', err);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    rechargerDonnees();
  }, [rechargerDonnees]);

  // 2. Gestion du Panier (côté client avant commande)
  const handleAjouterAuPanier = (article: Article) => {
    setArticlesPanier((prev) => {
      const existant = prev.find((item) => item.article.id === article.id);
      if (existant) {
        return prev.map((item) =>
          item.article.id === article.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...prev, { article, quantite: 1 }];
    });
  };

  const handleModifierQuantitePanier = (articleId: string, delta: number) => {
    setArticlesPanier((prev) =>
      prev
        .map((item) => {
          if (item.article.id === articleId) {
            const nouvQuantite = item.quantite + delta;
            return nouvQuantite > 0 ? { ...item, quantite: nouvQuantite } : null;
          }
          return item;
        })
        .filter(Boolean) as ArticlePanier[]
    );
  };

  const handleSupprimerArticlePanier = (articleId: string) => {
    setArticlesPanier((prev) => prev.filter((item) => item.article.id !== articleId));
  };

  const handleViderPanier = () => {
    setArticlesPanier([]);
  };

  // Favoris
  const handleBasculerFavori = (articleId: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, estFavori: !a.estFavori } : a))
    );
    if (articleSelectionne && articleSelectionne.id === articleId) {
      setArticleSelectionne((prev) => (prev ? { ...prev, estFavori: !prev.estFavori } : null));
    }
  };

  // 3. Ajout d'un nouveau produit avec persistance BDD réelle
  const handleAjouterNouvelArticle = async (nouvelArticle: Article) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouvelArticle),
      });
      const data = await res.json();
      if (data.success) {
        await rechargerDonnees();
      }
    } catch (e) {
      console.error('Erreur API création produit:', e);
    }
  };

  // 4. Passage de commande avec réservation de stock en BDD
  const handleCreerCommande = async (nouvelleCommande: DemandeOuCommande) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouvelleCommande),
      });
      const data = await res.json();
      if (data.success) {
        handleViderPanier();
        await rechargerDonnees();
      }
    } catch (e) {
      console.error('Erreur API création commande:', e);
    }
  };

  // 5. Modification du statut de commande (mise à jour et déduction stock finale si Livrée)
  const handleModifierStatutDemande = async (
    demandeId: string,
    nouveauStatut: DemandeOuCommande['statut']
  ) => {
    try {
      const res = await fetch(`/api/orders/${demandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nouveauStatut }),
      });
      const data = await res.json();
      if (data.success) {
        await rechargerDonnees();
      }
    } catch (e) {
      console.error('Erreur API statut commande:', e);
    }
  };

  // 6. Modification manuelle de stock en base de données
  const handleModifierQuantiteStock = async (
    articleId: string,
    nouvelleQuantite: number,
    raison?: string
  ) => {
    try {
      const res = await fetch('/api/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: articleId,
          newQuantity: nouvelleQuantite,
          reason: raison,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await rechargerDonnees();
      }
    } catch (e) {
      console.error('Erreur API ajustement stock:', e);
    }
  };

  // 7. Modification du seuil d'alerte en base de données
  const handleModifierSeuilAlerte = async (articleId: string, nouveauSeuil: number) => {
    try {
      const res = await fetch('/api/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: articleId,
          alertThreshold: nouveauSeuil,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await rechargerDonnees();
      }
    } catch (e) {
      console.error('Erreur API seuil alerte:', e);
    }
  };

  const totalArticlesPanier = articlesPanier.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <div className="min-h-screen bg-[#faf9fe] text-slate-900 flex flex-col font-sans antialiased">
      {/* En-tête DJASSA */}
      <Header
        nombrePanier={totalArticlesPanier}
        onChangerOnglet={setOngletActif}
        onChangerVille={setVilleSelectionnee}
        onOuvrirPanier={() => setPanierOuvert(true)}
        onOuvrirPublication={() => setModalPublicationOuverte(true)}
        ongletActif={ongletActif}
        villeSelectionnee={villeSelectionnee}
      />

      {/* Contenu dynamique */}
      <main className="flex-1">
        {chargement ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Connexion à la base de données DJASSA...</p>
          </div>
        ) : ongletActif === 'accueil' || ongletActif === 'recherche' ? (
          <MarketplaceView
            articles={articles}
            onAjouterAuPanier={handleAjouterAuPanier}
            onBasculerFavori={handleBasculerFavori}
            onChangerVille={setVilleSelectionnee}
            onOuvrirPublication={() => setModalPublicationOuverte(true)}
            onSelectionnerArticle={setArticleSelectionne}
            villeSelectionnee={villeSelectionnee}
          />
        ) : (
          <VendorPortalView
            articles={articles}
            demandes={demandes}
            mouvementsStock={mouvementsStock}
            onModifierQuantiteStock={handleModifierQuantiteStock}
            onModifierSeuilAlerte={handleModifierSeuilAlerte}
            onModifierStatutDemande={handleModifierStatutDemande}
            onOuvrirPublication={() => setModalPublicationOuverte(true)}
          />
        )}
      </main>

      {/* Tiroir Panier */}
      <CartDrawer
        articlesPanier={articlesPanier}
        estOuvert={panierOuvert}
        onCreerCommande={handleCreerCommande}
        onFermer={() => setPanierOuvert(false)}
        onModifierQuantite={handleModifierQuantitePanier}
        onSupprimerArticle={handleSupprimerArticlePanier}
        onViderPanier={handleViderPanier}
      />

      {/* Modale Fiche Produit */}
      <ProductDetailModal
        article={articleSelectionne}
        onAjouterAuPanier={handleAjouterAuPanier}
        onBasculerFavori={handleBasculerFavori}
        onFermer={() => setArticleSelectionne(null)}
      />

      {/* Modale Nouvelle Offre & Stock */}
      <NewProductModal
        estOuvert={modalPublicationOuverte}
        onAjouterArticle={handleAjouterNouvelArticle}
        onFermer={() => setModalPublicationOuverte(false)}
      />

      {/* Navigation Mobile Inférieure */}
      <MobileNav
        nombrePanier={totalArticlesPanier}
        onChangerOnglet={setOngletActif}
        onOuvrirPanier={() => setPanierOuvert(true)}
        onOuvrirPublication={() => setModalPublicationOuverte(true)}
        ongletActif={ongletActif}
      />
    </div>
  );
}
