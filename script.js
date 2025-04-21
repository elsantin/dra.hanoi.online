// script.js

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
                    mobileMenu.classList.remove('open'); // Use class toggle
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
 * Now relies solely on toggling the 'open' class.
 */
const setupMobileMenu = () => {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && closeMenu && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        });

        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
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
 * Sets up the contact form submission using Fetch API (AJAX) for FormSubmit.
 * Prevents page redirection and displays status messages locally.
 */
const setupContactForm = () => {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form && formStatus) {
        // Restore the event listener for AJAX submission
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default HTML form submission

            const formData = new FormData(form);
            const formAction = form.action; // Get the FormSubmit URL from the action attribute

            formStatus.textContent = 'Enviando...'; // Indicate submission start
            formStatus.style.color = 'gray';

            fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Important for FormSubmit AJAX
                }
            })
            .then(response => {
                // Check if response status is ok (e.g., 2xx)
                if (response.ok) {
                    return response.json(); // Parse JSON if response is ok
                } else {
                    // If response is not ok, try to parse potential error text
                    // FormSubmit might return errors as non-JSON, handle gracefully
                    return response.text().then(text => {
                        // Try to parse text as JSON in case error is structured
                        try {
                            const errorData = JSON.parse(text);
                            throw new Error(errorData.message || text || 'Error en la respuesta del servidor');
                        } catch (e) {
                            // If text is not JSON, use the text itself or a generic error
                            throw new Error(text || 'Error en la respuesta del servidor');
                        }
                    });
                }
            })
            .then(data => {
                // Handle successful JSON response
                // FormSubmit AJAX success response usually includes { success: true }
                console.log('FormSubmit success:', data);
                formStatus.textContent = '¡Mensaje enviado con éxito! Gracias.';
                formStatus.style.color = 'green';
                form.reset(); // Clear the form on success
                // Remove the message after a few seconds
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            })
            .catch(error => {
                // Handle errors (network error or non-ok response)
                console.error('Error submitting form:', error);
                formStatus.textContent = `Error al enviar: ${error.message || 'Intenta de nuevo.'}`;
                formStatus.style.color = 'red';
                 // Remove the message after a few seconds
                 setTimeout(() => {
                    formStatus.textContent = '';
                }, 7000); // Longer timeout for errors
            });
        });
    } else {
        if (!form) console.warn("Contact form element (#contact-form) not found.");
        if (!formStatus) console.warn("Form status element (#form-status) not found.");
    }
}

/**
 * Sets up the FAQ accordion functionality using max-height transition.
 */
const setupFAQAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = questionButton.querySelector('i'); // Get the icon for rotation

        if (questionButton && answer && icon) {
             // Ensure initial state is correct (closed) based on CSS max-height: 0
             answer.style.maxHeight = '0'; // Explicitly set initial max-height

            questionButton.addEventListener('click', () => {
                // Toggle active class on the item for icon rotation etc.
                const isActive = item.classList.toggle('active');

                // Set max-height for animation
                if (isActive) {
                    // Set max-height to the scroll height to animate opening
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    // Set max-height to 0 to animate closing
                    answer.style.maxHeight = '0';
                }

                // Optional: Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-answer').style.maxHeight = '0'; // Close others
                    }
                });
            });
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
    setupContactForm(); // Initialize contact form with AJAX submission restored
    setupFAQAccordion(); // Initialize FAQ accordion

    // Add fade-in class to sections for animation (if desired)
    const sections = document.querySelectorAll('section:not(#faq)'); // Example: Exclude FAQ
    sections.forEach(section => {
        section.classList.add('fade-in'); // Add class to trigger observer
    });
     // Apply fade-in to FAQ separately if desired, maybe with a slight delay?
     const faqSection = document.getElementById('faq');
     if (faqSection) {
         faqSection.classList.add('fade-in');
     }
    setupFadeInAnimation(); // Now call the observer setup

    // Add global click listener for smooth scroll links
    document.body.addEventListener('click', handleSmoothScroll);
});
