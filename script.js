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
 * Includes more robust response handling for non-JSON responses (like CAPTCHA pages).
 */
const setupContactForm = () => {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form && formStatus) {
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
                    'Accept': 'application/json' // Request JSON response
                }
            })
            .then(response => {
                const contentType = response.headers.get('content-type');
                if (response.ok) {
                    // If response is OK check content type
                    if (contentType && contentType.includes('application/json')) {
                        // It's JSON, process it
                        return response.json();
                    } else {
                        // It's OK but not JSON (likely FormSubmit success HTML page or unexpected response)
                        // We'll treat it as success but log the actual response
                        return response.text().then(text => {
                            console.warn("FormSubmit OK response but not JSON:", text);
                            // Simulate success data structure for the next .then()
                            return { success: true, message: "Respuesta recibida (no JSON)." };
                        });
                    }
                } else {
                    // Response is not OK (e.g., 4xx, 5xx error)
                    // Get the response body as text to include in the error
                    return response.text().then(text => {
                        // Try to extract a title or snippet from HTML error pages
                        const matchTitle = text.match(/<title>(.*?)<\/title>/i);
                        const matchH1 = text.match(/<h1[^>]*>(.*?)<\/h1>/i);
                        let detail = 'Respuesta inesperada del servidor.';
                        if (matchH1) {
                            detail = matchH1[1]; // Prefer H1 content
                        } else if (matchTitle) {
                            detail = matchTitle[1]; // Use title if no H1
                        } else if (text) {
                            // Use a snippet if no title/h1 found
                            detail = text.substring(0, 100) + (text.length > 100 ? '...' : '');
                        }
                        throw new Error(detail); // Throw an error with extracted detail
                    });
                }
            })
            .then(data => {
                // Handle successful submission (parsed JSON or simulated success)
                console.log('FormSubmit processed:', data); // Log the data received
                formStatus.textContent = '¡Mensaje enviado con éxito! Gracias.';
                formStatus.style.color = 'green';
                form.reset(); // Clear the form on success
                setTimeout(() => { formStatus.textContent = ''; }, 5000); // Clear status after 5s
            })
            .catch(error => {
                // Handle errors (network, non-ok response, JSON parsing failure on OK response)
                console.error('Error submitting form:', error);
                // Display the error message extracted or a default one
                formStatus.textContent = `Error al enviar: ${error.message || 'Intenta de nuevo.'}`;
                formStatus.style.color = 'red';
                 setTimeout(() => { formStatus.textContent = ''; }, 7000); // Clear status after 7s
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
    setupContactForm(); // Initialize contact form with improved AJAX submission
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
