// script.js

/**
 * Handles toggling the mobile navigation menu.
 */
const setupMobileMenu = () => {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link'); // Use specific class

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

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                mobileMenu.classList.add('translate-x-full');
                document.body.style.overflow = '';
                // Smooth scroll to section
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    // Add timeout to allow menu closing animation
                    setTimeout(() => {
                         targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 150); // Adjust delay if needed
                }
            });
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
 * Main function to run when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupNavbarScroll();
    // Call fade-in animation setup - uncomment if elements with 'fade-in' class are added
    // setupFadeInAnimation();
    setupBackToTopButton();
    updateCopyrightYear();
    setupContactForm(); // Initialize contact form handling (simulation)

    // Add fade-in class to sections for animation (if desired)
    // You can be more selective about which sections get the animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in'); // Add class to trigger observer
    });
    setupFadeInAnimation(); // Now call the observer setup
});
