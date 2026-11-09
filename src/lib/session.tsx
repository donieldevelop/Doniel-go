import type { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Chauffeur, Profil } from './types';

type EtatSession = {
  session: Session | null;
  profil: Profil | null;
  chauffeur: Chauffeur | null;
  chargement: boolean;
  recharger: () => Promise<void>;
  deconnexion: () => Promise<void>;
};

const Contexte = createContext<EtatSession | null>(null);

export function FournisseurSession({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [chauffeur, setChauffeur] = useState<Chauffeur | null>(null);
  const [chargement, setChargement] = useState(true);

  const chargerDonnees = useCallback(async (s: Session | null) => {
    if (!s) { setProfil(null); setChauffeur(null); return; }
    const [p, c] = await Promise.all([
      supabase.from('profils').select('*').eq('id', s.user.id).maybeSingle(),
      supabase.from('chauffeurs').select('*').eq('id', s.user.id).maybeSingle(),
    ]);
    setProfil((p.data as Profil) ?? null);
    setChauffeur((c.data as Chauffeur) ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      await chargerDonnees(data.session);
      setSession(data.session);
      setChargement(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_evt, s) => {
      // Différé pour ne pas bloquer le client Supabase pendant l'événement.
      // Le profil est chargé avant la session pour éviter un mauvais aiguillage d'écran.
      setTimeout(async () => { await chargerDonnees(s); setSession(s); }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [chargerDonnees]);

  const recharger = useCallback(() => chargerDonnees(session), [chargerDonnees, session]);
  const deconnexion = useCallback(async () => { await supabase.auth.signOut(); }, []);

  return (
    <Contexte.Provider value={{ session, profil, chauffeur, chargement, recharger, deconnexion }}>
      {children}
    </Contexte.Provider>
  );
}

export function useSession() {
  const c = useContext(Contexte);
  if (!c) throw new Error('useSession doit être utilisé dans FournisseurSession');
  return c;
}
