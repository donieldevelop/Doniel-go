import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { Bouton3D } from '@/components/Bouton3D';
import { Carte3D } from '@/components/Carte3D';
import { Ecran } from '@/components/Ecran';
import { FeuillePublicite } from '@/components/FeuillePublicite';
import { Jauge } from '@/components/Jauge';
import { T } from '@/components/Texte';
import { fcfa } from '@/lib/format';
import { useParametres } from '@/lib/parametres';
import { usePasDuJour } from '@/lib/pas';
import { useSession } from '@/lib/session';
import { messageErreur, supabase } from '@/lib/supabase';
import { couleurs, polices, relief } from '@/lib/theme';

const espaces = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');

export default function Marcher() {
  const { session, profil } = useSession();
  const p = useParametres();
  const { pas, disponible } = usePasDuJour();
  const [dejaRecompenses, setDejaRecompenses] = useState(0);
  const [pub, setPub] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const palier = p.pas_par_palier;
  const parPalier = p.recompense_par_palier;
  const max = p.pas_max_par_jour;

  const charger = useCallback(async () => {
    if (!session) return;
    const jour = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from('pas_journaliers').select('pas_recompenses')
      .eq('utilisateur_id', session.user.id).eq('jour', jour).maybeSingle();
    setDejaRecompenses(data?.pas_recompenses ?? 0);
  }, [session]);
  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  const pasComptes = Math.min(pas, max);
  const gain = Math.max(0, Math.floor(pasComptes / palier) - Math.floor(dejaRecompenses / palier)) * parPalier;
  const avantPalier = palier - (pasComptes % palier);

  async function recompenser() {
    setPub(false);
    setEnCours(true);
    const { data, error } = await supabase.rpc('reclamer_pas', { p_pas_du_jour: pas });
    setEnCours(false);
    if (error) { Alert.alert('Récompense impossible', messageErreur(error)); return; }
    Alert.alert('Bravo !', `${fcfa(Number(data))} de vivres ajoutés à vos bonus.`);
    charger();
  }

  return (
    <Ecran rafraichir={charger}>
      <View style={{ gap: 2, paddingTop: 6 }}>
        <T v="titre">Bonjour {profil?.nom_complet?.split(' ')[0] ?? ''}</T>
        <T v="doux">Tu marches, tu manges.</T>
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <View style={[{ width: 250, height: 250, borderRadius: 125, backgroundColor: couleurs.nuitProfond }, relief(14)]}>
          <LinearGradient colors={[couleurs.nuitClair, couleurs.nuit, couleurs.nuitProfond]} style={{
            flex: 1, borderRadius: 125, alignItems: 'center', justifyContent: 'center',
            borderWidth: 6, borderColor: couleurs.vert, borderBottomColor: couleurs.vertSombre, borderTopColor: couleurs.vertClair,
          }}>
            <View style={{ position: 'absolute', top: 16, width: 170, height: 70, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.10)' }} />
            <T style={{ fontFamily: polices.titre, fontSize: 52, lineHeight: 58, color: '#FFFFFF' }}>{espaces(pas)}</T>
            <T style={{ color: '#C9D3FF', fontFamily: polices.moyen }}>pas aujourd'hui</T>
          </LinearGradient>
        </View>
      </View>

      {disponible === false && (
        <T style={{ color: couleurs.rouge, textAlign: 'center' }}>
          Le compteur de pas n'est pas disponible : autorisez l'activité physique pour Doniel Go dans les réglages du téléphone.
        </T>
      )}

      <Carte3D>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T v="petit">Limite du jour</T>
            <T v="petit">{espaces(pasComptes)} / {espaces(max)} pas</T>
          </View>
          <Jauge valeur={pasComptes} max={max} hauteur={22} />
          <T v="doux">
            {pasComptes >= max
              ? 'Limite du jour atteinte. Reprenez demain !'
              : `Encore ${espaces(avantPalier)} pas pour gagner ${fcfa(parPalier)} de plus.`}
          </T>
        </View>
      </Carte3D>

      <Carte3D sombre>
        <View style={{ gap: 12 }}>
          <T style={{ color: '#C9D3FF' }}>Récompense disponible</T>
          <T style={{ fontFamily: polices.titre, fontSize: 40, lineHeight: 46, color: couleurs.vertClair }}>{fcfa(gain)}</T>
          <T style={{ color: '#DCE3FF' }}>
            {fcfa(parPalier)} de vivres tous les {espaces(palier)} pas, à dépenser sur Dily Soutra.
          </T>
          <Bouton3D titre="Obtenir ma récompense" desactive={gain <= 0} chargement={enCours} onPress={() => setPub(true)} />
        </View>
      </Carte3D>

      <FeuillePublicite visible={pub} onFermer={() => setPub(false)} onTermine={recompenser} />
    </Ecran>
  );
}
