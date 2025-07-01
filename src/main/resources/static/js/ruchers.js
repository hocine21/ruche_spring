import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2XMx0mSXYYUP2ISfYqXWVzppA39cDymc",
  authDomain: "rucheconnect-d9225.firebaseapp.com",
  databaseURL: "https://rucheconnect-d9225-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "rucheconnect-d9225",
  storageBucket: "rucheconnect-d9225.appspot.com",
  messagingSenderId: "619265212498",
  appId: "1:619265212498:web:347199f2c1826dbc4e9f8b",
  measurementId: "G-CWVVTE31DS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variables globales
let map;
let markers = {};
let apiaries = [];
let currentEditId = null;
let addressTimeout = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeEventListeners();
    loadApiaries();
});

// Initialisation de la carte
function initializeMap() {
    // Initialiser la carte centrée sur la France
    map = L.map('map').setView([46.603354, 1.888334], 6);
    
    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    // Bouton d'ajout de rucher
    document.getElementById('addApiaryBtn').addEventListener('click', () => openApiaryModal());
    
    // Fermeture de la modale
    document.querySelector('.close-modal-btn').addEventListener('click', () => {
        document.getElementById('apiaryModal').style.display = 'none';
    });
    
    // Formulaire de rucher
    document.getElementById('apiaryForm').addEventListener('submit', handleApiarySubmit);
    
    // Recherche de ruchers
    document.getElementById('searchApiary').addEventListener('input', filterApiaries);
    
    // Autocomplétion d'adresse
    document.getElementById('apiaryAddress').addEventListener('input', handleAddressInput);
}

// Chargement des ruchers
async function loadApiaries() {
    try {
        // Appel à l'API sur le port 9000
        const response = await fetch('http://localhost:9000/api/ruchers');
        if (!response.ok) throw new Error('Erreur API');
        const data = await response.json();
        // On suppose que data est un tableau d'objets Rucher
        apiaries = data.map(rucher => ({
            id: rucher.id || rucher._id || rucher.nom || Math.random(),
            name: rucher.nom || rucher.name || '',
            address: rucher.adresse || rucher.address || '',
            description: rucher.description || '',
            latitude: rucher.latitude ? parseFloat(rucher.latitude) : 46.603354,
            longitude: rucher.longitude ? parseFloat(rucher.longitude) : 1.888334
        }));
        renderApiaries();
        updateMap();
    } catch (error) {
        console.error('Erreur lors du chargement des ruchers:', error);
        showNotification('Erreur lors du chargement des ruchers', 'error');
    }
}

// Rendu des ruchers dans la liste
function renderApiaries(filteredApiaries = null) {
    const container = document.getElementById('apiariesList');
    const apiariesToRender = filteredApiaries || apiaries;
    
    container.innerHTML = apiariesToRender.map(apiary => `
        <div class="apiary-card" data-id="${apiary.id}" onclick="selectApiary(${apiary.id})">
            <h3>${apiary.name}</h3>
            <p>${apiary.address}</p>
            <p>${apiary.description}</p>
        </div>
    `).join('');
}

