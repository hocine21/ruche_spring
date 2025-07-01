document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');
    const inputs = form.querySelectorAll('input');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLine = document.querySelector('.progress-line');

    // Animation halo doré sur focus input
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('halo-focus');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('halo-focus');
        });
    });

    // Animation floating label
    inputs.forEach(input => {
        const formGroup = input.parentElement;
        // On focus
        input.addEventListener('focus', () => {
            formGroup.classList.add('focused');
        });
        // On blur
        input.addEventListener('blur', () => {
            if (!input.value) {
                formGroup.classList.remove('focused');
            }
        });
        // Si déjà rempli au chargement
        if (input.value) {
            formGroup.classList.add('focused');
        }
        // Sur saisie
        input.addEventListener('input', () => {
            if (input.value) {
                formGroup.classList.add('focused');
            } else {
                formGroup.classList.remove('focused');
            }
        });
    });

    // Gestion de la navigation entre les étapes
    nextBtn.addEventListener('click', () => {
        const step1Inputs = step1.querySelectorAll('input');
        let isValid = true;

        step1Inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showError(input, 'Ce champ est requis');
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                isValid = false;
                showError(input, 'Email invalide');
            }
        });

        if (isValid) {
            // Animation de transition
            step1.classList.remove('active');
            step1.classList.add('inactive');
            
            // Mettre à jour l'indicateur de progression
            progressSteps[0].classList.remove('active');
            progressSteps[1].classList.add('active');
            progressLine.classList.add('active');

            // Afficher la deuxième étape avec animation
            setTimeout(() => {
                step2.classList.remove('inactive');
                step2.classList.add('active', 'slide-in-right');
            }, 300);
        }
    });

    prevBtn.addEventListener('click', () => {
        // Animation de transition
        step2.classList.remove('active', 'slide-in-right');
        step2.classList.add('inactive');
        
        // Mettre à jour l'indicateur de progression
        progressSteps[1].classList.remove('active');
        progressSteps[0].classList.add('active');
        progressLine.classList.remove('active');

        // Afficher la première étape avec animation
        setTimeout(() => {
            step1.classList.remove('inactive');
            step1.classList.add('active', 'slide-in-left');
        }, 300);
    });

    // Validation du formulaire final
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const step2Inputs = step2.querySelectorAll('input');
        let isValid = true;

        step2Inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showError(input, 'Ce champ est requis');
            }
        });

        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');
        
        if (password.value !== confirmPassword.value) {
            isValid = false;
            showError(confirmPassword, 'Les mots de passe ne correspondent pas');
        }

        if (isValid) {
            // Animation du bouton lors de la soumission
            const submitBtn = form.querySelector('.signup-btn');
            submitBtn.classList.add('submitting');
            
            // Simuler l'envoi des données
            setTimeout(() => {
                submitBtn.classList.remove('submitting');
                showSuccess();
            }, 1500);
        }
    });

    // Fonction pour afficher les erreurs
    function showError(input, message) {
        const formGroup = input.parentElement;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Supprimer l'ancien message d'erreur s'il existe
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        formGroup.appendChild(errorDiv);
        formGroup.classList.add('error');
        
        // Faire défiler jusqu'au champ en erreur avec animation
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Animation de secousse
        formGroup.style.animation = 'none';
        formGroup.offsetHeight; // Forcer le reflow
        formGroup.style.animation = 'shake 0.5s ease-in-out';
        
        // Supprimer l'erreur après 3 secondes
        setTimeout(() => {
            errorDiv.remove();
            formGroup.classList.remove('error');
        }, 3000);
    }

    // Fonction pour valider l'email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Fonction pour afficher le message de succès
    function showSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Inscription réussie !';
        
        form.appendChild(successMessage);
        
        // Animation de disparition du message
        setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => {
                successMessage.remove();
                form.reset();
                // Retourner à la première étape
                step2.classList.remove('active', 'slide-in-right');
                step2.classList.add('inactive');
                step1.classList.remove('inactive');
                step1.classList.add('active', 'slide-in-left');
                
                // Réinitialiser l'indicateur de progression
                progressSteps[1].classList.remove('active');
                progressSteps[0].classList.add('active');
                progressLine.classList.remove('active');
                // Retirer les labels flottants
                inputs.forEach(input => input.parentElement.classList.remove('focused'));
            }, 500);
        }, 2000);
    }

    // Animation du fond d'alvéoles
    const honeycombBg = document.querySelector('.honeycomb-bg');
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        
        honeycombBg.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Menu burger responsive
    const burger = document.getElementById('burger-menu');
    const nav = document.getElementById('main-nav');
    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('open');
            nav.classList.remove('open');
        });
    });

    // Labels flottants sur tous les formulaires
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            const formGroup = input.parentElement;
            input.addEventListener('focus', () => {
                formGroup.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    formGroup.classList.remove('focused');
                }
            });
            if (input.value) {
                formGroup.classList.add('focused');
            }
            input.addEventListener('input', () => {
                if (input.value) {
                    formGroup.classList.add('focused');
                } else {
                    formGroup.classList.remove('focused');
                }
            });
        });
    });
});