import React, { useState } from 'react';
import { ArticlePanier } from '../types';
import { FORMATTER_PRIX } from '../data/mockData';

interface CartDrawerProps {
  estOuvert: boolean;
  onFermer: () => void;
  articlesPanier: ArticlePanier[];
  onModifierQuantite: (articleId: string, delta: number) => void;
  onSupprimerArticle: (articleId: string) => void;
  onViderPanier: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  estOuvert,
  onFermer,
  articlesPanier,
  onModifierQuantite,
  onSupprimerArticle,
  onViderPanier,
}) => {
  const [etapeCommande, setEtapeCommande] = useState<'panier' | 'coordonnees' | 'succes'>('panier');
  const [nomClient, setNomClient] = useState('');
  const [telephoneClient, setTelephoneClient] = useState('');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [moyenPaiement, setMoyenPaiement] = useState<'livraison' | 'mobile_money'>('livraison');
  const [chargement, setChargement] = useState(false);

  if (!estOuvert) return null;

  const totalSousTotal = articlesPanier.reduce(
    (total, item) => total + item.article.prixFCFA * item.quantite,
    0
  );
  const fraisLivraison = totalSousTotal > 0 ? 2000 : 0;
  const montantTotal = totalSousTotal + fraisLivraison;

  const handleConfirmerCommande = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomClient.trim() || !telephoneClient.trim()) return;

    setChargement(true);
    setTimeout(() => {
      setChargement(false);
      setEtapeCommande('succes');
    }, 700);
  };

  const handleRecommencer = () => {
    onViderPanier();
    setEtapeCommande('panier');
    setNomClient('');
    setTelephoneClient('');
    setAdresseLivraison('');
    onFermer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none bg-slate-950/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-violet-100">
        {/* En-tête du Panier */}
        <div className="p-4 sm:p-5 border-b border-violet-100 flex items-center justify-between bg-violet-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900 leading-tight">Mon Panier</h2>
              <span className="text-[11px] font-semibold text-violet-700">Boroboroli Express</span>
            </div>
          </div>
          <button
            onClick={onFermer}
            className="w-9 h-9 rounded-full hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            title="Fermer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Corps principal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {etapeCommande === 'succes' ? (
            <div className="py-10 flex flex-col items-center text-center space-y-4">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-violet-500/30">
                <span className="material-symbols-outlined text-[40px]">check_circle</span>
              </div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Commande Confirmée !</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Merci <strong>{nomClient}</strong>. Votre demande a été transmise au vendeur avec succès.
              </p>

              <div className="w-full bg-violet-50 border border-violet-200/80 p-4 rounded-2xl text-left text-xs text-violet-950 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-violet-900">
                  <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                  <span>Prochaine étape :</span>
                </div>
                <p>
                  Le vendeur va vous appeler au <strong className="text-violet-900">{telephoneClient}</strong> avant de lancer la livraison.
                </p>
                <p className="text-slate-600 pt-1 border-t border-violet-100">
                  Montant à régler à la livraison : <strong className="text-slate-950 text-sm font-black">{FORMATTER_PRIX(montantTotal)}</strong>.
                </p>
              </div>

              <button
                onClick={handleRecommencer}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-md shadow-violet-500/25 transition-all cursor-pointer"
                type="button"
              >
                Retourner aux offres Boroboroli
              </button>
            </div>
          ) : articlesPanier.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center text-violet-400">
                <span className="material-symbols-outlined text-[32px]">production_quantity_limits</span>
              </div>
              <h3 className="font-black text-base text-slate-900">Votre panier est vide</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Parcourez les offres disponibles sur Boroboroli et ajoutez vos articles préférés en un clic.
              </p>
              <button
                onClick={onFermer}
                className="mt-3 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer shadow-sm"
                type="button"
              >
                Explorer le catalogue
              </button>
            </div>
          ) : etapeCommande === 'panier' ? (
            <div className="space-y-3">
              {articlesPanier.map(({ article, quantite }) => (
                <div
                  key={article.id}
                  className="p-3 bg-white border border-violet-100 rounded-2xl flex gap-3 items-center shadow-xs"
                >
                  <img
                    alt={article.titre}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-50 p-1 shrink-0"
                    src={article.photo}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {article.titre}
                    </h4>
                    <span className="text-xs font-black text-violet-950 block mt-0.5">
                      {FORMATTER_PRIX(article.prixFCFA)}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {article.ville}
                    </span>

                    <div className="flex items-center justify-between mt-2">
                      {/* Sélecteur de quantité moderne */}
                      <div className="flex items-center bg-violet-50/80 rounded-xl p-0.5 border border-violet-100">
                        <button
                          onClick={() => onModifierQuantite(article.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs hover:bg-violet-100 cursor-pointer"
                          type="button"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-black text-violet-950">
                          {quantite}
                        </span>
                        <button
                          onClick={() => onModifierQuantite(article.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs hover:bg-violet-100 cursor-pointer"
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onSupprimerArticle(article.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Retirer du panier"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Étape formulaire de livraison simple */
            <form id="form-commande" onSubmit={handleConfirmerCommande} className="space-y-4">
              <div className="p-3.5 bg-violet-50 rounded-2xl text-xs text-violet-950 font-medium border border-violet-100">
                Renseignez simplement vos informations pour convenir de l'heure et du lieu de livraison.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Votre nom complet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Awa Koné"
                  value={nomClient}
                  onChange={(e) => setNomClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Numéro de téléphone (avec indicatif)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 07 00 00 00 00"
                  value={telephoneClient}
                  onChange={(e) => setTelephoneClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-500/10 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ville et quartier de livraison
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abidjan, Cocody Angré 8ème tranche"
                  value={adresseLivraison}
                  onChange={(e) => setAdresseLivraison(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Mode de règlement
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setMoyenPaiement('livraison')}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all ${
                      moyenPaiement === 'livraison'
                        ? 'border-violet-600 bg-violet-50 text-violet-950 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] text-violet-700">payments</span>
                    <span>Espèces à la livraison</span>
                  </label>

                  <label
                    onClick={() => setMoyenPaiement('mobile_money')}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all ${
                      moyenPaiement === 'mobile_money'
                        ? 'border-violet-600 bg-violet-50 text-violet-950 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px] text-violet-700">phone_android</span>
                    <span>Wave / Orange Money</span>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Pied du Panier avec Total en FCFA */}
        {etapeCommande !== 'succes' && articlesPanier.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-violet-100 bg-violet-50/40 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Articles ({articlesPanier.reduce((t, i) => t + i.quantite, 0)})</span>
                <span className="font-bold text-slate-900">{FORMATTER_PRIX(totalSousTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison estimés</span>
                <span className="font-bold text-slate-900">{FORMATTER_PRIX(fraisLivraison)}</span>
              </div>
              <div className="border-t border-violet-200/80 pt-2 flex justify-between text-base font-black text-slate-950">
                <span>Total à régler</span>
                <span className="text-violet-950 text-lg">{FORMATTER_PRIX(montantTotal)}</span>
              </div>
            </div>

            {etapeCommande === 'panier' ? (
              <button
                onClick={() => setEtapeCommande('coordonnees')}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                type="button"
              >
                <span>Passer à la livraison</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEtapeCommande('panier')}
                  className="px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                  type="button"
                >
                  Retour
                </button>
                <button
                  form="form-commande"
                  type="submit"
                  disabled={chargement}
                  className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {chargement ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <span>Confirmer ({FORMATTER_PRIX(montantTotal)})</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
