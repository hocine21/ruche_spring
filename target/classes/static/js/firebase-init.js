// Script d'initialisation Firebase pour ajouter des utilisateurs de test
// À exécuter une seule fois pour initialiser la base de données

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA2XMx0mSXYYUP2ISfYqXWVzppA39cDymc",
    authDomain: "rucheconnect-d9225.firebaseapp.com",
    databaseURL: "https://rucheconnect-d9225-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rucheconnect-d9225",
    storageBucket: "rucheconnect-d9225.firebasestorage.app",
    messagingSenderId: "619265212498",
    appId: "1:619265212498:web:473709779b6953a04e9f8b",
    measurementId: "G-15ZK4PY78D"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Données de test pour les utilisateurs
const testUsers = {
    "user1": {
        "email": "jean.dupont@rucheconnect.com",
        "nom": "Dupont",
        "prenom": "Jean",
        "role": "Apiculteur"
    },
    "user2": {
        "email": "marie.martin@rucheconnect.com",
        "nom": "Martin",
        "prenom": "Marie",
        "role": "Apiculteur"
    },
    "user3": {
        "email": "pierre.durand@rucheconnect.com",
        "nom": "Durand",
        "prenom": "Pierre",
        "role": "Apiculteur"
    },
    "admin1": {
        "email": "admin@rucheconnect.com",
        "nom": "Admin",
        "prenom": "Utilisateur",
        "role": "Admin"
    }
};

// Fonction pour initialiser la base de données
async function initializeFirebaseDatabase() {
    console.log("Initialisation de la base de données Firebase...");
    
    try {
        const usersRef = ref(database, 'users');
        await set(usersRef, testUsers);
        
        console.log("✅ Base de données initialisée avec succès !");
        console.log("Utilisateurs ajoutés :", Object.keys(testUsers).length);
        console.log("Vous pouvez maintenant accéder à la page /apiculteurs");
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation :", error);
    }
}

// Fonction pour vérifier si la base de données est vide
async function checkDatabaseStatus() {
    try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            console.log("📊 Base de données existante :", Object.keys(users).length, "utilisateurs");
            console.log("Utilisateurs :", users);
        } else {
            console.log("📭 Base de données vide");
            console.log("Exécutez initializeFirebaseDatabase() pour ajouter des utilisateurs de test");
        }
    } catch (error) {
        console.error("❌ Erreur lors de la vérification :", error);
    }
}

// Exposer les fonctions globalement
window.initializeFirebaseDatabase = initializeFirebaseDatabase;
window.checkDatabaseStatus = checkDatabaseStatus;

// Vérifier automatiquement le statut au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log("🐝 Firebase Init Script chargé");
    console.log("Commandes disponibles :");
    console.log("- checkDatabaseStatus() : Vérifier le statut de la base");
    console.log("- initializeFirebaseDatabase() : Initialiser avec des données de test");
    
    // Vérifier le statut automatiquement
    setTimeout(checkDatabaseStatus, 1000);
});

// Export pour utilisation dans d'autres modules
export { app, database, auth, initializeFirebaseDatabase, checkDatabaseStatus }; 