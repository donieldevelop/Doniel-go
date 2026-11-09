import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Bouton3D } from '@/components/Bouton3D';
import { Carte3D } from '@/components/Carte3D';
import { Champ } from '@/components/Champ';
import { Ecran } from '@/components/Ecran';
import { T } from '@/components/Texte';
import { messageErreur, supabase } from '@/lib/supabase';
import { couleurs } from '@/lib/theme';

export default function CreerCompte() {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  async function creer() {
    setErreur('');
    if (!nom.trim() || !telephone.trim() || !email.trim()) { setErreur('Remplissez tous les champs.'); return; }
    if (motDePasse.length < 6) { setErreur('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setEnCours(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: motDePasse,
      options: { data: { role: 'client', nom_complet: nom.trim(), telephone: telephone.trim() } },
    });
    setEnCours(false);
    if (error) { setErreur(messageErreur(error)); return; }
    if (!data.session) {
      Alert.alert('Vérifiez vos e-mails', 'Un lien de confirmation vous a été envoyé. Confirmez votre adresse, puis connectez-vous.');
      router.back();
    }
  }

  return (
    <Ecran>
      <T v="doux">Créez votre compte pour gagner des vivres en marchant et à chaque course.</T>
      <Carte3D>
        <View style={{ gap: 16 }}>
          <Champ libelle="Nom et prénoms" value={nom} onChangeText={setNom} autoComplete="name" />
          <Champ libelle="Téléphone" value={telephone} onChangeText={setTelephone}
            keyboardType="phone-pad" placeholder="07 00 00 00 00" />
          <Champ libelle="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Champ libelle="Mot de passe" value={motDePasse} onChangeText={setMotDePasse}
            secureTextEntry aide="6 caractères minimum" />
          {erreur ? <T style={{ color: couleurs.rouge }}>{erreur}</T> : null}
          <Bouton3D titre="Créer mon compte" onPress={creer} chargement={enCours} />
        </View>
      </Carte3D>
    </Ecran>
  );
}
