// Initialisation de la carte avec une animation
const map = L.map('map', {
    zoomAnimation: true,
    fadeAnimation: true
}).setView([48.8566, 2.3522], 13);

// Style personnalisé pour la carte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Icônes personnalisées pour les marqueurs - utilisant l'image beehive_6986741.png
const beeHiveIcon = L.icon({
    iconUrl: 'beehive_6986741.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
    className: 'beehive-icon'
});

// Différentes tailles d'icônes selon l'activité
const normalHiveIcon = L.icon({
    iconUrl: 'beehive_6986741.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
    className: 'beehive-icon normal'
});

const highHiveIcon = L.icon({
    iconUrl: 'beehive_6986741.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -38],
    className: 'beehive-icon high'
});

const moderateHiveIcon = L.icon({
    iconUrl: 'beehive_6986741.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
    className: 'beehive-icon moderate'
});

// Ajout des marqueurs pour les ruches
const ruches = [
    { 
        id: 1, 
        lat: 48.8566, 
        lng: 2.3522, 
        name: 'Ruche #1',
        temp: 24.5,
        humidity: 65,
        activity: 'Normal',
        lastCheck: '2024-05-16'
    },
    { 
        id: 2, 
        lat: 48.8606, 
        lng: 2.3376, 
        name: 'Ruche #2',
        temp: 23.2,
        humidity: 70,
        activity: 'Élevé',
        lastCheck: '2024-05-15'
    },
    { 
        id: 3, 
        lat: 48.8534, 
        lng: 2.3488, 
        name: 'Ruche #3',
        temp: 25.1,
        humidity: 62,
        activity: 'Modéré',
        lastCheck: '2024-05-14'
    }
];

ruches.forEach(ruche => {
    // Choisir la bonne icône en fonction de l'activité
    let icon;
    let activityColor;
    
    if (ruche.activity === 'Élevé') {
        icon = highHiveIcon;
        activityColor = '#00b894';
    } else if (ruche.activity === 'Modéré') {
        icon = moderateHiveIcon;
        activityColor = '#fdcb6e';
    } else {
        icon = normalHiveIcon;
        activityColor = '#0984e3';
    }
    
    const popupContent = `
        <div class="map-popup">
            <b>${ruche.name}</b>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-temperature-three-quarters" style="color: #ff7675;"></i>
                    <span>${ruche.temp}°C</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-droplet" style="color: #74b9ff;"></i>
                    <span>${ruche.humidity}%</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-bee" style="color: ${activityColor};"></i>
                    <span>${ruche.activity}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-calendar-check" style="color: #a29bfe;"></i>
                    <span>${ruche.lastCheck}</span>
                </div>
            </div>
            <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                <button style="background: #0984e3; color: white; border: none; border-radius: 8px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">
                    <i class="fa-solid fa-arrow-right"></i> Détails
                </button>
            </div>
        </div>
    `;
    
    const marker = L.marker([ruche.lat, ruche.lng], { icon: icon, title: ruche.name })
        .bindPopup(popupContent)
        .addTo(map);
        
    // Animation au survol du marqueur
    marker.on('mouseover', function() {
        this.openPopup();
    });
    
    // Animation de pulsation lors de l'ajout des marqueurs
    setTimeout(() => {
        if (marker._icon) {
            marker._icon.classList.add('marker-pulse');
            setTimeout(() => {
                if (marker._icon) {
                    marker._icon.classList.remove('marker-pulse');
                }
            }, 1500);
        }
    }, ruche.id * 300);
});

// Ajouter un cercle pour montrer le rayon d'activité avec un style plus harmonieux
const circle = L.circle([48.8566, 2.3522], {
    color: '#0984e3',
    weight: 1,
    fillColor: 'rgba(9, 132, 227, 0.08)',
    fillOpacity: 0.7,
    radius: 500,
    className: 'map-activity-radius'
}).addTo(map);

// Animation du cercle lors du chargement de la page
setTimeout(() => {
    if (document.querySelector('.map-activity-radius')) {
        document.querySelector('.map-activity-radius').classList.add('radius-animate');
    }
}, 500);

// Graphique de température et humidité
const tempHumidityCtx = document.getElementById('tempHumidityChart');
if (tempHumidityCtx) {
    const tempHumidityChart = new Chart(tempHumidityCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            datasets: [
                {
                    label: 'Température (°C)',
                    data: [22, 21, 20, 23, 25, 26, 24, 23],
                    borderColor: '#ff7675',
                    backgroundColor: 'rgba(255, 118, 117, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Humidité (%)',
                    data: [70, 72, 75, 68, 65, 63, 65, 67],
                    borderColor: '#74b9ff',
                    backgroundColor: 'rgba(116, 185, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Graphique d'activité
const activityCtx = document.getElementById('activityChart');
if (activityCtx) {
    const activityChart = new Chart(activityCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
                label: 'Activité des abeilles',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: '#55efc4',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Niveau d\'activité'
                    }
                }
            }
        }
    });
}

// Gestion des alertes
document.querySelectorAll('.alert-item').forEach(alert => {
    alert.addEventListener('click', () => {
        alert.style.opacity = '0.7';
        setTimeout(() => {
            alert.style.opacity = '1';
        }, 200);
    });
});

// Gestion du menu responsive
const burgerMenu = document.querySelector('.burger-menu');
const sidebar = document.querySelector('.sidebar');

