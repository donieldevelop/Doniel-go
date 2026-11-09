export type Profil = {
  id: string; role: 'chauffeur' | 'client' | 'admin';
  nom_complet: string | null; telephone: string | null; photo_url: string | null;
};
export type Chauffeur = {
  id: string; type: 'simple' | 'partenaire'; statut: 'en_attente' | 'actif' | 'recouvrement';
  numero_permis: string; immatriculation: string | null; modele_vehicule: string | null;
  code_parrain: string | null; parrain_id: string | null; frais_inscription: number;
  inscription_payee: boolean; bon_payeur_depuis: string | null; cree_le: string;
};
export type Produit = {
  id: string; categorie_id: string | null; categorie: string | null; nom: string;
  description: string | null; unite: string; prix_vente: number; stock: number; image_url: string | null;
};
export type StatutCommande = 'en_attente_retrait' | 'retiree' | 'soldee' | 'annulee';
export type Commande = {
  id: string; numero: number; type: 'chauffeur' | 'client'; statut: StatutCommande; montant_denrees: number;
  frais_inscription: number; montant_total: number; montant_paye: number;
  point_retrait_id: string | null; cree_le: string; date_limite_retrait: string;
  retiree_le: string | null; soldee_le: string | null;
};
export type Echeance = {
  id: string; rang: number; libelle: string; montant: number; montant_paye: number;
  date_echeance: string | null; statut: 'a_payer' | 'payee' | 'en_retard';
};
export type PointRetrait = { id: string; nom: string; adresse: string | null; horaires: string | null };
export type MouvementBonus = { id: string; montant: number; source: string; note: string | null; cree_le: string };

export type Personne = { nom_complet: string | null; telephone: string | null };
export type CommandeAdmin = Commande & { profils: Personne | null; echeances: Echeance[] };
export type ChauffeurAdmin = Chauffeur & { permis_url: string; piece_identite_url: string | null; profils: Personne | null };
export type ProduitAdmin = {
  id: string; categorie_id: string | null; nom: string; description: string | null; unite: string;
  prix_achat: number; marge_pct: number; prix_vente: number; stock: number; image_url: string | null; actif: boolean;
};

export type Zone = { id: string; nom: string; prix_km: number; prise_en_charge: number };
export type StatutCourse = 'demandee' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
export type Course = {
  id: string; client_id: string; chauffeur_id: string | null; zone_id: string;
  depart_adresse: string | null; arrivee_adresse: string | null; distance_km: number; prix: number;
  bonus_client: number | null; moyen_paiement: 'especes' | 'mobile_money'; statut: StatutCourse; cree_le: string;
};
export type InfosCourse = {
  client_nom: string | null; client_telephone: string | null; chauffeur_nom: string | null;
  chauffeur_telephone: string | null; vehicule: string | null; immatriculation: string | null;
};
