// Fonction pour charger le menu
async function loadMenu() {
    try {
        // Créer la structure du menu (sidebar uniquement)
        const menuHTML = `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <img src="ChatGPT Image 11 mai 2025, 22_42_25.png" alt="Logo RucheConnect" class="logo">
                    <h2>RucheConnect</h2>
                </div>
                <nav class="sidebar-nav">
                    <ul>
                        <li>
                            <a href="dashboard.html">
                                <i class="fa-solid fa-gauge-high"></i>
                                <span>Tableau de bord</span>
                            </a>
                        </li>
                        <li>
                            <a href="ruchers.html">
                                <i class="fa-solid fa-map-location-dot"></i>
                                <span>Gestion Ruchers</span>
                            </a>
                        </li>
                        <li>
                            <a href="ruches.html">
                                <i class="fa-solid fa-house-chimney"></i>
                                <span>Gestion Ruches</span>
                            </a>
                        </li>
                        <li>
                            <a href="mesures.html" id="menu-mesures">
                                <i class="fa-solid fa-chart-line"></i>
                                <span>Mesures & Historique</span>
                            </a>
                        </li>
                        <li>
                            <a href="alertes.html" id="menu-alertes">
                                <i class="fa-solid fa-bell"></i>
                                <span>Alertes Vol</span>
                            </a>
                        </li>
                        <li>
                            <a href="apiculteurs.html" id="menu-apiculteurs">
                                <i class="fa-solid fa-users"></i>
                                <span>Gestion Apiculteurs</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                <div class="sidebar-footer">
                    <a href="home.html" class="logout-btn">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Déconnexion</span>
                    </a>
                </div>
            </aside>
        `;

        // Insérer le menu dans le conteneur
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) {
            menuContainer.innerHTML = menuHTML;
            
            // Marquer le lien actif
            const currentPage = window.location.pathname.split('/').pop();
            const activeLink = menuContainer.querySelector(`a[href="${currentPage}"]`);
            if (activeLink) {
                activeLink.parentElement.classList.add('active');
            }
        }

        // Ajouter la top-bar au début du main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const topBarHTML = `
                <header class="top-bar">
                    <div class="search-bar">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Rechercher...">
                    </div>
                    <div class="user-menu">
                        <div class="notifications">
                            <i class="fa-solid fa-bell"></i>
                            <span class="badge">3</span>
                        </div>
                        <div class="user-info">
                            <img src="https://ui-avatars.com/api/?name=John+Doe" alt="User Avatar">
                            <span>John Doe</span>
                        </div>
                    </div>
                </header>
            `;
            mainContent.insertAdjacentHTML('afterbegin', topBarHTML);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
    }
}

// Charger le menu au chargement de la page
document.addEventListener('DOMContentLoaded', loadMenu);

// Gestion du menu responsive et des interactions
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu actif
    const menuItems = document.querySelectorAll('.sidebar-nav a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Retirer la classe active de tous les éléments
            menuItems.forEach(i => i.parentElement.classList.remove('active'));
            
            // Ajouter la classe active à l'élément cliqué
            this.parentElement.classList.add('active');
        });
    });

    // Gestion du responsive menu
    function handleResponsiveMenu() {
        const sidebar = document.querySelector('.sidebar');
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            sidebar.classList.add('mobile');
        } else {
            sidebar.classList.remove('mobile');
        }
    }

    // Gestion de la barre de recherche
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            // Ici vous pouvez ajouter la logique de recherche
            console.log('Recherche:', e.target.value);
        });
    }

    // Gestion des notifications
    const notifications = document.querySelector('.notifications');
    if (notifications) {
        notifications.addEventListener('click', function() {
            // Ici vous pouvez ajouter la logique pour afficher les notifications
            console.log('Notifications cliquées');
        });
    }

    // Gestion du menu utilisateur
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', function() {
            // Ici vous pouvez ajouter la logique pour le menu utilisateur
            console.log('Menu utilisateur cliqué');
        });
    }

    // Écouter les changements de taille de fenêtre
    window.addEventListener('resize', handleResponsiveMenu);
    
    // Initialiser l'état du menu
    handleResponsiveMenu();
}); 