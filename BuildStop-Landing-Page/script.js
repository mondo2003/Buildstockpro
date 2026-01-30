/**
 * BuildStop Pro - Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    const header = document.querySelector('.header');

    // Mobile Menu Toggle
    if (mobileMenuBtn && navList) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navList.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !navList.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navList.classList.remove('active');
            }
        });
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Don't prevent default for empty anchors
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Close mobile menu if open
                if (mobileMenuBtn && navList) {
                    mobileMenuBtn.classList.remove('active');
                    navList.classList.remove('active');
                }

                // Account for fixed header height
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle dynamic app links - scroll to contact section
    document.querySelectorAll('a[data-app-link]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector('#contact');
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle root links - scroll to contact section
    document.querySelectorAll('a[href="/"]').forEach(link => {
        // Skip if it's a nav link or has data-app-link attribute
        if (!link.hasAttribute('data-app-link') && !link.closest('.nav')) {
            link.addEventListener('click', function(e) {
                // Check if this should scroll to contact
                const text = this.textContent.trim().toLowerCase();
                const shouldScrollToContact = text.includes('get started') ||
                                     text.includes('browse all') ||
                                     text.includes('started');

                if (shouldScrollToContact) {
                    e.preventDefault();
                    // Scroll to contact section
                    const targetElement = document.querySelector('#contact');
                    if (targetElement) {
                        const headerHeight = header ? header.offsetHeight : 0;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
                // Logo clicks will naturally scroll to top (default behavior)
            });
        }
    });

    // Header Scroll Effect
    if (header) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add/remove scrolled class based on scroll position
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // Add reveal on scroll animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .product-card, .section-header').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Reserve button handler
function handleReserve() {
    alert('🛒 Reservation feature coming soon!\n\nWe\'re working hard to bring you the ability to reserve items for pickup. Stay tuned!');
}

// Hero search handler
function handleHeroSearch() {
    const searchInput = document.getElementById('heroSearchInput');
    const query = searchInput.value.trim();

    if (query) {
        alert(`🔍 Search for "${query}"\n\nSearch functionality coming soon! We\'re working hard to bring you real-time inventory search across local merchants.`);
    } else {
        alert('🔍 Search coming soon!\n\nWe\'re working hard to bring you real-time inventory search across local merchants.');
    }
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('heroSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleHeroSearch();
            }
        });
    }
});

// Contact form handler
function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    // In production, this would send to your backend API
    // For now, we'll show a success message and redirect to email
    const subject = encodeURIComponent(`BuildStop Pro Contact: ${data.subject}`);
    const body = encodeURIComponent(
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n\n` +
        `Message:\n${data.message}`
    );

    // Open email client with pre-filled information
    window.location.href = `mailto:support@buildstoppro.com?subject=${subject}&body=${body}`;

    // Show success message
    alert('Thank you for your message! Your email client has been opened with your message pre-filled.');

    // Reset form
    form.reset();
}
