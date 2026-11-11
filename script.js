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
                button.disabled = false;
                // Show success message
                UIFeedback.showStatusMessage('success', 'הטופס נשלח בהצלחה! נציג שלנו יחזור אליך בהקדם.');
                break;
            case 'error':
                button.innerHTML = '<i class="fas fa-times"></i> ' + message;
                button.disabled = false;
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
        
        setTimeout(() => {
            ImageModal.showImage(ImageModal.currentIndex);
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }, 50);
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
// פונקציה חדשה - גלריית תמונות מודרנית
function initModernGallery() {
    const workCards = document.querySelectorAll('.work-card');
    
    workCards.forEach(card => {
        // הוסף אפקט hover מודרני
        card.addEventListener('mouseenter', function() {
            this.querySelector('img').style.transform = 'scale(1.08)';
            this.querySelector('.work-overlay').style.opacity = '1';
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('img').style.transform = 'scale(1)';
            this.querySelector('.work-overlay').style.opacity = '0.8';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });
    });
    
    // שיפור המודל הקיים
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.add('modern-modal');
        // הוסף אנימציה חלקה יותר
        modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
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
// Secondary initialization on document ready
document.addEventListener('DOMContentLoaded', () => {
   // אתחול פונקציות שאינן קריטיות לטעינה ראשונית
   initFaqToggle();
   initVideoPlaceholder();
   initModernGallery();
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
   
   // Accessibility Menu
   function initAccessibilityMenu() {
       const accessibilityBtn = document.querySelector('.accessibility-btn');
       const accessibilityMenu = document.querySelector('.accessibility-menu');
       
       if (!accessibilityBtn || !accessibilityMenu) return;
       
       // Toggle the menu
       accessibilityBtn.addEventListener('click', () => {
           accessibilityMenu.classList.toggle('active');
       });
       
       // Close the menu when clicking outside
       document.addEventListener('click', (e) => {
           if (!accessibilityMenu.contains(e.target) && e.target !== accessibilityBtn) {
               accessibilityMenu.classList.remove('active');
           }
       });
       
       // Initialize from saved settings
       loadAccessibilitySettings();
       
       // Toggle larger text
       document.getElementById('toggleLargerText').addEventListener('click', (e) => {
           document.body.classList.toggle('larger-text');
           toggleButtonText(e.target, document.body.classList.contains('larger-text'));
           saveAccessibilitySettings();
       });
       
       // Toggle high contrast
       document.getElementById('toggleHighContrast').addEventListener('click', (e) => {
           document.body.classList.toggle('high-contrast');
           toggleButtonText(e.target, document.body.classList.contains('high-contrast'));
           saveAccessibilitySettings();
       });
       
       // Toggle text spacing
       document.getElementById('toggleTextSpacing').addEventListener('click', (e) => {
           document.body.classList.toggle('text-spacing');
           toggleButtonText(e.target, document.body.classList.contains('text-spacing'));
           saveAccessibilitySettings();
       });
       
       // Reset all
       document.getElementById('resetAccessibility').addEventListener('click', () => {
           document.body.classList.remove('larger-text', 'high-contrast', 'text-spacing');
           document.querySelectorAll('.accessibility-option button').forEach(button => {
               if (button.id !== 'resetAccessibility') {
                   button.textContent = 'הפעל';
               }
           });
           localStorage.removeItem('accessibilitySettings');
       });
   }

   // Helper functions
   function toggleButtonText(button, isActive) {
       button.textContent = isActive ? 'כבה' : 'הפעל';
   }

   function saveAccessibilitySettings() {
       const settings = {
           largerText: document.body.classList.contains('larger-text'),
           highContrast: document.body.classList.contains('high-contrast'),
           textSpacing: document.body.classList.contains('text-spacing')
       };
       localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
   }

   function loadAccessibilitySettings() {
       const savedSettings = localStorage.getItem('accessibilitySettings');
       if (!savedSettings) return;
       
       const settings = JSON.parse(savedSettings);
       
       if (settings.largerText) {
           document.body.classList.add('larger-text');
           document.getElementById('toggleLargerText').textContent = 'כבה';
       }
       
       if (settings.highContrast) {
           document.body.classList.add('high-contrast');
           document.getElementById('toggleHighContrast').textContent = 'כבה';
       }
       
       if (settings.textSpacing) {
           document.body.classList.add('text-spacing');
           document.getElementById('toggleTextSpacing').textContent = 'כבה';
       }
   }

   // קריאה לפונקציה
   initAccessibilityMenu();
});

// ניהול הסכמת עוגיות GDPR
document.addEventListener('DOMContentLoaded', function() {
   const cookieBanner = document.getElementById('cookieConsentBanner');
   const acceptAllBtn = document.getElementById('cookieAcceptAll');
   const acceptEssentialBtn = document.getElementById('cookieAcceptEssential');
   // בעמודים בלי באנר עוגיות (למשל הבלוג) אין מה לאתחל
   if (!cookieBanner || !acceptAllBtn || !acceptEssentialBtn) return;
   
   // בדוק אם כבר ניתנה הסכמה
   if (!localStorage.getItem('cookieConsent')) {
       cookieBanner.style.display = 'block';
   } else {
       // שחזר את הגדרות ההסכמה הקודמות
       const consentType = localStorage.getItem('cookieConsent');
     if (consentType === 'all') {
   gtag('consent', 'update', {
       'analytics_storage': 'granted',
       'ad_storage': 'granted',
       'ad_user_data': 'granted',
       'ad_personalization': 'granted'
   });
}
   }
   
   // אישור כל העוגיות
   acceptAllBtn.addEventListener('click', function() {
       localStorage.setItem('cookieConsent', 'all');
       cookieBanner.style.display = 'none';
     // עדכן את הגדרות ההסכמה של Google
gtag('consent', 'update', {
   'analytics_storage': 'granted',
   'ad_storage': 'granted',
   'ad_user_data': 'granted',
   'ad_personalization': 'granted'
});
   });
   
   // אישור רק עוגיות חיוניות
   acceptEssentialBtn.addEventListener('click', function() {
       localStorage.setItem('cookieConsent', 'essential');
       cookieBanner.style.display = 'none';
       
       // השאר את הגדרות ברירת המחדל (denied)
   });
});
// ניהול הסכמת עוגיות GDPR
document.addEventListener('DOMContentLoaded', function() {
   // ... (כל הקוד של עוגיות שכבר קיים)
}); 
// סוף הקוד הקיים

// מעקב אחר לחיצות טלפון
document.addEventListener('DOMContentLoaded', function() {
    // מצא את כל הקישורים עם מספרי טלפון
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    // הוסף מאזין אירועים לכל קישור טלפון
    phoneLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            const phoneNumber = this.getAttribute('href').replace('tel:', '');
            // שלח אירוע לגוגל טאג מנג'ר
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({
                    'event': 'phone_call',
                    'phone_number': phoneNumber,
                    'phone_call_location': getCurrentSection()
                });
                console.log('Phone call tracking:', phoneNumber);
            }
        });
    });
    
    // פונקציה לזיהוי המיקום באתר ממנו בוצעה השיחה
    function getCurrentSection() {
        // זיהוי בסיסי של החלק באתר
        if (window.location.pathname.includes('/blog/')) {
            return 'blog_page';
        }
        
        // בדף הבית, ננסה לזהות את החלק הספציפי
        const sections = ['hero', 'services', 'our-works', 'testimonials', 'about-us', 'contact'];
        let currentSection = 'unknown';
        
        // בדוק איזה חלק מוצג כרגע למשתמש
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element && isElementInViewport(element)) {
                currentSection = section;
            }
        });
        
        return currentSection;
    }
    
    // בדיקה אם אלמנט נראה בחלון הנוכחי
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
        
        // בדיקה אם חלק משמעותי מהאלמנט נראה (לא רק קצה)
        const vertInView = (rect.top <= windowHeight * 0.7) && ((rect.top + rect.height) >= windowHeight * 0.3);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
        
        return (vertInView && horInView);
    }
});