import React from 'react';

interface DjassaLogoProps {
  className?: string;
  taille?: 'sm' | 'md' | 'lg';
  modeSombre?: boolean;
  afficherSlogan?: boolean;
  nom?: string;
  slogan?: string;
}

export const DjassaLogo: React.FC<DjassaLogoProps> = ({
  className = '',
  taille = 'md',
  modeSombre = false,
  afficherSlogan = true,
  nom = 'DJASSA',
  slogan = 'Marketplace & Stock FCFA',
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
      {/* Emblème Graphique DJASSA */}
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
            <linearGradient id="djassa-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E0B36" />
              <stop offset="45%" stopColor="#3B0764" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
            <linearGradient id="djassa-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
            <linearGradient id="djassa-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Carré doux aux coins arrondis */}
          <rect width="44" height="44" rx="12" fill="url(#djassa-bg-grad)" />

          {/* Liseré subtil lumineux */}
          <rect
            x="0.75"
            y="0.75"
            width="42.5"
            height="42.5"
            rx="11.25"
            stroke="url(#djassa-glow)"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          {/* Monogramme 'D' moderne */}
          <path
            d="M14 11C14 9.89543 14.8954 9 16 9H23C29.6274 9 35 14.3726 35 21C35 27.6274 29.6274 33 23 33H16C14.8954 33 14 32.1046 14 31V11Z"
            stroke="url(#djassa-accent-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="23" cy="21" r="2.5" fill="#F97316" />
        </svg>
      </div>

      {/* Nom & Typographie */}
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`font-black font-display tracking-tight uppercase ${taillePolice} ${
              modeSombre ? 'text-white' : 'text-slate-900'
            }`}
          >
            {nom}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500 shrink-0 mb-1" />
        </div>

        {afficherSlogan && (
          <span
            className={`text-[10px] font-semibold tracking-wide uppercase mt-0.5 ${
              modeSombre ? 'text-violet-300/80' : 'text-violet-900/60'
            }`}
          >
            {slogan}
          </span>
        )}
      </div>
    </div>
  );
};
