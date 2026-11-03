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
    titre: string;
    quantite: number;
    prixFCFA: number;
  }[];
  totalFCFA: number;
  dateHeure: string;
  statut: 'Nouvelle demande' | 'En préparation' | 'Livrée';
  messageClient?: string;
}
