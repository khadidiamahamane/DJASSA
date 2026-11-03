import React, { useState, useMemo } from 'react';
import { Article } from '../types';
import { CATEGORIES_POPULAIRES, FORMATTER_PRIX } from '../data/mockData';

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

  // Filtrage simple, réactif et précis
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
      {/* Toast de confirmation temporaire */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 bg-[#160829] text-white px-4 py-3 rounded-2xl shadow-2xl border border-violet-500/30 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom">
          <span className="material-symbols-outlined text-fuchsia-400 text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO SECTION WAOUH : Moderne, Ambitieuse, Graphique & Chaleureuse */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#180a2e] via-[#240c47] to-[#faf9fe] pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6">
        {/* Halos Lumineux Décoratifs d'Arrière-Plan */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-120 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          {/* Badge Élégant Haute Technologie */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-violet-200 text-xs font-bold shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Boroboroli &bull; Le shopping moderne d'Afrique de l'Ouest</span>
          </div>

          {/* Titre Principal percutant */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Trouvez ce que vous aimez.{' '}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
              Payez en FCFA.
            </span>
          </h1>

          {/* Sous-titre rassurant */}
          <p className="text-sm sm:text-lg text-violet-200/90 max-w-2xl mx-auto font-medium leading-relaxed">
            La marketplace nouvelle génération : découvrez des pépites vérifiées, échangez directement avec les vendeurs et réglez à la livraison.
          </p>

          {/* BARRE DE RECHERCHE FLOTTANTE GLASSMORPHISM PREMIUM */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xl p-2.5 rounded-3xl shadow-2xl shadow-purple-950/25 border border-white/80 flex flex-col sm:flex-row items-center gap-2.5">
              <div className="w-full flex items-center px-3.5 py-2 gap-2.5 text-slate-400">
                <span className="material-symbols-outlined text-violet-600 text-[26px]">search</span>
                <input
                  type="text"
                  placeholder="Que recherchez-vous ? (ordinateur, casque, câble...)"
                  value={rechercheTexte}
                  onChange={(e) => setRechercheTexte(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-slate-900 text-sm sm:text-base font-medium placeholder:text-slate-400"
                />
                {rechercheTexte && (
                  <button
                    onClick={() => setRechercheTexte('')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    type="button"
                    title="Effacer la recherche"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              {/* Bouton de recherche avec dégradé Boroboroli */}
              <button
                onClick={() => {}}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white font-black text-sm shadow-md shadow-violet-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                type="button"
              >
                <span>Rechercher</span>
              </button>
            </div>

            {/* Ville active et déclencheur filtre par prix */}
            <div className="flex items-center justify-between mt-3 px-3 text-xs text-violet-200">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">location_on</span>
                <span>Zone : <strong className="text-white">{villeSelectionnee}</strong></span>
              </div>

              <button
                onClick={() => setAfficherFiltresAvances(!afficherFiltresAvances)}
                className="flex items-center gap-1.5 text-violet-200 hover:text-white font-bold cursor-pointer transition-colors bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>{afficherFiltresAvances ? 'Masquer filtre prix' : 'Filtrer par budget'}</span>
              </button>
            </div>

            {/* Volet Filtre budget */}
            {afficherFiltresAvances && (
              <div className="mt-3 p-4 bg-white/95 backdrop-blur-md border border-violet-200/80 rounded-2xl text-left text-xs space-y-3 shadow-xl animate-in fade-in">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>Budget maximum souhaité :</span>
                  <span className="text-violet-700 text-sm font-black bg-violet-50 px-2.5 py-1 rounded-xl">
                    {FORMATTER_PRIX(prixMaxFCFA)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={prixMaxFCFA}
                  onChange={(e) => setPrixMaxFCFA(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>5 000 FCFA</span>
                  <span>50 000 FCFA</span>
                  <span>100 000 FCFA</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATÉGORIES PRINCIPALES (Pills Modernes Haut de Gamme) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-violet-100/80 shadow-lg shadow-violet-900/5">
          <div className="flex items-center justify-between mb-2.5 px-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-violet-950/70">
              Explorer par univers
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {articlesFiltres.length} offres disponibles
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES_POPULAIRES.map((cat) => {
              const estActif = categorieChoisie === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategorieChoisie(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                    estActif
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 scale-102'
                      : 'bg-violet-50/60 hover:bg-violet-100/70 text-slate-700 border border-violet-100/80'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icone}</span>
                  <span>{cat.nom}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. GRILLE D'OFFRES BOROBOROLI (Élégance, Respiration & Clarté) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {categorieChoisie === 'tous' ? 'Sélection Boroboroli du jour' : categorieChoisie}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {articlesFiltres.length} {articlesFiltres.length > 1 ? 'articles disponibles' : 'article disponible'} &bull; Paiement à la réception
            </p>
          </div>

          {/* Bouton direct pour publier une offre */}
          <button
            onClick={onOuvrirPublication}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-violet-900 hover:text-white bg-violet-100/80 hover:bg-violet-700 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Vendre sur Boroboroli</span>
          </button>
        </div>

        {articlesFiltres.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-violet-100 p-6 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center text-violet-400 mx-auto">
              <span className="material-symbols-outlined text-[32px]">search_off</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">Aucun article ne correspond à votre recherche</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Modifiez vos critères de recherche ou réinitialisez les filtres pour découvrir toutes les offres.
            </p>
            <button
              onClick={() => {
                setRechercheTexte('');
                setCategorieChoisie('tous');
                onChangerVille('Toutes les villes');
                setPrixMaxFCFA(100000);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer shadow-sm"
              type="button"
            >
              Voir toutes les offres Boroboroli
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {articlesFiltres.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectionnerArticle(art)}
                className="bg-white rounded-3xl border border-violet-100/80 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-violet-900/10 hover:border-violet-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                {/* Image & Badges */}
                <div className="relative aspect-4/3 bg-slate-50/70 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    alt={art.titre}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    src={art.photo}
                  />

                  {/* Bouton favori */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBasculerFavori(art.id);
                      notifier(art.estFavori ? 'Retiré de vos favoris' : 'Ajouté à vos favoris Boroboroli !');
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center text-rose-500 hover:scale-110 transition-all cursor-pointer"
                    title="Enregistrer en favori"
                    type="button"
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: art.estFavori ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>

                  {/* Badge de ville */}
                  <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-xs flex items-center gap-1 border border-slate-100">
                    <span className="material-symbols-outlined text-violet-600 text-[14px]">location_on</span>
                    <span className="truncate max-w-[150px]">{art.ville.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Détails Carte */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 block mb-1">
                      {art.categorie}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2 leading-snug">
                      {art.titre}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {art.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                    {/* Prix en FCFA en grand */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                        {FORMATTER_PRIX(art.prixFCFA)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {art.vendeurNom.split(' ')[0]}
                      </span>
                    </div>

                    {/* Bouton d'action clair & moderne */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectionnerArticle(art);
                      }}
                      className="w-full py-2.5 rounded-2xl bg-violet-50 group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white text-violet-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      <span>Voir le détail</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SECTION DE RÉASSURANCE : Pourquoi faire confiance à Boroboroli ? */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 mt-6 border-t border-violet-100">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">security</span>
            <span>La promesse Boroboroli</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Achetez et vendez l'esprit tranquille
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Une plateforme simple pensée pour vous accompagner à chaque étape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-violet-100/90 text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-violet-500/25">
              <span className="material-symbols-outlined text-[28px]">search</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-900">1. Prix transparents en FCFA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consultez des photos réelles et des tarifs nets affichés en FCFA sans surprise ni frais cachés.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-violet-100/90 text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-md shadow-fuchsia-500/25">
              <span className="material-symbols-outlined text-[28px]">forum</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-900">2. Contact direct et réactif</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Appelez le vendeur ou écrivez-lui pour poser vos questions et convenir de l'heure et du lieu de livraison.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-violet-100/90 text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-800 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/25">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-900">3. Paiement à la réception</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspectez soigneusement votre colis avant de régler en espèces ou par Mobile Money (Wave, Orange).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
