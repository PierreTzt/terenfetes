# Territoire en Fête 🎉

Plateforme d'agrégation et diffusion automatique d'événements locaux.

> [!WARNING]
> **Projet abandonné, publié tel quel.** Ce dépôt n'est plus maintenu : pas de support, pas de corrections, pas de revue de PR.
> Le code est partagé pour qu'on puisse s'en inspirer ou le reprendre (fork), **pas pour être déployé en l'état**.
> Lire la section [État du projet](#état-du-projet) avant toute chose.

## État du projet

Dernier travail : décembre 2025. Constat au moment de la publication :

- **Le projet ne compile pas.** `npx tsc --noEmit` remonte ~98 erreurs et `npm run build` échoue au lint (~60 erreurs ESLint).
- **Plusieurs fonctionnalités sont désynchronisées du schéma Prisma.** Le code des photos (`app/api/photos/**`), des listes collaboratives (`app/api/lists/**`), des métriques agrégées dans `app/api/events/route.ts` et d'une partie de la newsletter utilise des champs qui n'existent pas dans `prisma/schema.prisma` (ex. `name`/`isPublic`/`creator` au lieu de `title`/`public`/`user`, `url`/`caption`/`uploader` au lieu de `imageUrl`/`user`). Ces fonctionnalités ne marcheraient pas à l'exécution.
- **Il n'y a pas d'authentification réelle.** La « connexion » stocke simplement l'email dans `localStorage`, et une vingtaine de routes d'écriture (`/api/users/[id]`, `/api/settings`, `/api/photos/[id]/moderate`, `/api/lists/**`…) ne vérifient pas qui appelle. L'administration repose sur une clé partagée `ADMIN_API_KEY` saisie dans le navigateur.
- **Aucun test.**

Ce qui est en place et peut servir de base : le modèle de données (`prisma/schema.prisma`), l'ingestion par webhook, la déduplication (`lib/deduplication.ts`), le géocodage, la carte Mapbox avec clustering, la newsletter en double opt-in (React Email + Resend), le SEO (sitemap, schema.org) et un exemple de workflow n8n.

Pour reprendre le projet, il faudrait au minimum : brancher une vraie authentification (Supabase Auth par exemple) et protéger chaque route d'écriture, puis aligner le code et le schéma Prisma jusqu'à ce que le build passe.

## 📋 Vue d'ensemble

**Proposition de valeur** : Agenda local clé-en-main qui agrège, nettoie, déduplique, géocode et diffuse automatiquement les événements d'un territoire vers site, newsletter et réseaux sociaux. Zéro double saisie. KPI traçables.

**Cibles** : Mairies, offices de tourisme, intercommunalités, centres-villes, tiers-lieux.

## 🚀 Fonctionnalités visées

Périmètre prévu pour la V1. Tout n'est pas terminé ni fonctionnel, voir [État du projet](#état-du-projet).

### Ingestion
- ✅ Import RSS/ICS automatique
- ✅ Scraping HTML via n8n
- ✅ Formulaire public de soumission
- ✅ Géocodage automatique (OpenCage / Mapbox)
- ✅ Déduplication intelligente

### Site public
- ✅ Liste des événements avec filtres
- ✅ Carte interactive (Mapbox GL)
- ✅ Page détail événement
- ✅ Formulaire de soumission
- ✅ SEO optimisé (schema.org, sitemap, OG tags)
- ✅ Accessible (RGAA basique)

### Diffusion
- ✅ Newsletter hebdomadaire automatique
- ✅ Brouillons posts sociaux (via n8n)

### Analytics
- ✅ Tracking vues, clics CTA, intentions
- ✅ Intégration PostHog

## 🛠 Stack technique

- **Frontend** : Next.js 15 (App Router, Turbopack) + React 19 + Tailwind CSS 4
- **Backend** : Next.js API Routes
- **Base de données** : Supabase PostgreSQL + Prisma ORM 6
- **Recherche** : recherche en base (insensible aux accents, synonymes). Un client Algolia existe dans `lib/algolia.ts` mais n'est branché nulle part.
- **Cartes** : Mapbox GL + Supercluster
- **Emails** : Resend + React Email
- **Automations** : n8n (ingestion RSS)
- **Analytics** : PostHog
- **Déploiement visé** : Vercel

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou pnpm
- PostgreSQL (via Supabase)
- Compte n8n (pour les workflows)

### Setup local

1. **Cloner et installer les dépendances**

```bash
git clone https://github.com/PierreTzt/terenfetes.git
cd terenfetes
npm install
```

2. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env.local` et remplir les valeurs :

```bash
cp .env.example .env.local
```

Voir [`.env.example`](.env.example) pour la liste des variables lues par le code.

```

3. **Initialiser la base de données**

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Seed avec 10 événements d'exemple
npm run db:seed
```

4. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🗄 Base de données

### Modèles principaux

- **Event** : Événements avec statut (PENDING/PUBLISHED/REJECTED/ARCHIVED)
- **Venue** : Lieux (salles, parcs, etc.)
- **Source** : Sources d'ingestion (RSS, ICS, HTML, formulaire)
- **MetricsEvent** : Métriques quotidiennes par événement
- **Subscriber** : Abonnés newsletter avec double opt-in
- **Newsletter** : Historique des newsletters envoyées

### Extensions PostgreSQL requises

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
```

### Déduplication

Script SQL pour identifier et fusionner les doublons (à exécuter manuellement ou via cron) :

```sql
-- Identifier les doublons potentiels
SELECT
  e1.id, e1.title, e1.startAt, e1.city,
  e2.id, e2.title, e2.startAt, e2.city,
  similarity(unaccent(lower(e1.title)), unaccent(lower(e2.title))) as sim
FROM events e1
JOIN events e2 ON e1.id < e2.id
WHERE
  e1.startAt::date = e2.startAt::date
  AND similarity(unaccent(lower(e1.title)), unaccent(lower(e2.title))) > 0.86
  AND (
    e1.venueId = e2.venueId
    OR earth_distance(ll_to_earth(e1.lat,e1.lng), ll_to_earth(e2.lat,e2.lng)) < 300
  );
```

## 🔌 API

### Endpoints publics

```
GET  /api/events?status=PUBLISHED&from=YYYY-MM-DD&city=Paris&category=Musique
GET  /api/events/[slug]
POST /api/metrics/view     { eventId }
POST /api/metrics/cta      { eventId }
```

### Endpoints protégés (webhook)

```
POST /api/ingest/webhook/[sourceId]
  Header: Authorization: Bearer WEBHOOK_SECRET
  Body: EventIngestDTO | EventIngestDTO[]

POST /api/geocode
  Header: x-api-key: METRICS_API_KEY
  Body: { address: string }
```

## 📧 Newsletter

### Configuration Resend

1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier votre domaine d'envoi
3. Récupérer l'API key
4. La configurer dans `.env.local`

### Générer et envoyer la newsletter

```typescript
import { buildWeeklyNewsletter, sendNewsletterToAllSubscribers } from '@/lib/newsletter'

const { events, subject } = await buildWeeklyNewsletter()
const results = await sendNewsletterToAllSubscribers(subject, events)
```

## 🔄 n8n Workflows

Les workflows d'exemple sont dans `/n8n-workflows/`.

### Import dans n8n

1. Ouvrir n8n
2. Cliquer sur "Import workflow"
3. Sélectionner le fichier JSON
4. Configurer les credentials et variables d'environnement

### Variables requises dans n8n

```
SITE_URL=https://your-domain.com
SOURCE_ID=uuid-of-your-source
WEBHOOK_SECRET=your-webhook-secret
```

## 🔍 Algolia

`lib/algolia.ts` contient la configuration d'index et les fonctions de synchronisation, mais elles ne sont appelées nulle part : la recherche du site passe par la base (`lib/db-search.ts`).

## 🚢 Déploiement

### Vercel (recommandé)

1. Pusher le code sur GitHub
2. Connecter le repo à Vercel
3. Configurer les variables d'environnement
4. Déployer

```bash
vercel --prod
```

### Variables d'environnement Vercel

Copier toutes les variables de `.env.local` dans les settings Vercel.

**Important** : Ne pas exposer les clés secrètes (WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, etc.)

## 🔐 Sécurité

### Configuration Row Level Security (RLS)

**Important** : Ces étapes sont obligatoires pour la production.

1. **Activer RLS sur toutes les tables**

Aller dans Supabase Dashboard > SQL Editor et exécuter le script :

```bash
prisma/migrations/001_enable_rls.sql
```

Ce script configure :
- ✅ Lecture publique uniquement pour events `status='PUBLISHED'`
- ✅ Accès service_role complet pour l'ingestion et la modération
- ✅ Insertion de métriques anonymes pour le tracking
- ✅ Protection des sources et données sensibles
- ✅ Gestion des abonnements newsletter

2. **Configurer Supabase Storage**

Créer le bucket "events" :
- Aller dans Storage > Create bucket
- Nom : `events`
- Public : ✅ Oui
- File size limit : 5 MB
- Allowed MIME types : `image/jpeg, image/jpg, image/png, image/webp`

Puis appliquer les policies :

```bash
supabase/storage-policies.sql
```

3. **Activer les extensions PostgreSQL**

Dans Supabase Dashboard > SQL Editor :

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
```

4. **Vérifier la configuration**

Tester en mode anonyme (sans authentification) :

```sql
-- Doit retourner uniquement les événements PUBLISHED
SELECT * FROM "Event" WHERE status = 'PUBLISHED';

-- Ne doit PAS retourner les événements PENDING
SELECT * FROM "Event" WHERE status = 'PENDING';
```

### Sécurité applicative

- ✅ RLS activé sur Supabase (configuration ci-dessus)
- ⚠️ Seuls l'ingestion (`WEBHOOK_SECRET`), le géocodage (`METRICS_API_KEY`) et les routes d'administration (`ADMIN_API_KEY`) sont protégés. Le reste des routes d'écriture est ouvert, voir [État du projet](#état-du-projet).
- ✅ Validations métier à la main (pas de bibliothèque de schéma)
- ✅ Rate limiting API (en mémoire, donc par instance) :
  - `/api/upload` : 10 uploads / heure / IP
  - `/api/events/submit` : 5 soumissions / 15 min / IP
- ✅ Anti-spam : honeypot sur formulaire public
- ✅ Images : validation type/taille + stockage sécurisé

### RGPD

- ✅ Double opt-in newsletter obligatoire
- ✅ Lien de désinscription dans chaque email
- ⚠️ Pas de bandeau de consentement : PostHog se charge sans demander l'accord
- ✅ Droits d'image : checkbox obligatoire lors de l'upload
- ⚠️ Politique de confidentialité et mentions légales à compléter

### Variables sensibles

**À ne JAMAIS exposer côté client** :
- `SUPABASE_SERVICE_ROLE_KEY`
- `WEBHOOK_SECRET`
- `METRICS_API_KEY`
- `ADMIN_API_KEY`
- `ALGOLIA_ADMIN_KEY`
- `RESEND_API_KEY`

**Variables publiques** (préfixe `NEXT_PUBLIC_`) :
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`

## ♿️ Accessibilité

- ✅ Contraste ≥ 4.5:1
- ✅ Navigation clavier complète
- ✅ Focus visible sur tous les éléments interactifs
- ✅ aria-labels sur les liens et boutons
- ✅ Alt texte sur toutes les images
- ✅ Structure HTML sémantique

## 📊 Analytics

### PostHog (Analytics)

```typescript
// Côté client
posthog.capture('event_view', { eventId: 'xxx' })
posthog.capture('cta_click', { eventId: 'xxx' })
```

## 🧪 Tests

Aucun test n'a été écrit.

## 📝 Scripts disponibles

```bash
npm run dev          # Dev server
npm run build        # Build production
npm run start        # Start production
npm run lint         # Lint code

npm run db:generate  # Générer Prisma client
npm run db:push      # Push schema to DB
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio
```

## 🗺 Roadmap V2

- [ ] Back-office de modération complet
- [ ] Gestion multi-territoires
- [ ] Système de tags personnalisables
- [ ] Export calendrier ICS
- [ ] Widget iframe embeddable
- [ ] API publique REST
- [ ] Intégration Facebook Events
- [ ] Paiement Stripe pour billetterie

## 📄 Licence

[GNU AGPL-3.0](LICENSE). Vous pouvez utiliser, modifier et redistribuer ce code, y compris commercialement. Si vous hébergez une version modifiée accessible à d'autres personnes (site, SaaS…), vous devez en publier le code source sous la même licence.

## 🤝 Support

Aucun. Le projet n'est plus maintenu. Forkez-le librement.

---

**Fait avec ❤️ pour les territoires dynamiques**
