# Foi & Cœur - Next.js Project

Projet Next.js transformé depuis le site HTML/CSS/JS original, clonant le design de Farata.net pour les rencontres chrétiennes.

## Structure du projet

```
foi-coeur/
├── app/
│   ├── globals.css          # Styles globaux
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page d'accueil
├── components/              # Composants React
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── VideoSection.tsx
│   ├── WhySection.tsx
│   ├── SecuritySection.tsx
│   ├── HowItWorks.tsx
│   ├── PricingSection.tsx
│   ├── Testimonials.tsx
│   ├── FinalVerse.tsx
│   └── Footer.tsx
├── lib/
│   └── animations.ts        # Hooks d'animation personnalisés
├── public/                  # Assets statiques
├── next.config.js            # Configuration Next.js
├── package.json              # Dépendances
└── tsconfig.json             # Configuration TypeScript
```

## Installation et démarrage

### Prérequis
- Node.js 18+ installé
- npm ou yarn

### Installation des dépendances

```bash
cd foi-coeur
npm install
```

### Démarrage en développement

```bash
npm run dev
```

Le site sera accessible sur http://localhost:3000

### Build pour production

```bash
npm run build
npm start
```

## Fonctionnalités

- **Design identique à Farata.net** (palette verte, layout split-screen)
- **Adapté pour les rencontres chrétiennes** (contenu, versets bibliques)
- **Animations avancées** (scroll, hover, parallax, mouse tracking)
- **Responsive design** (mobile-first, tablet, desktop)
- **Performance optimisée** (lazy loading, code splitting)
- **TypeScript** pour la sécurité des types

## Composants

### Header
- Navigation fixe avec effet de scroll
- Menu mobile responsive
- Animation de menu hamburger

### Hero
- Layout split-screen
- Animation de suivi de souris
- Parallax effect
- Boutons CTA avec ripple effect

### VideoSection
- Faux navigateur intégré
- Modal vidéo
- Boutons interactifs

### WhySection
- 4 cartes avec hover effects
- Focus sur les valeurs chrétiennes

### SecuritySection
- 3 cartes de sécurité
- Mise en avant de la vérification

### HowItWorks
- 5 étapes avec animation échelonnée
- Layout horizontal sur desktop

### PricingSection
- 2 plans (Gratuit/Premium)
- Liste de fonctionnalités
- Badge offre de lancement

### Testimonials
- 3 témoignages avec étoiles
- Design cartes
- Hover effects

### FinalVerse
- Versets bibliques
- Bouton CTA principal
- Motif géométrique animé

### Footer
- 4 colonnes de liens
- Bouton action
- Badge RGPD

## Hooks personnalisés

### useScrollAnimation
- Gère l'état de scroll du header
- Cache/show header intelligent

### useIntersectionObserver
- Animate les éléments au scroll
- Gère les délais d'animation

### useRippleEffect
- Effet ripple sur les boutons
- Animation dynamique au clic

### useMouseTracking
- Suivi de la souris pour le hero
- Animation parallax

## Adaptations chrétiennes

- **Couleurs**: Vert (même que Farata) au lieu de bleu chrétien classique
- **Contenu**: Versets bibliques au lieu de coraniques
- **Terminologie**: "Mariage chrétien" au lieu de "Mariage halal"
- **Symboles**: Croix au lieu de croissant
- **Localisation**: Côte d'Ivoire, Sénégal, Mali, Burkina
- **Coach IA**: "Pierre" au lieu de "Cheikh Moussa"

## Prochaines améliorations

- [ ] Ajouter de vraies images
- [ ] Intégrer une vraie vidéo
- [ ] Connecter à une API backend
- [ ] Ajouter l'authentification
- [ ] Implémenter les formulaires
- [ ] Optimiser le SEO
- [ ] Ajouter le support PWA