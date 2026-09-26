# Firebase Configuration Guide

## Prérequis

Avant de configurer Firebase, vous devez avoir un compte Firebase et un projet créé.

## Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Suivez les instructions pour créer votre projet
4. Une fois créé, sélectionnez votre projet

### 2. Activer Authentication

1. Dans le menu de gauche, cliquez sur "Authentication"
2. Cliquez sur "Commencer"
3. Activez "Email/Password" comme méthode de connexion
4. Pour Google Auth :
   - Cliquez sur "Ajouter un fournisseur"
   - Sélectionnez "Google"
   - Activez le fournisseur
   - Ajoutez l'email de support du projet
   - Sauvegardez les changements
5. Important : Ajoutez votre domaine autorisé dans les paramètres de Firebase Auth
   - Pour le développement : `http://localhost:3000`
   - Pour la production : votre domaine de production

### 3. Créer une base de données Firestore

1. Dans le menu de gauche, cliquez sur "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Mode production" ou "Mode test" (pour le développement)
4. Sélectionnez une localisation (ex: europe-west)
5. Cliquez sur "Activer"

### 4. Obtenir les configurations

1. Dans le menu de gauche, cliquez sur l'icône d'engrenage (Paramètres du projet)
2. Sélectionnez "Paramètres généraux"
3. Faites défiler jusqu'à la section "Vos applications"
4. Cliquez sur l'icône web (</>)
5. Donnez un nom à votre application (ex: foi-coeur-web)
6. Cliquez sur "Enregistrer l'application"
7. Copiez les valeurs de configuration fournies

### 5. Configurer les variables d'environnement

Ouvrez le fichier `.env.local` à la racine du projet et remplacez les valeurs par celles de votre projet Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

### 6. Règles de sécurité Firestore

Pour le développement, utilisez ces règles permissives. Pour la production, configurez des règles appropriées.

**Règles de développement (à utiliser uniquement en test) :**

Allez dans Firebase Console → Firestore Database → Règles et collez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Cliquez sur "Publier".

**Pour le développement rapide, c'est suffisant.**

### 7. Indexes Firestore

Certaines requêtes complexes nécessitent des indexes composites. Firebase vous demandera de créer ces indexes automatiquement lorsque vous utiliserez l'application.

Pour créer manuellement des indexes :
1. Allez dans Firestore Database
2. Cliquez sur l'onglet "Index"
3. Cliquez sur "Ajouter un index"
4. Configurez les champs nécessaires

## Structure de la base de données

### Collections

- **users** : Profils des utilisateurs
- **matches** : Matchs entre utilisateurs
- **likes** : Likes entre utilisateurs
- **messages** : Messages envoyés
- **conversations** : Conversations entre utilisateurs
- **reports** : Signalements de profils/messages
- **blocks** : Blocages d'utilisateurs

## Utilisation

### Exemple d'utilisation dans un composant

```typescript
import { userService } from '@/lib/firestore'
import { auth } from '@/lib/firebase'

// Créer un utilisateur après inscription
await userService.createUser(userId, {
  email: 'user@example.com',
  firstName: 'Jean',
  lastName: 'Dupont'
})

// Récupérer un utilisateur
const user = await userService.getUserById(userId)

// Mettre à jour le profil
await userService.updateUser(userId, {
  age: 30,
  city: 'Abidjan'
})
```

## Dépannage

### Erreur "Firebase: No Firebase App '[DEFAULT]' has been created"

Assurez-vous que les variables d'environnement sont correctement configurées dans `.env.local` et que le fichier n'est pas dans `.gitignore`.

### Erreur "Missing or insufficient permissions"

Vérifiez vos règles de sécurité Firestore et assurez-vous que l'utilisateur est authentifié.

### Erreur "The query requires an index"

Firebase vous demandera de créer un index composite. Cliquez sur le lien fourni dans l'erreur pour le créer automatiquement.