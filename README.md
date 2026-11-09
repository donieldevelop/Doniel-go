# Doniel Go

Application React Native (Expo) de VTC et de récompenses alimentaires : « Tu marches, tu manges. Tu empruntes, tu manges. »
Elle partage la base Supabase de Doniel Driver (les fichiers SQL sont dans le dépôt **Doniel-driver**, dossier `supabase/migrations`).

## Écrans
- **Marcher** : compteur de pas du jour, limite de 20 000 pas, récompense de 50 F en vivres par tranche de 1 000 pas, après 2 publicités
- **Emprunter** : départ (position GPS ou adresse), destination, prix estimé, bonus de 5 %, commande et suivi de la course, appel du chauffeur
- **Dily Soutra** : boutique payée avec les bonus, retrait au point de retrait
- **Mes bonus** : solde, commandes, historique

Les chauffeurs reçoivent et gèrent les courses dans l'appli **Doniel Driver** (onglet Courses).

## Provisoire, à brancher plus tard
- Publicités : espace réservé, à remplacer par les publicités récompensées **AdMob**
- Distance : estimation à vol d'oiseau × 1,3, à remplacer par **Google Maps** (carte et vrai trajet)
- Pas sur Android : comptés quand l'appli est ouverte ; comptage en arrière-plan via **Health Connect**
- Paiement en ligne : **GeniusPay**

## Lancer l'appli
1. `npm install`
2. `npx expo start`, puis scanner le QR code avec **Expo Go**
3. APK de test : `npx eas-cli@latest build -p android --profile preview`

## Avant le premier essai (Supabase, SQL Editor)
```sql
insert into zones (nom, prix_km, prise_en_charge) values ('Abidjan', 300, 500);
```
(prix au kilomètre et prise en charge à ajuster)
