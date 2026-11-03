'use client';

import React, { useState } from 'react';
import { Article } from '@/types';
import { VILLES_DISPONIBLES } from '@/lib/mockData';

interface NewProductModalProps {
  estOuvert: boolean;
  onFermer: () => void;
  onAjouterArticle: (nouvelArticle: Article) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  estOuvert,
  onFermer,
  onAjouterArticle,
}) => {
  const [titre, setTitre] = useState('');
  const [prixFCFA, setPrixFCFA] = useState<number | ''>(25000);
  const [quantiteStock, setQuantiteStock] = useState<number | ''>(10);
  const [seuilAlerte, setSeuilAlerte] = useState<number | ''>(3);
  const [sku, setSku] = useState('');
  const [categorie, setCategorie] = useState<Article['categorie']>('Électronique & Informatique');
  const [ville, setVille] = useState('Abidjan (Côte d’Ivoire)');
  const [quartier, setQuartier] = useState('Cocody');
  const [telephone, setTelephone] = useState('+225 07 00 00 00 00');
  const [description, setDescription] = useState('');
  const [vendeurNom, setVendeurNom] = useState('Mon Commerce');

  if (!estOuvert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !prixFCFA) return;

    const stock = Number(quantiteStock) || 1;
    const alerte = Number(seuilAlerte) || 3;

    const nouvelArticle: Article = {
      id: `art-${Date.now()}`,
      titre: titre.trim(),
      description: description.trim() || 'Article de qualité disponible immédiatement.',
      prixFCFA: Number(prixFCFA),
      categorie,
      ville,
      quartier: quartier.trim() || 'Centre-ville',
      vendeurNom: vendeurNom.trim() || 'Vendeur Certifié',
      vendeurTelephone: telephone.trim(),
      vendeurVerifie: true,
      photo: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
      enStock: stock > 0,
      quantiteDisponible: stock,
      stockReserve: 0,
      seuilAlerte: alerte,
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      etat: 'Neuf scellé',
      delaiLivraison: 'Livraison rapide disponible',
      estFavori: false,
    };

    onAjouterArticle(nouvelArticle);
    onFermer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs select-none">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-violet-100 my-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3.5 border-b border-violet-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 leading-tight">Publier une offre & Stock</h2>
              <span className="text-[11px] font-semibold text-violet-700">Visibilité immédiate sur DJASSA</span>
            </div>
          </div>
          <button
            onClick={onFermer}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            title="Fermer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Nom de l'article ou du produit *
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Casque Bluetooth sans fil Pro"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">Prix (en FCFA) *</label>
              <input
                type="number"
                required
                min={100}
                placeholder="Ex : 25000"
                value={prixFCFA}
                onChange={(e) => setPrixFCFA(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Catégorie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as Article['categorie'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50 cursor-pointer"
              >
                <option value="Électronique & Informatique">Électronique & Informatique</option>
                <option value="Mode & Vêtements">Mode & Vêtements</option>
                <option value="Maison & Bureau">Maison & Bureau</option>
                <option value="Matériel & Accessoires">Matériel & Accessoires</option>
                <option value="Alimentation & Produits Frais">Alimentation & Produits Frais</option>
              </select>
            </div>
          </div>

          {/* Section Gestion de Stock */}
          <div className="bg-violet-50/60 p-3.5 rounded-2xl border border-violet-100 space-y-3">
            <div className="flex items-center gap-1.5 text-violet-900 font-black text-xs">
              <span className="material-symbols-outlined text-[18px]">inventory</span>
              <span>Paramètres de Stock & Inventaire</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantité initiale *</label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="10"
                  value={quantiteStock}
                  onChange={(e) => setQuantiteStock(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-xl border border-violet-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Seuil d'alerte bas</label>
                <input
                  type="number"
                  min={1}
                  placeholder="3"
                  value={seuilAlerte}
                  onChange={(e) => setSeuilAlerte(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-xl border border-violet-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Référence SKU</label>
                <input
                  type="text"
                  placeholder="Ex : CLV-RGB-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-violet-200 bg-white text-xs font-mono text-slate-900 outline-none focus:border-violet-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">Ville</label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50 cursor-pointer"
              >
                {VILLES_DISPONIBLES.filter((v) => v !== 'Toutes les villes').map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Quartier</label>
              <input
                type="text"
                placeholder="Ex : Cocody Angré"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">Nom de votre commerce</label>
              <input
                type="text"
                placeholder="Ex : Abidjan Tech"
                value={vendeurNom}
                onChange={(e) => setVendeurNom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Téléphone de vente</label>
              <input
                type="tel"
                placeholder="Ex : +225 07 12 34 56 78"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Description de l'article</label>
            <textarea
              rows={2}
              placeholder="État, garantie, accessoires fournis..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onFermer}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              Enregistrer l'offre & le stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
