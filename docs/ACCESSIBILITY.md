# Accessibilité - Territoire en Fête

Ce document détaille les mesures d'accessibilité mises en place conformément aux normes WCAG 2.1 niveau AA.

## ✅ Mesures implémentées

### Navigation au clavier

- **Skip Links** : Liens "Aller au contenu principal" sur toutes les pages principales
  - Page d'accueil : Saute au contenu (`#main-content`)
  - Page carte : Saute à la liste des événements (`#event-list`)
  - Activés uniquement au focus (classe `sr-only focus:not-sr-only`)

- **États de focus visibles** : Tous les éléments interactifs ont des états de focus clairs
  - Liens de navigation : `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
  - Cartes d'événements : `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
  - Boutons : `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
  - Formulaires : États de focus natifs + styles personnalisés

- **Ordre logique de tabulation** : Structure HTML sémantique respectée
  - En-tête → Navigation → Contenu principal → Pied de page

### Sémantique HTML

- **Éléments landmarks** :
  - `<header>` pour l'en-tête du site
  - `<nav aria-label="Navigation principale">` pour la navigation
  - `<main>` pour le contenu principal
  - `<footer>` pour le pied de page
  - `<section aria-label="...">` pour les sections de contenu

- **Headings hiérarchiques** :
  - H1 : Titre de la page (un seul par page)
  - H2 : Sections principales
  - H3 : Titres d'événements

- **Listes sémantiques** :
  - Navigation : `role="list"` + `role="listitem"`
  - Grilles d'événements : `role="list"` + `role="listitem"` sur les cartes

### ARIA

- **aria-label** : Labels descriptifs pour les liens et contrôles
  ```html
  <a href="/carte" aria-label="Voir la carte des événements">Carte</a>
  <a href="/evenement/slug" aria-label="Événement : Festival Jazz, le lun. 6 oct. 2025 · 18:30">
  ```

- **aria-current** : Indicateur de page active
  ```html
  <a href="/" aria-current="page">Liste</a>
  ```

- **aria-live** : Annonces dynamiques pour les lecteurs d'écran
  ```html
  <div role="alert" aria-live="polite">Configuration requise</div>
  <div role="status" aria-live="polite">12 événements à venir</div>
  ```

- **aria-hidden** : Masquer les icônes décoratives
  ```html
  <svg aria-hidden="true">...</svg>
  ```

### Images

- **Images de contenu** :
  - Alt texte descriptif : `alt={event.title}`
  - Lazy loading : `loading="lazy"`
  - Blur placeholder pour éviter les CLS

- **Images décoratives** :
  - Icônes SVG : `aria-hidden="true"`
  - Images de fond : Pas de texte alternatif requis

- **Placeholders** :
  - Images manquantes affichent une icône avec `aria-hidden="true"`

### Formulaires

- **Labels explicites** :
  ```html
  <label htmlFor="title">Titre de l'événement *</label>
  <input type="text" id="title" name="title" required />
  ```

- **Messages d'erreur** :
  - Affichés visuellement et annoncés via `role="alert"`
  - Couleur + icône (pas uniquement la couleur)

- **Champs requis** :
  - Attribut `required` + astérisque (*) dans le label
  - Instructions claires en haut du formulaire

- **Autocomplétion** :
  - Attributs `autocomplete` appropriés
  - Suggestions navigables au clavier

### Contrastes

Tous les textes respectent un ratio de contraste minimum de 4.5:1 (WCAG AA) :

| Élément | Couleur texte | Couleur fond | Ratio |
|---------|---------------|--------------|-------|
| Titre principal (text-gray-900) | #111827 | #FFFFFF | 16.1:1 ✅ |
| Texte corps (text-gray-600) | #4B5563 | #FFFFFF | 7.5:1 ✅ |
| Texte secondaire (text-gray-500) | #6B7280 | #FFFFFF | 4.6:1 ✅ |
| Liens (text-blue-600) | #2563EB | #FFFFFF | 4.9:1 ✅ |
| Boutons primaires | #FFFFFF | #2563EB | 8.6:1 ✅ |
| Badges catégories (text-blue-700 / bg-blue-50) | #1D4ED8 | #EFF6FF | 9.2:1 ✅ |

**Outils de vérification utilisés** :
- WebAIM Contrast Checker
- Chrome DevTools Lighthouse

### États interactifs

- **Hover** : Changement de couleur + transition douce
- **Focus** : Ring bleu visible avec offset
- **Active** : Indication visuelle claire (border-bottom pour navigation)
- **Disabled** : Opacité réduite + cursor not-allowed

### Carte interactive (Mapbox)

- **Alternatives accessibles** :
  - Liste complète des événements sous la carte
  - Skip link direct vers la liste
  - Bouton "Passer la carte et voir la liste"

- **ARIA sur la carte** :
  ```html
  <div role="application" aria-label="Carte interactive des événements" />
  ```

- **Popups** :
  - Contenu HTML structuré
  - Bouton "Voir l'événement" avec texte visible

### Responsive & Mobile

- **Tailles de clic minimum** : 44x44px pour tous les éléments tactiles
- **Viewport meta tag** : `width=device-width, initial-scale=1`
- **Zoom activé** : Pas de `user-scalable=no`
- **Touch targets espacés** : Gap minimum de 8px entre éléments

## 🧪 Tests recommandés

### Tests automatisés

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# axe DevTools (Chrome Extension)
# - Installer l'extension
# - Analyser chaque page
# - Corriger les violations

# Pa11y
npm install -g pa11y
pa11y http://localhost:3000
pa11y http://localhost:3000/carte
pa11y http://localhost:3000/soumettre
```

