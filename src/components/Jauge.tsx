import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { couleurs } from '@/lib/theme';

/** Jauge en tube : rail creusé et remplissage brillant en relief */
export function Jauge({ valeur, max, hauteur = 30 }: { valeur: number; max: number; hauteur?: number }) {
  const pct = max > 0 ? Math.min(1, Math.max(0, valeur / max)) : 0;
  const r = hauteur / 2;
  return (
    <LinearGradient
      colors={[couleurs.nuitProfond, '#24326F']}
      style={{ height: hauteur, borderRadius: r, padding: 3, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
    >
      {pct > 0 && (
        <LinearGradient
          colors={[couleurs.vertClair, couleurs.vert, couleurs.vertSombre]}
          locations={[0, 0.55, 1]}
          style={{ height: '100%', width: `${Math.max(pct * 100, 8)}%`, borderRadius: r - 3, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', top: 3, left: 6, right: 6, height: '35%', borderRadius: r, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        </LinearGradient>
      )}
    </LinearGradient>
  );
}
