import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { Bouton3D } from '@/components/Bouton3D';
import { Carte3D } from '@/components/Carte3D';
import { Ecran } from '@/components/Ecran';
import { Pastille } from '@/components/Pastille';
import { T } from '@/components/Texte';
import { date, fcfa } from '@/lib/format';
import { messageErreur, supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/lib/theme';
import type { Commande, PointRetrait } from '@/lib/types';

type Ligne = { id: string; nom_produit: string; quantite: number; total: number };
const STATUT: Record<string, string> = { en_attente_retrait: 'À retirer', soldee: 'Retirée', retiree: 'Retirée', annulee: 'Annulée' };

export default function DetailCommande() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [c, setC] = useState<Commande | null>(null);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [point, setPoint] = useState<PointRetrait | null>(null);

  const charger = useCallback(async () => {
    const [cmd, l] = await Promise.all([
      supabase.from('commandes').select('*').eq('id', id).maybeSingle(),
      supabase.from('lignes_commande').select('id, nom_produit, quantite, total').eq('commande_id', id),
    ]);
    const commande = (cmd.data as Commande) ?? null;
    setC(commande); setLignes((l.data as Ligne[]) ?? []);
    if (commande?.point_retrait_id) {
      const pt = await supabase.from('points_retrait').select('id, nom, adresse, horaires').eq('id', commande.point_retrait_id).maybeSingle();
      setPoint((pt.data as PointRetrait) ?? null);
    }
  }, [id]);
  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  function annuler() {
    Alert.alert('Annuler la commande ?', 'Vos bonus vous seront rendus.', [
      { text: 'Garder', style: 'cancel' },
      { text: 'Annuler la commande', style: 'destructive', onPress: async () => {
        const { error } = await supabase.rpc('annuler_commande', { p_commande: id });
        if (error) Alert.alert('Annulation impossible', messageErreur(error)); else router.back();
      } },
    ]);
  }

  if (!c) return <Ecran><T v="doux">Chargement…</T></Ecran>;
  return (
    <Ecran>
      <View style={{ gap: 6 }}>
        <T v="titre">Commande n°{c.numero}</T>
        <Pastille cle={c.statut === 'en_attente_retrait' ? 'en_attente_retrait' : c.statut === 'annulee' ? 'annulee' : 'soldee'} texte={STATUT[c.statut]} />
      </View>
      {c.statut === 'en_attente_retrait' && (
        <Carte3D sombre>
          <View style={{ gap: 6 }}>
            <T style={{ color: '#C9D3FF' }}>À retirer avant le {date(c.date_limite_retrait)}</T>
            <T style={{ fontFamily: polices.gras, fontSize: 19, color: '#FFFFFF' }}>{point?.nom ?? 'Point de retrait'}</T>
            {point?.adresse ? <T style={{ color: '#DCE3FF' }}>{point.adresse}</T> : null}
            {point?.horaires ? <T style={{ color: '#DCE3FF' }}>{point.horaires}</T> : null}
            <T style={{ color: couleurs.vertClair, fontFamily: polices.gras, marginTop: 6 }}>Déjà payé avec vos bonus : rien à régler.</T>
            <T style={{ color: '#C9D3FF', fontSize: 14 }}>Présentez le numéro de commande au point de retrait.</T>
          </View>
        </Carte3D>
      )}
      <Carte3D>
        <View style={{ gap: 8 }}>
          <T v="sousTitre">Produits</T>
          {lignes.map((l) => (
            <View key={l.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <T style={{ flex: 1 }}>{l.quantite} × {l.nom_produit}</T>
              <T style={{ fontFamily: polices.gras }}>{fcfa(l.total)}</T>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <T style={{ fontFamily: polices.gras }}>Total payé en bonus</T>
            <T style={{ fontFamily: polices.titre, color: couleurs.vertSombre }}>{fcfa(c.montant_denrees)}</T>
          </View>
        </View>
      </Carte3D>
      {c.statut === 'en_attente_retrait' && <Bouton3D titre="Annuler la commande" ton="clair" onPress={annuler} />}
    </Ecran>
  );
}
