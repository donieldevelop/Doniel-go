import { Pressable, View } from 'react-native';
import { couleurs, polices } from '@/lib/theme';
import { T } from './Texte';

/** Rangée d'options en pastilles (une seule sélectionnée) */
export function Choix<V extends string>({ options, valeur, onChange }: {
  options: { valeur: V; libelle: string }[]; valeur: V; onChange: (v: V) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const actif = o.valeur === valeur;
        return (
          <Pressable key={o.valeur} onPress={() => onChange(o.valeur)} accessibilityRole="radio" accessibilityState={{ selected: actif }}>
            <View style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 2,
              backgroundColor: actif ? couleurs.nuit : '#FFFFFF', borderColor: actif ? couleurs.nuit : couleurs.bordure,
            }}>
              <T style={{ fontFamily: polices.gras, fontSize: 14, color: actif ? '#FFFFFF' : couleurs.texte }}>{o.libelle}</T>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export const MOYENS_ENCAISSEMENT = [
  { valeur: 'especes' as const, libelle: 'Espèces' },
  { valeur: 'mobile_money' as const, libelle: 'Mobile Money' },
];
