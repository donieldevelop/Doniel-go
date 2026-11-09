import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { couleurs, polices } from '@/lib/theme';
import { T } from './Texte';

/** Champ de saisie creusé (effet incrusté) */
export function Champ({ libelle, aide, ...props }: TextInputProps & { libelle: string; aide?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <T v="petit" style={{ color: couleurs.texte }}>{libelle}</T>
      <View style={s.creux}>
        <TextInput placeholderTextColor="#9AA3BF" {...props} style={s.input} />
      </View>
      {aide ? <T v="petit">{aide}</T> : null}
    </View>
  );
}

const s = StyleSheet.create({
  creux: {
    borderRadius: 16, backgroundColor: '#DDE3F2', paddingTop: 3,
    borderWidth: 1, borderColor: '#C9D1E8', borderBottomColor: '#FFFFFF',
  },
  input: {
    borderRadius: 14, backgroundColor: '#F4F6FC', paddingHorizontal: 16, height: 52,
    fontFamily: polices.moyen, fontSize: 16, color: couleurs.texte,
  },
});
