import { Text, TextProps } from 'react-native';
import { couleurs, polices } from '@/lib/theme';

type Variante = 'titre' | 'sousTitre' | 'corps' | 'doux' | 'petit' | 'chiffre';

const styles: Record<Variante, object> = {
  titre: { fontFamily: polices.titre, fontSize: 30, lineHeight: 36, color: couleurs.texte },
  sousTitre: { fontFamily: polices.gras, fontSize: 20, lineHeight: 26, color: couleurs.texte },
  corps: { fontFamily: polices.normal, fontSize: 16, lineHeight: 23, color: couleurs.texte },
  doux: { fontFamily: polices.normal, fontSize: 15, lineHeight: 21, color: couleurs.texteDoux },
  petit: { fontFamily: polices.moyen, fontSize: 13, lineHeight: 18, color: couleurs.texteDoux },
  chiffre: { fontFamily: polices.titre, fontSize: 26, lineHeight: 32, color: couleurs.texte },
};

export function T({ v = 'corps', style, ...props }: TextProps & { v?: Variante }) {
  return <Text {...props} style={[styles[v], style]} />;
}
