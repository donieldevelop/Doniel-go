import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Bouton3D } from '@/components/Bouton3D';
import { Carte3D } from '@/components/Carte3D';
import { Ecran } from '@/components/Ecran';
import { Pastille } from '@/components/Pastille';
import { T } from '@/components/Texte';
import { date, fcfa } from '@/lib/format';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/lib/theme';
import type { Commande, MouvementBonus } from '@/lib/types';

const SOURCES: Record<string, string> = { pas: 'Marche', course: 'Course', achat: 'Achat Dily Soutra', ajustement: 'Remboursement' };

export default function Bonus() {
  const { session, profil, deconnexion } = useSession();
  const [solde, setSolde] = useState(0);
  const [mouvements, setMouvements] = useState<MouvementBonus[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    if (!session) return;
    setEnCours(true);
    const [s, m, c] = await Promise.all([
      supabase.rpc('solde_bonus', { p_utilisateur: session.user.id }),
      supabase.from('mouvements_bonus').select('*').eq('utilisateur_id', session.user.id).order('cree_le', { ascending: false }).limit(30),
      supabase.from('commandes').select('*').eq('utilisateur_id', session.user.id).order('cree_le', { ascending: false }).limit(10),
    ]);
    setSolde(Number(s.data ?? 0));
    setMouvements((m.data as MouvementBonus[]) ?? []);
    setCommandes((c.data as Commande[]) ?? []);
    setEnCours(false);
  }, [session]);
  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  return (
    <Ecran rafraichir={charger} enCours={enCours}>
      <T v="titre">Mes bonus</T>
      <Carte3D sombre>
        <View style={{ gap: 10 }}>
          <T style={{ color: '#C9D3FF' }}>Vivres disponibles</T>
          <T style={{ fontFamily: polices.titre, fontSize: 44, lineHeight: 50, color: couleurs.vertClair }}>{fcfa(solde)}</T>
          <Bouton3D titre="Dépenser sur Dily Soutra" onPress={() => router.push('/boutique')} />
        </View>
      </Carte3D>

      {commandes.length > 0 && (
        <Carte3D>
          <View style={{ gap: 10 }}>
            <T v="sousTitre">Mes commandes</T>
            {commandes.map((c) => (
              <Pressable key={c.id} onPress={() => router.push(`/commande/${c.id}`)} accessibilityRole="button">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <T style={{ fontFamily: polices.gras }}>N°{c.numero}, {fcfa(c.montant_denrees)}</T>
                    <T v="petit">{date(c.cree_le)}</T>
                  </View>
                  <Pastille cle={c.statut === 'retiree' ? 'soldee' : c.statut}
                    texte={c.statut === 'en_attente_retrait' ? 'À retirer' : c.statut === 'annulee' ? 'Annulée' : 'Retirée'} />
                </View>
              </Pressable>
            ))}
          </View>
        </Carte3D>
      )}

      <Carte3D>
        <View style={{ gap: 8 }}>
          <T v="sousTitre">Historique</T>
          {mouvements.length === 0 && <T v="doux">Marchez ou empruntez Doniel Go pour gagner vos premiers vivres.</T>}
          {mouvements.map((m) => (
            <View key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <T>{SOURCES[m.source] ?? 'Bonus'}{m.note ? `, ${m.note}` : ''}</T>
                <T v="petit">{date(m.cree_le)}</T>
              </View>
              <T style={{ fontFamily: polices.gras, color: m.montant >= 0 ? couleurs.vertSombre : couleurs.rouge }}>
                {m.montant >= 0 ? '+' : ''}{fcfa(m.montant)}
              </T>
            </View>
          ))}
        </View>
      </Carte3D>

      <T v="doux">Connecté : {profil?.nom_complet ?? session?.user.email}</T>
      <Bouton3D titre="Se déconnecter" ton="clair" onPress={deconnexion} />
    </Ecran>
  );
}
