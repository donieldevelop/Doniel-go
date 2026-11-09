import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { RefreshControl, ScrollView, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { couleurs } from '@/lib/theme';

type Props = { children: ReactNode; defilant?: boolean; style?: ViewStyle; rafraichir?: () => void; enCours?: boolean };

export function Ecran({ children, defilant = true, style, rafraichir, enCours = false }: Props) {
  const contenu = <View style={[{ padding: 20, gap: 18, paddingBottom: 40 }, style]}>{children}</View>;
  return (
    <LinearGradient colors={['#F3F6FD', couleurs.fond]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {defilant ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            refreshControl={rafraichir ? <RefreshControl refreshing={enCours} onRefresh={rafraichir} tintColor={couleurs.orange} /> : undefined}
          >
            {contenu}
          </ScrollView>
        ) : contenu}
      </SafeAreaView>
    </LinearGradient>
  );
}
