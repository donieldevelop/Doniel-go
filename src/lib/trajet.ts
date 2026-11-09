import * as Location from 'expo-location';

export type Lieu = { adresse: string; lat: number; lng: number };

/** Position actuelle du téléphone, avec une adresse lisible */
export async function maPosition(): Promise<Lieu> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) throw new Error('Autorisez la localisation pour utiliser votre position.');
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude: lat, longitude: lng } = pos.coords;
  let adresse = 'Ma position';
  try {
    const [r] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (r) adresse = [r.name, r.street, r.district, r.city].filter(Boolean).join(', ') || adresse;
  } catch { /* adresse générique */ }
  return { adresse, lat, lng };
}

/** Retrouve un lieu à partir de son nom (quartier, rue, repère) */
export async function chercherLieu(texte: string): Promise<Lieu> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) throw new Error('Autorisez la localisation pour rechercher une adresse.');
  const resultats = await Location.geocodeAsync(`${texte}, Abidjan, Côte d'Ivoire`);
  if (!resultats.length) throw new Error(`Lieu introuvable : « ${texte} ». Précisez le quartier ou un repère.`);
  return { adresse: texte, lat: resultats[0].latitude, lng: resultats[0].longitude };
}

/**
 * Distance estimée par la route (km).
 * Provisoire : distance à vol d'oiseau × 1,3, en attendant la clé Google Maps.
 */
export function distanceKm(a: Lieu, b: Lieu): number {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const vol = 2 * R * Math.asin(Math.sqrt(h));
  return Math.max(1, Math.round(vol * 1.3 * 10) / 10);
}
