document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('is-sticky');
        } else {
            header.classList.remove('is-sticky');
        }
    });

    // 2. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu-overlay a');

    const setMobileMenuState = (isOpen) => {
        mobileMenu.classList.toggle('open', isOpen);
        hamburger.classList.toggle('is-open', isOpen);
        header.classList.toggle('menu-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => {
        setMobileMenuState(!mobileMenu.classList.contains('open'));
    });

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            setMobileMenuState(false);
        });
    });

    // Smooth scroll for internal page navigation
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href) return;

            event.preventDefault();

            if (link.getAttribute('aria-disabled') === 'true') {
                return;
            }

            if (href === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                history.pushState(null, '', window.location.pathname + window.location.search);
                return;
            }

            const target = document.getElementById(href.slice(1));
            if (!target) return;

            const headerHeight = header.getBoundingClientRect().height;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: 'smooth'
            });
            history.pushState(null, '', href);
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            setMobileMenuState(false);
            hamburger.focus();
        }
    });

    // 3. Scroll Spy for Navigation Links
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.desktop-only .nav-item');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger when section is exactly in the middle of the screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Remove active from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active to current section's link
                const activeLink = document.querySelector(`.desktop-only .nav-item[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});
