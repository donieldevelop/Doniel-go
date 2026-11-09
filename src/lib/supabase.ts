import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState } from 'react-native';

const extra = Constants.expoConfig?.extra as { supabaseUrl: string; supabaseKey: string };

export const supabase = createClient(extra.supabaseUrl, extra.supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Rafraîchit la session uniquement quand l'appli est au premier plan
AppState.addEventListener('change', (etat) => {
  if (etat === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/** Message d'erreur lisible (les erreurs métier viennent de la base, en français) */
export function messageErreur(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) {
    const m = String((e as { message: string }).message);
    if (m.includes('Invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
    if (m.includes('User already registered')) return 'Un compte existe déjà avec cet e-mail.';
    if (m.includes('Password should be')) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (m.includes('Network request failed')) return 'Pas de connexion internet. Réessayez.';
    return m;
  }
  return 'Une erreur est survenue. Réessayez.';
}
