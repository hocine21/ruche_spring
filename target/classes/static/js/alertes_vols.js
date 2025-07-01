// Variables globales
var modal = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INITIALISATION ALERTES VOLS ===');
    
    // Initialiser le modal
    modal = document.getElementById('reglerModal');
    
    // Événements
    document.getElementById('refreshBtn').addEventListener('click', loadData);
    document.getElementById('reglerForm').addEventListener('submit', handleRegler);
    
    // Fermer le modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Charger les données au démarrage
    loadData();
});

/**
 * Charge les données depuis l'API
 */
function loadData() {
    console.log('Chargement des données...');
    
    // Afficher le loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    
    fetch('/alertes-vols/api/mesures-ouvertes')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            console.log('Données reçues:', data);
            
            if (data.success) {
                displayMesures(data.mesuresOuvertes);
                displayHistorique(data.historique);
                updateStats(data);
            } else {
                showError('Erreur: ' + data.error);
            }
        })
        .catch(function(error) {
            console.error('Erreur:', error);
            showError('Erreur de connexion au serveur');
        })
        .finally(function() {
            document.getElementById('loading').style.display = 'none';
        });
}

/**
 * Affiche les mesures avec couvercle ouvert
 */
function displayMesures(mesures) {
    var tbody = document.getElementById('mesuresTableBody');
    
    if (mesures.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucune ruche avec couvercle ouvert</td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < mesures.length; i++) {
        var mesure = mesures[i];
        html += '<tr>' +
            '<td>' +
                '<div class="ruche-info">' +
                    '<i class="fas fa-bee"></i>' +
                    '<strong>' + (mesure.nomRuche || 'Ruche inconnue') + '</strong>' +
                '</div>' +
            '</td>' +
            '<td>' + (mesure.nomRucher || 'Rucher inconnu') + '</td>' +
            '<td>' + formatDate(mesure.horodatage) + '</td>' +
            '<td>' +
                '<span class="temperature ' + getTemperatureClass(mesure.temperature) + '">' +
                    (mesure.temperature ? mesure.temperature + '°C' : 'N/A') +
                '</span>' +
            '</td>' +
            '<td>' +
                '<span class="humidity ' + getHumidityClass(mesure.humidite) + '">' +
                    (mesure.humidite ? mesure.humidite + '%' : 'N/A') +
                '</span>' +
            '</td>' +
            '<td>' +
                '<div class="action-buttons">' +
                    '<button class="btn-verify" onclick="openReglerModal(\'' + mesure.id + '\', \'' + mesure.refCapteur + '\')">' +
                        '<i class="fas fa-check"></i> Régler' +
                    '</button>' +
                '</div>' +
            '</td>' +
        '</tr>';
    }
    
    tbody.innerHTML = html;
}

/**
 * Affiche l'historique des vérifications
 */
function displayHistorique(historique) {
    const tbody = document.getElementById('historiqueTableBody');
    
    if (historique.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Aucune vérification</td></tr>';
        return;
    }
    
    tbody.innerHTML = historique.map(h => 
        '<tr>' +
            '<td>' +
                '<div class="ruche-info">' +
                    '<i class="fas fa-bee"></i>' +
                    '<strong>' + (h.nomRuche || 'Ruche inconnue') + '</strong>' +
                '</div>' +
            '</td>' +
            '<td>' + formatDate(h.dateReglement) + '</td>' +
            '<td>' + (h.verifiePar || 'Utilisateur inconnu') + '</td>' +
            '<td>' +
                '<span class="status ' + (h.regle ? 'resolved' : 'pending') + '">' +
                    '<i class="fas ' + (h.regle ? 'fa-check-circle' : 'fa-clock') + '"></i>' +
                    (h.regle ? 'Réglé' : 'En cours') +
                '</span>' +
            '</td>' +
            '<td>' + (h.commentaire || 'Aucun commentaire') + '</td>' +
        '</tr>'
    ).join('');
}

/**
 * Met à jour les statistiques
 */
function updateStats(data) {
    const totalOuvertes = document.getElementById('totalOuvertes');
    const totalReglees = document.getElementById('totalReglees');
    const totalEnCours = document.getElementById('totalEnCours');
    
    totalOuvertes.textContent = data.totalOuvertes || 0;
    totalReglees.textContent = data.totalReglees || 0;
    totalEnCours.textContent = data.totalEnCours || 0;
    
    // Ajouter les classes CSS appropriées
    totalOuvertes.className = data.totalOuvertes > 0 ? 'alert' : 'success';
    totalReglees.className = 'success';
    totalEnCours.className = data.totalEnCours > 0 ? 'warning' : 'success';
}

/**
 * Ouvre le modal pour régler un problème
 */
function openReglerModal(mesureId, refCapteur) {
    console.log('Ouverture modal pour mesure:', mesureId, 'capteur:', refCapteur);
    
    document.getElementById('mesureId').value = mesureId;
    document.getElementById('refCapteur').value = refCapteur;
    document.getElementById('commentaire').value = '';
    
    modal.style.display = 'flex';
}

/**
 * Ferme le modal
 */
function closeModal() {
    modal.style.display = 'none';
}

/**
 * Gère la soumission du formulaire de réglage
 */
function handleRegler(event) {
    event.preventDefault();
    
    var mesureId = document.getElementById('mesureId').value;
    var refCapteur = document.getElementById('refCapteur').value;
    var commentaire = document.getElementById('commentaire').value;
    
    console.log('Envoi réglage:', { mesureId: mesureId, refCapteur: refCapteur, commentaire: commentaire });
    
    // Désactiver le bouton
    var submitBtn = event.target.querySelector('button[type="submit"]');
    var originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
    
    // Envoyer la requête
    fetch('/alertes-vols/api/regler', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            mesureId: mesureId,
            refCapteur: refCapteur,
            commentaire: commentaire
        })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            alert('Problème réglé avec succès !');
            closeModal();
            loadData(); // Recharger les données
        } else {
            alert('Erreur: ' + data.error);
        }
    })
    .catch(function(error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion');
    })
    .finally(function() {
        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

/**
 * Affiche une erreur
 */
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

/**
 * Formate une date
 */
function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR');
    } catch (e) {
        return dateString;
    }
}

/**
 * Détermine la classe CSS pour la température
 */
function getTemperatureClass(temperature) {
    if (!temperature) return 'normal';
    if (temperature > 35) return 'high';
    if (temperature < 10) return 'low';
    return 'normal';
}

/**
 * Détermine la classe CSS pour l'humidité
 */
function getHumidityClass(humidity) {
    if (!humidity) return 'normal';
    if (humidity > 80) return 'high';
    if (humidity < 30) return 'low';
    return 'normal';
} 