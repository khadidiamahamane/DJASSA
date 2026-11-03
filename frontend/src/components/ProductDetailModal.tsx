import React, { useState } from 'react';
import { Article } from '../types';
import { FORMATTER_PRIX } from '../data/mockData';

interface ProductDetailModalProps {
  article: Article | null;
  onFermer: () => void;
  onAjouterAuPanier: (article: Article) => void;
  onBasculerFavori: (articleId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  article,
  onFermer,
  onAjouterAuPanier,
  onBasculerFavori,
}) => {
  const [afficherNumero, setAfficherNumero] = useState(false);
  const [confirmationAjout, setConfirmationAjout] = useState(false);

  if (!article) return null;

  const handleAjouter = () => {
    onAjouterAuPanier(article);
    setConfirmationAjout(true);
    setTimeout(() => setConfirmationAjout(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-violet-100 my-auto animate-in zoom-in-95 duration-200">
        {/* Bouton Fermer */}
        <button
          onClick={onFermer}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-violet-50 text-slate-700 flex items-center justify-center shadow-md transition-all cursor-pointer border border-slate-100"
          type="button"
          title="Fermer"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        {/* 1. Photo de l'article avec cadrage soigné */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-slate-50/80 flex items-center justify-center p-6 border-b border-violet-100/80">
          <img
            alt={article.titre}
            className="w-full h-full object-contain"
            src={article.photo}
          />

          {/* Badge état / stock */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-violet-900 shadow-sm flex items-center gap-1.5 border border-violet-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{article.enStock ? 'En stock disponible' : 'Sur commande'}</span>
          </div>

          {/* Bouton Favori */}
          <button
            onClick={() => onBasculerFavori(article.id)}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm text-rose-500 hover:scale-105 transition-all cursor-pointer border border-slate-100"
            type="button"
            title="Enregistrer dans mes favoris"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: article.estFavori ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* 2. Contenu & Détails */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Titre et Prix */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700 mb-1.5 uppercase tracking-wide">
              <span>{article.categorie}</span>
              <span>&bull;</span>
              <span className="text-slate-500 font-semibold">{article.etat}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
              {article.titre}
            </h2>

            {/* PRIX EN GRAND FCFA AVEC FINITION PREMIUM */}
            <div className="mt-3.5 inline-flex items-center gap-2 bg-violet-50 text-slate-950 px-4 py-2 rounded-2xl border border-violet-200/80">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-violet-950">
                {FORMATTER_PRIX(article.prixFCFA)}
              </span>
              <span className="text-[11px] font-bold text-violet-600 bg-white px-2 py-0.5 rounded-full border border-violet-100">
                Paiement à la livraison
              </span>
            </div>
          </div>

          {/* Description courte & claire */}
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            {article.description}
          </p>

          {/* Informations Localisation & Livraison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-violet-100/80 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block">Emplacement</span>
                <span className="text-slate-600">{article.ville}</span>
                <span className="text-slate-400 block text-[11px]">{article.quartier}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-violet-100/80 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block">Livraison Boroboroli</span>
                <span className="text-slate-600">{article.delaiLivraison}</span>
                <span className="text-slate-400 block text-[11px]">Règlement au livreur</span>
              </div>
            </div>
          </div>

          {/* Carte Vendeur Rassurante & Professionnelle */}
          <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                {article.vendeurNom.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm">{article.vendeurNom}</span>
                  {article.vendeurVerifie && (
                    <span className="material-symbols-outlined text-violet-600 text-[18px]" title="Vendeur certifié Boroboroli">
                      verified
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block">Vendeur certifié sur Boroboroli</span>
              </div>
            </div>

            <button
              onClick={() => setAfficherNumero(!afficherNumero)}
              className="px-3.5 py-1.5 rounded-xl bg-white text-violet-900 border border-violet-200 font-bold text-xs hover:bg-violet-100/60 transition-colors shadow-xs cursor-pointer shrink-0"
              type="button"
            >
              {afficherNumero ? article.vendeurTelephone : 'Voir le numéro'}
            </button>
          </div>

          {/* Actions Principales : 2 boutons bien visibles */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {/* Contacter Vendeur (Appel direct) */}
            <a
              href={`tel:${article.vendeurTelephone.replace(/\s+/g, '')}`}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-[#160829] hover:bg-[#250d42] active:scale-98 text-white font-extrabold text-sm text-center flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-fuchsia-400">call</span>
              <span>Appeler le vendeur</span>
            </a>

            {/* Ajouter au panier ou Commander */}
            <button
              onClick={handleAjouter}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              <span>{confirmationAjout ? '✓ Article ajouté !' : 'Commander cet article'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
