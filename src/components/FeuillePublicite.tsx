import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { couleurs, polices } from '@/lib/theme';
import { Bouton3D } from './Bouton3D';
import { Feuille } from './Feuille';
import { T } from './Texte';

const DUREE = 5;
const NOMBRE = 2;

/**
 * Publicités à regarder avant d'obtenir la récompense.
 * Version provisoire : un espace réservé. Il sera remplacé par les publicités
 * récompensées AdMob dès que le compte AdMob sera créé.
 */
export function FeuillePublicite({ visible, onTermine, onFermer }: { visible: boolean; onTermine: () => void; onFermer: () => void }) {
  const [rang, setRang] = useState(1);
  const [reste, setReste] = useState(DUREE);

  useEffect(() => { if (visible) { setRang(1); setReste(DUREE); } }, [visible]);
  useEffect(() => {
    if (!visible || reste <= 0) return;
    const t = setTimeout(() => setReste((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, reste]);

  const fini = reste <= 0;
  function suite() {
    if (rang < NOMBRE) { setRang(rang + 1); setReste(DUREE); } else onTermine();
  }

  return (
    <Feuille visible={visible} titre={`Publicité ${rang} sur ${NOMBRE}`} onFermer={onFermer}>
      <View style={{ height: 220, borderRadius: 20, backgroundColor: couleurs.nuit, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <T style={{ color: '#C9D3FF', textAlign: 'center' }}>Espace publicitaire</T>
        <T style={{ fontFamily: polices.titre, fontSize: 48, lineHeight: 54, color: couleurs.vertClair }}>{fini ? '✓' : reste}</T>
      </View>
      <T v="doux">Les publicités financent vos vivres gratuits.</T>
      <Bouton3D titre={fini ? (rang < NOMBRE ? 'Publicité suivante' : 'Obtenir ma récompense') : `Patientez ${reste} s`}
        desactive={!fini} onPress={suite} />
    </Feuille>
  );
}
