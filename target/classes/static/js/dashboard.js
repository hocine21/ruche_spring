document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de la carte
    const map = L.map('map', {
        zoomAnimation: true,
        fadeAnimation: true
    }).setView([48.8566, 2.3522], 13);

    // Style personnalisé pour la carte
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Données des ruches depuis le backend
    const ruches = window.RUCHES_MAP || [];

    // Icône personnalisée ruche
    const beeHiveIcon = L.icon({
        iconUrl: '/static/images/beehive_6986741.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34],
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

    // Fonction de géocodage Nominatim
    function geocodeAdresse(adresse, callback) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    callback({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                } else {
                    callback(null);
                }
            })
            .catch(() => callback(null));
    }

    // Placer les ruches sur la carte
    let firstRucheCoords = null;
    let ruchesPlaced = 0;
    ruches.forEach((ruche, idx) => {
        const adresse = ruche.emplacement && ruche.emplacement.trim() !== '' ? ruche.emplacement : ruche.adresseRucher;
        if (!adresse || adresse.trim() === '') return;
        geocodeAdresse(adresse, coords => {
            if (coords) {
                if (!firstRucheCoords) firstRucheCoords = coords;
                const popupContent = `
                    <div class="map-popup">
                        <b>${ruche.nom}</b><br/>
                        <span>${adresse}</span>
                    </div>
                `;
                const marker = L.marker([coords.lat, coords.lng], { icon: beeHiveIcon, title: ruche.nom })
                    .bindPopup(popupContent)
                    .addTo(map);
                marker.on('mouseover', function() { this.openPopup(); });
            }
            ruchesPlaced++;
            // Centrer la carte sur la première ruche trouvée
            if (firstRucheCoords && ruchesPlaced === 1) {
                map.setView([firstRucheCoords.lat, firstRucheCoords.lng], 13);
            }
        });
    });

    // Ajout du cercle d'activité
    const circle = L.circle([48.8566, 2.3522], {
        color: '#0984e3',
        weight: 1,
        fillColor: 'rgba(9, 132, 227, 0.08)',
        fillOpacity: 0.7,
        radius: 500,
        className: 'map-activity-radius'
    }).addTo(map);

    // Animation du cercle
    setTimeout(() => {
        if (document.querySelector('.map-activity-radius')) {
            document.querySelector('.map-activity-radius').classList.add('radius-animate');
        }
    }, 500);

    // Graphique de température et humidité
    const tempHumidityCtx = document.getElementById('tempHumidityChart').getContext('2d');
    const tempHumidityChart = new Chart(tempHumidityCtx, {
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

    // Graphique d'activité
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    const activityChart = new Chart(activityCtx, {
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

    // Gestion des alertes
    document.querySelectorAll('.alert-item').forEach(alert => {
        alert.addEventListener('click', () => {
            alert.style.opacity = '0.7';
            setTimeout(() => {
                alert.style.opacity = '1';
            }, 200);
        });
    });

    // Mise à jour périodique des données
    function updateData() {
        // Mise à jour des valeurs des cartes
        const temperatureValue = document.querySelector('.card-icon.temperature + .card-info .value');
        const humidityValue = document.querySelector('.card-icon.humidity + .card-info .value');
        const activityValue = document.querySelector('.card-icon.activity + .card-info .value');
        const alertsValue = document.querySelector('.card-icon.alerts + .card-info .value');

        if (temperatureValue) {
            const newTemp = (Math.random() * 5 + 22).toFixed(1);
            temperatureValue.textContent = `${newTemp}°C`;
        }

        if (humidityValue) {
            const newHumidity = Math.floor(Math.random() * 10 + 60);
            humidityValue.textContent = `${newHumidity}%`;
        }

        if (activityValue) {
            const activities = ['Normal', 'Élevée', 'Basse'];
            activityValue.textContent = activities[Math.floor(Math.random() * activities.length)];
        }

        if (alertsValue) {
            const newAlerts = Math.floor(Math.random() * 5);
            alertsValue.textContent = newAlerts;
        }
    }

    // Mise à jour toutes les 30 secondes
    setInterval(updateData, 30000);
}); 