// Création de l'icône personnalisée pour les marqueurs
const beeIcon = L.icon({
    iconUrl: 'beehive_6986741.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Mise à jour de la carte
function updateMap() {
    // Supprimer tous les marqueurs existants
    Object.values(markers).forEach(marker => marker.remove());
    markers = {};
    
    // Ajouter les nouveaux marqueurs
    apiaries.forEach(apiary => {
        const marker = L.marker([apiary.latitude, apiary.longitude], { icon: beeIcon })
            .bindPopup(`
                <strong>${apiary.name}</strong><br>
                ${apiary.address}<br>
                ${apiary.description}
            `);
        
        marker.addTo(map);
        markers[apiary.id] = marker;
    });
}

// Filtrage des ruchers
function filterApiaries() {
    const searchTerm = document.getElementById('searchApiary').value.toLowerCase();
    
    const filteredApiaries = apiaries.filter(apiary => 
        apiary.name.toLowerCase().includes(searchTerm) ||
        apiary.address.toLowerCase().includes(searchTerm) ||
        apiary.description.toLowerCase().includes(searchTerm)
    );
    
    renderApiaries(filteredApiaries);
}

// Sélection d'un rucher
function selectApiary(id) {
    const apiary = apiaries.find(a => a.id === id);
    if (apiary) {
        // Mettre à jour la carte
        map.setView([apiary.latitude, apiary.longitude], 15);
        markers[id].openPopup();
        
        // Mettre à jour la liste
        document.querySelectorAll('.apiary-card').forEach(card => {
            card.classList.toggle('active', card.dataset.id === id.toString());
        });
    }
}

// Gestion de l'autocomplétion d'adresse
async function handleAddressInput(event) {
    const input = event.target.value;
    const suggestionsContainer = document.getElementById('addressSuggestions');
    
    // Effacer le timeout précédent
    if (addressTimeout) {
        clearTimeout(addressTimeout);
    }
    
    // Attendre que l'utilisateur ait fini de taper
    addressTimeout = setTimeout(async () => {
        if (input.length < 3) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=fr&limit=5`);
            const suggestions = await response.json();
            
            if (suggestions.length > 0) {
                suggestionsContainer.innerHTML = suggestions.map(suggestion => `
                    <div class="suggestion-item" onclick="selectAddress('${suggestion.display_name.replace(/'/g, "\\'")}', ${suggestion.lat}, ${suggestion.lon})">
                        ${suggestion.display_name}
                    </div>
                `).join('');
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Erreur lors de la recherche d\'adresse:', error);
        }
    }, 300);
}

// Sélection d'une adresse
function selectAddress(address, lat, lon) {
    document.getElementById('apiaryAddress').value = address;
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lon;
    document.getElementById('addressSuggestions').style.display = 'none';
}

// Ouverture de la modale
function openApiaryModal(apiaryId = null) {
    const modal = document.getElementById('apiaryModal');
    const form = document.getElementById('apiaryForm');
    currentEditId = apiaryId;
    
    if (apiaryId) {
        const apiary = apiaries.find(a => a.id === apiaryId);
        if (apiary) {
            document.getElementById('apiaryName').value = apiary.name;
            document.getElementById('apiaryAddress').value = apiary.address;
            document.getElementById('apiaryDescription').value = apiary.description;
            document.getElementById('latitude').value = apiary.latitude;
            document.getElementById('longitude').value = apiary.longitude;
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Gestion du formulaire
async function handleApiarySubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('apiaryName').value,
        address: document.getElementById('apiaryAddress').value,
        description: document.getElementById('apiaryDescription').value,
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value)
    };
    
    try {
        if (currentEditId) {
            // TODO: Appel API pour mettre à jour
            const index = apiaries.findIndex(a => a.id === currentEditId);
            if (index !== -1) {
                apiaries[index] = { ...apiaries[index], ...formData };
            }
        } else {
            // TODO: Appel API pour créer
            const newApiary = {
                id: apiaries.length + 1,
                ...formData
            };
            apiaries.push(newApiary);
        }
        
        renderApiaries();
        updateMap();
        document.getElementById('apiaryModal').style.display = 'none';
        showNotification('Rucher enregistré avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du rucher:', error);
        showNotification('Erreur lors de l\'enregistrement du rucher', 'error');
    }
}

// Fonction de notification
function showNotification(message, type = 'info') {
    // TODO: Implémenter un système de notification
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Affichage des ruchers
function afficherRuchers() {
  const tbody = document.getElementById('ruchersTableBody');
  const ruchersRef = ref(db, 'ruchers');
  onValue(ruchersRef, (snapshot) => {
    const data = snapshot.val();
    tbody.innerHTML = '';
    if (!data) {
      tbody.innerHTML = '<tr><td colspan="5">Aucun rucher trouvé.</td></tr>';
      return;
    }
    Object.values(data).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.nom || ''}</td>
        <td>${r.description || ''}</td>
        <td>${r.adresse || ''}</td>
        <td>${r.codePostal || ''}</td>
        <td>${r.ville || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}
afficherRuchers();

// Ajout d'un rucher
document.getElementById('addRucherForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const rucher = {
    nom: document.getElementById('nom').value,
    description: document.getElementById('description').value,
    adresse: document.getElementById('adresse').value,
    codePostal: document.getElementById('codePostal').value,
    ville: document.getElementById('ville').value,
    // apiculteurId: "à compléter si besoin"
  };
  push(ref(db, 'ruchers'), rucher)
    .then(() => {
      document.getElementById('addRucherForm').reset();
    })
    .catch((error) => {
      alert('Erreur lors de l\'ajout : ' + error.message);
    });
}); 