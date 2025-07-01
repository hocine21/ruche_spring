# Authentification Firebase - RucheConnect

## Configuration

L'authentification Firebase a été configurée avec les informations suivantes :

- **Projet Firebase** : rucheconnect-d9225
- **Base de données** : https://rucheconnect-d9225-default-rtdb.europe-west1.firebasedatabase.app
- **Auth Domain** : rucheconnect-d9225.firebaseapp.com

## Fonctionnalités

### 1. Connexion classique (email/password)
- Email : `admin@rucheconnect.com`
- Mot de passe : `admin123`

### 2. Connexion avec Google
- Utilise Firebase Auth avec Google Provider
- Redirection automatique vers la page admin après connexion

### 3. Connexion avec Firebase Auth
- Authentification via Firebase Auth (email/password)
- Vérification du token côté serveur
- Création automatique de l'utilisateur si nécessaire

## Pages

### `/login`
- Page de connexion avec formulaire classique
- Boutons pour Google Auth et Firebase Auth
- Gestion des erreurs d'authentification

### `/admin`
- Page protégée accessible uniquement après authentification
- Affichage des informations de l'utilisateur connecté
- Bouton de déconnexion

### `/logout`
- Déconnexion et redirection vers `/login`

## API Endpoints

### `POST /api/auth/firebase`
- Reçoit le token Firebase
- Authentifie l'utilisateur
- Crée une session
- Retourne le statut de l'authentification

## Structure des fichiers

```
src/main/resources/
├── templates/
│   ├── login.html          # Page de connexion
│   └── admin.html          # Page admin protégée
├── static/js/
│   └── firebase-auth.js    # Script d'authentification Firebase
└── application.properties  # Configuration du serveur (port 8081)

src/main/java/com/ruche/ruche_connect/
├── controller/
│   └── AuthController.java # Contrôleur d'authentification
├── service/
│   └── FirebaseAuthService.java # Service d'authentification
├── config/
│   └── FirebaseConfig.java # Configuration Firebase
└── model/
    └── User.java           # Modèle utilisateur
```

## Démarrage

1. Démarrer l'application :
```bash
mvn spring-boot:run
```

2. Accéder à l'application :
```
http://localhost:8081
```

3. Se connecter via `/login`

## Sécurité

- Les routes `/admin` sont protégées par session
- Vérification de l'authentification à chaque accès
- Redirection automatique vers `/login` si non authentifié
- Gestion des sessions côté serveur

## Prochaines étapes

1. Implémenter la vérification réelle des tokens Firebase avec Firebase Admin SDK
2. Ajouter la gestion des rôles et permissions
3. Créer un système de récupération de mot de passe
4. Ajouter l'inscription de nouveaux utilisateurs
5. Implémenter la déconnexion Firebase côté client 