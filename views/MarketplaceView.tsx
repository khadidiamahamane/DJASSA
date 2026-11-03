'use client';

import React, { useState, useMemo } from 'react';
import { Article } from '@/types';
import { CATEGORIES_POPULAIRES, FORMATTER_PRIX } from '@/lib/mockData';

interface MarketplaceViewProps {
  articles: Article[];
  onAjouterAuPanier: (article: Article) => void;
  onBasculerFavori: (articleId: string) => void;
  onSelectionnerArticle: (article: Article) => void;
  onOuvrirPublication: () => void;
  villeSelectionnee: string;
  onChangerVille: (ville: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  articles,
  onAjouterAuPanier,
  onBasculerFavori,
  onSelectionnerArticle,
  onOuvrirPublication,
  villeSelectionnee,
  onChangerVille,
}) => {
  const [rechercheTexte, setRechercheTexte] = useState('');
  const [categorieChoisie, setCategorieChoisie] = useState('tous');
  const [afficherFiltresAvances, setAfficherFiltresAvances] = useState(false);
  const [prixMaxFCFA, setPrixMaxFCFA] = useState<number>(100000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notifier = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtrage réactif
  const articlesFiltres = useMemo(() => {
    return articles.filter((a) => {
      // Filtre catégorie
      if (categorieChoisie !== 'tous' && a.categorie !== categorieChoisie) {
        return false;
      }
      // Filtre ville
      if (villeSelectionnee !== 'Toutes les villes' && a.ville !== villeSelectionnee) {
        return false;
      }
      // Filtre prix max
      if (a.prixFCFA > prixMaxFCFA) {
        return false;
      }
      // Recherche textuelle
      if (rechercheTexte.trim()) {
        const query = rechercheTexte.toLowerCase();
        const correspond =
          a.titre.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.ville.toLowerCase().includes(query) ||
          a.vendeurNom.toLowerCase().includes(query);
        if (!correspond) return false;
      }
      return true;
    });
  }, [articles, categorieChoisie, villeSelectionnee, prixMaxFCFA, rechercheTexte]);

  return (
    <div className="w-full pb-20">
      {/* Toast de confirmation */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 bg-[#160829] text-white px-4 py-3 rounded-2xl shadow-2xl border border-violet-500/30 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom">
          <span className="material-symbols-outlined text-fuchsia-400 text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO SECTION DJASSA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#180a2e] via-[#240c47] to-[#faf9fe] pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-120 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-violet-200 text-xs font-bold shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>DJASSA &bull; Marketplace & Gestion de Stock en Afrique de l'Ouest</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Achetez & Vendez en direct.{' '}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
              Payez en FCFA.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-violet-200/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Trouvez les meilleures offres de commerçants certifiés et suivez les stocks en temps réel.
          </p>

          {/* Barre de Recherche Flottante */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="bg-white p-2 rounded-3xl shadow-2xl shadow-violet-950/40 border border-violet-100/90 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-3 px-3.5 py-1.5 w-full">
                <span className="material-symbols-outlined text-violet-600 text-[22px]">search</span>
                <input
                  type="text"
                  placeholder="Que cherchez-vous ? (clavier, téléphone, sacoche...)"
                  value={rechercheTexte}
                  onChange={(e) => setRechercheTexte(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                />
                {rechercheTexte && (
                  <button
                    onClick={() => setRechercheTexte('')}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-end px-2 sm:px-0">
                <button
                  onClick={() => setAfficherFiltresAvances(!afficherFiltresAvances)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    afficherFiltresAvances
                      ? 'bg-violet-100 text-violet-900 border border-violet-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  type="button"
                  title="Filtres avancés"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span className="hidden sm:inline">Filtres</span>
                </button>

                <button
                  onClick={onOuvrirPublication}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-violet-500/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Publier</span>
                </button>
              </div>
            </div>

            {/* Filtres avancés dépliables */}
            {afficherFiltresAvances && (
              <div className="mt-3 bg-white p-4 rounded-3xl border border-violet-100 shadow-xl text-left text-xs space-y-3 animate-in fade-in-50">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Prix maximum : {FORMATTER_PRIX(prixMaxFCFA)}</span>
                  <button
                    onClick={() => setPrixMaxFCFA(100000)}
                    className="text-violet-700 text-[11px] hover:underline"
                    type="button"
                  >
                    Réinitialiser
                  </button>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={prixMaxFCFA}
                  onChange={(e) => setPrixMaxFCFA(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATÉGORIES POPULAIRES (Pillules modernes) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white p-2.5 sm:p-3 rounded-3xl border border-violet-100/90 shadow-lg shadow-violet-950/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES_POPULAIRES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategorieChoisie(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categorieChoisie === cat.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/30'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-violet-50/60'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">{cat.icone}</span>
              <span>{cat.nom}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRILLE DE PRODUITS MARKETPLACE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Offres disponibles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {articlesFiltres.length} article(s) trouvé(s) &bull; Stocks vérifiés en direct
            </p>
          </div>

          {villeSelectionnee !== 'Toutes les villes' && (
            <div className="flex items-center gap-1.5 bg-violet-100/80 text-violet-900 px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>{villeSelectionnee}</span>
            </div>
          )}
        </div>

        {articlesFiltres.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-violet-100 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">search_off</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">Aucun produit ne correspond</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Essayez de modifier votre recherche ou d'élargir le filtre de prix et de ville.
            </p>
            <button
              onClick={() => {
                setRechercheTexte('');
                setCategorieChoisie('tous');
                setPrixMaxFCFA(100000);
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors"
              type="button"
            >
              Voir toutes les offres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {articlesFiltres.map((art) => {
              const stockNet = Math.max(0, art.quantiteDisponible - (art.stockReserve ?? 0));
              const estBas = stockNet > 0 && stockNet <= (art.seuilAlerte ?? 5);

              return (
                <div
                  key={art.id}
                  className="group bg-white rounded-3xl border border-violet-100/90 shadow-xs hover:shadow-xl hover:border-violet-200 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Photo & badges */}
                  <div
                    onClick={() => onSelectionnerArticle(art)}
                    className="relative aspect-square bg-slate-50 p-4 flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    <img
                      src={art.photo}
                      alt={art.titre}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge Stock précis */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shadow-xs ${
                          stockNet === 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : estBas
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            stockNet === 0 ? 'bg-rose-500' : estBas ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{stockNet === 0 ? 'Épuisé' : `${stockNet} en stock`}</span>
                      </span>
                    </div>

                    {/* Favori */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBasculerFavori(art.id);
                        notifier(
                          art.estFavori ? 'Retiré de vos favoris' : 'Ajouté à vos favoris'
                        );
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xs text-rose-500 hover:scale-110 transition-transform cursor-pointer"
                      type="button"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: art.estFavori ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  {/* Détails Carte */}
                  <div className="p-3.5 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                        <span className="truncate max-w-[120px]">{art.ville}</span>
                        <span>{art.etat}</span>
                      </div>

                      <h3
                        onClick={() => onSelectionnerArticle(art)}
                        className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 cursor-pointer hover:text-violet-700 transition-colors leading-snug"
                        title={art.titre}
                      >
                        {art.titre}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Prix</span>
                        <span className="text-sm sm:text-base font-black text-slate-950">
                          {FORMATTER_PRIX(art.prixFCFA)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onAjouterAuPanier(art);
                          notifier(`"${art.titre}" ajouté au panier !`);
                        }}
                        disabled={stockNet === 0}
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                          stockNet === 0
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 active:scale-95'
                        }`}
                        type="button"
                        title={stockNet === 0 ? 'Article en rupture' : 'Ajouter au panier'}
                      >
                        <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
