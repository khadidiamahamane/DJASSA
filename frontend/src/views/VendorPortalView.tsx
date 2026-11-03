import React, { useState } from 'react';
import { Article, DemandeOuCommande } from '../types';
import { FORMATTER_PRIX } from '../data/mockData';

interface VendorPortalViewProps {
  articles: Article[];
  demandes: DemandeOuCommande[];
  onOuvrirPublication: () => void;
  onModifierStatutDemande: (demandeId: string, nouveauStatut: DemandeOuCommande['statut']) => void;
  onBasculerDisponibiliteArticle: (articleId: string) => void;
}

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({
  articles,
  demandes,
  onOuvrirPublication,
  onModifierStatutDemande,
  onBasculerDisponibiliteArticle,
}) => {
  const [ongletActif, setOngletActif] = useState<'offres' | 'demandes' | 'profil'>('offres');
  const [notification, setNotification] = useState<string | null>(null);

  const notifier = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 bg-[#160829] text-white px-4 py-3 rounded-2xl shadow-2xl border border-violet-500/30 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom">
          <span className="material-symbols-outlined text-fuchsia-400 text-[20px]">check_circle</span>
          <span>{notification}</span>
        </div>
      )}

      {/* En-tête Espace Vendeur Boroboroli Premium & Chaleureux */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-violet-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-xl shadow-md shadow-violet-500/25">
            BB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Espace Partenaire Boroboroli
              </h1>
              <span className="bg-violet-100 text-violet-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-violet-200">
                Compte Certifié
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gérez simplement vos offres et développez vos ventes en direct.
            </p>
          </div>
        </div>

        {/* Bouton d'action : Ajouter une offre */}
        <button
          onClick={onOuvrirPublication}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-violet-500/30 transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Publier une offre</span>
        </button>
      </div>

      {/* 3 INDICATEURS ESSENTIELS BOROBOROLI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Compteur 1 */}
        <div className="bg-white p-5 rounded-3xl border border-violet-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Offres en ligne</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {articles.length} offres
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center border border-violet-100">
            <span className="material-symbols-outlined text-[26px]">inventory_2</span>
          </div>
        </div>

        {/* Compteur 2 */}
        <div className="bg-white p-5 rounded-3xl border border-violet-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Demandes reçues</span>
            <span className="text-2xl sm:text-3xl font-black text-fuchsia-600 mt-1 block">
              {demandes.length} commandes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center border border-fuchsia-100">
            <span className="material-symbols-outlined text-[26px]">shopping_bag</span>
          </div>
        </div>

        {/* Compteur 3 */}
        <div className="bg-white p-5 rounded-3xl border border-violet-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Ventes finalisées</span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1 block">
              5 livrées
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <span className="material-symbols-outlined text-[26px]">verified</span>
          </div>
        </div>
      </div>

      {/* Onglets de navigation vendeur simples */}
      <div className="flex items-center gap-2 border-b border-violet-100 pb-2">
        <button
          onClick={() => setOngletActif('offres')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
            ongletActif === 'offres'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">list_alt</span>
          <span>Mes offres ({articles.length})</span>
        </button>

        <button
          onClick={() => setOngletActif('demandes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
            ongletActif === 'demandes'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span>Commandes reçues ({demandes.length})</span>
        </button>

        <button
          onClick={() => setOngletActif('profil')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
            ongletActif === 'profil'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          <span>Mon Profil</span>
        </button>
      </div>

      {/* CONTENU SELON ONGLET */}
      {ongletActif === 'offres' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-800">Articles actifs sur Boroboroli</h2>
            <button
              onClick={onOuvrirPublication}
              className="text-xs font-bold text-violet-700 hover:underline flex items-center gap-1 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Nouvel article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {articles.map((art) => (
              <div
                key={art.id}
                className="bg-white p-4 rounded-3xl border border-violet-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    alt={art.titre}
                    className="w-16 h-16 rounded-2xl object-contain bg-slate-50 p-1 shrink-0 border border-slate-100"
                    src={art.photo}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 block">
                      {art.categorie}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{art.titre}</h3>
                    <div className="flex items-center gap-2.5 mt-1 text-xs">
                      <span className="font-black text-slate-950">
                        {FORMATTER_PRIX(art.prixFCFA)}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-500 font-medium">{art.ville}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Bascule En stock / Épuisé */}
                  <button
                    onClick={() => {
                      onBasculerDisponibiliteArticle(art.id);
                      notifier(
                        art.enStock
                          ? `"${art.titre}" marqué comme épuisé.`
                          : `"${art.titre}" remis en stock sur Boroboroli !`
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      art.enStock
                        ? 'bg-violet-50 text-violet-900 border border-violet-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                    type="button"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${art.enStock ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    />
                    <span>{art.enStock ? 'En stock' : 'Épuisé'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ongletActif === 'demandes' && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-800 px-1">
            Commandes et demandes clients reçues
          </h2>

          <div className="space-y-3">
            {demandes.map((dem) => (
              <div
                key={dem.id}
                className="bg-white p-5 rounded-3xl border border-violet-100 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-50 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-violet-900 bg-violet-100/80 px-2.5 py-0.5 rounded-lg">
                        {dem.numero}
                      </span>
                      <span className="text-xs text-slate-400">{dem.dateHeure}</span>
                    </div>
                    <h3 className="font-black text-base text-slate-900 mt-1">
                      Client : {dem.clientNom}
                    </h3>
                  </div>

                  <span
                    className={`self-start sm:self-auto text-xs font-black px-3 py-1 rounded-full ${
                      dem.statut === 'Nouvelle demande'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : dem.statut === 'En préparation'
                        ? 'bg-violet-100 text-violet-900 border border-violet-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {dem.statut}
                  </span>
                </div>

                {/* Articles commandés */}
                <div className="text-xs space-y-1.5">
                  {dem.articles.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>{item.quantite}x {item.titre}</span>
                      <strong className="text-slate-950 font-bold">{FORMATTER_PRIX(item.prixFCFA * item.quantite)}</strong>
                    </div>
                  ))}
                  <div className="border-t border-violet-100 pt-2 flex justify-between font-black text-sm text-slate-950">
                    <span>Montant total à encaisser :</span>
                    <span className="text-violet-950 text-base">{FORMATTER_PRIX(dem.totalFCFA)}</span>
                  </div>
                </div>

                {/* Message client */}
                {dem.messageClient && (
                  <p className="text-xs bg-slate-50 p-3 rounded-2xl text-slate-600 italic border border-slate-100">
                    « {dem.messageClient} »
                  </p>
                )}

                {/* Actions directes pour le vendeur */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-500">
                    Livraison à : <strong className="text-slate-800">{dem.clientVille}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${dem.clientTelephone.replace(/\s+/g, '')}`}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-violet-500/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>Appeler le client ({dem.clientTelephone})</span>
                    </a>

                    {dem.statut !== 'Livrée' && (
                      <button
                        onClick={() => {
                          const suivant =
                            dem.statut === 'Nouvelle demande' ? 'En préparation' : 'Livrée';
                          onModifierStatutDemande(dem.id, suivant);
                          notifier(`Statut de la demande ${dem.numero} mis à jour : ${suivant}`);
                        }}
                        className="px-3.5 py-2 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        type="button"
                      >
                        {dem.statut === 'Nouvelle demande'
                          ? 'Passer en préparation'
                          : 'Marquer comme livrée'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ongletActif === 'profil' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-violet-100 shadow-xs space-y-4 max-w-lg">
          <h2 className="text-base font-black text-slate-900">Profil Vendeur Boroboroli</h2>
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-violet-50/60 rounded-2xl border border-violet-100">
              <span className="text-slate-400 block font-semibold">Nom de votre commerce</span>
              <span className="font-bold text-slate-900 text-sm">Boroboroli Partner Commerce</span>
            </div>
            <div className="p-3 bg-violet-50/60 rounded-2xl border border-violet-100">
              <span className="text-slate-400 block font-semibold">Téléphone direct</span>
              <span className="font-bold text-slate-900 text-sm">+225 07 48 90 12 34</span>
            </div>
            <div className="p-3 bg-violet-50/60 rounded-2xl border border-violet-100">
              <span className="text-slate-400 block font-semibold">Zone principale de vente</span>
              <span className="font-bold text-slate-900 text-sm">Abidjan (Côte d’Ivoire)</span>
            </div>
            <div className="p-3 bg-violet-50/60 rounded-2xl border border-violet-100">
              <span className="text-slate-400 block font-semibold">Règlements acceptés</span>
              <span className="font-bold text-violet-950 text-sm">Espèces &amp; Mobile Money (Wave / Orange)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
