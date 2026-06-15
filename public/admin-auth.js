class AdminAuth {
    constructor() {
        this.credentials = {
            username: 'admin',
            password: 'transflash2024'
        };
        
        this.init();
    }

    init() {
        // Vérifier si déjà connecté
        if (this.isAuthenticated()) {
            window.location.href = '/admin-dashboard.html';
            return;
        }

        this.bindEvents();
    }

    bindEvents() {
        const loginForm = document.getElementById('adminLoginForm');
        const loginBtn = document.getElementById('loginBtn');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Gestion des touches
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        // Effacer les erreurs lors de la saisie
        document.getElementById('adminUsername').addEventListener('input', () => {
            this.clearError('usernameError');
            this.clearError('loginError');
        });

        document.getElementById('adminPassword').addEventListener('input', () => {
            this.clearError('passwordError');
            this.clearError('loginError');
        });
    }

    handleLogin() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const loginBtn = document.getElementById('loginBtn');

        // Validation des champs
        if (!this.validateFields(username, password)) {
            return;
        }

        // Animation de chargement
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        loginBtn.textContent = 'Connexion...';

        // Simulation d'une vérification (dans un vrai système, ceci serait une requête serveur)
        setTimeout(() => {
            if (this.authenticate(username, password)) {
                this.setAuthSession();
                window.location.href = '/admin-dashboard.html';
            } else {
                this.showError('loginError', 'Nom d\'utilisateur ou mot de passe incorrect');
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Se connecter';
            }
        }, 1500);
    }

    validateFields(username, password) {
        let isValid = true;

        if (!username) {
            this.showError('usernameError', 'Le nom d\'utilisateur est requis');
            isValid = false;
        }

        if (!password) {
            this.showError('passwordError', 'Le mot de passe est requis');
            isValid = false;
        }

        return isValid;
    }

    authenticate(username, password) {
        return username === this.credentials.username && password === this.credentials.password;
    }

    setAuthSession() {
        const sessionData = {
            isAuthenticated: true,
            username: this.credentials.username,
            loginTime: new Date().getTime(),
            expiresIn: 24 * 60 * 60 * 1000 // 24 heures
        };

        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        sessionStorage.setItem('adminAuth', 'true');
    }

    isAuthenticated() {
        const sessionData = localStorage.getItem('adminSession');
        const sessionAuth = sessionStorage.getItem('adminAuth');

        if (!sessionData || !sessionAuth) {
            return false;
        }

        try {
            const session = JSON.parse(sessionData);
            const currentTime = new Date().getTime();
            
            // Vérifier si la session n'a pas expiré
            if (currentTime - session.loginTime > session.expiresIn) {
                this.logout();
                return false;
            }

            return session.isAuthenticated;
        } catch (error) {
            return false;
        }
    }

    logout() {
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminAuth');
        window.location.href = '/admin-login.html';
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }
}

// Initialiser l'authentification
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});
