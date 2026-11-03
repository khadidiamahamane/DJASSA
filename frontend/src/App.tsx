/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OngletNavigation, Article, ArticlePanier, DemandeOuCommande } from './types';
import { ARTICLES_INITIAUX, DEMANDES_INITIALES } from './data/mockData';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NewProductModal } from './components/NewProductModal';
import { MarketplaceView } from './views/MarketplaceView';
import { VendorPortalView } from './views/VendorPortalView';
import { BoroboroliLogo } from './components/BoroboroliLogo';

export default function App() {
  const [ongletActif, setOngletActif] = useState<OngletNavigation>('accueil');
  const [articles, setArticles] = useState<Article[]>(ARTICLES_INITIAUX);
  const [demandes, setDemandes] = useState<DemandeOuCommande[]>(DEMANDES_INITIALES);
  const [articlesPanier, setArticlesPanier] = useState<ArticlePanier[]>([]);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [articleSelectionne, setArticleSelectionne] = useState<Article | null>(null);
  const [modalPublicationOuverte, setModalPublicationOuverte] = useState(false);
  const [villeSelectionnee, setVilleSelectionnee] = useState('Toutes les villes');

  // Gestion du Panier
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

  // Ajout d'une nouvelle offre
  const handleAjouterNouvelArticle = (nouvelArticle: Article) => {
    setArticles((prev) => [nouvelArticle, ...prev]);
  };

  // Modification statut demande vendeur
  const handleModifierStatutDemande = (
    demandeId: string,
    nouveauStatut: DemandeOuCommande['statut']
  ) => {
    setDemandes((prev) =>
      prev.map((d) => (d.id === demandeId ? { ...d, statut: nouveauStatut } : d))
    );
  };

  // Basculer disponibilité stock
  const handleBasculerDisponibiliteArticle = (articleId: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, enStock: !a.enStock } : a))
    );
  };

  const totalArticlesPanier = articlesPanier.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <div className="min-h-screen bg-[#faf9fe] text-slate-900 flex flex-col font-sans antialiased">
      {/* En-tête Boroboroli avec sélecteur de ville */}
      <Header
        ongletActif={ongletActif}
        onChangerOnglet={setOngletActif}
        nombrePanier={totalArticlesPanier}
        onOuvrirPanier={() => setPanierOuvert(true)}
        onOuvrirPublication={() => setModalPublicationOuverte(true)}
        villeSelectionnee={villeSelectionnee}
        onChangerVille={setVilleSelectionnee}
      />

      {/* Contenu principal de l'application */}
      <main className="flex-1 w-full">
        {(ongletActif === 'accueil' || ongletActif === 'recherche') && (
          <MarketplaceView
            articles={articles}
            onAjouterAuPanier={handleAjouterAuPanier}
            onBasculerFavori={handleBasculerFavori}
            onSelectionnerArticle={setArticleSelectionne}
            onOuvrirPublication={() => setModalPublicationOuverte(true)}
            villeSelectionnee={villeSelectionnee}
            onChangerVille={setVilleSelectionnee}
          />
        )}

        {ongletActif === 'vendeur' && (
          <VendorPortalView
            articles={articles}
            demandes={demandes}
            onOuvrirPublication={() => setModalPublicationOuverte(true)}
            onModifierStatutDemande={handleModifierStatutDemande}
            onBasculerDisponibiliteArticle={handleBasculerDisponibiliteArticle}
          />
        )}
      </main>

      {/* Pied de page Boroboroli élégant & moderne */}
      <footer className="w-full bg-white border-t border-violet-100 py-10 px-4 sm:px-6 mb-16 lg:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <BoroboroliLogo taille="sm" />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              La marketplace moderne, chaleureuse et sécurisée en Afrique de l'Ouest. Tous les prix en FCFA avec règlement à la livraison.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600">
            <button
              onClick={() => setOngletActif('accueil')}
              className="hover:text-violet-700 transition-colors cursor-pointer"
              type="button"
            >
              Accueil
            </button>
            <button
              onClick={() => setOngletActif('recherche')}
              className="hover:text-violet-700 transition-colors cursor-pointer"
              type="button"
            >
              Rechercher
            </button>
            <button
              onClick={() => setOngletActif('vendeur')}
              className="hover:text-violet-700 transition-colors cursor-pointer"
              type="button"
            >
              Espace Partenaire
            </button>
            <button
              onClick={() => setModalPublicationOuverte(true)}
              className="text-violet-700 hover:text-violet-900 transition-colors cursor-pointer"
              type="button"
            >
              Publier une offre
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-violet-50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>&copy; {new Date().getFullYear()} Boroboroli. Tous droits réservés.</span>
          <span className="flex items-center gap-1.5 font-semibold text-violet-900/70">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500" />
            Conçu pour l'Afrique francophone
          </span>
        </div>
      </footer>

      {/* Barre de navigation mobile inférieure (Smartphone first avec flou d'arrière plan) */}
      <MobileNav
        ongletActif={ongletActif}
        onChangerOnglet={setOngletActif}
        nombrePanier={totalArticlesPanier}
        onOuvrirPanier={() => setPanierOuvert(true)}
        onOuvrirPublication={() => setModalPublicationOuverte(true)}
      />

      {/* Tiroir Panier FCFA avec confirmation de livraison */}
      <CartDrawer
        estOuvert={panierOuvert}
        onFermer={() => setPanierOuvert(false)}
        articlesPanier={articlesPanier}
        onModifierQuantite={handleModifierQuantitePanier}
        onSupprimerArticle={handleSupprimerArticlePanier}
        onViderPanier={handleViderPanier}
      />

      {/* Modal Fiche Produit Claire & Rassurante */}
      <ProductDetailModal
        article={articleSelectionne}
        onFermer={() => setArticleSelectionne(null)}
        onAjouterAuPanier={handleAjouterAuPanier}
        onBasculerFavori={handleBasculerFavori}
      />

      {/* Modal Publier une Offre en FCFA */}
      <NewProductModal
        estOuvert={modalPublicationOuverte}
        onFermer={() => setModalPublicationOuverte(false)}
        onAjouterArticle={handleAjouterNouvelArticle}
      />
    </div>
  );
}
