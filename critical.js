// critical.js - נטען מיד

// קבועים בסיסיים
const VALIDATION_MESSAGES = {
    email: 'נא להזין כתובת אימייל תקינה',
    tel: 'נא להזין מספר טלפון תקין (9-10 ספרות)',
    required: 'שדה זה הינו שדה חובה',
    minLength: (min) => `אורך מינימלי נדרש הוא ${min} תווים`
};

// תפריט ניווט למובייל
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // סגירת התפריט בלחיצה על קישור
        const navItems = document.querySelectorAll('.nav-links a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
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

// אנימציות גלילה בסיסיות
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if ('IntersectionObserver' in window) {
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
    } else {
        // Fallback for older browsers
        fadeElements.forEach(element => element.classList.add('visible'));
    }
}

// טיפול בכפתור הצף
const ScrollUtils = {
    handleFloatingButton: () => {
        const contactBtn = document.querySelector('.floating-contact-btn');
        const heroSection = document.querySelector('.hero');
        
        if (contactBtn && heroSection) {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            
            if (window.scrollY > heroBottom) {
                contactBtn.classList.add('visible');
            } else {
                contactBtn.classList.remove('visible');
            }
        }
    },
    
    scrollToContact: () => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
};

// פונקציה גלובלית לגלילה אל צור קשר
function scrollToContact() {
    ScrollUtils.scrollToContact();
}

// Event listeners setup for critical functions
document.addEventListener('DOMContentLoaded', () => {
    // הגדר זיהויי סקציות לצורך ניווט אם לא קיימים
    if (!document.querySelector('#services')) {
        const servicesSection = document.querySelector('.services');
        if (servicesSection) servicesSection.id = 'services';
    }
    if (!document.querySelector('#our-works')) {
        const worksSection = document.querySelector('.our-works');
        if (worksSection) worksSection.id = 'our-works';
    }
    if (!document.querySelector('#testimonials')) {
        const testimonialsSection = document.querySelector('.testimonials');
        if (testimonialsSection) testimonialsSection.id = 'testimonials';
    }
    if (!document.querySelector('#about-us')) {
        const aboutSection = document.querySelector('.about-us');
        if (aboutSection) aboutSection.id = 'about-us';
    }
    if (!document.querySelector('#contact')) {
        const contactSection = document.querySelector('.contact-form');
        if (contactSection) contactSection.id = 'contact';
    }
    
    // אתחול פונקציות קריטיות
    initMobileNav();
    initSmoothScroll();
    initScrollAnimations();
    
    // Scroll handling
    window.addEventListener('scroll', ScrollUtils.handleFloatingButton);
    
    // התאמת תפקוד הכפתור הצף
    const floatingContactBtn = document.querySelector('.floating-contact-btn');
    if (floatingContactBtn) {
        floatingContactBtn.addEventListener('click', ScrollUtils.scrollToContact);
    }
});