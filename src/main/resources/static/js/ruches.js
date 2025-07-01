// État global de l'application
let apiaries = [];
let hives = [];
let currentEditId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadApiaries();
    loadHives();
});

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    // Boutons d'ajout
    document.querySelector('.add-apiary-btn').addEventListener('click', () => openApiaryModal());
    document.querySelector('.add-global-hive-btn').addEventListener('click', () => openHiveModal());

    // Fermeture des modales
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
        });
    });

    // Formulaires
    document.getElementById('apiary-form').addEventListener('submit', handleApiarySubmit);
    document.getElementById('hive-form').addEventListener('submit', handleHiveSubmit);

    // Filtres
    document.getElementById('apiary-filter').addEventListener('change', filterHives);
    document.getElementById('hive-type-filter').addEventListener('change', filterHives);
    document.getElementById('status-filter').addEventListener('change', filterHives);
    document.getElementById('search-input').addEventListener('input', filterHives);
}

// Chargement des ruchers
async function loadApiaries() {
    try {
        // TODO: Remplacer par un appel API réel
        apiaries = [
            { id: 1, name: 'Rucher Principal', address: '123 Rue des Abeilles', description: 'Rucher principal en ville' },
            { id: 2, name: 'Rucher Secondaire', address: '456 Avenue du Miel', description: 'Rucher secondaire en périphérie' }
        ];
        updateApiarySelects();
    } catch (error) {
        console.error('Erreur lors du chargement des ruchers:', error);
        showNotification('Erreur lors du chargement des ruchers', 'error');
    }
}

// Chargement des ruches
async function loadHives() {
    try {
        // TODO: Remplacer par un appel API réel
        hives = [
            { id: 1, name: 'Ruche A1', apiaryId: 1, type: 'dadant', lastInspection: '2024-02-15', status: 'active', notes: '' },
            { id: 2, name: 'Ruche B2', apiaryId: 2, type: 'langstroth', lastInspection: '2024-02-14', status: 'maintenance', notes: '' }
        ];
        renderHives();
    } catch (error) {
        console.error('Erreur lors du chargement des ruches:', error);
        showNotification('Erreur lors du chargement des ruches', 'error');
    }
}

// Mise à jour des sélecteurs de ruchers
function updateApiarySelects() {
    const apiaryFilter = document.getElementById('apiary-filter');
    const hiveApiary = document.getElementById('hive-apiary');
    
    const options = apiaries.map(apiary => 
        `<option value="${apiary.id}">${apiary.name}</option>`
    ).join('');
    
    apiaryFilter.innerHTML = '<option value="">Tous les ruchers</option>' + options;
    hiveApiary.innerHTML = '<option value="">Sélectionner un rucher</option>' + options;
}

