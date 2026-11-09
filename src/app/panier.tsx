import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Bouton3D } from '@/components/Bouton3D';
import { Carte3D } from '@/components/Carte3D';
import { Ecran } from '@/components/Ecran';
import { Rond } from '@/components/Rond';
import { T } from '@/components/Texte';
import { fcfa } from '@/lib/format';
import { usePanier } from '@/lib/panier';
import { useSession } from '@/lib/session';
import { messageErreur, supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/lib/theme';
import type { PointRetrait } from '@/lib/types';

export default function Panier() {
  const panier = usePanier();
  const { session } = useSession();
  const [points, setPoints] = useState<PointRetrait[]>([]);
  const [point, setPoint] = useState<string | null>(null);
  const [solde, setSolde] = useState(0);
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  useFocusEffect(useCallback(() => {
    supabase.from('points_retrait').select('id, nom, adresse, horaires').order('nom').then(({ data }) => {
      const liste = (data as PointRetrait[]) ?? [];
      setPoints(liste);
      if (liste.length === 1) setPoint(liste[0].id);
    });
    if (session) supabase.rpc('solde_bonus', { p_utilisateur: session.user.id }).then(({ data }) => setSolde(Number(data ?? 0)));
  }, [session]));

  const manque = panier.total - solde;

  async function commander() {
    setErreur('');
    if (!point) { setErreur('Choisissez votre point de retrait.'); return; }
    setEnCours(true);
    const { data, error } = await supabase.rpc('passer_commande', {
      p_articles: panier.lignes.map((l) => ({ produit_id: l.produit.id, quantite: l.quantite })),
      p_point_retrait: point,
    });
    setEnCours(false);
    if (error) { setErreur(messageErreur(error)); return; }
    panier.vider();
    router.dismiss();
    router.push(`/commande/${(data as { id: string }).id}`);
  }

  if (panier.nombre === 0) {
    return (
      <Ecran>
        <T v="doux">Votre panier est vide. Ajoutez des vivres depuis Dily Soutra.</T>
        <Bouton3D titre="Retour à la boutique" onPress={() => router.back()} />
      </Ecran>
    );
  }

  return (
    <Ecran>
      <Carte3D>
        <View style={{ gap: 12 }}>
          {panier.lignes.map((l) => (
            <View key={l.produit.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <T style={{ fontFamily: polices.gras }}>{l.produit.nom}</T>
                <T v="petit">{fcfa(l.produit.prix_vente)} × {l.quantite} = {fcfa(l.produit.prix_vente * l.quantite)}</T>
              </View>
              <Rond texte="−" onPress={() => panier.changer(l.produit.id, l.quantite - 1)} libelle={`Retirer un ${l.produit.nom}`} />
              <T style={{ fontFamily: polices.titre, fontSize: 18, minWidth: 20, textAlign: 'center' }}>{l.quantite}</T>
              <Rond texte="+" onPress={() => panier.changer(l.produit.id, l.quantite + 1)} libelle={`Ajouter un ${l.produit.nom}`}
                desactive={l.quantite >= l.produit.stock} />
            </View>
          ))}
        </View>
      </Carte3D>

      <View style={{ gap: 10 }}>
        <T v="sousTitre">Point de retrait</T>
        {points.length === 0 && <T v="doux">Aucun point de retrait disponible pour le moment.</T>}
        {points.map((pt) => {
          const choisi = point === pt.id;
          return (
            <Pressable key={pt.id} onPress={() => setPoint(pt.id)} accessibilityRole="radio" accessibilityState={{ selected: choisi }}>
              <View style={{
                borderRadius: 18, padding: 14, borderWidth: 2, backgroundColor: choisi ? '#E6F8EE' : '#FFFFFF',
                borderColor: choisi ? couleurs.vert : couleurs.bordure,
              }}>
                <T style={{ fontFamily: polices.gras }}>{pt.nom}</T>
                {pt.adresse ? <T v="petit">{pt.adresse}</T> : null}
                {pt.horaires ? <T v="petit">{pt.horaires}</T> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Carte3D sombre>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T style={{ color: '#DCE3FF' }}>Total</T>
            <T style={{ fontFamily: polices.titre, fontSize: 22, color: '#FFFFFF' }}>{fcfa(panier.total)}</T>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T style={{ color: '#DCE3FF' }}>Mes bonus</T>
            <T style={{ fontFamily: polices.gras, color: couleurs.vertClair }}>{fcfa(solde)}</T>
          </View>
          <T style={{ color: manque > 0 ? '#FFB3B3' : '#C9D3FF', fontSize: 14, marginTop: 4 }}>
            {manque > 0
              ? `Il vous manque ${fcfa(manque)} de bonus. Marchez ou empruntez Doniel Go pour en gagner.`
              : 'Payé entièrement avec vos bonus. Retrait sous 3 jours au point choisi.'}
          </T>
        </View>
      </Carte3D>

      {erreur ? <T style={{ color: couleurs.rouge }}>{erreur}</T> : null}
      <Bouton3D titre="Payer avec mes bonus" onPress={commander} chargement={enCours} desactive={!point || manque > 0} />
    </Ecran>
  );
}
