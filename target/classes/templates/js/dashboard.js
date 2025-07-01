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

    // Icônes personnalisées pour les marqueurs
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

    // Données des ruches
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

    // Ajout des marqueurs pour les ruches
    ruches.forEach(ruche => {
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
            
        marker.on('mouseover', function() {
            this.openPopup();
        });
        
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