document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
        });
    }
    
    /* ==========================================================================
       SMOOTH SCROLL FOR ANCHOR LINKS
       ========================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('mobile-open')) {
                    navLinks.classList.remove('mobile-open');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });
    
    /* ==========================================================================
       HEADER SCROLL EFFECT
       ========================================================================== */
    const header = document.querySelector('.header');
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.scrollY;
                
                if (currentScroll > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                // Hide/show header on scroll
                if (currentScroll > lastScroll && currentScroll > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });
    
    /* ==========================================================================
       PARALLAX EFFECT FOR HERO
       ========================================================================== */
    const heroSection = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image-content');
    
    window.addEventListener('scroll', () => {
        if (heroSection && heroImage && window.scrollY < heroSection.offsetHeight) {
            const scrolled = window.scrollY;
            const rate = scrolled * 0.3;
            heroImage.style.transform = `translateY(${rate}px)`;
        }
    });
    
    /* ==========================================================================
       MOUSE TRACKING FOR HERO IMAGE
       ========================================================================== */
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        if (heroImage) {
            const rect = heroImage.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            mouseX = (e.clientX - centerX) / 30;
            mouseY = (e.clientY - centerY) / 30;
            
            heroImage.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        }
    });
    
    /* ==========================================================================
       SCROLL ANIMATIONS WITH STAGGER
       ========================================================================== */
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.animationDelay || 0;
                
                setTimeout(() => {
                    element.classList.add('visible');
                    element.classList.remove('hidden');
                }, delay);
                
                scrollObserver.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements with staggered delays
    const animatableElements = document.querySelectorAll('.feature-card, .why-card, .security-card, .pricing-card, .step, .testimonial-card');
    
    animatableElements.forEach((element, index) => {
        element.classList.add('hidden');
        element.dataset.animationDelay = `${index * 100}ms`;
        scrollObserver.observe(element);
    });
    
    // Special handling for video section
    const videoWrapper = document.querySelector('.video-wrapper');
    if (videoWrapper) {
        videoWrapper.classList.add('hidden');
        videoWrapper.dataset.animationDelay = '200ms';
        scrollObserver.observe(videoWrapper);
    }
    
    /* ==========================================================================
       VIDEO SECTION INTERACTIONS
       ========================================================================== */
    const videoDiscoverBtn = document.querySelector('.video-discover-btn');
    const videoPlayBtn = document.querySelector('.video-play-btn');
    
    if (videoDiscoverBtn) {
        videoDiscoverBtn.addEventListener('click', () => {
            const videoSection = document.querySelector('.video-section');
            if (videoSection) {
                videoSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (videoPlayBtn) {
        videoPlayBtn.addEventListener('click', () => {
            createVideoModal();
        });
    }
    
    function createVideoModal() {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="video-container-modal">
                    <div class="video-placeholder-modal">
                        <div class="video-pattern-modal"></div>
                        <h3 class="video-text-modal">Vidéo de présentation</h3>
                        <p class="video-subtitle-modal">Motion design en cours de chargement...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
    
    /* ==========================================================================
       ENHANCED BUTTON INTERACTIONS
       ========================================================================== */
    const allButtons = document.querySelectorAll('button, .btn, .cta-button, .web-cta-btn, .app-store-btn, .google-play-btn, .pricing-btn, .final-cta-btn');
    
    allButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('click', function(e) {
            createRipple(this, e);
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px)';
            }, 100);
        });
    });
    
    function createRipple(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            width: 100px;
            height: 100px;
            left: ${x - 50}px;
            top: ${y - 50}px;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    /* ==========================================================================
       CARD HOVER EFFECTS
       ========================================================================== */
    const allCards = document.querySelectorAll('.feature-card, .why-card, .security-card, .pricing-card, .testimonial-card');
    
    allCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            allCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.opacity = '0.7';
                    otherCard.style.transform = 'scale(0.98)';
                }
            });
        });
        
        card.addEventListener('mouseleave', () => {
            allCards.forEach(otherCard => {
                otherCard.style.opacity = '1';
                otherCard.style.transform = 'scale(1)';
            });
        });
    });
    
    /* ==========================================================================
       COUNTER ANIMATIONS
       ========================================================================== */
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }
    
    /* ==========================================================================
       FLOATING ANIMATIONS
       ========================================================================== */
    function addFloatingAnimation() {
        const floatingElements = document.querySelectorAll('.why-card-icon, .security-card-icon, .feature-icon');
        
        floatingElements.forEach((element, index) => {
            element.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
            element.style.animationDelay = `${index * 0.2}s`;
        });
    }
    
    /* ==========================================================================
   DYNAMIC CSS ANIMATIONS
   ========================================================================== */
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.05);
                opacity: 0.8;
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .hidden {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .nav-links.mobile-open {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: slideInDown 0.3s ease;
        }
        
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
        
        .header {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .header.scrolled {
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .video-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-content {
            position: relative;
            max-width: 900px;
            width: 90%;
            animation: scaleIn 0.3s ease;
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .modal-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: white;
            color: black;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .modal-close:hover {
            background: var(--primary);
            color: white;
            transform: rotate(90deg);
        }
        
        .video-container-modal {
            background: var(--gray-900);
            border-radius: var(--radius-xl);
            overflow: hidden;
            aspect-ratio: 16/9;
        }
        
        .video-placeholder-modal {
            width: 100%;
            height: 100%;
            background: var(--primary);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .video-pattern-modal {
            position: absolute;
            inset: 0;
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
            animation: patternMove 20s linear infinite;
        }
        
        @keyframes patternMove {
            0% {
                background-position: 0% 0%;
            }
            100% {
                background-position: 100% 100%;
            }
        }
        
        .video-text-modal {
            font-family: var(--font-display);
            font-size: 2rem;
            font-weight: 700;
            color: white;
            position: relative;
            z-index: 1;
            margin-bottom: var(--spacing-md);
        }
        
        .video-subtitle-modal {
            color: rgba(255,255,255,0.8);
            position: relative;
            z-index: 1;
        }
        
        /* Performance optimization */
        .animations-paused * {
            animation-play-state: paused !important;
            transition: none !important;
        }
    `;
    document.head.appendChild(dynamicStyles);
    
    /* ==========================================================================
       INITIAL PAGE LOAD ANIMATIONS
       ========================================================================== */
    function initPageAnimations() {
        // Hero content animation
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                heroContent.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Hero image animation
        const heroImageSection = document.querySelector('.hero-image');
        if (heroImageSection) {
            heroImageSection.style.opacity = '0';
            heroImageSection.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                heroImageSection.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                heroImageSection.style.opacity = '1';
                heroImageSection.style.transform = 'translateX(0)';
            }, 300);
        }
        
        // Add floating animations
        addFloatingAnimation();
    }
    
    /* ==========================================================================
       PERFORMANCE OPTIMIZATION
       ========================================================================== */
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--transition-base', '150ms ease');
        document.documentElement.style.setProperty('--transition-slow', '300ms ease');
    }
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.classList.add('animations-paused');
        } else {
            document.body.classList.remove('animations-paused');
        }
    });
    
    /* ==========================================================================
       MAGNETIC BUTTON EFFECT
       ========================================================================== */
    const magneticButtons = document.querySelectorAll('.pricing-btn, .final-cta-btn');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
    
    // Initialize on page load
    window.addEventListener('load', initPageAnimations);
    
    console.log('Foi & Cœur - Enhanced Animations Initialized');
});