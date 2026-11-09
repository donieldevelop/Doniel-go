import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet } from 'react-native';
import { couleurs, polices, relief } from '@/lib/theme';
import { T } from './Texte';

/** Petit bouton rond en relief (+ / −) */
export function Rond({ texte, onPress, libelle, desactive }: { texte: string; onPress: () => void; libelle: string; desactive?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={desactive} accessibilityLabel={libelle} accessibilityRole="button"
      style={({ pressed }) => [s.rond, relief(pressed ? 1 : 3, couleurs.vertSombre), { opacity: desactive ? 0.4 : 1, transform: [{ translateY: pressed ? 2 : 0 }] }]}>
      <LinearGradient colors={[couleurs.vertClair, couleurs.vert]} style={s.rondFace}>
        <T style={{ fontFamily: polices.titre, fontSize: 22, lineHeight: 26, color: '#FFFFFF' }}>{texte}</T>
      </LinearGradient>
    </Pressable>
  );
}

const s = StyleSheet.create({
  rond: { width: 38, height: 38, borderRadius: 19, backgroundColor: couleurs.vertSombre },
  rondFace: { width: 38, height: 35, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
