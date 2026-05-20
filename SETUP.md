# Setup Firebase Firestore (5 minuti)

Senza questo setup il sito funziona ma la classifica nazionale resta disattivata. Tutto il resto (giochi, daily challenge, share) funziona già.

## 1) Crea il progetto Firebase

1. Vai su https://console.firebase.google.com
2. Clicca **"Aggiungi progetto"** → nome a piacere (es. `gheigheimsitalia`)
3. Disattiva Google Analytics (non serve), clicca **Continua → Crea progetto**

## 2) Abilita Firestore in test mode

1. Nella console del progetto: menù sinistro → **Build → Firestore Database**
2. Clicca **Crea database** → scegli location `europe-west3` (Francoforte, vicino all'Italia)
3. Scegli **"Inizia in modalità test"** (apre tutto per 30 giorni — sufficiente per validare)
4. Clicca **Abilita**

## 3) Registra l'app web e copia la config

1. Nella console: ⚙️ **Impostazioni progetto → Generali**
2. Sezione **Le tue app** → clicca l'icona web `</>`
3. Nickname app: `gheigheims-web` (no hosting)
4. **Registra app**
5. Copia l'oggetto `firebaseConfig` che ti mostra — somiglia a:

```js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXX...",
  authDomain: "gheigheimsitalia.firebaseapp.com",
  projectId: "gheigheimsitalia",
  storageBucket: "gheigheimsitalia.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

## 4) Incolla nel codice

Apri `firebase.js` e sostituisci l'oggetto `firebaseConfig` con quello copiato.

> ⚠️ **Questi valori sono PUBBLICI** (il client li vede comunque). Non sono segreti — possono stare nel codice committato. La sicurezza si fa con le regole Firestore (step 5).

## 5) Regole Firestore di sicurezza (importante!)

Dopo 30 giorni la modalità test scade. Prima di allora vai su **Firestore → Regole** e sostituisci con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{doc} {
      allow read: if true;
      allow create: if
        request.resource.data.keys().hasOnly(['nickname', 'region', 'game', 'score', 'createdAt'])
        && request.resource.data.nickname is string
        && request.resource.data.nickname.size() >= 2
        && request.resource.data.nickname.size() <= 16
        && request.resource.data.region is string
        && request.resource.data.region.size() <= 32
        && request.resource.data.game in ['rps', 'guess', 'click']
        && request.resource.data.score is int
        && request.resource.data.score >= 0
        && request.resource.data.score <= 100000;
      allow update, delete: if false;
    }
  }
}
```

Questo permette: letture libere, scritture solo con dati validati, niente modifiche/cancellazioni.

## 6) Deploy

```bash
git add firebase.js
git commit -m "chore: configure firebase"
git push
```

Vercel rideploy automatico in ~5 secondi e la leaderboard è viva.

## Troubleshooting

- **"Leaderboard non configurata"**: il `firebaseConfig` contiene ancora `REPLACE_ME`. Hai saltato step 4.
- **Errore CORS / 403 in console**: regole Firestore troppo restrittive. Verifica step 5.
- **Nessun record appare**: clicca "Aggiorna" nella scena classifica.
- **Voglio cancellare un record offensivo**: console Firestore → collection `scores` → trovi doc → elimina manualmente.

## Costi

Firestore free tier (Spark plan):
- 50.000 letture/giorno
- 20.000 scritture/giorno
- 1 GB storage

Per scalare oltre, switcha al Blaze plan (pay-as-you-go): ~$0,06 per 100k letture extra. Per i numeri tipici di un sito viral hyper-casual, restate in free tier per i primi 10-30k DAU.