if (burgerMenu) {
    burgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Mise à jour en temps réel des données
function updateData() {
    // Simulation de mises à jour de données
    const temperature = 24.5 + (Math.random() * 2 - 1);
    const humidity = 65 + (Math.random() * 4 - 2);
    
    document.querySelector('.card-icon.temperature + .card-info .value').textContent = 
        `${temperature.toFixed(1)}°C`;
    document.querySelector('.card-icon.humidity + .card-info .value').textContent = 
        `${humidity.toFixed(0)}%`;
}

// Mise à jour toutes les 5 secondes
setInterval(updateData, 5000);

// Gestion des notifications
const notificationBell = document.querySelector('.notifications');
if (notificationBell) {
    notificationBell.addEventListener('click', () => {
        // Logique pour afficher les notifications
        console.log('Notifications clicked');
    });
}

// Gestion de la recherche
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        // Logique de recherche
        console.log('Searching for:', e.target.value);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const menuRuches = document.getElementById('menu-ruches');
    const menuGestionRuches = document.getElementById('menu-gestion-ruches');
    const ruchersSection = document.getElementById('ruchers-section');
    const hivesSection = document.getElementById('hives-section');
    const hivesManagementSection = document.getElementById('hives-management-section');
    const dashboardSection = document.getElementById('dashboard-section');
    
    // Éléments pour les ruchers
    const openApiaryBtn = document.getElementById('openApiaryModal');
    const closeApiaryBtn = document.getElementById('closeApiaryModal');
    const apiaryModal = document.getElementById('apiaryModal');
    const apiaryForm = document.getElementById('apiaryForm');
    const apiariesList = document.getElementById('apiaries-list');
    const modalTitle = document.getElementById('modalTitle');
    const addressInput = document.getElementById('apiaryAddress');
    const descInput = document.getElementById('apiaryDesc');
    const coordinatesDisplay = document.getElementById('coordinatesDisplay');
    
    // Éléments pour les ruches
    const openHiveBtn = document.getElementById('openHiveModal');
    const closeHiveBtn = document.getElementById('closeHiveModal');
    const hiveModal = document.getElementById('hiveModal');
    const hiveForm = document.getElementById('hiveForm');
    const hivesList = document.getElementById('hives-list');
    const hiveName = document.getElementById('hiveName');
    const hiveType = document.getElementById('hiveType');
    const hiveNotes = document.getElementById('hiveNotes');
    const hiveStatus = document.getElementsByName('hiveStatus');
    const backToApiariesBtn = document.getElementById('backToApiaries');
    const currentApiaryName = document.getElementById('currentApiaryName');
    const currentApiaryAddress = document.getElementById('currentApiaryAddress');
    
    // Élements pour la gestion globale des ruches
    const openGlobalHiveBtn = document.getElementById('openGlobalHiveModal');
    const closeGlobalHiveBtn = document.getElementById('closeGlobalHiveModal');
    const globalHiveModal = document.getElementById('globalHiveModal');
    const globalHiveForm = document.getElementById('globalHiveForm');
    const globalHiveApiary = document.getElementById('globalHiveApiary');
    const globalHiveName = document.getElementById('globalHiveName');
    const globalHiveType = document.getElementById('globalHiveType');
    const globalHiveNotes = document.getElementById('globalHiveNotes');
    const globalHiveStatus = document.getElementsByName('globalHiveStatus');
    const apiaryFilter = document.getElementById('apiaryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const hiveSearch = document.getElementById('hiveSearch');
    const hivesTableBody = document.getElementById('hivesTableBody');
    
    // Variables de gestion
    let editIndex = null; // Index du rucher en cours d'édition
    let hiveEditIndex = null; // Index de la ruche en cours d'édition
    let currentApiaryIndex = null; // Index du rucher actuellement sélectionné
    let currentCoordinates = null; // Coordonnées du rucher en cours d'édition
    
    // Données
    let apiaries = []; // Liste des ruchers
    const apiaryMarkers = []; // Marqueurs des ruchers sur la carte
    
    // Initialisation de la carte de prévisualisation
    let previewMap;
    
    // Marqueur pour la prévisualisation
    let previewMarker = null;

    // Navigation principale
    if (menuRuches) {
        menuRuches.addEventListener('click', function(e) {
            e.preventDefault();
            ruchersSection.style.display = 'block';
            hivesSection.style.display = 'none';
            dashboardSection.style.display = 'none';
            hivesManagementSection.style.display = 'none';
            
            // Activer l'élément du menu
            document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
            menuRuches.parentElement.classList.add('active');
        });
    }
    
    // Navigation entre ruchers et ruches
    if (backToApiariesBtn) {
        backToApiariesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            ruchersSection.style.display = 'block';
            hivesSection.style.display = 'none';
            currentApiaryIndex = null;
        });
    }
    
    // Modales ruchers
    if (openApiaryBtn) {
        openApiaryBtn.addEventListener('click', function() {
            console.log('Ouverture de la modale rucher');
            openModal();
        });
    }
    
    if (closeApiaryBtn) {
        closeApiaryBtn.addEventListener('click', function() {
            closeModal();
        });
    }
    
    if (apiaryModal) {
        apiaryModal.addEventListener('click', function(e) {
            if (e.target === apiaryModal) {
                closeModal();
            }
        });
    }
    
    // Modales ruches
    if (openHiveBtn) {
        openHiveBtn.addEventListener('click', function() {
            console.log('Ouverture de la modale ruche');
            openHiveModal();
        });
    }
    
    if (closeHiveBtn) {
        closeHiveBtn.addEventListener('click', function() {
            closeHiveModal();
        });
    }
    
    if (hiveModal) {
        hiveModal.addEventListener('click', function(e) {
            if (e.target === hiveModal) {
                closeHiveModal();
            }
        });
    }
    
    // Retour au tableau de bord
    const menuDashboard = document.querySelector('a[href="#dashboard"]');
    if (menuDashboard) {
        menuDashboard.addEventListener('click', function(e) {
            e.preventDefault();
            ruchersSection.style.display = 'none';
            hivesSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            
            // Activer l'élément du menu
            document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
            menuDashboard.parentElement.classList.add('active');
        });
    }
    
    // Navigation vers la gestion globale des ruches
    if (menuGestionRuches) {
        menuGestionRuches.addEventListener('click', function(e) {
            e.preventDefault();
            ruchersSection.style.display = 'none';
            hivesSection.style.display = 'none';
            dashboardSection.style.display = 'none';
            hivesManagementSection.style.display = 'block';
            
            // Activer l'élément du menu
            document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
            menuGestionRuches.parentElement.classList.add('active');
            
            // Charger les données
            updateGlobalHivesList();
            updateApiaryDropdowns();
        });
    }
    
    // Fonction pour initialiser la carte de prévisualisation
    function initPreviewMap() {
        if (!previewMap) {
            try {
                previewMap = L.map('previewMap').setView([48.8566, 2.3522], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(previewMap);
            } catch (error) {
                console.error("Erreur d'initialisation de la carte:", error);
            }
        }
    }
    
    // Fonction pour initialiser l'autocomplétion d'adresses
    function initializeAutocomplete() {
        // Vérifier si l'API Google Maps est chargée
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            const autocomplete = new google.maps.places.Autocomplete(addressInput, {
                types: ['address'],
                fields: ['formatted_address', 'geometry']
            });
            autocomplete.addListener('place_changed', function() {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    currentCoordinates = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    updatePreviewMap(currentCoordinates);
                    updateCoordinatesDisplay(currentCoordinates);
                    console.log('Coordonnées sélectionnées:', currentCoordinates);
                }
            });
        } else {
            // Fallback si Google Maps n'est pas disponible - utiliser OpenStreetMap Nominatim avec autocomplétion
            let timeoutId;
            
            addressInput.addEventListener('input', function() {
                clearTimeout(timeoutId);
                const query = this.value.trim();
                
                if (query.length < 3) return; // Attendre au moins 3 caractères
                
                // Délai pour éviter trop de requêtes pendant la frappe
                timeoutId = setTimeout(async () => {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
                        const data = await response.json();
                        
                        // Créer une liste de suggestions
                        showAddressSuggestions(data);
                    } catch (error) {
                        console.error('Erreur lors de la recherche d\'adresses:', error);
                    }
                }, 300);
            });
            
            // Lorsque l'utilisateur sort du champ d'adresse, essayer de géolocaliser
            addressInput.addEventListener('blur', async function() {
                setTimeout(async () => {
                    try {
                        const address = addressInput.value.trim();
                        if (address && !currentCoordinates) {
                            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
                            const data = await response.json();
                            if (data && data.length > 0) {
                                currentCoordinates = {
                                    lat: parseFloat(data[0].lat),
                                    lng: parseFloat(data[0].lon)
                                };
                                updatePreviewMap(currentCoordinates);
                                updateCoordinatesDisplay(currentCoordinates);
                                console.log('Coordonnées trouvées via Nominatim:', currentCoordinates);
                            }
                        }
                    } catch (error) {
                        console.error('Erreur lors de la géolocalisation:', error);
                    }
                }, 200);
            });
        }
    }
    
    // Fonction pour afficher les suggestions d'adresses
    function showAddressSuggestions(addresses) {
        // Supprimer les anciennes suggestions si elles existent
        const oldSuggestions = document.getElementById('address-suggestions');
        if (oldSuggestions) {
            oldSuggestions.remove();
        }
        
        if (!addresses || addresses.length === 0) return;
        
        // Créer l'élément de liste de suggestions
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.id = 'address-suggestions';
        suggestionsDiv.style.position = 'absolute';
        suggestionsDiv.style.width = addressInput.offsetWidth + 'px';
        suggestionsDiv.style.maxHeight = '200px';
        suggestionsDiv.style.overflowY = 'auto';
        suggestionsDiv.style.background = 'white';
        suggestionsDiv.style.border = '1px solid #ddd';
        suggestionsDiv.style.borderRadius = '0 0 8px 8px';
        suggestionsDiv.style.zIndex = '1000';
        suggestionsDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        
        // Positionner sous le champ d'adresse
        const rect = addressInput.getBoundingClientRect();
        suggestionsDiv.style.left = (addressInput.offsetLeft) + 'px';
        suggestionsDiv.style.top = (addressInput.offsetTop + addressInput.offsetHeight) + 'px';
        
        // Ajouter chaque suggestion
        addresses.forEach(address => {
            const suggestion = document.createElement('div');
            suggestion.textContent = address.display_name;
            suggestion.style.padding = '8px 12px';
            suggestion.style.cursor = 'pointer';
            suggestion.style.borderBottom = '1px solid #eee';
            suggestion.style.transition = 'background 0.2s';
            
            suggestion.addEventListener('mouseenter', () => {
                suggestion.style.background = '#f5f5f5';
            });
            
            suggestion.addEventListener('mouseleave', () => {
                suggestion.style.background = 'white';
            });
            
            suggestion.addEventListener('click', () => {
                addressInput.value = address.display_name;
                currentCoordinates = {
                    lat: parseFloat(address.lat),
                    lng: parseFloat(address.lon)
                };
                updatePreviewMap(currentCoordinates);
                updateCoordinatesDisplay(currentCoordinates);
                suggestionsDiv.remove();
            });
            
            suggestionsDiv.appendChild(suggestion);
        });
        
        // Ajouter au parent du champ d'adresse
        addressInput.parentNode.style.position = 'relative';
        addressInput.parentNode.appendChild(suggestionsDiv);
        
        // Fermer les suggestions si on clique ailleurs
        document.addEventListener('click', function closeDropdown(e) {
            if (e.target !== addressInput && e.target !== suggestionsDiv) {
                if (suggestionsDiv.parentNode) {
                    suggestionsDiv.remove();
                }
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
    
    // Fonction pour mettre à jour la carte de prévisualisation
    function updatePreviewMap(coordinates) {
        if (coordinates) {
            try {
                initPreviewMap();
                previewMap.setView([coordinates.lat, coordinates.lng], 15);
                
                // Supprimer l'ancien marqueur si existant
                if (previewMarker) {
                    previewMap.removeLayer(previewMarker);
                }
                
                // Ajouter un nouveau marqueur
                previewMarker = L.marker([coordinates.lat, coordinates.lng], { 
                    icon: beeHiveIcon,
                    draggable: true // Permet de déplacer le marqueur
                }).addTo(previewMap);
                
                // Mettre à jour les coordonnées lorsque le marqueur est déplacé
                previewMarker.on('dragend', function(e) {
                    const position = previewMarker.getLatLng();
                    currentCoordinates = {
                        lat: position.lat,
                        lng: position.lng
                    };
                    updateCoordinatesDisplay(currentCoordinates);
                });
            } catch (error) {
                console.error("Erreur lors de la mise à jour de la carte:", error);
            }
        }
    }
    
    // Fonction pour mettre à jour l'affichage des coordonnées
    function updateCoordinatesDisplay(coordinates) {
        if (coordinates && coordinatesDisplay) {
            coordinatesDisplay.innerHTML = `<i class="fa-solid fa-location-dot" style="color:#ff9800;"></i> Latitude: ${coordinates.lat.toFixed(6)}, Longitude: ${coordinates.lng.toFixed(6)}`;
        } else if (coordinatesDisplay) {
            coordinatesDisplay.innerHTML = '';
        }
    }

    function openModal(edit = false, data = null, index = null) {
        console.log("Ouverture modale appelée");
        apiaryModal.style.display = 'flex';
        modalTitle.textContent = edit ? 'Modifier le rucher' : 'Ajouter un rucher';
        
        if (apiaryForm) apiaryForm.reset();
        
        editIndex = null;
        currentCoordinates = null;
        
        // Réinitialiser la carte de prévisualisation
        setTimeout(() => {
            try {
                initPreviewMap();
                if (previewMap) previewMap.invalidateSize();
                if (previewMarker) {
                    previewMap.removeLayer(previewMarker);
                    previewMarker = null;
                }
                updateCoordinatesDisplay(null);
            } catch (error) {
                console.error("Erreur dans setTimeout de openModal:", error);
            }
        }, 100);
        
        if (edit && data) {
            addressInput.value = data.address;
            descInput.value = data.desc;
            currentCoordinates = data.coordinates || null;
            editIndex = index;
            
            // Mettre à jour la carte avec les coordonnées existantes
            if (currentCoordinates) {
                setTimeout(() => {
                    updatePreviewMap(currentCoordinates);
                    updateCoordinatesDisplay(currentCoordinates);
                }, 200);
            }
        }
        
        // Initialiser l'autocomplétion après l'ouverture de la modale
        setTimeout(initializeAutocomplete, 100);
    }
    
    function closeModal() {
        apiaryModal.style.display = 'none';
        if (apiaryForm) apiaryForm.reset();
        editIndex = null;
        currentCoordinates = null;
        
        // Réinitialiser la carte et le marqueur
        if (previewMarker && previewMap) {
            previewMap.removeLayer(previewMarker);
            previewMarker = null;
        }
        updateCoordinatesDisplay(null);
    }

    // Soumission du formulaire
    if (apiaryForm) {
        apiaryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const address = addressInput.value.trim();
            const desc = descInput.value.trim();
            
            if (!address || !desc) return;
            
            // Si aucune coordonnée n'a été récupérée, essayer de les obtenir
            if (!currentCoordinates) {
                // Fonction pour continuer l'enregistrement une fois les coordonnées obtenues
                const continueSubmission = () => {
                    const apiaryData = { 
                        address, 
                        desc, 
                        icon: 'fa-hive', // Icône par défaut
                        coordinates: currentCoordinates || null 
                    };
                    
                    if (editIndex !== null) {
                        apiaries[editIndex] = apiaryData;
                    } else {
                        apiaries.push(apiaryData);
                    }
                    renderApiaries();
                    updateMapMarkers();
                    closeModal();
                };
                
                // Essayer d'obtenir les coordonnées avec Nominatim
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            currentCoordinates = {
                                lat: parseFloat(data[0].lat),
                                lng: parseFloat(data[0].lon)
                            };
                        }
                        continueSubmission();
                    })
                    .catch(error => {
                        console.error('Erreur lors de la géolocalisation:', error);
                        continueSubmission();
                    });
            } else {
                // Si on a déjà les coordonnées, enregistrer directement
                const apiaryData = { 
                    address, 
                    desc, 
                    icon: 'fa-hive', // Icône par défaut
                    coordinates: currentCoordinates 
                };
                
                if (editIndex !== null) {
                    apiaries[editIndex] = apiaryData;
                } else {
                    apiaries.push(apiaryData);
                }
                renderApiaries();
                updateMapMarkers();
                closeModal();
            }
        });
    }

    function renderApiaries() {
        if (!apiariesList) return;
        
        apiariesList.innerHTML = '';
        apiaries.forEach((apiary, idx) => {
            const card = document.createElement('div');
            card.className = 'apiary-card';
            
            card.innerHTML = `
                <div class="apiary-header">
                    <div class="apiary-icon">
                        <img src="beehive_6986741.png" alt="Ruche" style="width: 32px; height: 32px;">
                    </div>
                    <div class="apiary-info">
                        <div class="apiary-title">${apiary.address}</div>
                        <div class="apiary-description">${apiary.desc}</div>
                        ${apiary.coordinates ? 
                            `<div class="apiary-coordinates">
                                <i class="fa-solid fa-location-dot"></i> 
                                Lat: ${apiary.coordinates.lat.toFixed(4)}, Lng: ${apiary.coordinates.lng.toFixed(4)}
                            </div>` : ''}
                    </div>
                </div>
                <div class="apiary-actions">
                    <button class="view-apiary-btn">
                        <i class="fa-solid fa-map-location-dot"></i> Voir sur la carte
                    </button>
                    <button class="edit-apiary-btn">
                        <i class="fa-solid fa-pen"></i> Modifier
                    </button>
                    <button class="delete-apiary-btn">
                        <i class="fa-solid fa-trash"></i> Supprimer
                    </button>
                </div>
            `;
            
            // Voir sur la carte
            card.querySelector('.view-apiary-btn').addEventListener('click', () => {
                // Changer de vue vers le tableau de bord avec la carte
                dashboardSection.style.display = 'block';
                ruchersSection.style.display = 'none';
                
                // Centrer la carte sur le rucher si on a des coordonnées
                if (apiary.coordinates) {
                    map.setView([apiary.coordinates.lat, apiary.coordinates.lng], 15);
                    
                    // Mettre en évidence le marqueur correspondant s'il existe
                    if (apiaryMarkers && apiaryMarkers[idx]) {
                        apiaryMarkers[idx].openPopup();
                    }
                }
                
                // Activer l'élément du menu tableau de bord
                document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
                document.querySelector('a[href="#dashboard"]').parentElement.classList.add('active');
            });
            
            // Modifier
            card.querySelector('.edit-apiary-btn').addEventListener('click', () => {
                openModal(true, apiary, idx);
            });
            
            // Supprimer
            card.querySelector('.delete-apiary-btn').addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce rucher ?')) {
                    apiaries.splice(idx, 1);
                    renderApiaries();
                    updateMapMarkers();
                }
            });
            
            apiariesList.appendChild(card);
        });
        
        // Afficher un message si aucun rucher n'est présent
        if (apiaries.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '40px 20px';
            emptyState.style.color = '#888';
            
            emptyState.innerHTML = `
                <div style="font-size:4em; color:#ffd700; margin-bottom:20px;">
                    <i class="fa-solid fa-hive"></i>
                </div>
                <h3 style="font-size:1.5em; margin-bottom:10px; color:#555;">Aucun rucher enregistré</h3>
                <p style="margin-bottom:20px;">Commencez par ajouter votre premier rucher</p>
                <button id="emptyStateAddBtn" style="background:linear-gradient(90deg,#ffd700 0%,#ff9800 100%); color:#fff; border:none; border-radius:14px; padding:12px 28px; font-size:1.1em; font-weight:600; box-shadow:0 2px 10px #ffd70033; cursor:pointer; transition:background 0.2s;">
                    <i class="fa-solid fa-plus"></i> Ajouter un rucher
                </button>
            `;
            
            apiariesList.appendChild(emptyState);
            
            // Ajouter l'événement pour le bouton d'ajout dans l'état vide
            const emptyStateBtn = document.getElementById('emptyStateAddBtn');
            if (emptyStateBtn) {
                emptyStateBtn.addEventListener('click', () => {
                    openModal();
                });
            }
        }
    }
    
    // Fonction pour mettre à jour les marqueurs sur la carte
    function updateMapMarkers() {
        try {
            // Supprimer les marqueurs existants
            apiaryMarkers.forEach(marker => {
                if (map) map.removeLayer(marker);
            });
            apiaryMarkers.length = 0;
            
            // Ajouter les nouveaux marqueurs
            apiaries.forEach((apiary, idx) => {
                if (apiary.coordinates && map) {
                    // Générer des données fictives de température et humidité pour la démo
                    const temp = (Math.random() * 5 + 22).toFixed(1);
                    const humidity = Math.floor(Math.random() * 15 + 60);
                    const activities = ['Normal', 'Élevé', 'Modéré'];
                    const activity = activities[Math.floor(Math.random() * activities.length)];
                    const lastCheck = new Date().toISOString().split('T')[0];
                    
                    // Choisir la couleur en fonction de l'activité
                    let activityColor;
                    if (activity === 'Élevé') {
                        activityColor = '#00b894';
                    } else if (activity === 'Modéré') {
                        activityColor = '#fdcb6e';
                    } else {
                        activityColor = '#0984e3';
                    }
                    
                    const marker = L.marker([apiary.coordinates.lat, apiary.coordinates.lng], { 
                        icon: beeHiveIcon, 
                        title: apiary.address 
                    })
                    .bindPopup(`
                        <div class="map-popup">
                            <b>${apiary.address}</b>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fa-solid fa-temperature-three-quarters" style="color: #ff7675;"></i>
                                    <span>${temp}°C</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fa-solid fa-droplet" style="color: #74b9ff;"></i>
                                    <span>${humidity}%</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fa-solid fa-bee" style="color: ${activityColor};"></i>
                                    <span>${activity}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fa-solid fa-calendar-check" style="color: #a29bfe;"></i>
                                    <span>${lastCheck}</span>
                                </div>
                            </div>
                            <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                                <button class="popup-details-btn" data-index="${idx}" style="background: #0984e3; color: white; border: none; border-radius: 8px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">
                                    <i class="fa-solid fa-pen"></i> Gérer ce rucher
                                </button>
                            </div>
                        </div>
                    `)
                    .addTo(map);
                    
                    marker.on('mouseover', function() {
                        this.openPopup();
                    });
                    
                    // Ajouter une animation lors de l'ajout du marqueur
                    setTimeout(() => {
                        if (marker._icon) {
                            marker._icon.classList.add('marker-pulse');
                            setTimeout(() => {
                                if (marker._icon) {
                                    marker._icon.classList.remove('marker-pulse');
                                }
                            }, 1500);
                        }
                    }, 300);
                    
                    apiaryMarkers.push(marker);
                }
            });
            
            // Gérer le clic sur le bouton dans le popup
            document.addEventListener('click', function(e) {
                if (e.target && e.target.classList.contains('popup-details-btn')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    if (!isNaN(index) && index >= 0 && index < apiaries.length) {
                        // Rediriger vers la page des ruchers
                        if (menuRuches) menuRuches.click();
                        
                        // Mettre en évidence le rucher concerné
                        setTimeout(() => {
                            const ruchers = document.querySelectorAll('.apiary-card');
                            if (ruchers[index]) {
                                ruchers[index].scrollIntoView({ behavior: 'smooth' });
                                ruchers[index].style.boxShadow = '0 0 0 3px #ffd700';
                                setTimeout(() => {
                                    ruchers[index].style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                                }, 2000);
                            }
                        }, 300);
                    }
                }
            });
        } catch (error) {
            console.error("Erreur lors de la mise à jour des marqueurs:", error);
        }
    }

    // Permettre de cliquer sur la carte de prévisualisation pour définir l'emplacement
    setTimeout(() => {
        try {
            initPreviewMap();
            if (previewMap) {
                previewMap.on('click', function(e) {
                    currentCoordinates = {
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                    };
                    updatePreviewMap(currentCoordinates);
                    updateCoordinatesDisplay(currentCoordinates);
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'initialisation de l'événement de clic sur la carte:", error);
        }
    }, 500);
    
    // Initialiser la liste des ruchers
    renderApiaries();

    // Gérer la navigation depuis un rucher vers ses ruches
    function showHivesForApiary(apiaryIndex) {
        if (apiaryIndex >= 0 && apiaryIndex < apiaries.length) {
            currentApiaryIndex = apiaryIndex;
            const apiary = apiaries[apiaryIndex];
            
            // Mettre à jour les informations de l'apiary dans la section des ruches
            currentApiaryName.textContent = apiary.address;
            currentApiaryAddress.textContent = apiary.desc;
            
            // Afficher la section des ruches et masquer celle des ruchers
            ruchersSection.style.display = 'none';
            hivesSection.style.display = 'block';
            
            // Initialiser les ruches dans l'apiary si nécessaire
            if (!apiary.hives) {
                apiary.hives = [];
            }
            
            // Rendre les ruches de ce rucher
            renderHives(apiary.hives);
        }
    }

    // Rendre les ruches d'un rucher
    function renderHives(hives) {
        if (!hivesList) return;
        
        hivesList.innerHTML = '';
        
        if (hives.length === 0) {
            // Afficher un message si aucune ruche n'est présente
            const emptyState = document.createElement('div');
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '40px 20px';
            emptyState.style.color = '#888';
            
            emptyState.innerHTML = `
                <div style="font-size:4em; color:#ffd700; margin-bottom:20px;">
                    <i class="fa-solid fa-bee"></i>
                </div>
                <h3 style="font-size:1.5em; margin-bottom:10px; color:#555;">Aucune ruche dans ce rucher</h3>
                <p style="margin-bottom:20px;">Ajoutez votre première ruche pour commencer</p>
                <button id="emptyStateAddHiveBtn" style="background:linear-gradient(90deg,#ffd700 0%,#ff9800 100%); color:#fff; border:none; border-radius:14px; padding:12px 28px; font-size:1.1em; font-weight:600; box-shadow:0 2px 10px #ffd70033; cursor:pointer; transition:background 0.2s;">
                    <i class="fa-solid fa-plus"></i> Ajouter une ruche
                </button>
            `;
            
            hivesList.appendChild(emptyState);
            
            // Ajouter l'événement pour le bouton d'ajout dans l'état vide
            const emptyStateBtn = document.getElementById('emptyStateAddHiveBtn');
            if (emptyStateBtn) {
                emptyStateBtn.addEventListener('click', () => {
                    openHiveModal();
                });
            }
            return;
        }
        
        // Afficher les ruches existantes
        hives.forEach((hive, idx) => {
            const card = document.createElement('div');
            card.className = 'hive-card';
            card.style.background = '#fff';
            card.style.borderRadius = '12px';
            card.style.padding = '16px';
            card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
            card.style.transition = 'all 0.3s ease';
            
            // Déterminer la couleur de statut
            let statusColor, statusText;
            switch(hive.status) {
                case 'active':
                    statusColor = '#2e7d32';
                    statusText = 'Active';
                    break;
                case 'inactive':
                    statusColor = '#f57f17';
                    statusText = 'Inactive';
                    break;
                case 'maintenance':
                    statusColor = '#1565c0';
                    statusText = 'Maintenance';
                    break;
                default:
                    statusColor = '#2e7d32';
                    statusText = 'Active';
            }
            
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:#ffd700; border-radius:50%;">
                            <i class="fa-solid fa-bee" style="color:#fff; font-size:18px;"></i>
                        </div>
                        <div>
                            <h3 style="margin:0; font-size:1.2em; font-weight:600;">${hive.name}</h3>
                            <span style="display:inline-block; margin-top:4px; padding:4px 10px; background:${statusColor}22; color:${statusColor}; border-radius:12px; font-size:0.8em; font-weight:500;">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px; color:#666;">
                        <i class="fa-solid fa-shapes"></i>
                        <span>Type: ${hive.type}</span>
                    </div>
                    ${hive.notes ? `
                    <div style="color:#777; font-size:0.9em; margin-top:8px;">
                        <i class="fa-solid fa-quote-left" style="font-size:0.8em; opacity:0.5;"></i>
                        ${hive.notes}
                    </div>` : ''}
                </div>
                
                <div style="display:flex; gap:8px; margin-top:16px;">
                    <button class="edit-hive-btn" data-index="${idx}" style="flex:1; background:#eee; color:#333; border:none; border-radius:8px; padding:8px 0; font-size:0.9em; cursor:pointer; transition:all 0.2s ease;">
                        <i class="fa-solid fa-pen"></i> Modifier
                    </button>
                    <button class="delete-hive-btn" data-index="${idx}" style="flex:1; background:#fee; color:#e53935; border:none; border-radius:8px; padding:8px 0; font-size:0.9em; cursor:pointer; transition:all 0.2s ease;">
                        <i class="fa-solid fa-trash"></i> Supprimer
                    </button>
                </div>
            `;
            
            // Ajouter les événements pour les boutons
            card.querySelector('.edit-hive-btn').addEventListener('click', () => {
                openHiveModal(true, hive, idx);
            });
            
            card.querySelector('.delete-hive-btn').addEventListener('click', () => {
                if (confirm(`Êtes-vous sûr de vouloir supprimer la ruche "${hive.name}" ?`)) {
                    // Supprimer la ruche
                    if (currentApiaryIndex !== null) {
                        apiaries[currentApiaryIndex].hives.splice(idx, 1);
                        renderHives(apiaries[currentApiaryIndex].hives);
                    }
                }
            });
            
            hivesList.appendChild(card);
        });
    }

    // Gestion du formulaire d'ajout/modification de ruche
    if (hiveForm) {
        hiveForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Vérifier qu'un rucher est sélectionné
            if (currentApiaryIndex === null) {
                alert('Erreur: Aucun rucher sélectionné.');
                return;
            }
            
            // Récupérer les valeurs du formulaire
            const name = hiveName.value.trim();
            const type = hiveType.value;
            const notes = hiveNotes.value.trim();
            
            // Récupérer le statut sélectionné
            let status = 'active';
            for (let radio of hiveStatus) {
                if (radio.checked) {
                    status = radio.value;
                    break;
                }
            }
            
            if (!name) {
                alert('Veuillez donner un nom à la ruche.');
                return;
            }
            
            // Créer l'objet ruche
            const hiveData = {
                name,
                type,
                notes,
                status,
                dateAdded: new Date().toISOString()
            };
            
            // Ajouter ou mettre à jour la ruche
            if (hiveEditIndex !== null) {
                apiaries[currentApiaryIndex].hives[hiveEditIndex] = hiveData;
            } else {
                // S'assurer que le tableau des ruches existe
                if (!apiaries[currentApiaryIndex].hives) {
                    apiaries[currentApiaryIndex].hives = [];
                }
                apiaries[currentApiaryIndex].hives.push(hiveData);
            }
            
            // Mettre à jour l'affichage
            renderHives(apiaries[currentApiaryIndex].hives);
            closeHiveModal();
        });
    }

    // Ajouter des gestionnaires d'événements pour les ruchers
    function addApiaryEventListeners() {
        // Ajouter des écouteurs d'événements pour gérer les ruches dans les ruchers
        document.querySelectorAll('.apiary-card').forEach((card, idx) => {
            // Ajouter un gestionnaire pour accéder aux ruches d'un rucher
            const manageRuchesBtn = document.createElement('button');
            manageRuchesBtn.className = 'manage-hives-btn';
            manageRuchesBtn.innerHTML = '<i class="fa-solid fa-bee"></i> Gérer les ruches';
            manageRuchesBtn.style.background = '#ffd700';
            manageRuchesBtn.style.color = '#fff';
            manageRuchesBtn.style.border = 'none';
            manageRuchesBtn.style.borderRadius = '8px';
            manageRuchesBtn.style.padding = '8px 12px';
            manageRuchesBtn.style.fontSize = '0.9em';
            manageRuchesBtn.style.cursor = 'pointer';
            manageRuchesBtn.style.transition = 'all 0.2s ease';
            
            manageRuchesBtn.addEventListener('click', () => {
                showHivesForApiary(idx);
            });
            
            // Ajouter le bouton dans la carte du rucher
            const actionsDiv = card.querySelector('.apiary-actions');
            if (actionsDiv) {
                actionsDiv.appendChild(manageRuchesBtn);
            }
        });
    }

    // Mettre à jour la fonction renderApiaries pour ajouter les événements
    const originalRenderApiaries = renderApiaries;
    renderApiaries = function() {
        originalRenderApiaries();
        addApiaryEventListeners();
    };

    // Définir la fonction d'ouverture de la modale pour les ruches
    function openHiveModal(edit = false, data = null, index = null) {
        hiveModal.style.display = 'flex';
        hiveModalTitle.textContent = edit ? 'Modifier la ruche' : 'Ajouter une ruche';
        
        if (hiveForm) hiveForm.reset();
        hiveEditIndex = null;
        
        if (edit && data) {
            hiveName.value = data.name || '';
            hiveType.value = data.type || 'Dadant';
            hiveNotes.value = data.notes || '';
            
            // Définir le statut
            const statusRadios = document.getElementsByName('hiveStatus');
            for (let radio of statusRadios) {
                if (radio.value === data.status) {
                    radio.checked = true;
                    break;
                }
            }
            
            hiveEditIndex = index;
        }
    }
    
    function closeHiveModal() {
        hiveModal.style.display = 'none';
        if (hiveForm) hiveForm.reset();
        hiveEditIndex = null;
    }

    // GESTION GLOBALE DES RUCHES
    
    // Données en dur pour initialiser des ruches (partie statique)
    const initialHives = [
        {
            id: 1,
            name: "Ruche Lavande",
            apiaryId: 0, // Sera assigné dynamiquement au premier rucher
            type: "Dadant",
            status: "active",
            notes: "Colonie forte, bonne production de miel",
            dateAdded: "2024-04-15"
        },
        {
            id: 2,
            name: "Ruche Tournesol",
            apiaryId: 0, // Sera assigné dynamiquement au premier rucher
            type: "Langstroth",
            status: "maintenance",
            notes: "Reine à remplacer prochainement",
            dateAdded: "2024-04-20"
        },
        {
            id: 3,
            name: "Ruche Acacia",
            apiaryId: 1, // Sera assigné dynamiquement au deuxième rucher
            type: "Warré",
            status: "inactive",
            notes: "Ruche en observation, activité réduite",
            dateAdded: "2024-05-01"
        }
    ];
    
    // ID global pour les nouvelles ruches
    let nextHiveId = 4;
    
    // Variable pour stocker l'ID de la ruche en cours d'édition
    let globalHiveEditId = null;
    
    // Modales ruches globales
    if (openGlobalHiveBtn) {
        openGlobalHiveBtn.addEventListener('click', function() {
            openGlobalHiveModal();
        });
    }
    
    if (closeGlobalHiveBtn) {
        closeGlobalHiveBtn.addEventListener('click', function() {
            closeGlobalHiveModal();
        });
    }
    
    if (globalHiveModal) {
        globalHiveModal.addEventListener('click', function(e) {
            if (e.target === globalHiveModal) {
                closeGlobalHiveModal();
            }
        });
    }
    
    function openGlobalHiveModal(edit = false, hiveData = null) {
        globalHiveModal.style.display = 'flex';
        document.getElementById('globalHiveModalTitle').textContent = edit ? 'Modifier la ruche' : 'Ajouter une ruche';
        
        if (globalHiveForm) globalHiveForm.reset();
        globalHiveEditId = null;
        
        // Mettre à jour la liste des ruchers dans le dropdown
        updateApiaryDropdowns();
        
        if (edit && hiveData) {
            globalHiveApiary.value = hiveData.apiaryId;
            globalHiveName.value = hiveData.name;
            globalHiveType.value = hiveData.type;
            globalHiveNotes.value = hiveData.notes || '';
            
            // Mettre à jour le statut
            for (let radio of globalHiveStatus) {
                if (radio.value === hiveData.status) {
                    radio.checked = true;
                    break;
                }
            }
            
            globalHiveEditId = hiveData.id;
        }
    }
    
    function closeGlobalHiveModal() {
        globalHiveModal.style.display = 'none';
        if (globalHiveForm) globalHiveForm.reset();
        globalHiveEditId = null;
    }
    
    // Mettre à jour les listes déroulantes des ruchers
    function updateApiaryDropdowns() {
        // Réinitialiser les options
        globalHiveApiary.innerHTML = '<option value="">Sélectionnez un rucher</option>';
        apiaryFilter.innerHTML = '<option value="all">Tous les ruchers</option>';
        
        // Ajouter les ruchers dans les listes déroulantes
        apiaries.forEach((apiary, idx) => {
            // Pour le formulaire
            const option1 = document.createElement('option');
            option1.value = idx;
            option1.textContent = apiary.address;
            globalHiveApiary.appendChild(option1);
            
            // Pour le filtre
            const option2 = document.createElement('option');
            option2.value = idx;
            option2.textContent = apiary.address;
            apiaryFilter.appendChild(option2);
        });
        
        // Si aucun rucher n'est disponible, désactiver le formulaire
        if (apiaries.length === 0) {
            globalHiveApiary.innerHTML = '<option value="">Aucun rucher disponible</option>';
            globalHiveApiary.disabled = true;
            if (globalHiveForm) {
                globalHiveForm.querySelector('button[type="submit"]').disabled = true;
            }
        } else {
            globalHiveApiary.disabled = false;
            if (globalHiveForm) {
                globalHiveForm.querySelector('button[type="submit"]').disabled = false;
            }
        }
    }
    
    // Initialiser les ruches avec des données en dur
    function initializeHives() {
        // Initialiser quelques ruchers si aucun n'existe
        if (apiaries.length === 0) {
            apiaries.push({
                address: "Rucher de démonstration 1",
                desc: "Un rucher pour tester l'application",
                icon: 'fa-hive',
                coordinates: { lat: 48.8566, lng: 2.3522 },
                hives: []
            });
            
            apiaries.push({
                address: "Rucher de démonstration 2",
                desc: "Un autre rucher pour tester l'application",
                icon: 'fa-hive',
                coordinates: { lat: 48.8606, lng: 2.3376 },
                hives: []
            });
            
            renderApiaries();
            updateMapMarkers();
        }
        
        // Assigner les ruches initiales aux ruchers existants
        for (let hive of initialHives) {
            // Vérifier si la ruche existe déjà dans un rucher
            let exists = false;
            for (let apiary of apiaries) {
                if (apiary.hives) {
                    for (let existingHive of apiary.hives) {
                        if (existingHive.id === hive.id) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) break;
                }
            }
            
            // Si la ruche n'existe pas encore, l'ajouter
            if (!exists) {
                const apiaryIndex = parseInt(hive.apiaryId);
                if (apiaryIndex >= 0 && apiaryIndex < apiaries.length) {
                    if (!apiaries[apiaryIndex].hives) {
                        apiaries[apiaryIndex].hives = [];
                    }
                    apiaries[apiaryIndex].hives.push(hive);
                }
            }
        }
    }
    
    // Obtenir toutes les ruches de tous les ruchers
    function getAllHives() {
        const allHives = [];
        
        apiaries.forEach((apiary, apiaryIdx) => {
            if (apiary.hives && apiary.hives.length > 0) {
                apiary.hives.forEach(hive => {
                    // Ajouter l'information sur le rucher à chaque ruche
                    allHives.push({
                        ...hive,
                        apiaryId: apiaryIdx,
                        apiaryName: apiary.address
                    });
                });
            }
        });
        
        return allHives;
    }
    
    // Filtrer les ruches selon les critères
    function filterHives() {
        let hives = getAllHives();
        
        // Filtre par rucher
        const apiaryValue = apiaryFilter.value;
        if (apiaryValue !== 'all') {
            hives = hives.filter(hive => hive.apiaryId.toString() === apiaryValue);
        }
        
        // Filtre par statut
        const statusValue = statusFilter.value;
        if (statusValue !== 'all') {
            hives = hives.filter(hive => hive.status === statusValue);
        }
        
        // Recherche
        const searchValue = hiveSearch.value.trim().toLowerCase();
        if (searchValue) {
            hives = hives.filter(hive => 
                hive.name.toLowerCase().includes(searchValue) || 
                (hive.notes && hive.notes.toLowerCase().includes(searchValue))
            );
        }
        
        return hives;
    }
    
    // Mettre à jour la liste des ruches dans le tableau
    function updateGlobalHivesList() {
        // Assurez-vous d'avoir quelques ruches
        initializeHives();
        
        // Obtenir les ruches filtrées
        const filteredHives = filterHives();
        
        // Vider le tableau
        hivesTableBody.innerHTML = '';
        
        if (filteredHives.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.style.borderTop = '1px solid #eee';
            emptyRow.innerHTML = `
                <td colspan="6" style="padding:20px; text-align:center; color:#888;">
                    Aucune ruche ne correspond aux critères de recherche
                </td>
            `;
            hivesTableBody.appendChild(emptyRow);
            return;
        }
        
        // Remplir le tableau avec les ruches filtrées
        filteredHives.forEach(hive => {
            const row = document.createElement('tr');
            row.style.borderTop = '1px solid #eee';
            
            // Déterminer la couleur et le texte du statut
            let statusColor, statusText;
            switch(hive.status) {
                case 'active':
                    statusColor = '#2e7d32';
                    statusText = 'Active';
                    break;
                case 'inactive':
                    statusColor = '#f57f17';
                    statusText = 'Inactive';
                    break;
                case 'maintenance':
                    statusColor = '#1565c0';
                    statusText = 'Maintenance';
                    break;
                default:
                    statusColor = '#2e7d32';
                    statusText = 'Active';
            }
            
            // Formater la date
            const dateObj = new Date(hive.dateAdded);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
            
            row.innerHTML = `
                <td style="padding:16px; font-weight:500;">${hive.name}</td>
                <td style="padding:16px;">${hive.apiaryName}</td>
                <td style="padding:16px;">${hive.type}</td>
                <td style="padding:16px;">
                    <span style="display:inline-block; padding:4px 10px; background:${statusColor}22; color:${statusColor}; border-radius:12px; font-size:0.8em; font-weight:500;">
                        ${statusText}
                    </span>
                </td>
                <td style="padding:16px;">${formattedDate}</td>
                <td style="padding:16px; text-align:center;">
                    <button class="edit-global-hive-btn" data-id="${hive.id}" data-apiary="${hive.apiaryId}" style="background:#eee; color:#333; border:none; border-radius:8px; padding:6px 12px; margin-right:8px; font-size:0.9em; cursor:pointer; transition:all 0.2s ease;">
                        <i class="fa-solid fa-pen"></i> Modifier
                    </button>
                    <button class="delete-global-hive-btn" data-id="${hive.id}" data-apiary="${hive.apiaryId}" style="background:#fee; color:#e53935; border:none; border-radius:8px; padding:6px 12px; font-size:0.9em; cursor:pointer; transition:all 0.2s ease;">
                        <i class="fa-solid fa-trash"></i> Supprimer
                    </button>
                </td>
            `;
            
            // Ajouter les gestionnaires d'événements pour les boutons
            const editBtn = row.querySelector('.edit-global-hive-btn');
            const deleteBtn = row.querySelector('.delete-global-hive-btn');
            
            editBtn.addEventListener('click', function() {
                const hiveId = parseInt(this.getAttribute('data-id'));
                const apiaryId = parseInt(this.getAttribute('data-apiary'));
                
                // Trouver la ruche
                const hive = apiaries[apiaryId].hives.find(h => h.id === hiveId);
                if (hive) {
                    openGlobalHiveModal(true, { ...hive, apiaryId });
                }
            });
            
            deleteBtn.addEventListener('click', function() {
                const hiveId = parseInt(this.getAttribute('data-id'));
                const apiaryId = parseInt(this.getAttribute('data-apiary'));
                
                // Trouver la ruche
                const hiveIndex = apiaries[apiaryId].hives.findIndex(h => h.id === hiveId);
                if (hiveIndex !== -1) {
                    const hiveName = apiaries[apiaryId].hives[hiveIndex].name;
                    if (confirm(`Êtes-vous sûr de vouloir supprimer la ruche "${hiveName}" ?`)) {
                        apiaries[apiaryId].hives.splice(hiveIndex, 1);
                        updateGlobalHivesList();
                    }
                }
            });
            
            hivesTableBody.appendChild(row);
        });
    }
    
    // Gestion du formulaire de ruche globale
    if (globalHiveForm) {
        globalHiveForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const apiaryId = parseInt(globalHiveApiary.value);
            const name = globalHiveName.value.trim();
            const type = globalHiveType.value;
            const notes = globalHiveNotes.value.trim();
            
            // Récupérer le statut sélectionné
            let status = 'active';
            for (let radio of globalHiveStatus) {
                if (radio.checked) {
                    status = radio.value;
                    break;
                }
            }
            
            // Valider les entrées
            if (isNaN(apiaryId) || apiaryId < 0 || apiaryId >= apiaries.length) {
                alert('Veuillez sélectionner un rucher valide.');
                return;
            }
            
            if (!name) {
                alert('Veuillez donner un nom à la ruche.');
                return;
            }
            
            // Créer l'objet ruche
            const hiveData = {
                name,
                type,
                notes,
                status,
                dateAdded: new Date().toISOString().split('T')[0]
            };
            
            // Ajouter ou mettre à jour la ruche
            if (globalHiveEditId !== null) {
                // Trouver la ruche à modifier dans le bon rucher
                const hiveIndex = apiaries[apiaryId].hives.findIndex(h => h.id === globalHiveEditId);
                
                if (hiveIndex !== -1) {
                    // Mise à jour
                    hiveData.id = globalHiveEditId;
                    apiaries[apiaryId].hives[hiveIndex] = hiveData;
                } else {
                    // La ruche a été déplacée vers un autre rucher
                    // Supprimer de l'ancien rucher
                    for (let i = 0; i < apiaries.length; i++) {
                        if (apiaries[i].hives) {
                            const oldHiveIndex = apiaries[i].hives.findIndex(h => h.id === globalHiveEditId);
                            if (oldHiveIndex !== -1) {
                                apiaries[i].hives.splice(oldHiveIndex, 1);
                                break;
                            }
                        }
                    }
                    
                    // Ajouter au nouveau rucher
                    hiveData.id = globalHiveEditId;
                    if (!apiaries[apiaryId].hives) {
                        apiaries[apiaryId].hives = [];
                    }
                    apiaries[apiaryId].hives.push(hiveData);
                }
            } else {
                // Nouvelle ruche
                hiveData.id = nextHiveId++;
                if (!apiaries[apiaryId].hives) {
                    apiaries[apiaryId].hives = [];
                }
                apiaries[apiaryId].hives.push(hiveData);
            }
            
            // Mettre à jour l'affichage
            updateGlobalHivesList();
            closeGlobalHiveModal();
        });
    }
    
    // Gestion des filtres et de la recherche
    if (apiaryFilter) {
        apiaryFilter.addEventListener('change', updateGlobalHivesList);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', updateGlobalHivesList);
    }
    
    if (hiveSearch) {
        hiveSearch.addEventListener('input', function() {
            // Utiliser un délai pour ne pas déclencher la recherche à chaque frappe
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(updateGlobalHivesList, 300);
        });
    }
});

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animation des statistiques
function animateStatistics() {
    const stats = document.querySelectorAll('.stat-value');
    stats.forEach(stat => {
        const value = parseInt(stat.textContent);
        stat.textContent = '0';
        let current = 0;
        const increment = value / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                clearInterval(timer);
                stat.textContent = value;
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 50);
    });
}

// Animation des icônes au survol
document.querySelectorAll('.card-icon').forEach(icon => {
    icon.addEventListener('mouseover', () => {
        icon.classList.add('icon-animate');
    });
    icon.addEventListener('mouseout', () => {
        icon.classList.remove('icon-animate');
    });
});

// Animation des graphiques
function animateCharts() {
    const ctx = document.getElementById('measuresChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Température',
                data: [22, 21, 23, 25, 24, 22],
                borderColor: '#ff7675',
                tension: 0.4,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }, {
                label: 'Humidité',
                data: [65, 68, 70, 65, 63, 67],
                borderColor: '#74b9ff',
                tension: 0.4,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }]
        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Effet de parallaxe sur les cartes
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width - 0.5) * 20;
        const yPercent = (y / rect.height - 0.5) * 20;
        
        card.style.transform = `perspective(1000px) rotateX(${yPercent}deg) rotateY(${xPercent}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'none';
    });
});

// Animation de chargement des données
function showLoadingAnimation(element) {
    element.classList.add('loading');
    const loader = document.createElement('div');
    loader.className = 'loader';
    element.appendChild(loader);
}

function hideLoadingAnimation(element) {
    element.classList.remove('loading');
    const loader = element.querySelector('.loader');
    if (loader) loader.remove();
}

// Simulation de chargement de données
function loadData(callback) {
    const container = document.querySelector('.measures-display');
    showLoadingAnimation(container);
    setTimeout(() => {
        hideLoadingAnimation(container);
        if (callback) callback();
    }, 1500);
}

// Gestion des vues (graphique/liste)
document.querySelectorAll('.view-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        document.querySelectorAll('.view-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (view === 'graph') {
            document.querySelector('.measures-graph').style.display = 'block';
            document.querySelector('.measures-list').style.display = 'none';
        } else {
            document.querySelector('.measures-graph').style.display = 'none';
            document.querySelector('.measures-list').style.display = 'block';
        }
    });
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Animer les statistiques au chargement
    animateStatistics();
    
    // Initialiser les graphiques
    animateCharts();
    
    // Ajouter les classes d'animation aux éléments
    document.querySelectorAll('.card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
    
    // Simuler des notifications
    setTimeout(() => {
        showNotification('Bienvenue dans votre espace apiculteur !', 'success');
    }, 1000);
});

// Gestion des alertes en temps réel
function simulateAlerts() {
    setInterval(() => {
        const random = Math.random();
        if (random < 0.1) { // 10% de chance d'avoir une alerte
            const alerts = [
                'Température élevée détectée dans la Ruche #2',
                'Humidité basse dans la Ruche #5',
                'Ouverture du couvercle détectée sur la Ruche #3'
            ];
            const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
            showNotification(randomAlert, 'warning');
        }
    }, 30000); // Vérifier toutes les 30 secondes
}

simulateAlerts();

// Gestion des apiculteurs
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Données de démonstration pour les apiculteurs
    const apiculteurs = [
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            status: "active",
            ruchers: 5,
            ruches: 12,
            dateInscription: "2024-01-15",
            avatar: "https://ui-avatars.com/api/?name=John+Doe"
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            status: "active",
            ruchers: 3,
            ruches: 8,
            dateInscription: "2024-02-01",
            avatar: "https://ui-avatars.com/api/?name=Jane+Smith"
        }
    ];

    // Gestion des apiculteurs
    const addApiculteurBtn = document.getElementById('add-apiculteur-btn');
    const apiculteursSection = document.getElementById('apiculteurs-section');
    const apiculteursList = document.querySelector('.apiculteurs-list');

    if (addApiculteurBtn) {
        addApiculteurBtn.addEventListener('click', () => {
            showApiculteurModal();
        });
    }

    // Fonction pour afficher la modale d'ajout/modification d'apiculteur
    function showApiculteurModal(apiculteur = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="width: 500px;">
                <button class="close-modal" style="position:absolute; top:18px; right:18px; background:none; border:none; font-size:1.5em; color:#bfa900; cursor:pointer;">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <h3 style="color:#bfa900; font-weight:700; margin-bottom:18px;">
                    ${apiculteur ? 'Modifier l\'apiculteur' : 'Ajouter un apiculteur'}
                </h3>
                <form id="apiculteurForm">
                    <div style="margin-bottom:16px;">
                        <label style="font-weight:600; color:#bfa900;">Nom complet</label>
                        <input type="text" id="apiculteurName" value="${apiculteur ? apiculteur.name : ''}" required 
                               style="width:100%; padding:10px; border-radius:8px; border:1.2px solid #ffd700; margin-top:4px;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-weight:600; color:#bfa900;">Email</label>
                        <input type="email" id="apiculteurEmail" value="${apiculteur ? apiculteur.email : ''}" required 
                               style="width:100%; padding:10px; border-radius:8px; border:1.2px solid #ffd700; margin-top:4px;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-weight:600; color:#bfa900;">Statut</label>
                        <select id="apiculteurStatus" style="width:100%; padding:10px; border-radius:8px; border:1.2px solid #ffd700; margin-top:4px;">
                            <option value="active" ${apiculteur && apiculteur.status === 'active' ? 'selected' : ''}>Actif</option>
                            <option value="inactive" ${apiculteur && apiculteur.status === 'inactive' ? 'selected' : ''}>Inactif</option>
                        </select>
                    </div>
                    <div style="margin-top:24px; text-align:right;">
                        <button type="submit" style="background:linear-gradient(90deg,#ffd700 0%,#ff9800 100%); color:#fff; border:none; border-radius:14px; padding:12px 32px; font-size:1.1em; font-weight:600; box-shadow:0 2px 10px #ffd70033; cursor:pointer;">
                            <i class="fa-solid fa-save"></i> ${apiculteur ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermeture de la modale
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Gestion du formulaire
        const form = modal.querySelector('#apiculteurForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                id: apiculteur ? apiculteur.id : apiculteurs.length + 1,
                name: document.getElementById('apiculteurName').value,
                email: document.getElementById('apiculteurEmail').value,
                status: document.getElementById('apiculteurStatus').value,
                ruchers: apiculteur ? apiculteur.ruchers : 0,
                ruches: apiculteur ? apiculteur.ruches : 0,
                dateInscription: apiculteur ? apiculteur.dateInscription : new Date().toISOString().split('T')[0],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(document.getElementById('apiculteurName').value)}`
            };

            if (apiculteur) {
                // Mise à jour
                const index = apiculteurs.findIndex(a => a.id === apiculteur.id);
                if (index !== -1) {
                    apiculteurs[index] = formData;
                }
            } else {
                // Ajout
                apiculteurs.push(formData);
            }

            renderApiculteurs();
            modal.remove();
            showNotification(`Apiculteur ${apiculteur ? 'modifié' : 'ajouté'} avec succès !`, 'success');
        });
    }

    // Fonction pour afficher la liste des apiculteurs
    function renderApiculteurs() {
        if (!apiculteursList) return;

        apiculteursList.innerHTML = '';
        apiculteurs.forEach(apiculteur => {
            const card = document.createElement('div');
            card.className = 'apiculteur-card';
            card.innerHTML = `
                <div class="apiculteur-info">
                    <img src="${apiculteur.avatar}" alt="${apiculteur.name}">
                    <div class="info-details">
                        <h3>${apiculteur.name}</h3>
                        <p>${apiculteur.email}</p>
                        <span class="status ${apiculteur.status}">${apiculteur.status === 'active' ? 'Actif' : 'Inactif'}</span>
                    </div>
                </div>
                <div class="apiculteur-stats">
                    <div class="stat">
                        <span class="stat-value">${apiculteur.ruchers}</span>
                        <span class="stat-label">Ruchers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${apiculteur.ruches}</span>
                        <span class="stat-label">Ruches</span>
                    </div>
                </div>
                <div class="apiculteur-actions">
                    <button class="edit-btn" onclick="editApiculteur(${apiculteur.id})">
                        <i class="fa-solid fa-pen"></i>
                        Modifier
                    </button>
                    <button class="delete-btn" onclick="deleteApiculteur(${apiculteur.id})">
                        <i class="fa-solid fa-trash"></i>
                        Supprimer
                    </button>
                </div>
            `;
            apiculteursList.appendChild(card);
        });
    }

    // Fonction pour éditer un apiculteur
    window.editApiculteur = function(id) {
        const apiculteur = apiculteurs.find(a => a.id === id);
        if (apiculteur) {
            showApiculteurModal(apiculteur);
        }
    };

    // Fonction pour supprimer un apiculteur
    window.deleteApiculteur = function(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet apiculteur ?')) {
            const index = apiculteurs.findIndex(a => a.id === id);
            if (index !== -1) {
                apiculteurs.splice(index, 1);
                renderApiculteurs();
                showNotification('Apiculteur supprimé avec succès !', 'success');
            }
        }
    };

    // Initialiser la liste des apiculteurs
    if (apiculteursSection) {
        renderApiculteurs();
    }

    // Gestion des alertes vol
    const alertesSection = document.getElementById('alertes-section');
    if (alertesSection) {
        // Simuler des alertes en temps réel
        setInterval(() => {
            const alertsTable = alertesSection.querySelector('.alerts-table tbody');
            if (alertsTable && Math.random() < 0.3) { // 30% de chance d'avoir une nouvelle alerte
                const now = new Date();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${now.toLocaleString()}</td>
                    <td>Ruche #${Math.floor(Math.random() * 5 + 1)}</td>
                    <td>Ouverture couvercle</td>
                    <td><span class="status pending">En cours</span></td>
                `;
                alertsTable.insertBefore(row, alertsTable.firstChild);
                showNotification('Nouvelle alerte détectée !', 'warning');
            }
        }, 10000);

        // Gestion de la désactivation temporaire
        const disableBtn = alertesSection.querySelector('.disable-btn');
        if (disableBtn) {
            disableBtn.addEventListener('click', () => {
                const duration = alertesSection.querySelector('select').value;
                showNotification(`Alertes désactivées pour ${duration}`, 'info');
                disableBtn.disabled = true;
                setTimeout(() => {
                    disableBtn.disabled = false;
                    showNotification('Alertes réactivées', 'success');
                }, 5000); // Simulation de la durée
            });
        }
    }

    // Gestion des mesures et historique
    const mesuresSection = document.getElementById('mesures-section');
    if (mesuresSection) {
        // Mise à jour en temps réel des valeurs
        setInterval(() => {
            const temp = 24.5 + (Math.random() * 2 - 1);
            const humidity = 65 + (Math.random() * 4 - 2);
            
            const tempValue = mesuresSection.querySelector('.measure-value:first-child');
            const humidityValue = mesuresSection.querySelector('.measure-value:nth-child(2)');
            
            if (tempValue) tempValue.textContent = `${temp.toFixed(1)}°C`;
            if (humidityValue) humidityValue.textContent = `${Math.round(humidity)}%`;
        }, 5000);

        // Gestion du changement de vue (graphique/liste)
        const viewBtns = mesuresSection.querySelectorAll('.view-type-btn');
        const graphView = mesuresSection.querySelector('.measures-graph');
        const listView = mesuresSection.querySelector('.measures-list');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (btn.dataset.view === 'graph') {
                    graphView.style.display = 'block';
                    listView.style.display = 'none';
                } else {
                    graphView.style.display = 'none';
                    listView.style.display = 'block';
                }
            });
        });
    }
});