// Rendu des ruches dans le tableau
function renderHives(filteredHives = null) {
    const tbody = document.querySelector('#hives-table tbody');
    const hivesToRender = filteredHives || hives;
    
    tbody.innerHTML = hivesToRender.map(hive => {
        const apiary = apiaries.find(a => a.id === hive.apiaryId);
        return `
            <tr>
                <td>${hive.name}</td>
                <td>${apiary ? apiary.name : 'N/A'}</td>
                <td>${hive.type}</td>
                <td>${hive.lastInspection}</td>
                <td><span class="status-badge ${hive.status}">${getStatusLabel(hive.status)}</span></td>
                <td>
                    <button class="action-btn" onclick="editHive(${hive.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deleteHive(${hive.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filtrage des ruches
function filterHives() {
    const apiaryFilter = document.getElementById('apiary-filter').value;
    const typeFilter = document.getElementById('hive-type-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const searchFilter = document.getElementById('search-input').value.toLowerCase();

    const filteredHives = hives.filter(hive => {
        const apiary = apiaries.find(a => a.id === hive.apiaryId);
        const matchesApiary = !apiaryFilter || hive.apiaryId === parseInt(apiaryFilter);
        const matchesType = !typeFilter || hive.type === typeFilter;
        const matchesStatus = !statusFilter || hive.status === statusFilter;
        const matchesSearch = !searchFilter || 
            hive.name.toLowerCase().includes(searchFilter) ||
            (apiary && apiary.name.toLowerCase().includes(searchFilter));

        return matchesApiary && matchesType && matchesStatus && matchesSearch;
    });

    renderHives(filteredHives);
}

// Gestion des modales
function openApiaryModal(apiaryId = null) {
    const modal = document.getElementById('apiary-modal');
    const form = document.getElementById('apiary-form');
    currentEditId = apiaryId;

    if (apiaryId) {
        const apiary = apiaries.find(a => a.id === apiaryId);
        if (apiary) {
            document.getElementById('apiary-name').value = apiary.name;
            document.getElementById('apiary-address').value = apiary.address;
            document.getElementById('apiary-description').value = apiary.description;
        }
    } else {
        form.reset();
    }

    modal.style.display = 'block';
}

function openHiveModal(hiveId = null) {
    const modal = document.getElementById('hive-modal');
    const form = document.getElementById('hive-form');
    currentEditId = hiveId;

    if (hiveId) {
        const hive = hives.find(h => h.id === hiveId);
        if (hive) {
            document.getElementById('hive-name').value = hive.name;
            document.getElementById('hive-apiary').value = hive.apiaryId;
            document.getElementById('hive-type').value = hive.type;
            document.getElementById('hive-notes').value = hive.notes;
            document.querySelector(`input[name="status"][value="${hive.status}"]`).checked = true;
        }
    } else {
        form.reset();
    }

    modal.style.display = 'block';
}

// Gestion des formulaires
async function handleApiarySubmit(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('apiary-name').value,
        address: document.getElementById('apiary-address').value,
        description: document.getElementById('apiary-description').value
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

        updateApiarySelects();
        document.getElementById('apiary-modal').style.display = 'none';
        showNotification('Rucher enregistré avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du rucher:', error);
        showNotification('Erreur lors de l\'enregistrement du rucher', 'error');
    }
}

async function handleHiveSubmit(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('hive-name').value,
        apiaryId: parseInt(document.getElementById('hive-apiary').value),
        type: document.getElementById('hive-type').value,
        notes: document.getElementById('hive-notes').value,
        status: document.querySelector('input[name="status"]:checked').value,
        lastInspection: new Date().toISOString().split('T')[0]
    };

    try {
        if (currentEditId) {
            // TODO: Appel API pour mettre à jour
            const index = hives.findIndex(h => h.id === currentEditId);
            if (index !== -1) {
                hives[index] = { ...hives[index], ...formData };
            }
        } else {
            // TODO: Appel API pour créer
            const newHive = {
                id: hives.length + 1,
                ...formData
            };
            hives.push(newHive);
        }

        renderHives();
        document.getElementById('hive-modal').style.display = 'none';
        showNotification('Ruche enregistrée avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la ruche:', error);
        showNotification('Erreur lors de l\'enregistrement de la ruche', 'error');
    }
}

// Fonctions utilitaires
function getStatusLabel(status) {
    const labels = {
        active: 'Active',
        inactive: 'Inactive',
        maintenance: 'En maintenance'
    };
    return labels[status] || status;
}

function showNotification(message, type = 'info') {
    // TODO: Implémenter un système de notification
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Fonctions d'édition et de suppression
function editHive(id) {
    openHiveModal(id);
}

async function deleteHive(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ruche ?')) {
        try {
            // TODO: Appel API pour supprimer
            hives = hives.filter(h => h.id !== id);
            renderHives();
            showNotification('Ruche supprimée avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de la suppression de la ruche:', error);
            showNotification('Erreur lors de la suppression de la ruche', 'error');
        }
    }
}

// Sidebar menu functionality
const menuItems = document.querySelectorAll('.sidebar-nav a');
menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        menuItems.forEach(i => i.parentElement.classList.remove('active'));
        this.parentElement.classList.add('active');
    });
});

// Responsive menu behavior
function handleResponsiveMenu() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        mainContent.style.marginLeft = '60px';
    } else {
        sidebar.classList.remove('collapsed');
        mainContent.style.marginLeft = '250px';
    }
}

// Search functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const tableRows = document.querySelectorAll('table tbody tr');
        
        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Status selection
const statusOptions = document.querySelectorAll('.status-option');
statusOptions.forEach(option => {
    option.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            // Update visual feedback
            statusOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        }
    });
});

// Filter functionality
const filterSelects = document.querySelectorAll('.filter-group select');
filterSelects.forEach(select => {
    select.addEventListener('change', function() {
        // Here you would typically filter the table based on the selected values
        console.log('Filter changed:', this.value);
    });
});

// Initialize responsive behavior
handleResponsiveMenu();
window.addEventListener('resize', handleResponsiveMenu);

// Notifications
const notificationsBtn = document.querySelector('.notifications');
if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
        // Here you would typically show a notifications dropdown or modal
        console.log('Notifications clicked');
    });
}

// User menu
const userMenu = document.querySelector('.user-info');
if (userMenu) {
    userMenu.addEventListener('click', function() {
        // Here you would typically show a user menu dropdown
        console.log('User menu clicked');
    });
}
 