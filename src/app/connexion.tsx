import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bouton3D } from '@/components/Bouton3D';
import { Carte3D } from '@/components/Carte3D';
import { Champ } from '@/components/Champ';
import { T } from '@/components/Texte';
import { messageErreur, supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/lib/theme';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  async function seConnecter() {
    setErreur('');
    if (!email.trim() || !motDePasse) { setErreur('Saisissez votre e-mail et votre mot de passe.'); return; }
    setEnCours(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: motDePasse });
    setEnCours(false);
    if (error) setErreur(messageErreur(error));
  }

  return (
    <LinearGradient colors={[couleurs.nuitClair, couleurs.nuit, couleurs.nuitProfond]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 22, gap: 28 }} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 4 }}>
              <T style={{ fontFamily: polices.titre, fontSize: 44, lineHeight: 48, color: '#FFFFFF' }}>Doniel Go</T>
              <T style={{ fontFamily: polices.moyen, fontSize: 18, color: couleurs.vertClair }}>
                Tu marches, tu manges. Tu empruntes, tu manges.
              </T>
            </View>
            <Carte3D>
              <View style={{ gap: 16 }}>
                <Champ libelle="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none"
                  keyboardType="email-address" autoComplete="email" placeholder="vous@exemple.com" />
                <Champ libelle="Mot de passe" value={motDePasse} onChangeText={setMotDePasse}
                  secureTextEntry autoComplete="password" placeholder="Votre mot de passe" />
                {erreur ? <T style={{ color: couleurs.rouge }}>{erreur}</T> : null}
                <Bouton3D titre="Se connecter" onPress={seConnecter} chargement={enCours} />
              </View>
            </Carte3D>
            <Link href="/creer-compte" asChild>
              <T style={{ textAlign: 'center', color: '#FFFFFF', fontFamily: polices.gras, fontSize: 17 }}>
                Pas encore de compte ? Créer un compte
              </T>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
