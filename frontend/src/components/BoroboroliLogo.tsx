import React from 'react';

interface BoroboroliLogoProps {
  className?: string;
  taille?: 'sm' | 'md' | 'lg';
  modeSombre?: boolean;
  afficherSlogan?: boolean;
}

export const BoroboroliLogo: React.FC<BoroboroliLogoProps> = ({
  className = '',
  taille = 'md',
  modeSombre = false,
  afficherSlogan = true,
}) => {
  const dimensionsEmbleme = {
    sm: { w: 32, h: 32, rx: 9 },
    md: { w: 42, h: 42, rx: 12 },
    lg: { w: 52, h: 52, rx: 16 },
  }[taille];

  const taillePolice = {
    sm: 'text-base tracking-tight',
    md: 'text-xl tracking-tight',
    lg: 'text-2xl tracking-tight',
  }[taille];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblème Graphique Vibrant Boroboroli */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: dimensionsEmbleme.w, height: dimensionsEmbleme.h }}
      >
        {/* Glow doux en arrière-plan */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 opacity-35 blur-md -z-10" />

        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="boro-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E0B36" />
              <stop offset="45%" stopColor="#3B0764" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
            <linearGradient id="boro-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
            <linearGradient id="boro-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Carré doux aux coins arrondis */}
          <rect
            width="44"
            height="44"
            rx="12"
            fill="url(#boro-bg-grad)"
          />

          {/* Liseré subtil lumineux */}
          <rect
            x="0.75"
            y="0.75"
            width="42.5"
            height="42.5"
            rx="11.25"
            stroke="url(#boro-glow)"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          {/* Monogramme 'B' stylisé et fluide en double anneau moderne */}
          {/* Tronc vertical */}
          <path
            d="M13 11C13 9.89543 13.8954 9 15 9H17C18.1046 9 19 9.89543 19 11V33C19 34.1046 18.1046 35 17 35H15C13.8954 35 13 34.1046 13 33V11Z"
            fill="url(#boro-accent-grad)"
          />

          {/* Boucle supérieure */}
          <path
            d="M17 9H25C28.3137 9 31 11.6863 31 15C31 18.3137 28.3137 21 25 21H17V9Z"
            stroke="url(#boro-accent-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Boucle inférieure plus généreuse */}
          <path
            d="M17 21H27C30.866 21 34 24.134 34 28C34 31.866 30.866 35 27 35H17V21Z"
            stroke="url(#boro-accent-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point accent lumineux fuchsia/ambre */}
          <circle cx="23.5" cy="21" r="2" fill="#F97316" />
        </svg>
      </div>

      {/* Nom & Typographie Boroboroli */}
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`font-black font-display tracking-tight uppercase ${taillePolice} ${
              modeSombre ? 'text-white' : 'text-slate-900'
            }`}
          >
            Boroboroli
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 shrink-0 mb-1" />
        </div>

        {afficherSlogan && (
          <span
            className={`text-[10px] font-semibold tracking-wide uppercase mt-0.5 ${
              modeSombre ? 'text-violet-300/80' : 'text-violet-900/60'
            }`}
          >
            Marché Moderne en FCFA
          </span>
        )}
      </div>
    </div>
  );
};
