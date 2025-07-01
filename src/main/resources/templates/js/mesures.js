// Initialisation du graphique
let measuresChart;

// Données de test
const testData = {
    labels: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
    temperature: [24.2, 24.5, 24.8, 25.0, 24.9, 24.7, 24.5],
    humidity: [64, 65, 66, 65, 64, 65, 65]
};

// Configuration du graphique
function initChart() {
    const ctx = document.getElementById('measuresChart').getContext('2d');
    
    measuresChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: testData.labels,
            datasets: [
                {
                    label: 'Température (°C)',
                    data: testData.temperature,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Humidité (%)',
                    data: testData.humidity,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
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

// Gestion de l'affichage graphique/liste
function toggleView(viewType) {
    const graphView = document.querySelector('.measures-graph');
    const listView = document.querySelector('.measures-list');
    const graphBtn = document.querySelector('[data-view="graph"]');
    const listBtn = document.querySelector('[data-view="list"]');

    if (viewType === 'graph') {
        graphView.style.display = 'block';
        listView.style.display = 'none';
        graphBtn.classList.add('active');
        listBtn.classList.remove('active');
    } else {
        graphView.style.display = 'none';
        listView.style.display = 'block';
        graphBtn.classList.remove('active');
        listBtn.classList.add('active');
    }
}

// Mise à jour des données
function updateData() {
    // Simulation de nouvelles données
    const newTemp = 24.5 + (Math.random() - 0.5);
    const newHumidity = 65 + (Math.random() - 0.5);

    // Mise à jour des cartes de mesures
    document.querySelector('.measure-card:nth-child(1) .measure-value').textContent = `${newTemp.toFixed(1)}°C`;
    document.querySelector('.measure-card:nth-child(2) .measure-value').textContent = `${Math.round(newHumidity)}%`;

    // Mise à jour du graphique
    testData.labels.push(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    testData.temperature.push(newTemp);
    testData.humidity.push(newHumidity);

    // Garder seulement les 7 derniers points
    if (testData.labels.length > 7) {
        testData.labels.shift();
        testData.temperature.shift();
        testData.humidity.shift();
    }

    measuresChart.update();
}

// Gestion des événements
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation du graphique
    initChart();

    // Gestion des boutons de vue
    document.querySelectorAll('.view-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleView(btn.dataset.view);
        });
    });

    // Gestion des sélecteurs
    document.getElementById('ruche-select').addEventListener('change', () => {
        // Simuler le chargement des données pour la ruche sélectionnée
        updateData();
    });

    document.getElementById('periode-select').addEventListener('change', () => {
        // Simuler le chargement des données pour la période sélectionnée
        updateData();
    });

    // Mise à jour périodique des données
    setInterval(updateData, 30000); // Toutes les 30 secondes
}); 