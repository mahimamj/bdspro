// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const toast = document.getElementById('toast');

// Mobile Navigation Toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Modal functions
function openModal(modalType) {
    if (modalType === 'login') {
        loginModal.style.display = 'block';
    } else if (modalType === 'signup') {
        signupModal.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
}

function closeModal(modalType) {
    if (modalType === 'login') {
        loginModal.style.display = 'none';
    } else if (modalType === 'signup') {
        signupModal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

function switchModal(fromModal, toModal) {
    closeModal(fromModal);
    openModal(toModal);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModal('login');
    }
    if (e.target === signupModal) {
        closeModal('signup');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('login');
        closeModal('signup');
    }
});

// Toast notification function
function showToast(message, type = 'success', duration = 3000) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Form handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    
    // Simulate login process
    showToast('Logging in...', 'success');
    
    // Here you would typically make an API call
    setTimeout(() => {
        showToast('Login successful!', 'success');
        closeModal('login');
        this.reset();
        
        // Store user data in localStorage for demo
        const userData = {
            name: email.split('@')[0], // Use email prefix as name for demo
            email: email,
            phone: phone
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const agree = formData.get('agree');
    
    // Basic validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    if (!agree) {
        showToast('Please agree to the terms and conditions!', 'error');
        return;
    }
    
    // Simulate signup process
    showToast('Creating account...', 'success');
    
    // Here you would typically make an API call
    setTimeout(() => {
        showToast('Account created successfully!', 'success');
        closeModal('signup');
        this.reset();
        
        // Store user data in localStorage for demo
        const userData = {
            name: name,
            email: email,
            phone: phone
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Simulate contact form submission
    showToast('Sending message...', 'success');
    
    // Here you would typically make an API call
    setTimeout(() => {
        showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        this.reset();
    }, 1500);
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => observer.observe(el));
});

// Counter animation for stats - Minimal
function animateCounter(element, target, duration = 1000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    updateCounter();
}

// Animate counters when they come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.textContent);
            animateCounter(counter, target);
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

// Observe counter elements
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        if (counter.textContent.includes('+')) {
            counterObserver.observe(counter);
        }
    });
});

// Parallax effect for hero section - Minimal
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.2;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation - Minimal
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading animation - Minimal
const style = document.createElement('style');
style.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    .feature-card,
    .reward-card,
    .community-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .feature-card.aos-animate,
    .reward-card.aos-animate,
    .reward-card.aos-animate,
    .community-card.aos-animate {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Google Analytics simulation (replace with actual GA code)
function trackEvent(eventName, eventData) {
    console.log('Event tracked:', eventName, eventData);
    // Here you would typically send data to Google Analytics
}

// Track button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('button_click', {
            button_text: buttonText,
            page: window.location.pathname
        });
    }
});

// Track form submissions
document.addEventListener('submit', (e) => {
    if (e.target.id === 'loginForm') {
        trackEvent('form_submit', { form_type: 'login' });
    } else if (e.target.id === 'signupForm') {
        trackEvent('form_submit', { form_type: 'signup' });
    } else if (e.target.id === 'contactForm') {
        trackEvent('form_submit', { form_type: 'contact' });
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    
    // Track page load performance
    trackEvent('page_load', {
        load_time: loadTime,
        url: window.location.href
    });
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    trackEvent('javascript_error', {
        message: e.error.message,
        filename: e.filename,
        lineno: e.lineno
    });
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Tab navigation for modals
    if (loginModal.style.display === 'block' || signupModal.style.display === 'block') {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }
});

// Add touch support for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe up
            console.log('Swipe up detected');
        } else {
            // Swipe down
            console.log('Swipe down detected');
        }
    }
}

// Add lazy loading for images (if any are added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Add print styles
const printStyle = document.createElement('style');
printStyle.textContent = `
    @media print {
        .navbar,
        .hero-buttons,
        .btn,
        .modal,
        .toast {
            display: none !important;
        }
        
        .hero {
            background: white !important;
            color: black !important;
        }
        
        .hero-text {
            color: black !important;
        }
        
        .feature-card,
        .plan-card,
        .reward-card,
        .community-card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
        }
    }
`;
document.head.appendChild(printStyle);

console.log('BDS PRO Website JavaScript loaded successfully!');
