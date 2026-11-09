import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bouton3D } from '@/components/Bouton3D';
import { Rond } from '@/components/Rond';
import { T } from '@/components/Texte';
import { fcfa } from '@/lib/format';
import { usePanier } from '@/lib/panier';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { couleurs, polices, relief } from '@/lib/theme';
import type { Produit } from '@/lib/types';

export default function Boutique() {
  const { session } = useSession();
  const panier = usePanier();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [quota, setQuota] = useState(0);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    setEnCours(true);
    const [p, q] = await Promise.all([
      supabase.from('catalogue').select('*').order('nom'),
      session ? supabase.rpc('solde_bonus', { p_utilisateur: session.user.id }) : Promise.resolve({ data: 0 }),
    ]);
    setProduits((p.data as Produit[]) ?? []);
    setQuota(Number(q.data ?? 0));
    setEnCours(false);
  }, [session]);
  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  const sections = useMemo(() => {
    const groupes = new Map<string, Produit[]>();
    produits.forEach((p) => {
      const c = p.categorie ?? 'Autres produits';
      groupes.set(c, [...(groupes.get(c) ?? []), p]);
    });
    return [...groupes.entries()].map(([title, data]) => ({ title, data }));
  }, [produits]);

  const depasse = panier.total > quota;

  return (
    <LinearGradient colors={['#F3F6FD', couleurs.fond]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6 }}>
          <T v="titre">Dily Soutra</T>
          <T v="doux">Vos bonus : {fcfa(quota)} de vivres à dépenser.</T>
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(p) => p.id}
          refreshing={enCours}
          onRefresh={charger}
          contentContainerStyle={{ padding: 20, paddingBottom: panier.nombre ? 140 : 30, gap: 12 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => <T v="sousTitre" style={{ marginTop: 8 }}>{section.title}</T>}
          renderItem={({ item }) => <CarteProduit produit={item} />}
          ListEmptyComponent={!enCours ? (
            <T v="doux" style={{ textAlign: 'center', marginTop: 40 }}>
              La boutique se remplit bientôt. Tirez vers le bas pour actualiser.
            </T>
          ) : undefined}
        />
        {panier.nombre > 0 && (
          <View style={[s.barre, relief(12)]}>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: polices.titre, fontSize: 22, color: depasse ? '#FFB3B3' : '#FFFFFF' }}>{fcfa(panier.total)}</T>
              <T style={{ color: depasse ? '#FFB3B3' : '#C9D3FF', fontSize: 14 }}>
                {depasse ? `Il vous manque ${fcfa(panier.total - quota)} de bonus` : `${panier.nombre} article${panier.nombre > 1 ? 's' : ''}`}
              </T>
            </View>
            <Bouton3D titre="Voir le panier" petit onPress={() => router.push('/panier')} />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function CarteProduit({ produit }: { produit: Produit }) {
  const { ajouter, changer, quantiteDe } = usePanier();
  const q = quantiteDe(produit.id);
  const epuise = produit.stock <= 0;
  return (
    <View style={[s.carte, relief(4)]}>
      <LinearGradient colors={['#FFFFFF', '#F3F6FD']} style={s.carteFace}>
        <View style={s.vignette}>
          {produit.image_url
            ? <Image source={{ uri: produit.image_url }} style={{ width: '100%', height: '100%' }} />
            : <T style={{ fontFamily: polices.titre, fontSize: 26, color: couleurs.nuitClair }}>{produit.nom.charAt(0)}</T>}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T style={{ fontFamily: polices.gras, fontSize: 17 }}>{produit.nom}</T>
          <T v="petit">{produit.unite}</T>
          <T style={{ fontFamily: polices.titre, fontSize: 19, color: couleurs.nuit }}>{fcfa(produit.prix_vente)}</T>
        </View>
        {epuise ? (
          <T v="petit" style={{ color: couleurs.rouge }}>Épuisé</T>
        ) : q === 0 ? (
          <Bouton3D titre="Ajouter" petit onPress={() => ajouter(produit)} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Rond texte="−" onPress={() => changer(produit.id, q - 1)} libelle={`Retirer un ${produit.nom}`} />
            <T style={{ fontFamily: polices.titre, fontSize: 20, minWidth: 22, textAlign: 'center' }}>{q}</T>
            <Rond texte="+" onPress={() => changer(produit.id, q + 1)} libelle={`Ajouter un ${produit.nom}`} desactive={q >= produit.stock} />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  carte: { borderRadius: 20, backgroundColor: '#FFFFFF' },
  carteFace: { borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FFFFFF', borderBottomColor: couleurs.bordure },
  vignette: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#E3E9FF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  barre: {
    position: 'absolute', left: 14, right: 14, bottom: 12, borderRadius: 24, padding: 14, paddingLeft: 20,
    backgroundColor: couleurs.nuit, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
});
