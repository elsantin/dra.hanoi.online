// script.js
// (Formerly drahanoi.js)

/**
 * Handles smooth scrolling to sections with an offset for the fixed navbar.
 * Uses getBoundingClientRect for potentially more accurate positioning.
 * @param {Event} event The click event.
 */
const handleSmoothScroll = (event) => {
    const link = event.target.closest('a.smooth-scroll-link'); // Find the link element
    if (!link) return; // Exit if the click wasn't on a valid link

    const targetId = link.getAttribute('href');
    // Basic check if it's an internal link starting with #
    if (targetId && targetId.startsWith('#')) {
        event.preventDefault(); // Prevent default anchor jump

        const targetElement = document.querySelector(targetId);
        const navbar = document.getElementById('navbar');

        if (targetElement && navbar) {
            const navbarHeight = navbar.offsetHeight;
            // Calculate position using getBoundingClientRect relative to viewport + current scroll position
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight - 24; // Increased offset to 24px

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // If it's the mobile menu, close it after clicking
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                 // Add timeout to allow scroll to start before closing menu
                 setTimeout(() => {
                    mobileMenu.classList.remove('open');
                    mobileMenu.classList.add('translate-x-full');
                    document.body.style.overflow = ''; // Restore scroll
                 }, 150); // Small delay
            }
        } else {
            console.warn(`Smooth scroll target "${targetId}" or navbar not found.`);
            // Fallback to default behavior if target/navbar not found
             window.location.hash = targetId;
        }
    }
    // If it's an external link (like WhatsApp), let the browser handle it (no preventDefault)
};


/**
 * Handles toggling the mobile navigation menu.
 */
const setupMobileMenu = () => {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    // Note: Smooth scroll for mobile links is handled by the global click listener

    if (menuToggle && closeMenu && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('open'); // Use class for transition
            mobileMenu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });

        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = ''; // Restore scroll
        });

    } else {
        console.warn("Mobile menu elements not found.");
    }
};

/**
 * Adds a background/shadow to the navbar when scrolling down.
 */
const setupNavbarScroll = () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        console.warn("Navbar element not found.");
        return;
    }

    const scrollThreshold = 50; // Pixels to scroll before changing navbar style

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });
};

/**
 * Sets up Intersection Observer to fade in elements when they enter the viewport.
 */
const setupFadeInAnimation = () => {
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length === 0) return; // No elements to observe

    const appearOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger a bit earlier
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
};

/**
 * Sets up the Back to Top button functionality.
 */
const setupBackToTopButton = () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;

    const scrollThreshold = 300; // Show button after scrolling 300px

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            backToTopButton.classList.add('show');
             backToTopButton.classList.remove('hidden'); // Use Tailwind class
             backToTopButton.classList.add('flex'); // Use Tailwind class
        } else {
            backToTopButton.classList.remove('show');
             backToTopButton.classList.add('hidden');
             backToTopButton.classList.remove('flex');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

/**
 * Updates the copyright year in the footer.
 */
const updateCopyrightYear = () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
};

/**
 * Adds basic client-side validation feedback to the contact form (optional).
 * Note: This does NOT submit the form. Backend integration is required.
 */
const setupContactForm = () => {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form && formStatus) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default browser submission

            // Basic validation check (can be expanded)
            const name = form.elements['name'].value;
            const email = form.elements['email'].value;
            const message = form.elements['message'].value;

            if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
                formStatus.textContent = 'Por favor, completa todos los campos requeridos.';
                formStatus.style.color = 'red';
                return;
            }

            // --- IMPORTANT ---
            // Here you would typically send the form data to a server
            // using fetch() or XMLHttpRequest.
            // Since there's no backend, we'll just show a success message.
            // Replace this with actual submission logic.
            // Example:
            // fetch('/api/contact', { method: 'POST', body: new FormData(form) })
            //   .then(response => response.json())
            //   .then(data => { ... handle success ... })
            //   .catch(error => { ... handle error ... });

            formStatus.textContent = '¡Gracias por tu mensaje! (Simulación - Formulario no conectado)';
            formStatus.style.color = 'green';
            form.reset(); // Clear the form

            // Remove the message after a few seconds
            setTimeout(() => {
                formStatus.textContent = '';
            }, 5000);
        });
    }
}

/**
 * Sets up the FAQ accordion functionality.
 */
const setupFAQAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (questionButton && answer) {
            questionButton.addEventListener('click', () => {
                // Toggle active class on the item
                const isActive = item.classList.toggle('active');

                // Toggle answer visibility based on active class
                if (isActive) {
                    // Set max-height to the scroll height to animate opening
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    // Set max-height to 0 to animate closing
                    answer.style.maxHeight = '0';
                }

                // Optional: Close other open items
                // faqItems.forEach(otherItem => {
                //     if (otherItem !== item && otherItem.classList.contains('active')) {
                //         otherItem.classList.remove('active');
                //         otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                //     }
                // });
            });

             // Set initial max-height to 0 for closed state
             if (!item.classList.contains('active')) {
                answer.style.maxHeight = '0';
            }
        }
    });
};


/**
 * Main function to run when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupNavbarScroll();
    setupBackToTopButton();
    updateCopyrightYear();
    setupContactForm(); // Initialize contact form handling (simulation)
    setupFAQAccordion(); // Initialize FAQ accordion

    // Add fade-in class to sections for animation (if desired)
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in'); // Add class to trigger observer
    });
    setupFadeInAnimation(); // Now call the observer setup

    // Add global click listener for smooth scroll links
    document.body.addEventListener('click', handleSmoothScroll);
});
