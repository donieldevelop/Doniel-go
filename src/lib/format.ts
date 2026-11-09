export function fcfa(n: number | null | undefined): string {
  const v = Math.round(n ?? 0);
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + ' F';
}

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export function date(d: string | null | undefined): string {
  if (!d) return '—';
  const x = new Date(d.length === 10 ? d + 'T12:00:00' : d);
  return `${x.getDate()} ${MOIS[x.getMonth()]} ${x.getFullYear()}`;
}

export const LIBELLE_STATUT: Record<string, string> = {
  en_attente_retrait: 'À retirer',
  retiree: 'En remboursement',
  soldee: 'Soldée',
  annulee: 'Annulée',
};
