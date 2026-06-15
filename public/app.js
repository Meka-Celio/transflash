class MoneyTransferApp {
    constructor() {
        this.currentStep = 1;
        this.transferData = {
            sendCountry: { code: 'ma', name: 'Maroc', currency: 'MAD', flag: '🇲🇦' },
            receiveCountry: { code: 'ga', name: 'Gabon', currency: 'XAF', flag: '🇬🇦' },
            sendAmount: 100,
            receiveAmount: 65596,
            exchangeRate: 655.96,
            fees: 5.00,
            totalAmount: 105.00,
            sender: {},
            receiver: {},
            depositMode: 'physical'
        };
        
        this.exchangeRates = {
            'MAD-XAF': 65,
            'MAD-XOF': 65.50,
            'EUR-XAF': 655.96,
            'EUR-XOF': 655.96,
            'XOF-MAD': 0.015,
            'XOF-EUR': 0.0015,
            'XAF-MAD': 0.0015,
            'XAF-EUR': 0.0015
        };

        this.countries = {
            'ma': { name: 'Maroc', currency: 'MAD', flag: '🇲🇦' },
            'fr': { name: 'France', currency: 'EUR', flag: '🇫🇷' },
            'ga': { name: 'Gabon', currency: 'XAF', flag: '🇬🇦' },
            'ci': { name: 'Côte d\'Ivoire', currency: 'XOF', flag: '🇨🇮' },
            'cm': { name: 'Cameroun', currency: 'XAF', flag: '🇨🇲' },
            'sn': { name: 'Sénégal', currency: 'XOF', flag: '🇸🇳' }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateAmounts();
        this.updateProgressBar();
        this.initAdminAccess();
    }

    bindEvents() {
        // Country selection events
        document.getElementById('sendCountry').addEventListener('click', () => {
            this.toggleDropdown('sendCountryDropdown');
        });

        document.getElementById('receiveCountry').addEventListener('click', () => {
            this.toggleDropdown('receiveCountryDropdown');
        });

        // Country option selection
        document.querySelectorAll('#sendCountryDropdown .country-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectCountry('send', e.target.closest('.country-option'));
            });
        });

        document.querySelectorAll('#receiveCountryDropdown .country-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectCountry('receive', e.target.closest('.country-option'));
            });
        });

        // Amount input events
        document.getElementById('sendAmount').addEventListener('input', () => {
            this.updateAmounts();
        });

        // Navigation events
        document.getElementById('nextStep1').addEventListener('click', () => {
            this.validateStep1() && this.goToStep(2);
        });

        document.getElementById('prevStep2').addEventListener('click', () => {
            this.goToStep(1);
        });

        document.getElementById('nextStep2').addEventListener('click', () => {
            this.validateStep2() && this.goToStep(3);
        });

        document.getElementById('prevStep3').addEventListener('click', () => {
            this.goToStep(2);
        });

        document.getElementById('validateTransfer').addEventListener('click', () => {
            this.validateTransfer();
        });

        document.getElementById('newTransfer').addEventListener('click', () => {
            this.resetApp();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.country-select')) {
                this.closeAllDropdowns();
            }
        });

        // Form validation events
        this.bindValidationEvents();
    }

    bindValidationEvents() {
        const fields = ['senderName', 'senderPhone', 'senderEmail', 'receiverName', 'receiverPhone'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(fieldId);
                });
                field.addEventListener('input', () => {
                    this.clearFieldError(fieldId);
                });
            }
        });
    }

    toggleDropdown(dropdownId) {
        this.closeAllDropdowns();
        const dropdown = document.getElementById(dropdownId);
        dropdown.classList.toggle('show');
    }

    closeAllDropdowns() {
        document.querySelectorAll('.country-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    selectCountry(type, option) {
        const countryCode = option.dataset.country;
        const currency = option.dataset.currency;
        const country = this.countries[countryCode];

        if (type === 'send') {
            this.transferData.sendCountry = {
                code: countryCode,
                name: country.name,
                currency: currency,
                flag: country.flag
            };
            this.updateCountryDisplay('sendCountry', country);
        } else {
            this.transferData.receiveCountry = {
                code: countryCode,
                name: country.name,
                currency: currency,
                flag: country.flag
            };
            this.updateCountryDisplay('receiveCountry', country);
        }

        this.closeAllDropdowns();
        this.updateAmounts();
    }

    updateCountryDisplay(elementId, country) {
        const element = document.getElementById(elementId);
        const flag = element.querySelector('.country-flag');
        const strong = element.querySelector('.country-info strong');

        flag.textContent = country.flag;
        strong.textContent = country.name;
    }

    updateAmounts() {
        const sendAmount = parseFloat(document.getElementById('sendAmount').value) || 0;
        const rateKey = `${this.transferData.sendCountry.currency}-${this.transferData.receiveCountry.currency}`;
        const rate = this.exchangeRates[rateKey] || 1;
        
        const receiveAmount = Math.round(sendAmount * rate);
        const fees = Math.max(5, sendAmount * 0.05); // 5% fees, minimum 5
        const totalAmount = sendAmount + fees;

        this.transferData.sendAmount = sendAmount;
        this.transferData.receiveAmount = receiveAmount;
        this.transferData.exchangeRate = rate;
        this.transferData.fees = fees;
        this.transferData.totalAmount = totalAmount;

        // Update UI
        document.getElementById('receiveAmount').value = receiveAmount;
        document.getElementById('sendCurrency').textContent = `${this.transferData.sendCountry.currency} ▼`;
        document.getElementById('receiveCurrency').textContent = this.transferData.receiveCountry.currency;
        document.getElementById('exchangeRate').textContent = 
            `1 ${this.transferData.sendCountry.currency} = ${rate.toFixed(2)} ${this.transferData.receiveCountry.currency}`;
        document.getElementById('fees').textContent = `${fees.toFixed(2)} ${this.transferData.sendCountry.currency}`;
        document.getElementById('totalAmount').textContent = `${totalAmount.toFixed(2)} ${this.transferData.sendCountry.currency}`;
    }

    validateStep1() {
        const sendAmount = parseFloat(document.getElementById('sendAmount').value);
        
        if (!sendAmount || sendAmount < 1) {
            this.showError('Le montant doit être supérieur à 0');
            return false;
        }

        if (sendAmount > 10000) {
            this.showError('Le montant ne peut pas dépasser 10 000');
            return false;
        }

        return true;
    }

    validateStep2() {
        const fields = [
            { id: 'senderName', name: 'Nom de l\'expéditeur' },
            { id: 'senderPhone', name: 'Téléphone de l\'expéditeur' },
            { id: 'senderEmail', name: 'Email de l\'expéditeur' },
            { id: 'receiverName', name: 'Nom du bénéficiaire' },
            { id: 'receiverPhone', name: 'Téléphone du bénéficiaire' }
        ];

        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field.id)) {
                isValid = false;
            }
        });

        // Save form data
        if (isValid) {
            this.transferData.sender = {
                name: document.getElementById('senderName').value,
                phone: document.getElementById('senderPhone').value,
                email: document.getElementById('senderEmail').value
            };

            this.transferData.receiver = {
                name: document.getElementById('receiverName').value,
                phone: document.getElementById('receiverPhone').value
            };

            this.transferData.depositMode = document.querySelector('input[name="depositMode"]:checked').value;
        }

        return isValid;
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Clear previous errors
        this.clearFieldError(fieldId);

        // Required field validation
        if (!value) {
            message = 'Ce champ est obligatoire';
            isValid = false;
        } else {
            // Specific validations
            switch (fieldId) {
                case 'senderEmail':
                    if (!this.isValidEmail(value)) {
                        message = 'Adresse email invalide';
                        isValid = false;
                    }
                    break;
                case 'senderPhone':
                case 'receiverPhone':
                    if (!this.isValidPhone(value)) {
                        message = 'Numéro de téléphone invalide';
                        isValid = false;
                    }
                    break;
                case 'senderName':
                case 'receiverName':
                    if (value.length < 2) {
                        message = 'Le nom doit contenir au moins 2 caractères';
                        isValid = false;
                    }
                    break;
            }
        }

        if (!isValid) {
            this.showFieldError(fieldId, message);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,15}$/;
        return phoneRegex.test(phone);
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}Error`);
        
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}Error`);
        
        field.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    showError(message) {
        alert(message); // In a real app, you'd use a proper notification system
    }

    goToStep(step) {
        // Hide current step
        document.querySelectorAll('.form-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });

        // Show new step
        document.getElementById(`step${step}`).classList.add('active');

        // Update progress
        this.currentStep = step;
        this.updateProgressBar();

        // Update summary if going to step 3
        if (step === 3) {
            this.updateSummary();
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    updateProgressBar() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    updateSummary() {
        // Transfer details
        document.getElementById('summaryFromCountry').textContent = 
            `${this.transferData.sendCountry.flag} ${this.transferData.sendCountry.name}`;
        document.getElementById('summaryToCountry').textContent = 
            `${this.transferData.receiveCountry.flag} ${this.transferData.receiveCountry.name}`;
        document.getElementById('summarySendAmount').textContent = 
            `${this.transferData.sendAmount.toFixed(2)} ${this.transferData.sendCountry.currency}`;
        document.getElementById('summaryReceiveAmount').textContent = 
            `${this.transferData.receiveAmount.toFixed(2)} ${this.transferData.receiveCountry.currency}`;
        document.getElementById('summaryExchangeRate').textContent = 
            `1 ${this.transferData.sendCountry.currency} = ${this.transferData.exchangeRate.toFixed(2)} ${this.transferData.receiveCountry.currency}`;
        document.getElementById('summaryFees').textContent = 
            `${this.transferData.fees.toFixed(2)} ${this.transferData.sendCountry.currency}`;
        document.getElementById('summaryTotal').textContent = 
            `${this.transferData.totalAmount.toFixed(2)} ${this.transferData.sendCountry.currency}`;

        // Sender info
        document.getElementById('summarySenderName').textContent = this.transferData.sender.name;
        document.getElementById('summarySenderPhone').textContent = this.transferData.sender.phone;
        document.getElementById('summarySenderEmail').textContent = this.transferData.sender.email;

        // Receiver info
        document.getElementById('summaryReceiverName').textContent = this.transferData.receiver.name;
        document.getElementById('summaryReceiverPhone').textContent = this.transferData.receiver.phone;
        document.getElementById('summaryDepositMode').textContent = 
            this.transferData.depositMode === 'physical' ? 'Dépôt physique' : 'Dépôt virtuel';
    }

    validateTransfer() {
        const acceptTerms = document.getElementById('acceptTerms').checked;
        
        if (!acceptTerms) {
            this.showError('Vous devez accepter les conditions générales');
            return;
        }

        // Simulate transfer processing
        const button = document.getElementById('validateTransfer');
        button.classList.add('loading');
        button.disabled = true;
        button.textContent = 'Traitement en cours...';

        setTimeout(() => {
            this.showConfirmation();
            button.classList.remove('loading');
            button.disabled = false;
            button.textContent = 'Valider le transfert';
        }, 2000);
    }

    showConfirmation() {
        const referenceNumber = this.generateReference();
        document.getElementById('transferReference').textContent = referenceNumber;
        document.getElementById('confirmationModal').classList.add('show');
    }

    generateReference() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `TF${timestamp}${random}`.toUpperCase();
    }

    resetApp() {
        // Hide modal
        document.getElementById('confirmationModal').classList.remove('show');
        
        // Reset to step 1
        this.goToStep(1);
        
        // Reset form data
        this.transferData = {
            sendCountry: { code: 'ma', name: 'Maroc', currency: 'MAD', flag: '🇲🇦' },
            receiveCountry: { code: 'ga', name: 'Gabon', currency: 'XAF', flag: '🇬🇦' },
            sendAmount: 100,
            receiveAmount: 65596,
            exchangeRate: 655.96,
            fees: 5.00,
            totalAmount: 105.00,
            sender: {},
            receiver: {},
            depositMode: 'physical'
        };
        
        // Reset form fields
        document.getElementById('sendAmount').value = 100;
        document.getElementById('senderName').value = '';
        document.getElementById('senderPhone').value = '';
        document.getElementById('senderEmail').value = '';
        document.getElementById('receiverName').value = '';
        document.getElementById('receiverPhone').value = '';
        document.querySelector('input[name="depositMode"][value="physical"]').checked = true;
        document.getElementById('acceptTerms').checked = false;
        
        // Clear all errors
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
        
        // Update displays
        this.updateCountryDisplay('sendCountry', this.countries.ma);
        this.updateCountryDisplay('receiveCountry', this.countries.ga);
        this.updateAmounts();
    }

    initAdminAccess() {
        // Accès admin caché - Triple clic sur le logo
        let clickCount = 0;
        let clickTimer = null;
        
        const logo = document.querySelector('.logo-text');
        logo.addEventListener('click', () => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 2000);
            } else if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                
                // Afficher l'accès admin
                const adminAccess = document.getElementById('adminAccess');
                adminAccess.style.display = 'block';
                adminAccess.style.animation = 'fadeIn 0.5s ease';
                
                // Masquer après 5 secondes
                setTimeout(() => {
                    adminAccess.style.display = 'none';
                }, 5000);
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MoneyTransferApp();
});

// Add smooth scrolling and animations
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation for better UX
    const addLoadingAnimation = (element) => {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0.7';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 300);
    };

    // Add click effects to buttons
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Add focus effects to inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = '';
        });
    });
});
