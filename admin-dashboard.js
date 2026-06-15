class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.mockData = this.generateMockData();
        
        this.init();
    }

    init() {
        // Vérifier l'authentification
        if (!this.isAuthenticated()) {
            window.location.href = 'admin-login.html';
            return;
        }

        this.bindEvents();
        this.loadDashboardData();
        this.loadTransfersData();
        this.loadUsersData();
        this.updateStats();
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
            
            if (currentTime - session.loginTime > session.expiresIn) {
                return false;
            }

            return session.isAuthenticated;
        } catch (error) {
            return false;
        }
    }

    bindEvents() {
        // Navigation sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Recherche et filtres
        document.getElementById('transferSearch')?.addEventListener('input', (e) => {
            this.filterTransfers(e.target.value);
        });

        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filterTransfersByStatus(e.target.value);
        });

        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        // Boutons d'action
        document.getElementById('updateRatesBtn')?.addEventListener('click', () => {
            this.updateExchangeRates();
        });

        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.showAddUserModal();
        });
    }

    showSection(sectionName) {
        // Masquer toutes les sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Désactiver tous les liens de navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Afficher la section sélectionnée
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Mettre à jour le titre
        const titles = {
            dashboard: 'Dashboard',
            transfers: 'Gestion des transferts',
            users: 'Gestion des utilisateurs',
            rates: 'Taux de change',
            settings: 'Paramètres système'
        };

        document.getElementById('pageTitle').textContent = titles[sectionName];
        this.currentSection = sectionName;
    }

    generateMockData() {
        const countries = ['🇲🇦 Maroc', '🇬🇦 Gabon', '🇨🇮 Côte d\'Ivoire', '🇸🇳 Sénégal', '🇨🇲 Cameroun'];
        const statuses = ['completed', 'pending', 'cancelled'];
        const names = ['Ahmed Benali', 'Marie Dubois', 'Fatou Diallo', 'Jean Kouassi', 'Aminata Traoré'];
        
        const transfers = [];
        const users = [];

        // Générer des transferts fictifs
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            transfers.push({
                id: `TF${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
                sender: names[Math.floor(Math.random() * names.length)],
                receiver: names[Math.floor(Math.random() * names.length)],
                amount: Math.floor(Math.random() * 5000) + 100,
                currency: ['MAD', 'EUR', 'XAF', 'XOF'][Math.floor(Math.random() * 4)],
                fromCountry: countries[Math.floor(Math.random() * countries.length)],
                toCountry: countries[Math.floor(Math.random() * countries.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                date: date.toLocaleDateString('fr-FR')
            });
        }

        // Générer des utilisateurs fictifs
        for (let i = 0; i < 30; i++) {
            const name = names[Math.floor(Math.random() * names.length)];
            const email = name.toLowerCase().replace(' ', '.') + '@email.com';
            const phone = '+212' + Math.floor(Math.random() * 1000000000);
            
            users.push({
                id: 1000 + i,
                name: name,
                email: email,
                phone: phone,
                country: countries[Math.floor(Math.random() * countries.length)],
                transfers: Math.floor(Math.random() * 20) + 1,
                joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toLocaleDateString('fr-FR')
            });
        }

        return { transfers, users };
    }

    loadDashboardData() {
        // Mettre à jour les statistiques en temps réel
        this.animateCounter('todayTransfers', 127);
        this.animateCounter('newUsers', 45);
        this.animateCounter('pendingTransfers', 8);
        
        // Simuler la mise à jour du volume total
        setTimeout(() => {
            document.getElementById('totalVolume').textContent = '2.4M €';
        }, 500);
    }

    loadTransfersData() {
        const tbody = document.getElementById('transfersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.mockData.transfers.slice(0, 20).forEach(transfer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${transfer.id}</strong></td>
                <td>${transfer.sender}</td>
                <td>${transfer.receiver}</td>
                <td><strong>${transfer.amount} ${transfer.currency}</strong></td>
                <td>${transfer.fromCountry} → ${transfer.toCountry}</td>
                <td><span class="status-badge status-${transfer.status}">${this.getStatusText(transfer.status)}</span></td>
                <td>${transfer.date}</td>
                <td>
                    <button class="action-btn view" onclick="adminDashboard.viewTransfer('${transfer.id}')">Voir</button>
                    <button class="action-btn edit" onclick="adminDashboard.editTransfer('${transfer.id}')">Modifier</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadUsersData() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.mockData.users.slice(0, 15).forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${user.id}</strong></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.country}</td>
                <td><strong>${user.transfers}</strong></td>
                <td>${user.joinDate}</td>
                <td>
                    <button class="action-btn view" onclick="adminDashboard.viewUser(${user.id})">Voir</button>
                    <button class="action-btn edit" onclick="adminDashboard.editUser(${user.id})">Modifier</button>
                    <button class="action-btn delete" onclick="adminDashboard.deleteUser(${user.id})">Supprimer</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateStats() {
        // Simuler des mises à jour en temps réel
        setInterval(() => {
            const todayTransfers = document.getElementById('todayTransfers');
            const currentValue = parseInt(todayTransfers.textContent);
            if (Math.random() > 0.7) { // 30% de chance de mise à jour
                todayTransfers.textContent = currentValue + 1;
            }
        }, 30000); // Toutes les 30 secondes
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    getStatusText(status) {
        const statusTexts = {
            completed: 'Complété',
            pending: 'En attente',
            cancelled: 'Annulé'
        };
        return statusTexts[status] || status;
    }

    filterTransfers(searchTerm) {
        const rows = document.querySelectorAll('#transfersTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm.toLowerCase());
            row.style.display = isVisible ? '' : 'none';
        });
    }

    filterTransfersByStatus(status) {
        const rows = document.querySelectorAll('#transfersTableBody tr');
        
        rows.forEach(row => {
            if (!status) {
                row.style.display = '';
                return;
            }
            
            const statusBadge = row.querySelector('.status-badge');
            const isVisible = statusBadge.classList.contains(`status-${status}`);
            row.style.display = isVisible ? '' : 'none';
        });
    }

    filterUsers(searchTerm) {
        const rows = document.querySelectorAll('#usersTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm.toLowerCase());
            row.style.display = isVisible ? '' : 'none';
        });
    }

    updateExchangeRates() {
        const btn = document.getElementById('updateRatesBtn');
        btn.classList.add('loading');
        btn.disabled = true;
        btn.textContent = 'Mise à jour...';

        setTimeout(() => {
            // Simuler la mise à jour des taux
            document.querySelectorAll('.rate-value').forEach(rateElement => {
                const currentRate = parseFloat(rateElement.textContent);
                const variation = (Math.random() - 0.5) * 0.02; // Variation de ±1%
                const newRate = (currentRate * (1 + variation)).toFixed(2);
                rateElement.textContent = newRate;
            });

            btn.classList.remove('loading');
            btn.disabled = false;
            btn.textContent = 'Mettre à jour les taux';
            
            this.showNotification('Taux de change mis à jour avec succès', 'success');
        }, 2000);
    }

    viewTransfer(transferId) {
        this.showNotification(`Affichage du transfert ${transferId}`, 'info');
    }

    editTransfer(transferId) {
        this.showNotification(`Modification du transfert ${transferId}`, 'info');
    }

    viewUser(userId) {
        this.showNotification(`Affichage de l'utilisateur ${userId}`, 'info');
    }

    editUser(userId) {
        this.showNotification(`Modification de l'utilisateur ${userId}`, 'info');
    }

    deleteUser(userId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            this.showNotification(`Utilisateur ${userId} supprimé`, 'success');
            // Recharger les données
            setTimeout(() => {
                this.loadUsersData();
            }, 1000);
        }
    }

    showAddUserModal() {
        this.showNotification('Fonctionnalité d\'ajout d\'utilisateur à implémenter', 'info');
    }

    showNotification(message, type = 'info') {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Couleurs selon le type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };

        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Suppression automatique
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('adminSession');
            sessionStorage.removeItem('adminAuth');
            window.location.href = 'admin-login.html';
        }
    }
}

// Initialiser le dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});