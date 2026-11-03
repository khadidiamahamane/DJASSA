'use client';

import React, { useState } from 'react';
import { ArticlePanier, DemandeOuCommande } from '@/types';
import { FORMATTER_PRIX } from '@/lib/mockData';

interface CartDrawerProps {
  estOuvert: boolean;
  onFermer: () => void;
  articlesPanier: ArticlePanier[];
  onModifierQuantite: (articleId: string, delta: number) => void;
  onSupprimerArticle: (articleId: string) => void;
  onViderPanier: () => void;
  onCreerCommande?: (commande: DemandeOuCommande) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  estOuvert,
  onFermer,
  articlesPanier,
  onModifierQuantite,
  onSupprimerArticle,
  onViderPanier,
  onCreerCommande,
}) => {
  const [etapeCommande, setEtapeCommande] = useState<'panier' | 'coordonnees' | 'succes'>('panier');
  const [nomClient, setNomClient] = useState('');
  const [telephoneClient, setTelephoneClient] = useState('');
  const [villeClient, setVilleClient] = useState('Abidjan (Cocody)');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [modePaiement, setModePaiement] = useState<DemandeOuCommande['modePaiement']>('Espèces à la livraison');
  const [messageClient, setMessageClient] = useState('');
  const [chargement, setChargement] = useState(false);
  const [numeroCommandeGeneree, setNumeroCommandeGeneree] = useState('');

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
    const numCmd = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;
    setNumeroCommandeGeneree(numCmd);

    setTimeout(() => {
      setChargement(false);
      setEtapeCommande('succes');

      if (onCreerCommande) {
        const nouvelleCmd: DemandeOuCommande = {
          id: `cmd-${Date.now()}`,
          numero: numCmd,
          clientNom: nomClient.trim(),
          clientTelephone: telephoneClient.trim(),
          clientVille: `${villeClient} - ${adresseLivraison.trim() || 'Centre'}`,
          articles: articlesPanier.map((item) => ({
            articleId: item.article.id,
            titre: item.article.titre,
            quantite: item.quantite,
            prixFCFA: item.article.prixFCFA,
          })),
          totalFCFA: montantTotal,
          dateHeure: 'À l’instant',
          statut: 'Nouvelle demande',
          messageClient: messageClient.trim() || undefined,
          modePaiement,
        };
        onCreerCommande(nouvelleCmd);
      }
    }, 700);
  };

  const handleRecommencer = () => {
    onViderPanier();
    setEtapeCommande('panier');
    setNomClient('');
    setTelephoneClient('');
    setAdresseLivraison('');
    setMessageClient('');
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
              <span className="text-[11px] font-semibold text-violet-700">DJASSA Express</span>
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
              <p className="text-xs font-bold text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
                N° {numeroCommandeGeneree}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                Merci <strong>{nomClient}</strong>. Votre commande a été transmise aux vendeurs concernés et le stock a été mis à jour.
              </p>

              <div className="w-full bg-violet-50 border border-violet-200/80 p-4 rounded-2xl text-left text-xs text-violet-950 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-violet-900">
                  <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                  <span>Prochaine étape :</span>
                </div>
                <p>
                  Le vendeur va vous appeler au <strong className="text-violet-900">{telephoneClient}</strong> pour coordonner la livraison.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-violet-200/60 font-semibold">
                  <span>Paiement choisi :</span>
                  <span className="text-violet-900 font-bold">{modePaiement}</span>
                </div>
              </div>

              <button
                onClick={handleRecommencer}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs cursor-pointer hover:bg-slate-800 transition-colors shadow-sm"
                type="button"
              >
                Continuer mes achats
              </button>
            </div>
          ) : etapeCommande === 'coordonnees' ? (
            <form onSubmit={handleConfirmerCommande} className="space-y-4 text-xs">
              <div className="bg-violet-50 p-3 rounded-2xl border border-violet-100 flex items-center justify-between">
                <span className="font-bold text-violet-950">Total à régler (livraison incluse) :</span>
                <span className="font-black text-violet-900 text-sm">{FORMATTER_PRIX(montantTotal)}</span>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Votre Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Koffi Kouamé"
                  value={nomClient}
                  onChange={(e) => setNomClient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Numéro de téléphone WhatsApp / Appel *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex : +225 07 12 34 56 78"
                  value={telephoneClient}
                  onChange={(e) => setTelephoneClient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Ville & Commune</label>
                <input
                  type="text"
                  value={villeClient}
                  onChange={(e) => setVilleClient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Quartier & Précisions d'adresse</label>
                <textarea
                  rows={2}
                  placeholder="Ex : Angré 8ème tranche, après la pharmacie..."
                  value={adresseLivraison}
                  onChange={(e) => setAdresseLivraison(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Mode de règlement</label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value as DemandeOuCommande['modePaiement'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50 cursor-pointer"
                >
                  <option value="Espèces à la livraison">Paiement en espèces à la livraison</option>
                  <option value="Wave">Wave Mobile Money</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Carte Bancaire">Carte Bancaire (Stripe)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Message pour le vendeur (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex : Livrer de préférence entre 14h et 17h"
                  value={messageClient}
                  onChange={(e) => setMessageClient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none text-xs bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEtapeCommande('panier')}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={chargement}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black text-xs hover:from-violet-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-500/25"
                >
                  {chargement ? (
                    <span>Transmission...</span>
                  ) : (
                    <>
                      <span>Confirmer la commande</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : articlesPanier.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-400 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">production_quantity_limits</span>
              </div>
              <h3 className="font-bold text-base text-slate-800">Votre panier est vide</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explorez les offres des vendeurs DJASSA et ajoutez vos coups de cœur.
              </p>
              <button
                onClick={onFermer}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors cursor-pointer"
                type="button"
              >
                Parcourir les offres
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>{articlesPanier.length} article(s)</span>
                <button
                  onClick={onViderPanier}
                  className="text-rose-600 hover:underline font-semibold cursor-pointer"
                  type="button"
                >
                  Vider tout
                </button>
              </div>

              {articlesPanier.map((item) => (
                <div
                  key={item.article.id}
                  className="p-3 bg-white rounded-2xl border border-violet-100 shadow-xs flex items-center gap-3"
                >
                  <img
                    src={item.article.photo}
                    alt={item.article.titre}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-50 p-1 shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{item.article.titre}</h4>
                    <p className="text-xs font-black text-violet-900 mt-0.5">
                      {FORMATTER_PRIX(item.article.prixFCFA)}
                    </p>
                    <span className="text-[10px] text-slate-500">{item.article.vendeurNom}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => onModifierQuantite(item.article.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-xs"
                      type="button"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-black">{item.quantite}</span>
                    <button
                      onClick={() => onModifierQuantite(item.article.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-xs"
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onSupprimerArticle(item.article.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    type="button"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied du Panier */}
        {etapeCommande === 'panier' && articlesPanier.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-violet-100 bg-violet-50/40 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles :</span>
                <span className="font-semibold">{FORMATTER_PRIX(totalSousTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison estimés :</span>
                <span className="font-semibold text-emerald-600">
                  {fraisLivraison > 0 ? FORMATTER_PRIX(fraisLivraison) : 'Gratuit'}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-violet-200/60">
                <span>Total estimé :</span>
                <span className="text-violet-950">{FORMATTER_PRIX(montantTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setEtapeCommande('coordonnees')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white font-black text-xs shadow-md shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <span>Passer la commande</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
