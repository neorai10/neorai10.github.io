// Constants for validation
const VALIDATION_MESSAGES = {
    email: 'נא להזין כתובת אימייל תקינה',
    tel: 'נא להזין מספר טלפון תקין (9-10 ספרות)',
    required: 'שדה זה הינו שדה חובה',
    minLength: (min) => `אורך מינימלי נדרש הוא ${min} תווים`
};

// Form validation utilities
const ValidationUtils = {
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePhone: (phone) => {
        const phoneRegex = /^[0-9]{9,10}$/;
        return phoneRegex.test(phone);
    },
    
    getErrorMessage: (input) => {
        if (!input.value.trim()) {
            return VALIDATION_MESSAGES.required;
        }
        
        if (input.type === 'email' && !ValidationUtils.validateEmail(input.value)) {
            return VALIDATION_MESSAGES.email;
        }
        
        if (input.type === 'tel' && !ValidationUtils.validatePhone(input.value)) {
            return VALIDATION_MESSAGES.tel;
        }
        
        if (input.minLength && input.value.length < input.minLength) {
            return VALIDATION_MESSAGES.minLength(input.minLength);
        }
        
        return '';
    }
};

// UI Feedback utilities
const UIFeedback = {
    showError: (group, message) => {
        const errorDiv = group.querySelector('.form-validation-error');
        group.classList.add('error');
        errorDiv.textContent = message;
        
        // Set focus on the first error field
        const input = group.querySelector('input, textarea');
        if (input && !UIFeedback.hasSetFocus) {
            input.focus();
            UIFeedback.hasSetFocus = true;
        }
    },
    
    clearError: (group) => {
        const errorDiv = group.querySelector('.form-validation-error');
        group.classList.remove('error');
        errorDiv.textContent = '';
    },
    
    showSubmitStatus: (button, status, message) => {
        switch (status) {
            case 'sending':
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
                break;
            case 'success':
                button.innerHTML = '<i class="fas fa-check"></i> ' + message;
                // Show success message
                UIFeedback.showStatusMessage('success', 'הטופס נשלח בהצלחה!');
                break;
            case 'error':
                button.innerHTML = '<i class="fas fa-times"></i> ' + message;
                // Show error message
                UIFeedback.showStatusMessage('error', 'אירעה שגיאה בשליחת הטופס. אנא נסו שוב.');
                break;
            default:
                button.disabled = false;
                button.innerHTML = 'שלח פנייה';
        }
    },
    
    showStatusMessage: (type, message) => {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.innerHTML = `
            <div class="status-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.querySelector('.contact-form').insertBefore(statusDiv, document.querySelector('form'));
        
        // Auto remove after 5 seconds
        setTimeout(() => statusDiv.remove(), 5000);
    }
};

// Form submission handler
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Reset focus flag
    UIFeedback.hasSetFocus = false;
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    try {
        UIFeedback.showSubmitStatus(submitButton, 'sending');
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            UIFeedback.showSubmitStatus(submitButton, 'success', 'נשלח בהצלחה!');
            form.reset();
        } else {
            throw new Error('Server responded with: ' + response.status);
        }
    } catch (error) {
        console.error('Submission error:', error);
        UIFeedback.showSubmitStatus(submitButton, 'error', 'שגיאה בשליחה');
    } finally {
        setTimeout(() => {
            UIFeedback.showSubmitStatus(submitButton, 'default');
        }, 3000);
    }
}

// Form validation handler
function validateForm(form) {
    let isValid = true;
    const formGroups = form.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const errorMessage = ValidationUtils.getErrorMessage(input);
        
        if (errorMessage) {
            UIFeedback.showError(group, errorMessage);
            isValid = false;
        } else {
            UIFeedback.clearError(group);
        }
    });
    
    return isValid;
}

// Modal handling
const ImageModal = {
    open: (card) => {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const img = card.querySelector('img');
        const caption = card.querySelector('h3').textContent;
        const description = card.querySelector('p').textContent;
        
        modalImg.src = img.src;
        document.querySelector('.modal-caption').textContent = `${caption} - ${description}`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },
    
    close: () => {
        document.getElementById('imageModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Scroll utilities
const ScrollUtils = {
    scrollToContact: () => {
        document.querySelector('.contact-form').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    },
    
    handleFloatingButton: () => {
        const contactBtn = document.querySelector('.floating-contact-btn');
        const heroSection = document.querySelector('.hero');
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        
        if (window.scrollY > heroBottom) {
            contactBtn.classList.add('visible');
        } else {
            contactBtn.classList.remove('visible');
        }
    }
};

// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    // Modal event listeners
    document.getElementById('imageModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            ImageModal.close();
        }
    });
    
    // Form submission
    document.getElementById('mainContactForm').addEventListener('submit', handleSubmit);
    
    // Scroll handling
    window.addEventListener('scroll', ScrollUtils.handleFloatingButton);
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ImageModal.close();
        }
    });
    
    // Add input event listeners for real-time validation
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            const errorMessage = ValidationUtils.getErrorMessage(input);
            
            if (errorMessage) {
                UIFeedback.showError(group, errorMessage);
            } else {
                UIFeedback.clearError(group);
            }
        });
    });
});