// ... existing code ...

// Gestion des apiculteurs
document.getElementById('menu-apiculteurs').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('apiculteurs-section');
    loadBeekeepers();
});

function loadBeekeepers() {
    const beekeepersGrid = document.querySelector('.beekeepers-grid');
    beekeepersGrid.innerHTML = ''; // Clear existing content

    // Example data - replace with actual data from your backend
    const beekeepers = [
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'active',
            ruchers: 5,
            ruches: 12
        },
        {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'active',
            ruchers: 3,
            ruches: 8
        }
    ];

    beekeepers.forEach(beekeeper => {
        const card = createBeekeeperCard(beekeeper);
        beekeepersGrid.appendChild(card);
    });
}

function createBeekeeperCard(beekeeper) {
    const card = document.createElement('div');
    card.className = 'apiculteur-card';
    card.innerHTML = `
        <div class="apiculteur-info">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(beekeeper.name)}" alt="${beekeeper.name}">
            <div class="info-details">
                <h3>${beekeeper.name}</h3>
                <p>${beekeeper.email}</p>
                <span class="status ${beekeeper.status}">Actif</span>
            </div>
        </div>
        <div class="apiculteur-stats">
            <div class="stat">
                <span class="stat-value">${beekeeper.ruchers}</span>
                <span class="stat-label">Ruchers</span>
            </div>
            <div class="stat">
                <span class="stat-value">${beekeeper.ruches}</span>
                <span class="stat-label">Ruches</span>
            </div>
        </div>
        <div class="apiculteur-actions">
            <button class="edit-btn" onclick="editBeekeeper('${beekeeper.name}')">
                <i class="fa-solid fa-pen"></i>
                Modifier
            </button>
            <button class="delete-btn" onclick="deleteBeekeeper('${beekeeper.name}')">
                <i class="fa-solid fa-trash"></i>
                Supprimer
            </button>
        </div>
    `;
    return card;
}

