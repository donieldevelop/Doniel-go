import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type Parametres = Record<string, number>;

const DEFAUTS: Parametres = {
  inscription_simple: 10000, inscription_partenaire: 30000,
  quota_depart_simple: 30000, quota_depart_partenaire: 50000,
  quota_3_mois: 50000, quota_6_mois: 100000,
  acompte_retrait_pct: 40, nb_semaines: 6, delai_retrait_jours: 3,
  bonus_partenaire_achats_pct: 10, bonus_parrainage_pct: 5,
  commission_go_pct: 13, bonus_emprunteur_pct: 5,
  pas_par_palier: 1000, recompense_par_palier: 50, pas_max_par_jour: 20000,
};

export function useParametres(): Parametres {
  const [p, setP] = useState<Parametres>(DEFAUTS);
  useEffect(() => {
    supabase.from('parametres').select('cle, valeur').then(({ data }) => {
      if (data) setP({ ...DEFAUTS, ...Object.fromEntries(data.map((r) => [r.cle, Number(r.valeur)])) });
    });
  }, []);
  return p;
}
