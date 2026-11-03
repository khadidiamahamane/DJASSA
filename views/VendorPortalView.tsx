'use client';

import React, { useState } from 'react';
import { Article, DemandeOuCommande, MouvementStock } from '@/types';
import { FORMATTER_PRIX } from '@/lib/mockData';

interface VendorPortalViewProps {
  articles: Article[];
  demandes: DemandeOuCommande[];
  mouvementsStock: MouvementStock[];
  onOuvrirPublication: () => void;
  onModifierStatutDemande: (demandeId: string, nouveauStatut: DemandeOuCommande['statut']) => void;
  onModifierQuantiteStock: (articleId: string, nouvelleQuantite: number, raison?: string) => void;
  onModifierSeuilAlerte: (articleId: string, nouveauSeuil: number) => void;
}

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({
  articles,
  demandes,
  mouvementsStock,
  onOuvrirPublication,
  onModifierStatutDemande,
  onModifierQuantiteStock,
  onModifierSeuilAlerte,
}) => {
  const [ongletActif, setOngletActif] = useState<'offres' | 'stock' | 'demandes' | 'profil'>('stock');
  const [notification, setNotification] = useState<string | null>(null);
  const [articleEnEditionStock, setArticleEnEditionStock] = useState<Article | null>(null);
  const [ajustementQuantite, setAjustementQuantite] = useState<number>(0);
  const [raisonAjustement, setRaisonAjustement] = useState<string>('Réapprovisionnement magasin');

  const notifier = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Calculs de gestion de stock
  const articlesEnAlerte = articles.filter((a) => {
    const dispo = Math.max(0, a.quantiteDisponible - (a.stockReserve ?? 0));
    return dispo <= (a.seuilAlerte ?? 5);
  });

  const valeurTotaleStock = articles.reduce((sum, a) => {
    return sum + a.prixFCFA * Math.max(0, a.quantiteDisponible - (a.stockReserve ?? 0));
  }, 0);

  const handleAppliquerAjustement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleEnEditionStock) return;

    const nouvelleQte = Math.max(0, articleEnEditionStock.quantiteDisponible + ajustementQuantite);
    onModifierQuantiteStock(articleEnEditionStock.id, nouvelleQte, raisonAjustement);
    notifier(`Stock mis à jour pour "${articleEnEditionStock.titre}" : ${nouvelleQte} unités.`);
    setArticleEnEditionStock(null);
    setAjustementQuantite(0);
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

      {/* En-tête Espace Vendeur DJASSA */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-violet-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-xl shadow-md shadow-violet-500/25">
            DJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Portail Vendeur & Gestion de Stock
              </h1>
              <span className="bg-violet-100 text-violet-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-violet-200">
                Compte Certifié
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilotez vos stocks en direct, vos alertes de réapprovisionnement et vos commandes clients.
            </p>
          </div>
        </div>

        {/* Bouton d'action */}
        <button
          onClick={onOuvrirPublication}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-violet-500/30 transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Bannière Alerte Stock Bas si nécessaire */}
      {articlesEnAlerte.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-3xl border border-amber-200 bg-amber-50/80 text-amber-950 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <span className="font-black text-sm block text-amber-900">
                Attention : {articlesEnAlerte.length} article(s) ont atteint le seuil d'alerte de stock
              </span>
              <span className="text-amber-800">
                Certains produits sont en rupture ou presque épuisés. Réapprovisionnez rapidement pour ne pas perdre de ventes.
              </span>
            </div>
          </div>
          <button
            onClick={() => setOngletActif('stock')}
            className="px-3 py-1.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-800 transition-colors shrink-0"
            type="button"
          >
            Voir les stocks
          </button>
        </div>
      )}

      {/* 4 Indicateurs Clés DJASSA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Indicateur 1 : Offres */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-violet-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Catalogue</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
              {articles.length} articles
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center border border-violet-100">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
        </div>

        {/* Indicateur 2 : Valeur Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-violet-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Valeur du Stock</span>
            <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block truncate max-w-[130px]" title={FORMATTER_PRIX(valeurTotaleStock)}>
              {FORMATTER_PRIX(valeurTotaleStock)}
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <span className="material-symbols-outlined text-[24px]">payments</span>
          </div>
        </div>

        {/* Indicateur 3 : Alertes Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-violet-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Alertes Stock</span>
            <span className={`text-xl sm:text-2xl font-black mt-1 block ${articlesEnAlerte.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {articlesEnAlerte.length} alerte(s)
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
          </div>
        </div>

        {/* Indicateur 4 : Commandes */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-violet-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Commandes</span>
            <span className="text-xl sm:text-2xl font-black text-fuchsia-600 mt-1 block">
              {demandes.length} reçues
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center border border-fuchsia-100">
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
          </div>
        </div>
      </div>

      {/* Onglets de navigation vendeur */}
      <div className="flex items-center gap-2 border-b border-violet-100 pb-2 overflow-x-auto">
        <button
          onClick={() => setOngletActif('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
            ongletActif === 'stock'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">inventory</span>
          <span>Gestion de Stock ({articles.length})</span>
          {articlesEnAlerte.length > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {articlesEnAlerte.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setOngletActif('demandes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
            ongletActif === 'demandes'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span>Commandes ({demandes.length})</span>
        </button>

        <button
          onClick={() => setOngletActif('offres')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
            ongletActif === 'offres'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">list_alt</span>
          <span>Mes Articles</span>
        </button>

        <button
          onClick={() => setOngletActif('profil')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
            ongletActif === 'profil'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">store</span>
          <span>Boutique</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1 : GESTION DE STOCK APPROFONDIE */}
      {ongletActif === 'stock' && (
        <div className="space-y-6">
          {/* Tableau de gestion du stock */}
          <div className="bg-white rounded-3xl border border-violet-100 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black text-slate-900">Inventaire & Niveaux de Stock</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ajustez les quantités, réservez ou mettez à jour vos seuils d'alerte.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Trier par :</span>
                <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-xl">
                  Niveau d'urgence
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-center">Stock Total</th>
                    <th className="py-3 px-4 text-center">Réservé</th>
                    <th className="py-3 px-4 text-center">Disponible</th>
                    <th className="py-3 px-4 text-center">Seuil Alerte</th>
                    <th className="py-3 px-4 text-center">État</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.map((art) => {
                    const dispo = Math.max(0, art.quantiteDisponible - (art.stockReserve ?? 0));
                    const reserve = art.stockReserve ?? 0;
                    const seuil = art.seuilAlerte ?? 5;
                    const estEnAlerte = dispo <= seuil;
                    const estEnRupture = dispo === 0;

                    return (
                      <tr key={art.id} className="hover:bg-violet-50/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={art.photo}
                            alt={art.titre}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]" title={art.titre}>
                              {art.titre}
                            </span>
                            <span className="text-[10px] text-slate-400">{FORMATTER_PRIX(art.prixFCFA)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {art.sku ?? '—'}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-slate-900 text-sm">
                          {art.quantiteDisponible}
                        </td>

                        <td className="py-3 px-4 text-center font-medium text-amber-700">
                          {reserve > 0 ? (
                            <span className="bg-amber-100/80 px-2 py-0.5 rounded-full text-xs font-bold">
                              {reserve}
                            </span>
                          ) : (
                            '0'
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-black text-sm">
                          <span
                            className={
                              estEnRupture ? 'text-rose-600' : estEnAlerte ? 'text-amber-600' : 'text-emerald-700'
                            }
                          >
                            {dispo}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center text-slate-500 font-semibold">
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={seuil}
                            onChange={(e) => onModifierSeuilAlerte(art.id, Number(e.target.value) || 1)}
                            className="w-12 text-center p-1 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                            title="Modifier le seuil d'alerte"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                              estEnRupture
                                ? 'bg-rose-100 text-rose-800'
                                : estEnAlerte
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                estEnRupture ? 'bg-rose-500' : estEnAlerte ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{estEnRupture ? 'Rupture' : estEnAlerte ? 'Stock Bas' : 'Optimal'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setArticleEnEditionStock(art);
                              setAjustementQuantite(0);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-900 font-bold text-xs border border-violet-200 transition-colors cursor-pointer"
                            type="button"
                          >
                            Ajuster
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Journal des mouvements de stock récents */}
          <div className="bg-white rounded-3xl border border-violet-100 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Journal des Mouvements de Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5">Historique des entrées, sorties et réservations automatiques.</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">{mouvementsStock.length} mouvements</span>
            </div>

            <div className="space-y-2.5">
              {mouvementsStock.slice(0, 6).map((mvt) => {
                const articleConcerne = articles.find((a) => a.id === mvt.articleId);

                return (
                  <div
                    key={mvt.id}
                    className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          mvt.type === 'IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mvt.type === 'OUT'
                            ? 'bg-rose-100 text-rose-800'
                            : mvt.type === 'RESERVATION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-violet-100 text-violet-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {mvt.type === 'IN'
                            ? 'arrow_downward'
                            : mvt.type === 'OUT'
                            ? 'arrow_upward'
                            : mvt.type === 'RESERVATION'
                            ? 'lock_clock'
                            : 'sync_alt'}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 block">
                          {articleConcerne?.titre ?? 'Article'}
                        </span>
                        <span className="text-[11px] text-slate-500">{mvt.raison ?? 'Opération de stock'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black text-xs block ${
                          mvt.quantite > 0 && mvt.type === 'IN'
                            ? 'text-emerald-700'
                            : mvt.type === 'OUT'
                            ? 'text-rose-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {mvt.type === 'IN' ? `+${mvt.quantite}` : mvt.type === 'OUT' ? `-${mvt.quantite}` : `${mvt.quantite}`}
                      </span>
                      <span className="text-[10px] text-slate-400">{mvt.dateHeure}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : COMMANDES CLIENTS */}
      {ongletActif === 'demandes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-slate-900">Commandes & Réservations</h2>
            <span className="text-xs font-bold text-slate-500">{demandes.length} commande(s) au total</span>
          </div>

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
                      {dem.modePaiement && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {dem.modePaiement}
                        </span>
                      )}
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
                        : dem.statut === 'Livrée'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {dem.statut}
                  </span>
                </div>

                {/* Articles commandés */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl text-xs">
                  <span className="font-bold text-slate-700 block">Articles commandés :</span>
                  {dem.articles.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-800">
                      <span>
                        <strong>{item.quantite}x</strong> {item.titre}
                      </span>
                      <span className="font-black">{FORMATTER_PRIX(item.prixFCFA * item.quantite)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center font-black text-slate-950 text-sm">
                    <span>Total commande :</span>
                    <span className="text-violet-900">{FORMATTER_PRIX(dem.totalFCFA)}</span>
                  </div>
                </div>

                {/* Coordonnées & actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-slate-500">
                      Ville : <strong className="text-slate-800">{dem.clientVille}</strong>
                    </p>
                    <p className="text-slate-500">
                      Téléphone : <strong className="text-slate-800">{dem.clientTelephone}</strong>
                    </p>
                    {dem.messageClient && (
                      <p className="text-slate-500 italic">"{dem.messageClient}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {dem.statut === 'Nouvelle demande' && (
                      <button
                        onClick={() => {
                          onModifierStatutDemande(dem.id, 'En préparation');
                          notifier(`Commande ${dem.numero} passée en préparation.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-colors cursor-pointer"
                        type="button"
                      >
                        Préparer
                      </button>
                    )}

                    {dem.statut === 'En préparation' && (
                      <button
                        onClick={() => {
                          onModifierStatutDemande(dem.id, 'Livrée');
                          notifier(`Commande ${dem.numero} marquée comme livrée !`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                        type="button"
                      >
                        Marquer livrée
                      </button>
                    )}

                    <a
                      href={`tel:${dem.clientTelephone}`}
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
                      title="Appeler le client"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 3 : MES OFFRES */}
      {ongletActif === 'offres' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-slate-900">Articles actifs en boutique</h2>
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
            {articles.map((art) => {
              const dispo = Math.max(0, art.quantiteDisponible - (art.stockReserve ?? 0));

              return (
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
                        <span className="text-slate-300">&bull;</span>
                        <span className="font-bold text-violet-900">{dispo} disponible(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        setArticleEnEditionStock(art);
                        setAjustementQuantite(0);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-900 border border-violet-200 hover:bg-violet-100 transition-colors"
                      type="button"
                    >
                      Gérer stock ({dispo})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4 : PROFIL VENDEUR */}
      {ongletActif === 'profil' && (
        <div className="bg-white p-6 rounded-3xl border border-violet-100 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center">
              KT
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Kouassi Tech & Bureau</h2>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Vendeur Certifié DJASSA &bull; Abidjan Cocody
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-900 block">Coordonnées professionnelles</span>
              <p className="text-slate-600">Téléphone : +225 07 48 90 12 34</p>
              <p className="text-slate-600">Email : contact@kouassitech.ci</p>
              <p className="text-slate-600">Boutique physique : Cocody Riviera 3, Abidjan</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-900 block">Conditions & Commissions</span>
              <p className="text-slate-600">Taux commission DJASSA : 5% par vente</p>
              <p className="text-slate-600">Délai moyen d'expédition : 24 heures</p>
              <p className="text-slate-600">Règlements acceptés : Wave, Orange Money, Espèces</p>
            </div>
          </div>
        </div>
      )}

      {/* MODALE D'AJUSTEMENT DE STOCK */}
      {articleEnEditionStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-violet-100 my-auto animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-violet-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-600 text-[22px]">tune</span>
                <h3 className="font-black text-base text-slate-900">Ajuster le Stock</h3>
              </div>
              <button
                onClick={() => setArticleEnEditionStock(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-violet-50/60 p-3 rounded-2xl border border-violet-100">
              <span className="font-bold text-xs text-slate-900 block">{articleEnEditionStock.titre}</span>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                <span>Stock actuel : <strong>{articleEnEditionStock.quantiteDisponible}</strong></span>
                <span>&bull;</span>
                <span>Réservé : <strong>{articleEnEditionStock.stockReserve ?? 0}</strong></span>
                <span>&bull;</span>
                <span className="text-violet-900 font-bold">
                  Dispo : {Math.max(0, articleEnEditionStock.quantiteDisponible - (articleEnEditionStock.stockReserve ?? 0))}
                </span>
              </div>
            </div>

            <form onSubmit={handleAppliquerAjustement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Variation de stock (+ pour réappro, - pour sortie) :
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAjustementQuantite((q) => q - 5)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setAjustementQuantite((q) => q - 1)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={ajustementQuantite}
                    onChange={(e) => setAjustementQuantite(Number(e.target.value) || 0)}
                    className="w-full text-center py-2 rounded-xl border border-slate-200 font-black text-sm bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setAjustementQuantite((q) => q + 1)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setAjustementQuantite((q) => q + 5)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    +5
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Nouveau stock total prévu :{' '}
                  <strong className="text-violet-900">
                    {Math.max(0, articleEnEditionStock.quantiteDisponible + ajustementQuantite)} unités
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Motif de l'opération :</label>
                <select
                  value={raisonAjustement}
                  onChange={(e) => setRaisonAjustement(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none text-xs"
                >
                  <option value="Réapprovisionnement magasin">Réapprovisionnement fournisseur / magasin</option>
                  <option value="Correction inventaire physique">Correction suite à inventaire physique</option>
                  <option value="Sortie article endommagé">Article endommagé ou défectueux</option>
                  <option value="Vente directe magasin">Vente physique au comptoir</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setArticleEnEditionStock(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black shadow-md shadow-violet-500/25"
                >
                  Valider la mise à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
