import {
  Baloo2_400Regular, Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold, useFonts,
} from '@expo-google-fonts/baloo-2';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { FournisseurPanier } from '@/lib/panier';
import { FournisseurSession, useSession } from '@/lib/session';
import { couleurs, polices } from '@/lib/theme';

function Navigation() {
  const { session, chargement } = useSession();
  if (chargement) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: couleurs.nuit }}>
        <ActivityIndicator size="large" color={couleurs.vertClair} />
      </View>
    );
  }
  const connecte = !!session;
  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
      headerStyle: { backgroundColor: '#F3F6FD' },
      headerTitleStyle: { fontFamily: polices.gras, color: couleurs.texte },
      headerTintColor: couleurs.nuit,
      headerBackTitle: 'Retour',
    }}>
      <Stack.Protected guard={!connecte}>
        <Stack.Screen name="connexion" options={{ headerShown: false }} />
        <Stack.Screen name="creer-compte" options={{ title: 'Créer un compte' }} />
      </Stack.Protected>
      <Stack.Protected guard={connecte}>
        <Stack.Screen name="(onglets)" options={{ headerShown: false }} />
        <Stack.Screen name="panier" options={{ title: 'Mon panier', presentation: 'modal' }} />
        <Stack.Screen name="commande/[id]" options={{ title: 'Ma commande' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function Racine() {
  const [pretes] = useFonts({ Baloo2_400Regular, Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold });
  if (!pretes) return <View style={{ flex: 1, backgroundColor: couleurs.nuit }} />;
  return (
    <FournisseurSession>
      <FournisseurPanier>
        <StatusBar style="dark" />
        <Navigation />
      </FournisseurPanier>
    </FournisseurSession>
  );
}