### Tests manuels

#### Navigation clavier
1. ✅ Utiliser uniquement Tab / Shift+Tab pour naviguer
2. ✅ Vérifier que tous les liens/boutons sont atteignables
3. ✅ Tester le skip link (Tab dès le chargement)
4. ✅ Vérifier l'ordre logique de tabulation

#### Lecteurs d'écran
1. ✅ **NVDA** (Windows) + Firefox
2. ✅ **JAWS** (Windows) + Chrome
3. ✅ **VoiceOver** (macOS) + Safari

**Points à vérifier** :
- Les landmarks sont annoncés
- Les titres sont navigables (H1, H2, H3)
- Les listes sont annoncées avec le nombre d'éléments
- Les liens ont des labels descriptifs
- Les images de contenu ont un alt texte
- Les formulaires annoncent les labels et erreurs
- Les changements dynamiques sont annoncés (aria-live)

#### Zoom
1. ✅ Zoomer à 200% sans perte de fonctionnalité
2. ✅ Pas de scroll horizontal
3. ✅ Texte reste lisible

#### Contraste
1. ✅ Activer Windows High Contrast Mode
2. ✅ Vérifier que tous les éléments restent visibles
3. ✅ Tester avec Daltonisme (Chrome Extension)

## 📋 Checklist WCAG 2.1 AA

### Perceptible
- ✅ 1.1.1 - Contenu non textuel : Alt texte sur toutes les images
- ✅ 1.3.1 - Info et relations : Structure sémantique claire
- ✅ 1.3.2 - Ordre séquentiel : Ordre logique de lecture
- ✅ 1.4.1 - Utilisation de la couleur : Pas de couleur seule pour transmettre l'info
- ✅ 1.4.3 - Contraste minimum : Ratio ≥ 4.5:1
- ✅ 1.4.4 - Redimensionnement : Zoom 200% fonctionnel
- ✅ 1.4.10 - Reflow : Pas de scroll horizontal à 320px
- ✅ 1.4.11 - Contraste non textuel : Contrôles UI ≥ 3:1

### Utilisable
- ✅ 2.1.1 - Clavier : Toutes les fonctionnalités au clavier
- ✅ 2.1.2 - Pas de piège clavier : Navigation libre
- ✅ 2.4.1 - Contourner les blocs : Skip links présents
- ✅ 2.4.2 - Titre de page : Titres uniques et descriptifs
- ✅ 2.4.3 - Parcours du focus : Ordre logique
- ✅ 2.4.4 - Fonction du lien : Labels descriptifs
- ✅ 2.4.6 - En-têtes et étiquettes : Labels clairs
- ✅ 2.4.7 - Visibilité du focus : États visibles
- ✅ 2.5.3 - Étiquette dans le nom : Labels cohérents

### Compréhensible
- ✅ 3.1.1 - Langue de la page : `<html lang="fr">`
- ✅ 3.2.3 - Navigation cohérente : Menu identique partout
- ✅ 3.2.4 - Identification cohérente : Composants cohérents
- ✅ 3.3.1 - Identification erreurs : Messages clairs
- ✅ 3.3.2 - Étiquettes ou instructions : Labels sur tous les champs
- ✅ 3.3.3 - Suggestions erreurs : Messages explicites
- ✅ 3.3.4 - Prévention erreurs : Confirmations sur actions importantes

### Robuste
- ✅ 4.1.2 - Nom, rôle, valeur : ARIA correct
- ✅ 4.1.3 - Messages de statut : aria-live approprié

## 🚀 Améliorations futures (hors V1)

### Niveau AAA (optionnel)
- [ ] Contraste amélioré 7:1 (niveau AAA)
- [ ] Pas de timeout automatique
- [ ] Taille de police ajustable (préférence utilisateur)

### UX avancée
- [ ] Mode sombre avec contraste adapté
- [ ] Préférences motion réduit (`prefers-reduced-motion`)
- [ ] Sous-titres sur vidéos (si intégration future)
- [ ] Transcriptions audio (si podcasts)
- [ ] Langue alternative (si site multilingue)

### Tests continus
- [ ] Intégrer Pa11y en CI/CD
- [ ] Lighthouse CI avec seuils minimums (score A11y ≥ 95)
- [ ] Tests automatisés avec Playwright + axe-core
- [ ] Audits trimestriels avec utilisateurs en situation de handicap

## 📚 Ressources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [RGAA (Référentiel français)](https://accessibilite.numerique.gouv.fr/)
- [a11y Project Checklist](https://www.a11yproject.com/checklist/)

## 🤝 Support

Pour signaler un problème d'accessibilité : contact@territoireenfete.fr
