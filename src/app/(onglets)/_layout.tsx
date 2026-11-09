import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import type { ColorValue } from 'react-native';
import { usePanier } from '@/lib/panier';
import { couleurs, polices } from '@/lib/theme';

type NomIcone = keyof typeof Ionicons.glyphMap;
const icone = (nom: NomIcone) => ({ color, size }: { color: ColorValue; size: number }) =>
  <Ionicons name={nom} color={color as string} size={size} />;

export default function Onglets() {
  const { nombre } = usePanier();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: couleurs.vertClair,
      tabBarInactiveTintColor: '#AEB8DA',
      tabBarLabelStyle: { fontFamily: polices.gras, fontSize: 12 },
      tabBarStyle: {
        backgroundColor: couleurs.nuit, borderTopWidth: 0, height: 66, paddingTop: 6,
        elevation: 16, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: -4 },
      },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Marcher', tabBarIcon: icone('walk') }} />
      <Tabs.Screen name="course" options={{ title: 'Emprunter', tabBarIcon: icone('car-sport') }} />
      <Tabs.Screen name="boutique" options={{
        title: 'Dily Soutra', tabBarIcon: icone('basket'),
        tabBarBadge: nombre > 0 ? nombre : undefined, tabBarBadgeStyle: { backgroundColor: couleurs.vert, color: '#FFFFFF' },
      }} />
      <Tabs.Screen name="bonus" options={{ title: 'Mes bonus', tabBarIcon: icone('gift') }} />
    </Tabs>
  );
}
