// פונקציה לפתיחת מודל התמונה
function openImageModal(card) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const img = card.querySelector('img');
    const caption = card.querySelector('h3').textContent;
    const description = card.querySelector('p').textContent;
    
    modalImg.src = img.src;
    document.querySelector('.modal-caption').textContent = caption + ' - ' + description;
    modal.style.display = 'flex';
    
    // מניעת גלילה של הרקע
    document.body.style.overflow = 'hidden';
}

// פונקציה לסגירת מודל התמונה
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// גלילה לטופס יצירת קשר
function scrollToContact() {
    const contactForm = document.querySelector('.contact-form');
    contactForm.scrollIntoView({ behavior: 'smooth' });
}

// וולידציה של הטופס
function validateForm(form) {
    let isValid = true;
    const formGroups = form.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        group.classList.remove('error');
        
        if (input.validity.valid === false) {
            group.classList.add('error');
            isValid = false;
        }
    });
    
    return isValid;
}

// כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
    // סגירת המודל בלחיצה על הרקע
    document.getElementById('imageModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeImageModal();
        }
    });

    // הצגת/הסתרת כפתור יצירת קשר
    window.addEventListener('scroll', function() {
        const contactBtn = document.querySelector('.floating-contact-btn');
        const heroSection = document.querySelector('.hero');
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        
        if (window.scrollY > heroBottom) {
            contactBtn.classList.add('visible');
        } else {
            contactBtn.classList.remove('visible');
        }
    });

    // סגירת מודל בלחיצה על ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
});
// להוסיף בסוף הקובץ
document.getElementById('mainContactForm').addEventListener('submit', handleSubmit);

function handleSubmit(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
    
    // הטופס נשלח דרך formspree
    fetch(event.target.action, {
        method: 'POST',
        body: new FormData(event.target),
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            submitButton.innerHTML = '<i class="fas fa-check"></i> נשלח בהצלחה!';
            event.target.reset();
        } else {
            submitButton.innerHTML = '<i class="fas fa-times"></i> שגיאה בשליחה';
        }
    }).catch(error => {
        submitButton.innerHTML = '<i class="fas fa-times"></i> שגיאה בשליחה';
    }).finally(() => {
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = 'שלח פנייה';
        }, 3000);
    });
}