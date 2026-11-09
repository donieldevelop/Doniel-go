import { View } from 'react-native';
import { couleurs, polices } from '@/lib/theme';
import { T } from './Texte';

const TEINTES: Record<string, [string, string]> = {
  en_attente_retrait: ['#FFF1DD', couleurs.orangeSombre],
  retiree: ['#E3E9FF', couleurs.nuitClair],
  soldee: ['#DDF6E8', couleurs.vertSombre],
  annulee: ['#ECEEF3', couleurs.texteDoux],
  payee: ['#DDF6E8', couleurs.vertSombre],
  a_payer: ['#E3E9FF', couleurs.nuitClair],
  en_retard: ['#FCE3E3', couleurs.rouge],
  actif: ['#DDF6E8', couleurs.vertSombre],
  en_attente: ['#FFF1DD', couleurs.orangeSombre],
  recouvrement: ['#FCE3E3', couleurs.rouge],
};

export function Pastille({ cle, texte }: { cle: string; texte: string }) {
  const [fond, encre] = TEINTES[cle] ?? ['#ECEEF3', couleurs.texteDoux];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: fond, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 }}>
      <T style={{ fontFamily: polices.gras, fontSize: 13, color: encre }}>{texte}</T>
    </View>
  );
}
