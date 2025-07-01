// Variables globales
let currentEditId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadApiculteurs();
});

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    // Formulaire d'ajout/modification
    document.getElementById('beekeeperForm').addEventListener('submit', handleFormSubmit);
    
    // Fermeture de la modale
    document.querySelector('.close-modal-btn').addEventListener('click', closeModal);
}

// Chargement des apiculteurs
async function loadApiculteurs() {
    try {
        const response = await fetch('/api/apiculteurs');
        if (!response.ok) throw new Error('Erreur API');
        
        const apiculteurs = await response.json();
        renderApiculteurs(apiculteurs);
    } catch (error) {
        console.error('Erreur lors du chargement des apiculteurs:', error);
        showNotification('Erreur lors du chargement des apiculteurs', 'error');
    }
}

// Rendu des apiculteurs dans le tableau
function renderApiculteurs(apiculteurs) {
    const tbody = document.getElementById('apiculteursTableBody');
    
    if (apiculteurs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucun apiculteur trouvé.</td></tr>';
        return;
    }

    tbody.innerHTML = apiculteurs.map(apiculteur => `
        <tr>
            <td>${apiculteur.nom}</td>
            <td>${apiculteur.prenom}</td>
            <td>${apiculteur.email}</td>
            <td>${apiculteur.role}</td>
            <td>
                <button class="btn-edit" onclick="editApiculteur('${apiculteur.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteApiculteur('${apiculteur.id}')">
                    <i class="fas fa-trash"></i>
                </button>
        </td>
        </tr>
    `).join('');
}

// Ouverture de la modale
function openModal(apiculteurId = null) {
    const modal = document.getElementById('beekeeperModal');
    const form = document.getElementById('beekeeperForm');
    const modalTitle = document.getElementById('modalTitle');
    
    currentEditId = apiculteurId;
    
    if (apiculteurId) {
        modalTitle.textContent = 'Modifier un apiculteur';
        // Charger les données de l'apiculteur pour l'édition
        loadApiculteurForEdit(apiculteurId);
    } else {
        modalTitle.textContent = 'Ajouter un apiculteur';
        form.reset();
        document.getElementById('userId').value = '';
    }
    
    modal.style.display = 'block';
}

// Fermeture de la modale
function closeModal() {
    document.getElementById('beekeeperModal').style.display = 'none';
    currentEditId = null;
}

// Charger un apiculteur pour l'édition
async function loadApiculteurForEdit(apiculteurId) {
    try {
        const response = await fetch(`/api/apiculteurs/${apiculteurId}`);
        if (!response.ok) throw new Error('Erreur API');
        
        const apiculteur = await response.json();
        
        document.getElementById('userId').value = apiculteur.id;
        document.getElementById('nom').value = apiculteur.nom;
        document.getElementById('prenom').value = apiculteur.prenom;
        document.getElementById('email').value = apiculteur.email;
        document.getElementById('role').value = apiculteur.role;
        
    } catch (error) {
        console.error('Erreur lors du chargement de l\'apiculteur:', error);
        showNotification('Erreur lors du chargement de l\'apiculteur', 'error');
    }
}

    // Gestion du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();
        
        const formData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
            email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };
    
    try {
        let response;
        
        if (currentEditId) {
            // Mise à jour
            response = await fetch(`/api/apiculteurs/${currentEditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            // Création
            response = await fetch('/api/apiculteurs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        
        if (!response.ok) throw new Error('Erreur API');
        
        closeModal();
        loadApiculteurs();
        showNotification('Apiculteur enregistré avec succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        showNotification('Erreur lors de l\'enregistrement', 'error');
    }
}

// Édition d'un apiculteur
function editApiculteur(apiculteurId) {
    openModal(apiculteurId);
}

// Suppression d'un apiculteur
async function deleteApiculteur(apiculteurId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet apiculteur ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/apiculteurs/${apiculteurId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur API');
        
        loadApiculteurs();
        showNotification('Apiculteur supprimé avec succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// Fonction de notification
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Couleurs selon le type
    if (type === 'success') {
        notification.style.background = '#4caf50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#2196f3';
    }
    
    notification.textContent = message;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 