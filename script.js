// script.js - נטען עם defer

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
    hasSetFocus: false,
    
    showError: (group, message) => {
        const errorDiv = group.querySelector('.form-validation-error');
        if (errorDiv) {
            group.classList.add('error');
            errorDiv.textContent = message;
            
            // Set focus on the first error field
            const input = group.querySelector('input, textarea');
            if (input && !UIFeedback.hasSetFocus) {
                input.focus();
                UIFeedback.hasSetFocus = true;
            }
        }
    },
    
    clearError: (group) => {
        const errorDiv = group.querySelector('.form-validation-error');
        if (errorDiv) {
            group.classList.remove('error');
            errorDiv.textContent = '';
        }
    },
    
    showSubmitStatus: (button, status, message) => {
        if (!button) return;
        
        switch (status) {
            case 'sending':
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
                break;
            case 'success':
                button.innerHTML = '<i class="fas fa-check"></i> ' + message;
                // Show success message
                UIFeedback.showStatusMessage('success', 'הטופס נשלח בהצלחה! נציג שלנו יחזור אליך בהקדם.');
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
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;
        
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.innerHTML = `
            <div class="status-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        contactForm.insertBefore(statusDiv, document.querySelector('form'));
        
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
        if (input) {
            const errorMessage = ValidationUtils.getErrorMessage(input);
            
            if (errorMessage) {
                UIFeedback.showError(group, errorMessage);
                isValid = false;
            } else {
                UIFeedback.clearError(group);
            }
        }
    });
    
    return isValid;
}

// Modal handling
const ImageModal = {
    currentIndex: 0,
    images: [],
    
    open: (card) => {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        if (!modal || !modalImg) return;
        
        const workCards = document.querySelectorAll('.work-card');
        
        // שמירת כל תמונות העבודות
        ImageModal.images = [];
        workCards.forEach((workCard, index) => {
            const img = workCard.querySelector('img');
            const caption = workCard.querySelector('h3')?.textContent || '';
            const description = workCard.querySelector('p')?.textContent || '';
            
            if (img) {
                ImageModal.images.push({
                    src: img.src,
                    caption: caption,
                    description: description
                });
                
                // בדיקה אם זו התמונה הנוכחית
                if (workCard === card) {
                    ImageModal.currentIndex = index;
                }
            }
        });
        
        ImageModal.showImage(ImageModal.currentIndex);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },
    
    close: () => {
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },
    
    showImage: (index) => {
        const modalImg = document.getElementById('modalImage');
        const captionDiv = document.querySelector('.modal-caption');
        if (!modalImg || !captionDiv || !ImageModal.images.length) return;
        
        const image = ImageModal.images[index];
        
        modalImg.src = image.src;
        modalImg.alt = `${image.caption} - ${image.description}`;
        captionDiv.textContent = `${image.caption} - ${image.description}`;
    },
    
    nextImage: () => {
        ImageModal.currentIndex = (ImageModal.currentIndex + 1) % ImageModal.images.length;
        ImageModal.showImage(ImageModal.currentIndex);
    },
    
    prevImage: () => {
        ImageModal.currentIndex = (ImageModal.currentIndex - 1 + ImageModal.images.length) % ImageModal.images.length;
        ImageModal.showImage(ImageModal.currentIndex);
    }
};

// עדכון פונקציית פתיחת המודל
function openImageModal(card) {
    ImageModal.open(card);
}

// FAQ Toggle
function initFaqToggle() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Toggle active class on the clicked item
                item.classList.toggle('active');
                
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
            });
        }
    });
}

// טיפול בסרטון
function initVideoPlaceholder() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function() {
            // אם יש סרטון יוטיוב, אפשר להחליף את תמונת הממתינה באייפריים
            
            // כאשר אין סרטון אמיתי, אפשר פשוט להציג התראה
            alert('הסרטון יהיה זמין בקרוב! 🎬');
        });
    }
}

// Secondary initialization on document ready
document.addEventListener('DOMContentLoaded', () => {
    // אתחול פונקציות שאינן קריטיות לטעינה ראשונית
    initFaqToggle();
    initVideoPlaceholder();
    
    // Modal event listeners
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                ImageModal.close();
            }
        });
    }
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('imageModal')?.style.display === 'flex') {
            if (e.key === 'Escape') {
                ImageModal.close();
            } else if (e.key === 'ArrowLeft') {
                ImageModal.nextImage();
            } else if (e.key === 'ArrowRight') {
                ImageModal.prevImage();
            }
        }
    });
    
    // Form submission
    const mainContactForm = document.getElementById('mainContactForm');
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', handleSubmit);
    }
    
    // Add input event listeners for real-time validation
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (group) {
                const errorMessage = ValidationUtils.getErrorMessage(input);
                
                if (errorMessage) {
                    UIFeedback.showError(group, errorMessage);
                } else {
                    UIFeedback.clearError(group);
                }
            }
        });
    });
});