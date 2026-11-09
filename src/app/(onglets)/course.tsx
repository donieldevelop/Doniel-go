import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, View } from 'react-native';
import { Bouton3D } from '@/components/Bouton3D';
import { Carte3D } from '@/components/Carte3D';
import { Champ } from '@/components/Champ';
import { Choix } from '@/components/Choix';
import { Ecran } from '@/components/Ecran';
import { T } from '@/components/Texte';
import { fcfa } from '@/lib/format';
import { useParametres } from '@/lib/parametres';
import { useSession } from '@/lib/session';
import { messageErreur, supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/lib/theme';
import { chercherLieu, distanceKm, Lieu, maPosition } from '@/lib/trajet';
import type { Course, InfosCourse, Zone } from '@/lib/types';

const ETAPES: Record<string, string> = {
  demandee: 'Recherche d\'un chauffeur…',
  acceptee: 'Votre chauffeur arrive',
  en_cours: 'Course en cours',
};

export default function Emprunter() {
  const { session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [verifie, setVerifie] = useState(false);

  const charger = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from('courses').select('*').eq('client_id', session.user.id)
      .in('statut', ['demandee', 'acceptee', 'en_cours']).order('cree_le', { ascending: false }).limit(1).maybeSingle();
    setCourse((data as Course) ?? null);
    setVerifie(true);
  }, [session]);
  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  // Suivi de la course : actualisation toutes les 5 secondes
  useEffect(() => {
    if (!course) return;
    const id = course.id;
    const t = setInterval(async () => {
      const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
      const c = data as Course | null;
      if (c && c.statut === 'terminee') {
        Alert.alert('Course terminée', `Merci ! ${fcfa(c.bonus_client ?? 0)} de vivres ajoutés à vos bonus.`);
        setCourse(null);
      } else if (c && c.statut === 'annulee') {
        Alert.alert('Course annulée');
        setCourse(null);
      } else setCourse(c);
    }, 5000);
    return () => clearInterval(t);
  }, [course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!verifie) return <Ecran><T v="doux">Chargement…</T></Ecran>;
  return course ? <SuiviCourse course={course} onAnnulee={() => setCourse(null)} /> : <NouvelleCourse onCommandee={setCourse} />;
}

function NouvelleCourse({ onCommandee }: { onCommandee: (c: Course) => void }) {
  const p = useParametres();
  const [zones, setZones] = useState<Zone[]>([]);
  const [zone, setZone] = useState('');
  const [departTexte, setDepartTexte] = useState('');
  const [depart, setDepart] = useState<Lieu | null>(null);
  const [arriveeTexte, setArriveeTexte] = useState('');
  const [estimation, setEstimation] = useState<{ arrivee: Lieu; km: number; prix: number } | null>(null);
  const [moyen, setMoyen] = useState<'especes' | 'mobile_money'>('especes');
  const [enCours, setEnCours] = useState<'' | 'position' | 'estimation' | 'commande'>('');

  useEffect(() => {
    supabase.from('zones').select('id, nom, prix_km, prise_en_charge').order('nom').then(({ data }) => {
      const z = (data as Zone[]) ?? [];
      setZones(z);
      if (z.length) setZone(z[0].id);
    });
  }, []);

  async function utiliserPosition() {
    setEnCours('position');
    try {
      const l = await maPosition();
      setDepart(l); setDepartTexte(l.adresse); setEstimation(null);
    } catch (e) { Alert.alert('Position indisponible', messageErreur(e)); }
    setEnCours('');
  }

  async function estimer() {
    const z = zones.find((x) => x.id === zone);
    if (!z) { Alert.alert('Aucune zone desservie pour le moment.'); return; }
    if (!departTexte.trim() || !arriveeTexte.trim()) { Alert.alert('Indiquez le départ et la destination.'); return; }
    setEnCours('estimation');
    try {
      const d = depart && depart.adresse === departTexte ? depart : await chercherLieu(departTexte.trim());
      setDepart(d);
      const a = await chercherLieu(arriveeTexte.trim());
      const km = distanceKm(d, a);
      setEstimation({ arrivee: a, km, prix: z.prise_en_charge + Math.ceil(km * z.prix_km) });
    } catch (e) { Alert.alert('Estimation impossible', messageErreur(e)); }
    setEnCours('');
  }

  async function commander() {
    if (!estimation || !depart) return;
    setEnCours('commande');
    const { data, error } = await supabase.rpc('demander_course', {
      p_zone: zone, p_distance_km: estimation.km,
      p_depart: depart.adresse, p_depart_lat: depart.lat, p_depart_lng: depart.lng,
      p_arrivee: estimation.arrivee.adresse, p_arrivee_lat: estimation.arrivee.lat, p_arrivee_lng: estimation.arrivee.lng,
      p_moyen: moyen,
    });
    setEnCours('');
    if (error) { Alert.alert('Commande impossible', messageErreur(error)); return; }
    onCommandee(data as Course);
  }

  return (
    <Ecran>
      <View style={{ gap: 2, paddingTop: 6 }}>
        <T v="titre">Emprunter</T>
        <T v="doux">Tu empruntes, tu manges : {p.bonus_emprunteur_pct} % de chaque course rendus en vivres.</T>
      </View>
      <Carte3D>
        <View style={{ gap: 14 }}>
          <Champ libelle="Départ" value={departTexte} placeholder="Quartier, rue ou repère"
            onChangeText={(t) => { setDepartTexte(t); setEstimation(null); }} />
          <Bouton3D titre="Utiliser ma position" ton="clair" petit onPress={utiliserPosition} chargement={enCours === 'position'} />
          <Champ libelle="Destination" value={arriveeTexte} placeholder="Ex. Cocody Angré, pharmacie des 7e tranche"
            onChangeText={(t) => { setArriveeTexte(t); setEstimation(null); }} />
          {zones.length > 1 && (
            <View style={{ gap: 6 }}>
              <T v="petit" style={{ color: couleurs.texte }}>Zone</T>
              <Choix options={zones.map((z) => ({ valeur: z.id, libelle: z.nom }))} valeur={zone}
                onChange={(v) => { setZone(v); setEstimation(null); }} />
            </View>
          )}
          <View style={{ gap: 6 }}>
            <T v="petit" style={{ color: couleurs.texte }}>Paiement au chauffeur</T>
            <Choix options={[{ valeur: 'especes', libelle: 'Espèces' }, { valeur: 'mobile_money', libelle: 'Mobile Money' }]}
              valeur={moyen} onChange={setMoyen} />
          </View>
          {!estimation && <Bouton3D titre="Voir le prix" onPress={estimer} chargement={enCours === 'estimation'} />}
        </View>
      </Carte3D>

      {estimation && (
        <Carte3D sombre>
          <View style={{ gap: 10 }}>
            <T style={{ color: '#C9D3FF' }}>Prix estimé, environ {String(estimation.km).replace('.', ',')} km</T>
            <T style={{ fontFamily: polices.titre, fontSize: 40, lineHeight: 46, color: '#FFFFFF' }}>{fcfa(estimation.prix)}</T>
            <T style={{ color: couleurs.vertClair, fontFamily: polices.gras }}>
              + {fcfa(Math.floor(estimation.prix * p.bonus_emprunteur_pct / 100))} de vivres pour vous à la fin de la course
            </T>
            <Bouton3D titre="Commander la course" onPress={commander} chargement={enCours === 'commande'} />
          </View>
        </Carte3D>
      )}
    </Ecran>
  );
}

function SuiviCourse({ course, onAnnulee }: { course: Course; onAnnulee: () => void }) {
  const [infos, setInfos] = useState<InfosCourse | null>(null);

  useEffect(() => {
    if (course.statut === 'demandee') { setInfos(null); return; }
    supabase.rpc('infos_course', { p_course: course.id }).then(({ data }) => {
      setInfos(((data as InfosCourse[]) ?? [])[0] ?? null);
    });
  }, [course.id, course.statut]);

  function annuler() {
    Alert.alert('Annuler la course ?', undefined, [
      { text: 'Non', style: 'cancel' },
      { text: 'Annuler la course', style: 'destructive', onPress: async () => {
        const { error } = await supabase.rpc('annuler_course', { p_course: course.id });
        if (error) Alert.alert('Annulation impossible', messageErreur(error)); else onAnnulee();
      } },
    ]);
  }

  return (
    <Ecran>
      <T v="titre">Ma course</T>
      <Carte3D sombre>
        <View style={{ gap: 10 }}>
          <T style={{ fontFamily: polices.titre, fontSize: 26, lineHeight: 32, color: couleurs.vertClair }}>{ETAPES[course.statut]}</T>
          <T style={{ color: '#DCE3FF' }}>De : {course.depart_adresse}</T>
          <T style={{ color: '#DCE3FF' }}>À : {course.arrivee_adresse}</T>
          <T style={{ fontFamily: polices.titre, fontSize: 30, lineHeight: 36, color: '#FFFFFF' }}>{fcfa(course.prix)}</T>
          <T style={{ color: '#C9D3FF' }}>À payer au chauffeur en {course.moyen_paiement === 'especes' ? 'espèces' : 'Mobile Money'}</T>
        </View>
      </Carte3D>
      {infos && (
        <Carte3D>
          <View style={{ gap: 6 }}>
            <T v="sousTitre">{infos.chauffeur_nom ?? 'Votre chauffeur'}</T>
            <T v="doux">{[infos.vehicule, infos.immatriculation].filter(Boolean).join(', ') || 'Véhicule non renseigné'}</T>
            {infos.chauffeur_telephone && (
              <Bouton3D titre="Appeler le chauffeur" ton="nuit" petit
                onPress={() => Linking.openURL(`tel:${infos.chauffeur_telephone?.replace(/\s/g, '')}`)} />
            )}
          </View>
        </Carte3D>
      )}
      {(course.statut === 'demandee' || course.statut === 'acceptee') && (
        <Bouton3D titre="Annuler la course" ton="clair" onPress={annuler} />
      )}
    </Ecran>
  );
}
