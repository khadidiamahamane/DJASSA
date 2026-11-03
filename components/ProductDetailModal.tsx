'use client';

import React, { useState } from 'react';
import { Article } from '@/types';
import { FORMATTER_PRIX } from '@/lib/mockData';

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

  const stockNet = Math.max(0, article.quantiteDisponible - (article.stockReserve ?? 0));
  const estStockCritique = stockNet > 0 && stockNet <= (article.seuilAlerte ?? 5);

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

          {/* Badge état / stock précis */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-violet-900 shadow-sm flex items-center gap-2 border border-violet-100">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stockNet === 0 ? 'bg-rose-500' : estStockCritique ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span>
              {stockNet === 0
                ? 'Rupture temporaire'
                : estStockCritique
                ? `Stock limité (${stockNet} restant${stockNet > 1 ? 's' : ''})`
                : `En stock (${stockNet} dispo)`}
            </span>
          </div>

          {/* Bouton Favori */}
          <button
            onClick={() => onBasculerFavori(article.id)}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm text-rose-500 hover:scale-105 transition-all cursor-pointer border border-slate-100"
            type="button"
            title="Ajouter aux favoris"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: article.estFavori ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* 2. Informations détaillées */}
        <div className="p-5 sm:p-7 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-violet-100 text-violet-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-violet-200">
                {article.categorie}
              </span>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-slate-500 text-xs font-semibold">{article.etat}</span>
              {article.sku && (
                <>
                  <span className="text-slate-400 text-xs">&bull;</span>
                  <span className="text-slate-400 text-[11px] font-mono">SKU: {article.sku}</span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {article.titre}
            </h2>

            <div className="mt-2.5 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-violet-950">
                {FORMATTER_PRIX(article.prixFCFA)}
              </span>
              <span className="text-xs text-slate-400 font-medium">Prix net en FCFA</span>
            </div>
          </div>

          {/* Description complète */}
          <div className="bg-violet-50/60 p-4 rounded-2xl border border-violet-100/80">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
              Description de l'offre
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {article.description}
            </p>
          </div>

          {/* Localisation & Délais de livraison */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-semibold">Localisation :</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{article.ville}</span>
              <span className="text-[11px] text-slate-500">{article.quartier}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-semibold">Livraison :</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">Rapide & Directe</span>
              <span className="text-[11px] text-slate-500">{article.delaiLivraison}</span>
            </div>
          </div>

          {/* Fiche Vendeur Certifié */}
          <div className="p-3.5 bg-gradient-to-r from-violet-50 to-indigo-50/50 rounded-2xl border border-violet-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                {article.vendeurNom.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {article.vendeurNom}
                  </span>
                  {article.vendeurVerifie && (
                    <span
                      className="material-symbols-outlined text-violet-700 text-[16px]"
                      title="Vendeur Certifié DJASSA"
                    >
                      verified
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-medium block">
                  Partenaire vérifié DJASSA
                </span>
              </div>
            </div>

            {/* Bouton Contact direct */}
            <button
              onClick={() => setAfficherNumero(!afficherNumero)}
              className="px-3 py-1.5 rounded-xl border border-violet-200 bg-white hover:bg-violet-50 text-violet-900 font-bold text-xs transition-colors shrink-0 cursor-pointer"
              type="button"
            >
              {afficherNumero ? article.vendeurTelephone : 'Voir contact'}
            </button>
          </div>

          {/* Actions : Panier & WhatsApp */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleAjouter}
              disabled={stockNet === 0}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                stockNet === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : confirmationAjout
                  ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white shadow-violet-500/25'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                {confirmationAjout ? 'check' : 'add_shopping_cart'}
              </span>
              <span>
                {stockNet === 0
                  ? 'Article en rupture'
                  : confirmationAjout
                  ? 'Ajouté au panier !'
                  : 'Ajouter au Panier'}
              </span>
            </button>

            <a
              href={`https://wa.me/${article.vendeurTelephone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(
                article.vendeurNom
              )},%20je%20suis%20intéressé(e)%20par%20votre%20article%20"${encodeURIComponent(
                article.titre
              )}"%20sur%20DJASSA.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
