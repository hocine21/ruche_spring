// Données de test pour les apiculteurs
let beekeepers = [
    {
        id: 1,
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@email.com",
        phone: "06 12 34 56 78",
        address: "123 rue des Fleurs, 75001 Paris",
        level: "expert",
        hives: 15,
        lastActivity: new Date("2024-03-15")
    },
    {
        id: 2,
        firstName: "Marie",
        lastName: "Martin",
        email: "marie.martin@email.com",
        phone: "07 23 45 67 89",
        address: "456 avenue des Abeilles, 69002 Lyon",
        level: "intermediaire",
        hives: 8,
        lastActivity: new Date("2024-03-14")
    },
    {
        id: 3,
        firstName: "Pierre",
        lastName: "Dubois",
        email: "pierre.dubois@email.com",
        phone: "06 34 56 78 90",
        address: "789 boulevard des Ruches, 13008 Marseille",
        level: "debutant",
        hives: 3,
        lastActivity: new Date("2024-03-13")
    }
];

// Éléments DOM
const tableBody = document.querySelector('.data-table tbody');
const modal = document.getElementById('beekeeperModal');
const addBeekeeperBtn = document.querySelector('.add-beekeeper-btn');
const closeModalBtn = document.querySelector('.close-modal-btn');
const beekeeperForm = document.getElementById('beekeeperForm');
const searchInput = document.getElementById('searchBeekeeper');

// État
let editingBeekeeperId = null;

// Chargement initial des apiculteurs
function loadBeekeepers() {
    displayBeekeepers(beekeepers);
}

// Création d'une ligne de tableau pour un apiculteur
function createBeekeeperRow(beekeeper) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <div class="user-info">
                <img src="https://ui-avatars.com/api/?name=${beekeeper.firstName}+${beekeeper.lastName}&background=ffd700&color=fff" alt="${beekeeper.firstName} ${beekeeper.lastName}">
                <div>
                    <span class="name">${beekeeper.firstName} ${beekeeper.lastName}</span>
                    <span class="address">${beekeeper.address}</span>
                </div>
            </div>
        </td>
        <td>${beekeeper.email}</td>
        <td>${beekeeper.phone}</td>
        <td>
            <span class="level-badge level-${beekeeper.level}">
                ${beekeeper.level.charAt(0).toUpperCase() + beekeeper.level.slice(1)}
            </span>
        </td>
        <td>${beekeeper.hives}</td>
        <td>${formatDate(beekeeper.lastActivity)}</td>
        <td>
            <div class="action-buttons">
                <button onclick="editBeekeeper(${beekeeper.id})" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBeekeeper(${beekeeper.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return tr;
}

// Formatage de la date
function formatDate(date) {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
        return 'Aujourd\'hui';
    } else if (diff < 48 * 60 * 60 * 1000) {
        return 'Hier';
    } else {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Affichage des apiculteurs
function displayBeekeepers(beekeepersToDisplay = beekeepers) {
    tableBody.innerHTML = '';
    beekeepersToDisplay.forEach(beekeeper => {
        tableBody.appendChild(createBeekeeperRow(beekeeper));
    });
}

// Affichage des alertes
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="close-alert">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(alert);
    
    // Suppression automatique après 5 secondes
    setTimeout(() => {
        alert.remove();
    }, 5000);
    
    // Fermeture manuelle
    alert.querySelector('.close-alert').addEventListener('click', () => {
        alert.remove();
    });
}

// Gestion de la modale
function openModal(beekeeperId = null) {
    editingBeekeeperId = beekeeperId;
    const modalTitle = document.querySelector('.modal-content h3');
    modalTitle.textContent = beekeeperId ? 'Modifier un apiculteur' : 'Ajouter un apiculteur';
    
    if (beekeeperId) {
        const beekeeper = beekeepers.find(b => b.id === beekeeperId);
        if (beekeeper) {
            document.getElementById('firstName').value = beekeeper.firstName;
            document.getElementById('lastName').value = beekeeper.lastName;
            document.getElementById('email').value = beekeeper.email;
            document.getElementById('phone').value = beekeeper.phone;
            document.getElementById('address').value = beekeeper.address;
            document.getElementById('level').value = beekeeper.level;
            document.getElementById('username').value = beekeeper.username || '';
            document.getElementById('password').value = '';
        }
    } else {
        beekeeperForm.reset();
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    beekeeperForm.reset();
    editingBeekeeperId = null;
}

// Gestion des apiculteurs
function editBeekeeper(beekeeperId) {
    openModal(beekeeperId);
}

function deleteBeekeeper(beekeeperId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet apiculteur ?')) {
        beekeepers = beekeepers.filter(b => b.id !== beekeeperId);
        displayBeekeepers();
        showAlert('Apiculteur supprimé avec succès');
    }
}

// Recherche d'apiculteurs
function searchBeekeepers(query) {
    query = query.toLowerCase();
    const filteredBeekeepers = beekeepers.filter(beekeeper => 
        beekeeper.firstName.toLowerCase().includes(query) ||
        beekeeper.lastName.toLowerCase().includes(query) ||
        beekeeper.email.toLowerCase().includes(query) ||
        beekeeper.phone.includes(query)
    );
    displayBeekeepers(filteredBeekeepers);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Chargement initial
    loadBeekeepers();

    // Gestion du formulaire
    beekeeperForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            level: document.getElementById('level').value,
            username: document.getElementById('username').value,
            hives: 0,
            lastActivity: new Date()
        };

        if (editingBeekeeperId) {
            // Mise à jour
            const index = beekeepers.findIndex(b => b.id === editingBeekeeperId);
            if (index !== -1) {
                beekeepers[index] = { ...beekeepers[index], ...formData };
                showAlert('Apiculteur modifié avec succès');
            }
        } else {
            // Création
            formData.id = Math.max(...beekeepers.map(b => b.id), 0) + 1;
            beekeepers.push(formData);
            showAlert('Apiculteur ajouté avec succès');
        }
        
        closeModal();
        displayBeekeepers();
    });

    // Fermeture de la modale
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Recherche
    searchInput.addEventListener('input', (e) => {
        searchBeekeepers(e.target.value);
    });
}); 