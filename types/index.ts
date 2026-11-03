export type OngletNavigation = 'accueil' | 'recherche' | 'vendeur';

export interface Article {
  id: string;
  titre: string;
  description: string;
  prixFCFA: number;
  categorie: 'Électronique & Informatique' | 'Mode & Vêtements' | 'Maison & Bureau' | 'Matériel & Accessoires' | 'Alimentation & Produits Frais';
  ville: string;
  quartier: string;
  vendeurNom: string;
  vendeurTelephone: string;
  vendeurVerifie: boolean;
  photo: string;
  enStock: boolean;
  quantiteDisponible: number;
  stockReserve?: number;
  seuilAlerte?: number;
  sku?: string;
  estFavori?: boolean;
  etat: 'Neuf scellé' | 'Très bon état' | 'Reconditionné garanti';
  delaiLivraison: string;
}

export interface ArticlePanier {
  article: Article;
  quantite: number;
}

export interface DemandeOuCommande {
  id: string;
  numero: string;
  clientNom: string;
  clientTelephone: string;
  clientVille: string;
  articles: {
    articleId?: string;
    titre: string;
    quantite: number;
    prixFCFA: number;
  }[];
  totalFCFA: number;
  dateHeure: string;
  statut: 'Nouvelle demande' | 'En préparation' | 'Livrée' | 'Annulée';
  messageClient?: string;
  modePaiement?: 'Espèces à la livraison' | 'Wave' | 'Orange Money' | 'MTN MoMo' | 'Carte Bancaire';
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVATION' | 'RELEASE';

export interface MouvementStock {
  id: string;
  articleId: string;
  type: MovementType;
  quantite: number;
  raison?: string;
  dateHeure: string;
}

export interface VendorProfile {
  id: string;
  nomBoutique: string;
  slug: string;
  description?: string;
  telephone: string;
  ville: string;
  quartier: string;
  statut: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  tauxCommission: number;
}
