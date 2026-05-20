# Setup Firebase — già fatto ✅

Il progetto Firebase è già configurato e attivo. Niente da fare lato tuo.

## Cosa è stato fatto via CLI

- **Progetto**: `gheigheimsitalia` (Firebase + GCP)
- **Firestore API**: abilitato
- **Database**: `(default)` in `europe-west3` (Francoforte)
- **Indici**: composto `game ASC + score DESC` (pronto)
- **Regole**: scritte in `firestore.rules` e deployate. Schema validato lato server (nickname 2-16 char, regione max 32, game in `[rps, guess, click]`, score 0-100000, niente update/delete)
- **App web registrata** + config inserita in `firebase.js`

## Console Firebase

https://console.firebase.google.com/project/gheigheimsitalia/firestore/databases/-default-/data

Da qui puoi:
- Vedere tutti i record in tempo reale
- Cancellare manualmente record offensivi/test
- Modificare le regole (in `firestore.rules` + `firebase deploy --only firestore:rules`)

## Costi

Free tier (Spark plan) sufficiente fino a:
- 50.000 letture/giorno
- 20.000 scritture/giorno
- 1 GB storage

Per scalare oltre: switch al Blaze plan (pay-as-you-go), ~$0,06 per 100k letture extra.

## Replica per future setup

Per replicare questo setup su un altro progetto:

```bash
firebase projects:create <project-id> --display-name "<name>"
firebase apps:create web "<app-name>" --project <project-id>
firebase apps:sdkconfig WEB <app-id> --project <project-id>  # → incolla in firebase.js
# Enable Firestore API (via gcloud o link console)
firebase firestore:databases:create "(default)" --location europe-west3 --project <project-id>
firebase deploy --only firestore --project <project-id>
```
