import React from 'react';
import { OngletNavigation } from '../types';

interface MobileNavProps {
  ongletActif: OngletNavigation;
  onChangerOnglet: (onglet: OngletNavigation) => void;
  nombrePanier: number;
  onOuvrirPanier: () => void;
  onOuvrirPublication: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  ongletActif,
  onChangerOnglet,
  nombrePanier,
  onOuvrirPanier,
  onOuvrirPublication,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-violet-100/90 px-2 py-1.5 shadow-[0_-4px_25px_rgba(30,11,54,0.09)]">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Accueil */}
        <button
          onClick={() => onChangerOnglet('accueil')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            ongletActif === 'accueil'
              ? 'text-violet-700 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: ongletActif === 'accueil' ? "'FILL' 1" : "'FILL' 0" }}
          >
            storefront
          </span>
          <span className="text-[10px] mt-0.5">Accueil</span>
        </button>

        {/* Rechercher */}
        <button
          onClick={() => onChangerOnglet('recherche')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            ongletActif === 'recherche'
              ? 'text-violet-700 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">search</span>
          <span className="text-[10px] mt-0.5">Recherche</span>
        </button>

        {/* Bouton Central : Vendre (Spectaculaire avec dégradé Boroboroli) */}
        <button
          onClick={onOuvrirPublication}
          className="flex flex-col items-center justify-center -mt-5 py-0.5 cursor-pointer group"
          type="button"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/40 group-active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[26px]">add</span>
          </div>
          <span className="text-[10px] font-black text-violet-950 mt-1">Vendre</span>
        </button>

        {/* Panier */}
        <button
          onClick={onOuvrirPanier}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-500 hover:text-slate-800 relative transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          {nombrePanier > 0 && (
            <span className="absolute top-1 right-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
              {nombrePanier}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Panier</span>
        </button>

        {/* Espace Vendeur */}
        <button
          onClick={() => onChangerOnglet('vendeur')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            ongletActif === 'vendeur'
              ? 'text-violet-700 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: ongletActif === 'vendeur' ? "'FILL' 1" : "'FILL' 0" }}
          >
            space_dashboard
          </span>
          <span className="text-[10px] mt-0.5">Espace Pro</span>
        </button>
      </div>
    </nav>
  );
};
