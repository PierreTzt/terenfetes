# Territoire en Fête 🎉

Plateforme d'agrégation et diffusion automatique d'événements locaux. V1 production-ready.

## 📋 Vue d'ensemble

**Proposition de valeur** : Agenda local clé-en-main qui agrège, nettoie, déduplique, géocode et diffuse automatiquement les événements d'un territoire vers site, newsletter et réseaux sociaux. Zéro double saisie. KPI traçables.

**Cibles** : Mairies, offices de tourisme, intercommunalités, centres-villes, tiers-lieux.

## 🚀 Fonctionnalités V1

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

- **Frontend** : Next.js 14 (App Router) + Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : Supabase PostgreSQL + Prisma ORM
- **Recherche** : Algolia
- **Cartes** : Mapbox GL
- **Emails** : Resend + React Email
- **Automations** : n8n (ETL, newsletter, social)
- **Analytics** : PostHog
- **Observabilité** : Sentry
- **Déploiement** : Vercel

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou pnpm
- PostgreSQL (via Supabase)
- Compte n8n (pour les workflows)

### Setup local

1. **Cloner et installer les dépendances**

```bash
git clone <repository-url>
cd terenfetes
npm install
```

2. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env.local` et remplir les valeurs :

```bash
cp .env.example .env.local
```

**Variables requises** :

```env
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-token

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your-search-key
ALGOLIA_ADMIN_KEY=your-admin-key

# Resend
RESEND_API_KEY=re_your_key

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key

# Geocoding
GEOCODE_PROVIDER=opencage
GEOCODE_API_KEY=your-geocode-key

# Sécurité
WEBHOOK_SECRET=your-secret
METRICS_API_KEY=your-api-key
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

### Configuration initiale

```typescript
import { configureAlgoliaIndex } from '@/lib/algolia'

await configureAlgoliaIndex()
```

### Synchronisation automatique

Les événements sont automatiquement synchronisés vers Algolia lors de :
- Création (via webhook)
- Mise à jour (via back-office)
- Publication (changement de statut)

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
- ✅ Endpoints sensibles protégés par tokens (WEBHOOK_SECRET, METRICS_API_KEY)
- ✅ Validation des données en entrée (Zod + validations métier)
- ✅ Rate limiting API :
  - `/api/upload` : 10 uploads / heure / IP
  - `/api/events/submit` : 5 soumissions / 15 min / IP
- ✅ Anti-spam : honeypot sur formulaire public
- ✅ CORS configuré (uniquement domaines autorisés)
- ✅ Sanitization des URLs externes
- ✅ Images : validation type/taille + stockage sécurisé

### RGPD

- ✅ Double opt-in newsletter obligatoire
- ✅ Lien de désinscription dans chaque email
- ✅ Pas de cookies analytics sans consentement (PostHog configuré)
- ✅ Droits d'image : checkbox obligatoire lors de l'upload
- ✅ Politique de confidentialité à créer (template disponible)

### Variables sensibles

**À ne JAMAIS exposer côté client** :
- `SUPABASE_SERVICE_ROLE_KEY`
- `WEBHOOK_SECRET`
- `METRICS_API_KEY`
- `ALGOLIA_ADMIN_KEY`
- `RESEND_API_KEY`

**Variables publiques** (préfixe `NEXT_PUBLIC_`) :
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` (search-only key)
- `NEXT_PUBLIC_POSTHOG_KEY`

## ♿️ Accessibilité

- ✅ Contraste ≥ 4.5:1
- ✅ Navigation clavier complète
- ✅ Focus visible sur tous les éléments interactifs
- ✅ aria-labels sur les liens et boutons
- ✅ Alt texte sur toutes les images
- ✅ Structure HTML sémantique

## 📊 Analytics & Observabilité

### PostHog (Analytics)

```typescript
// Côté client
posthog.capture('event_view', { eventId: 'xxx' })
posthog.capture('cta_click', { eventId: 'xxx' })
```

### Sentry (Erreurs)

Configurer `SENTRY_DSN` dans `.env.local`

## 🧪 Tests

### Tests end-to-end (Playwright)

```bash
# Installer Playwright
npm install -D @playwright/test

# Lancer les tests
npx playwright test
```

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

Propriétaire - Tous droits réservés

## 🤝 Support

Pour toute question : contact@territoireenfete.fr

---

**Fait avec ❤️ pour les territoires dynamiques**
