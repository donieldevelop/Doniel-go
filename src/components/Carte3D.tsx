import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { couleurs, relief } from '@/lib/theme';

/** Carte en relief : surface bombée claire, arête lumineuse en haut, ombre profonde */
export function Carte3D({ children, style, sombre }: { children: ReactNode; style?: ViewStyle; sombre?: boolean }) {
  return (
    <View style={[s.conteneur, relief(sombre ? 10 : 6), style]}>
      <LinearGradient
        colors={sombre ? [couleurs.nuitClair, couleurs.nuit, couleurs.nuitProfond] : [couleurs.surface, couleurs.surfaceHaut]}
        style={[s.face, sombre && { borderColor: 'rgba(255,255,255,0.14)' }]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  conteneur: { borderRadius: 24, backgroundColor: couleurs.surface },
  face: {
    borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#FFFFFF',
    borderBottomColor: couleurs.bordure,
  },
});
