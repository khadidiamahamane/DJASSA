import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DJASSA — Marketplace & Gestion de Stock',
  description: "DJASSA est la marketplace moderne multi-vendeurs avec gestion de stock intégrée en Afrique de l'Ouest. Achetez et vendez en FCFA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#faf9fe] text-[#131127] antialiased selection:bg-violet-200 selection:text-violet-900">
        {children}
      </body>
    </html>
  );
}
