import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { couleurs, polices, relief } from '@/lib/theme';
import { T } from './Texte';

type Ton = 'orange' | 'nuit' | 'vert' | 'clair';

const TONS: Record<Ton, { haut: string; bas: string; levre: string; texte: string }> = {
  orange: { haut: couleurs.orangeClair, bas: couleurs.orange, levre: couleurs.orangeSombre, texte: '#3A1D00' },
  nuit: { haut: couleurs.nuitClair, bas: couleurs.nuit, levre: couleurs.nuitProfond, texte: '#FFFFFF' },
  vert: { haut: couleurs.vertClair, bas: couleurs.vert, levre: couleurs.vertSombre, texte: '#FFFFFF' },
  clair: { haut: '#FFFFFF', bas: '#E3E8F6', levre: '#B9C2DD', texte: couleurs.nuit },
};

type Props = {
  titre: string;
  onPress?: () => void;
  ton?: Ton;
  chargement?: boolean;
  desactive?: boolean;
  style?: ViewStyle;
  petit?: boolean;
};

/** Bouton en relief : face brillante dégradée posée sur une « lèvre » plus sombre */
export function Bouton3D({ titre, onPress, ton = 'vert', chargement, desactive, style, petit }: Props) {
  const c = TONS[ton];
  const inactif = desactive || chargement;
  const hauteur = petit ? 44 : 56;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactif}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactif }}
      style={[{ opacity: desactive ? 0.5 : 1 }, style]}
    >
      {({ pressed }) => (
        <View style={[{ height: hauteur + 6, borderRadius: 18 }, !pressed && relief(5, c.levre)]}>
          <View style={[StyleSheet.absoluteFill, { top: 6, backgroundColor: c.levre, borderRadius: 18 }]} />
          <LinearGradient
            colors={[c.haut, c.bas]}
            style={[s.face, { height: hauteur, transform: [{ translateY: pressed ? 5 : 0 }] }]}
          >
            <View style={s.reflet} />
            {chargement
              ? <ActivityIndicator color={c.texte} />
              : <T style={{ fontFamily: polices.gras, fontSize: petit ? 16 : 18, color: c.texte }}>{titre}</T>}
          </LinearGradient>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  face: { borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, overflow: 'hidden' },
  reflet: {
    position: 'absolute', top: 3, left: 10, right: 10, height: '42%',
    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
