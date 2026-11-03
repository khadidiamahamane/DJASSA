import React, { useState } from 'react';
import { Article } from '../types';
import { VILLES_DISPONIBLES } from '../data/mockData';

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
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPinIQbqIGPFcsF0wdQGwMRRY_OljEhuYoPLz-8QM44gvzYLNsJb0LI1i14wdKuDZrc5qbAU-WRjwLbPkdBsWjA-J1grqD-1d50yVYspH69Ln065CveLnFu05WNq6ZsheZOTnihGCbs5fj5ckJpg6LbDF3mT4eAzRKzX_LLR4wfjspSNN3IKITYO828syNvkz8HyO4YF-6Ja4Ib0lkLi9oI9zoxrURMb-eR8B3AJ8AD7PpkMP4fZaodg',
      enStock: true,
      quantiteDisponible: 1,
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
              <h2 className="font-black text-lg text-slate-900 leading-tight">Publier une offre</h2>
              <span className="text-[11px] font-semibold text-violet-700">Visibilité immédiate sur Boroboroli</span>
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
              Nom de l'article ou du service
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Écouteurs sans fil neufs avec boîtier"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Prix en FCFA
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  placeholder="25000"
                  value={prixFCFA}
                  onChange={(e) => setPrixFCFA(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-violet-950 outline-none focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-500/10 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-700">
                  FCFA
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Catégorie
              </label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-violet-600 cursor-pointer"
              >
                <option value="Électronique & Informatique">Électronique &amp; Informatique</option>
                <option value="Mode & Vêtements">Mode &amp; Vêtements</option>
                <option value="Maison & Bureau">Maison &amp; Bureau</option>
                <option value="Matériel & Accessoires">Matériel &amp; Accessoires</option>
                <option value="Alimentation & Produits Frais">Alimentation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Votre Ville
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-violet-600 cursor-pointer"
              >
                {VILLES_DISPONIBLES.filter((v) => v !== 'Toutes les villes').map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Quartier
              </label>
              <input
                type="text"
                placeholder="Ex: Cocody Angré"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-violet-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Votre nom ou nom de boutique
              </label>
              <input
                type="text"
                placeholder="Ex: Boutique Aïcha"
                value={vendeurNom}
                onChange={(e) => setVendeurNom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Numéro de téléphone / WhatsApp
              </label>
              <input
                type="tel"
                required
                placeholder="+225 07 00 00 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-violet-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Petite description claire
            </label>
            <textarea
              rows={2}
              placeholder="Décrivez l'état de l'article, ses points forts et les conditions de livraison..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:bg-white focus:border-violet-600 resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onFermer}
              type="button"
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black shadow-md shadow-violet-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>Publier sur Boroboroli</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
