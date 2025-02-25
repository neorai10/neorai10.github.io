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
    hasSetFocus: false,
    
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

// Modal handling - מוחק את הגדרה הראשונה ומשתמש רק בהגדרה המורחבת
const ImageModal = {
    currentIndex: 0,
    images: [],
    
    open: (card) => {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const workCards = document.querySelectorAll('.work-card');
        
        // שמירת כל תמונות העבודות
        ImageModal.images = [];
        workCards.forEach((workCard, index) => {
            const img = workCard.querySelector('img');
            const caption = workCard.querySelector('h3').textContent;
            const description = workCard.querySelector('p').textContent;
            
            ImageModal.images.push({
                src: img.src,
                caption: caption,
                description: description
            });
            
            // בדיקה אם זו התמונה הנוכחית
            if (workCard === card) {
                ImageModal.currentIndex = index;
            }
        });
        
        ImageModal.showImage(ImageModal.currentIndex);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },
    
    close: () => {
        document.getElementById('imageModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    },
    
    showImage: (index) => {
        const modalImg = document.getElementById('modalImage');
        const captionDiv = document.querySelector('.modal-caption');
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

// Scroll utilities
const ScrollUtils = {
    scrollToContact: () => {
        document.querySelector('#contact').scrollIntoView({ 
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

// FAQ Toggle
function initFaqToggle() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
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
    });
}

// תפריט ניווט למובייל
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    // סגירת התפריט בלחיצה על קישור
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// אנימציות גלילה
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(element => {
        fadeInObserver.observe(element);
    });
}

// טיפול בסרטון
function initVideoPlaceholder() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function() {
            // אם יש סרטון יוטיוב, אפשר להחליף את תמונת הממתינה באייפריים
            
            // לדוגמה:
            // const videoId = 'YOUR_VIDEO_ID';
            // const iframe = document.createElement('iframe');
            // iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            // iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            // iframe.allowFullscreen = true;
            
            // const responsiveVideo = document.createElement('div');
            // responsiveVideo.className = 'responsive-video';
            // responsiveVideo.appendChild(iframe);
            
            // videoPlaceholder.parentNode.replaceChild(responsiveVideo, videoPlaceholder);
            
            // כאשר אין סרטון אמיתי, אפשר פשוט להציג התראה
            alert('הסרטון יהיה זמין בקרוב! 🎬');
        });
    }
}

// חלקה של המעבר לקישורי עוגן
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // תיקון למרווח של התפריט
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    // הגדר זיהויי סקציות לצורך ניווט אם לא קיימים
    if (!document.querySelector('#services')) document.querySelector('.services').id = 'services';
    if (!document.querySelector('#our-works')) document.querySelector('.our-works').id = 'our-works';
    if (!document.querySelector('#testimonials')) document.querySelector('.testimonials').id = 'testimonials';
    if (!document.querySelector('#about-us')) document.querySelector('.about-us').id = 'about-us';
    if (!document.querySelector('#contact')) document.querySelector('.contact-form').id = 'contact';
    
    // אתחול כל הפונקציונליות
    initFaqToggle();
    initMobileNav();
    initScrollAnimations();
    initVideoPlaceholder();
    initSmoothScroll();
    
    // Modal event listeners
    document.getElementById('imageModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            ImageModal.close();
        }
    });
    
    // Form submission
    const mainContactForm = document.getElementById('mainContactForm');
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', handleSubmit);
    }
    
    // Scroll handling
    window.addEventListener('scroll', ScrollUtils.handleFloatingButton);
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('imageModal').style.display === 'flex') {
            if (e.key === 'Escape') {
                ImageModal.close();
            } else if (e.key === 'ArrowLeft') {
                ImageModal.nextImage();
            } else if (e.key === 'ArrowRight') {
                ImageModal.prevImage();
            }
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

    // התאמת תפקוד הכפתור הצף
    const floatingContactBtn = document.querySelector('.floating-contact-btn');
    if (floatingContactBtn) {
        floatingContactBtn.addEventListener('click', () => {
            ScrollUtils.scrollToContact();
        });
    }
});

// מוודא שהפונקציה scrollToContact קיימת גם בסקופ הגלובלי לשימוש ב-onclick
function scrollToContact() {
    ScrollUtils.scrollToContact();
}