// Modal management for beekeepers
const beekeeperModal = document.getElementById('beekeeperModal');
const openBeekeeperModal = document.getElementById('openBeekeeperModal');
const closeBeekeeperModal = document.getElementById('closeBeekeeperModal');
const beekeeperForm = document.getElementById('beekeeperForm');

openBeekeeperModal.addEventListener('click', () => {
    beekeeperModal.style.display = 'flex';
});

closeBeekeeperModal.addEventListener('click', () => {
    beekeeperModal.style.display = 'none';
});

beekeeperForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your form submission logic here
    beekeeperModal.style.display = 'none';
    loadBeekeepers(); // Reload the list after adding/editing
});

// Search functionality
const beekeeperSearch = document.getElementById('beekeeperSearch');
beekeeperSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.apiculteur-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const email = card.querySelector('p').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || email.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// ... existing code ... 

document.getElementById('select-ruche').addEventListener('change', async function() {
    const rucheId = this.value;
    if (!rucheId) return;
    // Trouver la ruche sélectionnée dans la liste JS
    const ruche = ruchesCarte.find(r => r.id === rucheId);
    if (!ruche) return;
    // Appel AJAX pour la dernière mesure
    const resp = await fetch(`/api/mesures/last/${ruche.referenceCapteur}`);
    if (resp.ok) {
        const mesure = await resp.json();
        document.getElementById('card-temperature').textContent = mesure.temperature !== null ? mesure.temperature + '°C' : '--';
        document.getElementById('card-humidite').textContent = mesure.humidite !== null ? mesure.humidite + '%' : '--';
        document.getElementById('card-couvercle').textContent = mesure.etatCouvercle || '--';
        
        const icon = document.getElementById('card-couvercle-icon');
        if (mesure.etatCouvercle === 'OUVERT') {
            icon.innerHTML = '<i class="fa-solid fa-lock-open" style="color:#e74c3c;"></i>';
        } else {
            icon.innerHTML = '<i class="fa-solid fa-lock" style="color:#27ae60;"></i>';
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Affiche les ruches dans la console
    console.log('ruchesCarte:', ruchesCarte);

    // Remplit la liste déroulante si besoin (si pas déjà fait par Thymeleaf)
    const select = document.getElementById('select-ruche');
    if (select && ruchesCarte.length > 0) {
        ruchesCarte.forEach(ruche => {
            const option = document.createElement('option');
            option.value = ruche.id;
            option.textContent = ruche.nom;
            select.appendChild(option);
        });
    }
});

// ... existing code ...
    // Chargement des ruchers
    async function loadApiaries() {
        try {
            const response = await fetch('/api/ruchers');
            if (!response.ok) throw new Error('Erreur API');
            const data = await response.json();
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
// ... existing code ...

// ... existing code ...
    // Fonction pour récupérer les alertes dynamiques
    async function refreshAlertesDynamiques() {
        const container = document.getElementById('alertes-dynamiques-list');
        const nbAlertesElem = document.getElementById('card-alertes-nb');
        try {
            const resp = await fetch('/api/alertes/dynamiques');
            if (!resp.ok) throw new Error('Erreur API');
            const alertes = await resp.json();
            if (nbAlertesElem) nbAlertesElem.textContent = alertes.length;
            if (!alertes || alertes.length === 0) {
                container.innerHTML = '<div style="color:#aaa; font-size:0.95em;">Aucune alerte récente</div>';
                return;
            }
            container.innerHTML = alertes.map(a => `
                <div class="alert-item" style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                    <i class="fa-solid ${a.icone}" style="color:#e67e22;"></i>
                    <div>
                        <b>${a.titre}</b> <span style="color:#bfa900;">${a.ruche}</span> : <span>${a.valeur}</span>
                        <span style="color:#888; font-size:0.9em; margin-left:8px;">${a.heure}</span>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            if (nbAlertesElem) nbAlertesElem.textContent = '0';
            container.innerHTML = '<div style="color:#e74c3c; font-size:0.95em;">Erreur chargement alertes</div>';
        }
    }
// ... existing code ...