import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

const cleDuJour = () => `pas:${new Date().toISOString().slice(0, 10)}`;
const debutDuJour = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

/**
 * Pas du jour.
 * iPhone : le téléphone compte en permanence, on lit le total de la journée.
 * Android : les pas sont comptés quand l'appli est ouverte et cumulés dans la journée
 * (le comptage en arrière-plan viendra avec Health Connect).
 */
export function usePasDuJour() {
  const [pas, setPas] = useState(0);
  const [disponible, setDisponible] = useState<boolean | null>(null);
  const base = useRef(0);

  useEffect(() => {
    let abonnement: { remove: () => void } | null = null;
    let actif = true;

    async function demarrer() {
      const ok = await Pedometer.isAvailableAsync();
      const perm = await Pedometer.requestPermissionsAsync();
      if (!actif) return;
      setDisponible(ok && perm.granted);
      if (!ok || !perm.granted) return;

      if (Platform.OS === 'ios') {
        const lire = async () => {
          const r = await Pedometer.getStepCountAsync(debutDuJour(), new Date());
          if (actif) setPas(r.steps);
        };
        await lire();
        abonnement = Pedometer.watchStepCount(() => { lire(); });
      } else {
        base.current = Number(await AsyncStorage.getItem(cleDuJour())) || 0;
        setPas(base.current);
        let cle = cleDuJour();
        abonnement = Pedometer.watchStepCount(({ steps }) => {
          if (cle !== cleDuJour()) { cle = cleDuJour(); base.current = 0; }
          const total = base.current + steps;
          setPas(total);
          AsyncStorage.setItem(cle, String(total));
        });
      }
    }

    demarrer();
    // Android : à chaque retour dans l'appli, on repart du total enregistré
    const sub = AppState.addEventListener('change', (etat) => {
      if (etat === 'active' && Platform.OS !== 'ios') {
        abonnement?.remove();
        demarrer();
      }
    });
    return () => { actif = false; abonnement?.remove(); sub.remove(); };
  }, []);

  return { pas, disponible };
}
