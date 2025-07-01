// Gestion de la navigation du menu admin
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer tous les liens du menu
    const menuLinks = document.querySelectorAll('.sidebar-nav a');
    
    // Récupérer toutes les sections de contenu
    const sections = {
        'dashboard': document.getElementById('dashboard-section'),
        'ruchers': document.getElementById('ruchers-section'),
        'hives-management': document.getElementById('hives-management-section'),
        'hives': document.getElementById('hives-section'),
        'mesures': document.getElementById('mesures-section'),
        'alertes': document.getElementById('alertes-section'),
        'apiculteurs': document.getElementById('apiculteurs-section')
    };

    // Fonction pour afficher une section et masquer les autres
    function showSection(sectionId) {
        // Masquer toutes les sections
        Object.values(sections).forEach(section => {
            if (section) {
                section.style.display = 'none';
            }
        });

        // Afficher la section demandée
        if (sections[sectionId]) {
            sections[sectionId].style.display = 'block';
        }

        // Retirer la classe active de tous les liens
        menuLinks.forEach(link => {
            link.parentElement.classList.remove('active');
        });

        // Ajouter la classe active au lien correspondant
        const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }
    }

    // Gestion des clics sur les liens du menu
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            const sectionId = href.replace('#', '');
            
            // Gestion spéciale pour les liens avec des IDs spécifiques
            if (this.id === 'menu-ruchers') {
                showSection('ruchers');
            } else if (this.id === 'menu-ruches') {
                showSection('hives-management');
            } else if (this.id === 'menu-mesures') {
                // Redirection vers la page mesures.html
                window.location.href = '/mesures';
            } else if (this.id === 'menu-alertes') {
                showSection('alertes');
            } else if (this.id === 'menu-apiculteurs') {
                showSection('apiculteurs');
            } else if (href === '#dashboard') {
                showSection('dashboard');
            } else {
                // Navigation par défaut
                showSection(sectionId);
            }
        });
    });

    // Gestion du lien "Retour aux ruchers"
    const backToApiariesLink = document.getElementById('backToApiaries');
    if (backToApiariesLink) {
        backToApiariesLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('ruchers');
        });
    }

    // Afficher la section dashboard par défaut
    showSection('dashboard');

    // Gestion du menu responsive
    function handleResponsiveMenu() {
        const sidebar = document.querySelector('.sidebar');
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile && sidebar) {
            sidebar.classList.add('mobile');
        } else if (sidebar) {
            sidebar.classList.remove('mobile');
        }
    }

    // Gestion de la barre de recherche
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            // Logique de recherche à implémenter
            console.log('Recherche:', e.target.value);
        });
    }

    // Gestion des notifications
    const notifications = document.querySelector('.notifications');
    if (notifications) {
        notifications.addEventListener('click', function() {
            // Logique pour afficher les notifications
            console.log('Notifications cliquées');
        });
    }

    // Gestion du menu utilisateur
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', function() {
            // Logique pour le menu utilisateur
            console.log('Menu utilisateur cliqué');
        });
    }

    // Écouter les changements de taille de fenêtre
    window.addEventListener('resize', handleResponsiveMenu);
    
    // Initialiser l'état du menu
    handleResponsiveMenu();
}); 