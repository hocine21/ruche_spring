// Données de test pour les alertes
let alerts = [
    {
        id: 1,
        type: 'vol',
        location: 'Ruche A1',
        timestamp: new Date('2024-03-15T10:30:00'),
        status: 'active',
        details: 'Mouvement suspect détecté',
        resolvedBy: null,
        resolvedAt: null
    },
    {
        id: 2,
        type: 'vol',
        location: 'Ruche B2',
        timestamp: new Date('2024-03-14T15:45:00'),
        status: 'resolved',
        details: 'Fausse alerte - vent fort',
        resolvedBy: 'Admin',
        resolvedAt: new Date('2024-03-14T16:00:00')
    }
];

// État d'inhibition des alertes
let alertsInhibited = false;

// Fonction pour charger les alertes
function loadAlerts() {
    const alertsList = document.querySelector('.alerts-list');
    alertsList.innerHTML = '';

    alerts.forEach(alert => {
        const alertCard = createAlertCard(alert);
        alertsList.appendChild(alertCard);
    });
}

// Fonction pour créer une carte d'alerte
function createAlertCard(alert) {
    const card = document.createElement('div');
    card.className = `alert-card ${alert.status}`;
    
    const formattedTime = formatDate(alert.timestamp);
    const statusText = alert.status === 'active' ? 'En cours' : 'Résolue';
    
    card.innerHTML = `
        <div class="alert-header">
            <div class="alert-title">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Alerte Vol - ${alert.location}</h3>
            </div>
            <div class="alert-time">${formattedTime}</div>
        </div>
        <div class="alert-details">
            <div class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${alert.location}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-info-circle"></i>
                <span>${alert.details}</span>
            </div>
        </div>
        ${alert.status === 'active' ? `
            <div class="alert-actions">
                <button class="action-btn resolve" onclick="resolveAlert(${alert.id})">
                    <i class="fas fa-check"></i>
                    Résoudre
                </button>
                <button class="action-btn ignore" onclick="ignoreAlert(${alert.id})">
                    <i class="fas fa-times"></i>
                    Ignorer
                </button>
            </div>
        ` : `
            <div class="alert-status">
                <i class="fas fa-check-circle"></i>
                <span>Résolue par ${alert.resolvedBy} le ${formatDate(alert.resolvedAt)}</span>
            </div>
        `}
    `;
    
    return card;
}

// Fonction pour formater la date
function formatDate(date) {
    return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fonction pour résoudre une alerte
function resolveAlert(alertId) {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
        alert.status = 'resolved';
        alert.resolvedBy = 'Admin'; // À remplacer par l'utilisateur connecté
        alert.resolvedAt = new Date();
        loadAlerts();
        showAlert('Alerte résolue avec succès', 'success');
    }
}

// Fonction pour ignorer une alerte
function ignoreAlert(alertId) {
    if (confirm('Êtes-vous sûr de vouloir ignorer cette alerte ?')) {
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'resolved';
            alert.resolvedBy = 'Admin'; // À remplacer par l'utilisateur connecté
            alert.resolvedAt = new Date();
            alert.details += ' (Ignorée)';
            loadAlerts();
            showAlert('Alerte ignorée', 'warning');
        }
    }
}

// Fonction pour gérer l'inhibition des alertes
function toggleAlertsInhibition() {
    const modal = document.getElementById('inhibitionModal');
    modal.style.display = 'block';
}

// Fonction pour confirmer l'inhibition des alertes
function confirmInhibition() {
    const duration = document.getElementById('inhibitionDuration').value;
    const reason = document.getElementById('inhibitionReason').value;
    
    if (!duration || !reason) {
        showAlert('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    alertsInhibited = true;
    const statusIndicator = document.querySelector('.status-indicator');
    statusIndicator.classList.add('inactive');
    
    // Simuler la fin de l'inhibition après la durée spécifiée
    const durationInMinutes = parseInt(duration);
    setTimeout(() => {
        alertsInhibited = false;
        statusIndicator.classList.remove('inactive');
        showAlert('Inhibition des alertes terminée', 'info');
    }, durationInMinutes * 60 * 1000);
    
    closeModal();
    showAlert('Alertes inhibées avec succès', 'success');
}

// Fonction pour fermer le modal
function closeModal() {
    const modal = document.getElementById('inhibitionModal');
    modal.style.display = 'none';
}

// Fonction pour afficher les alertes
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Fonction pour filtrer les alertes
function filterAlerts() {
    const statusFilter = document.getElementById('statusFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    
    const filteredAlerts = alerts.filter(alert => {
        const statusMatch = statusFilter === 'all' || alert.status === statusFilter;
        const locationMatch = locationFilter === 'all' || alert.location === locationFilter;
        return statusMatch && locationMatch;
    });
    
    const alertsList = document.querySelector('.alerts-list');
    alertsList.innerHTML = '';
    
    filteredAlerts.forEach(alert => {
        const alertCard = createAlertCard(alert);
        alertsList.appendChild(alertCard);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadAlerts();
    
    // Gestionnaires d'événements
    document.getElementById('inhibitAlertsBtn').addEventListener('click', toggleAlertsInhibition);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('confirmInhibitionBtn').addEventListener('click', confirmInhibition);
    document.getElementById('cancelInhibitionBtn').addEventListener('click', closeModal);
    
    // Filtres
    document.getElementById('statusFilter').addEventListener('change', filterAlerts);
    document.getElementById('locationFilter').addEventListener('change', filterAlerts);
}); 