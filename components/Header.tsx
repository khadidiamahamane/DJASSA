'use client';

import React from 'react';
import { OngletNavigation } from '@/types';
import { VILLES_DISPONIBLES } from '@/lib/mockData';
import { DjassaLogo } from './DjassaLogo';

interface HeaderProps {
  ongletActif: OngletNavigation;
  onChangerOnglet: (onglet: OngletNavigation) => void;
  nombrePanier: number;
  onOuvrirPanier: () => void;
  onOuvrirPublication: () => void;
  villeSelectionnee: string;
  onChangerVille: (ville: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  ongletActif,
  onChangerOnglet,
  nombrePanier,
  onOuvrirPanier,
  onOuvrirPublication,
  villeSelectionnee,
  onChangerVille,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-violet-100/80 shadow-[0_2px_15px_rgba(30,11,54,0.04)]">
      {/* Bandeau supérieur de réassurance DJASSA */}
      <div className="bg-gradient-to-r from-[#160829] via-[#240b44] to-[#1a0e33] text-violet-100 text-xs py-1.5 px-4 text-center font-medium border-b border-violet-900/40 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500" />
        </span>
        <span className="text-violet-200">
          <strong>DJASSA</strong> : Marketplace Multi-Vendeurs &bull; Gestion de Stock en Direct &bull; Paiement Sécurisé en FCFA
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Logo & Sélecteur Ville */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onChangerOnglet('accueil')}
            className="group cursor-pointer focus:outline-none"
            type="button"
            title="DJASSA Accueil"
          >
            <DjassaLogo taille="md" nom="DJASSA" slogan="Marketplace & Stock FCFA" />
          </button>

          {/* Sélecteur de ville */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-50/70 border border-violet-100 rounded-xl text-xs text-slate-700 hover:border-violet-300 transition-colors">
            <span className="material-symbols-outlined text-violet-600 text-[18px]">location_on</span>
            <select
              value={villeSelectionnee}
              onChange={(e) => onChangerVille(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {VILLES_DISPONIBLES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation principale Desktop */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => onChangerOnglet('accueil')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              ongletActif === 'accueil'
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-sm shadow-violet-500/30'
                : 'text-slate-600 hover:text-violet-950 hover:bg-white'
            }`}
            type="button"
          >
            Accueil
          </button>
          <button
            onClick={() => onChangerOnglet('recherche')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              ongletActif === 'recherche'
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-sm shadow-violet-500/30'
                : 'text-slate-600 hover:text-violet-950 hover:bg-white'
            }`}
            type="button"
          >
            Rechercher
          </button>
          <button
            onClick={() => onChangerOnglet('vendeur')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              ongletActif === 'vendeur'
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-sm shadow-violet-500/30'
                : 'text-slate-600 hover:text-violet-950 hover:bg-white'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span>Espace Vendeur & Stock</span>
          </button>
        </nav>

        {/* Actions principales */}
        <div className="flex items-center gap-2.5">
          {/* Bouton Publier une offre */}
          <button
            onClick={onOuvrirPublication}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span className="hidden sm:inline">Publier une offre</span>
            <span className="sm:hidden">Vendre</span>
          </button>

          {/* Panier */}
          <button
            onClick={onOuvrirPanier}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-950 font-bold text-xs sm:text-sm border border-violet-100 transition-colors relative cursor-pointer"
            type="button"
            title="Consulter mon panier"
          >
            <span className="material-symbols-outlined text-[20px] text-violet-700">shopping_cart</span>
            <span className="hidden md:inline">Panier</span>
            {nombrePanier > 0 && (
              <span className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full min-w-5 text-center shadow-xs">
                {nombrePanier}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
