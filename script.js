// script.js
// (Formerly drahanoi.js)

/**
 * Handles smooth scrolling to sections with an offset for the fixed navbar.
 * Uses getBoundingClientRect for potentially more accurate positioning.
 * @param {Event} event The click event.
 */
const handleSmoothScroll = (event) => {
    // Find the closest ancestor anchor link with the specific class
    const link = event.target.closest('a.smooth-scroll-link');
    if (!link) return; // Exit if the click wasn't on or inside a valid link

    const targetId = link.getAttribute('href');
    // Check if it's an internal link (starts with #)
    if (targetId && targetId.startsWith('#')) {
        event.preventDefault(); // Prevent default anchor jump for internal links

        const targetElement = document.querySelector(targetId);
        const navbar = document.getElementById('navbar');

        if (targetElement && navbar) {
            const navbarHeight = navbar.offsetHeight;
            // Calculate target position: element's top relative to viewport + current scroll - navbar height - offset
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight - 24; // Increased offset

            // Perform smooth scroll
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close the mobile menu if it's open after clicking an internal link
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                // Use a small delay to ensure the scroll starts before the menu visually closes
                setTimeout(() => {
                    mobileMenu.classList.remove('open'); // <<< SIMPLIFIED: Only remove 'open' class
                    document.body.style.overflow = ''; // Restore scrolling on the body
                }, 150); // 150ms delay
            }
        } else {
            // Warn if the target element or navbar isn't found
            console.warn(`Smooth scroll target "${targetId}" or navbar not found.`);
            // Fallback to default browser behavior if elements are missing
             window.location.hash = targetId;
        }
    }
    // If it's not an internal link (e.g., external link like WhatsApp), the default browser behavior occurs
};


/**
 * Handles toggling the mobile navigation menu visibility.
 * Relies on adding/removing the 'open' class; CSS handles the transition.
 */
const setupMobileMenu = () => {
    const menuToggle = document.getElementById('menu-toggle'); // Hamburger button
    const closeMenu = document.getElementById('close-menu');   // Close button (X)
    const mobileMenu = document.getElementById('mobile-menu'); // The menu container itself

    // Check if all required elements exist
    if (menuToggle && closeMenu && mobileMenu) {
        // Listener for the hamburger button to open the menu
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('open'); // Add 'open' class to trigger CSS transition/styles
            document.body.style.overflow = 'hidden'; // Prevent background scrolling when menu is open
        });

        // Listener for the close button (X) to close the menu
        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('open'); // Remove 'open' class to trigger CSS transition/styles
            document.body.style.overflow = ''; // Restore background scrolling
        });

    } else {
        // Warn if any menu element is missing
        console.warn("Mobile menu elements (toggle, close, or menu itself) not found.");
    }
};

/**
 * Adds a background/shadow style to the navbar when the user scrolls down.
 */
const setupNavbarScroll = () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        console.warn("Navbar element not found for scroll effect.");
        return; // Exit if navbar doesn't exist
    }

    const scrollThreshold = 50; // Number of pixels to scroll before applying the style

    // Listen for scroll events on the window
    window.addEventListener('scroll', () => {
        // Check if the vertical scroll position exceeds the threshold
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('nav-scrolled'); // Add class defined in CSS
        } else {
            navbar.classList.remove('nav-scrolled'); // Remove class
        }
    });
};

/**
 * Sets up Intersection Observer to fade in elements as they enter the viewport.
 */
const setupFadeInAnimation = () => {
    // Select all elements intended to fade in
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length === 0) return; // Exit if no elements have the class

    // Configuration for the Intersection Observer
    const appearOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Start animation slightly before element fully enters viewport
    };

    // Create the observer instance
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // If the element is intersecting (visible)
            if (entry.isIntersecting) {
                entry.target.classList.add('appear'); // Add class to trigger CSS fade-in animation
                observer.unobserve(entry.target); // Stop observing this element once it has appeared
            }
        });
    }, appearOptions);

    // Observe each element with the .fade-in class
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
};

/**
 * Sets up the Back to Top button: shows it on scroll, hides it near the top,
 * and scrolls to top on click.
 */
const setupBackToTopButton = () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return; // Exit if button doesn't exist

    const scrollThreshold = 300; // Pixels to scroll before showing the button

    // Listener for window scroll events
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            // Show button: Use 'show' class for CSS transitions and Tailwind classes for display
            backToTopButton.classList.add('show');
            backToTopButton.classList.remove('hidden');
            backToTopButton.classList.add('flex'); // Use flex for centering icon
        } else {
            // Hide button
            backToTopButton.classList.remove('show');
            backToTopButton.classList.add('hidden');
            backToTopButton.classList.remove('flex');
        }
    });

    // Listener for clicking the button
    backToTopButton.addEventListener('click', () => {
        // Smoothly scroll the window to the top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

/**
 * Updates the copyright year displayed in the footer.
 */
const updateCopyrightYear = () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        // Set the text content to the current full year
        yearSpan.textContent = new Date().getFullYear();
    }
};

/**
 * Adds basic client-side validation feedback to the contact form.
 * IMPORTANT: This does NOT actually submit the form data.
 * Backend integration (e.g., using fetch to send data to a server) is required for real submission.
 */
const setupContactForm = () => {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status'); // Element to display messages

    if (form && formStatus) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default browser form submission

            // --- Basic Client-Side Validation ---
            const name = form.elements['name'].value;
            const email = form.elements['email'].value;
            const message = form.elements['message'].value;

            // Check if required fields are empty (trim whitespace)
            if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
                formStatus.textContent = 'Por favor, completa todos los campos requeridos.';
                formStatus.style.color = 'red'; // Indicate error
                return; // Stop processing if validation fails
            }

            // --- Form Submission Simulation ---
            // In a real application, you would send the data here using fetch()

            // --- Simulation Feedback ---
            formStatus.textContent = '¡Gracias por tu mensaje! (Simulación - Formulario no conectado)';
            formStatus.style.color = 'green'; // Indicate success (simulation)
            form.reset(); // Clear the form fields

            // Clear the status message after a few seconds
            setTimeout(() => {
                formStatus.textContent = '';
            }, 5000); // 5 seconds
        });
    }
}

/**
 * Sets up the FAQ accordion functionality using max-height for smooth transitions.
 * Relies on toggling an 'active' class on the parent item.
 */
const setupFAQAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item'); // Get all FAQ items

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question'); // Button to click
        const answer = item.querySelector('.faq-answer');           // Content to show/hide

        if (questionButton && answer) {
            // Set initial state based on CSS (max-height: 0)
            if (!item.classList.contains('active')) {
                 answer.style.maxHeight = '0';
            }

            // Add click listener to the question button
            questionButton.addEventListener('click', () => {
                // Toggle the 'active' class on the faq-item container
                const isActive = item.classList.toggle('active');

                // Set max-height based on the 'active' state
                if (isActive) {
                    // If now active, set max-height to the content's scroll height for opening animation
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    // If now inactive, set max-height to 0 for closing animation
                    answer.style.maxHeight = '0';
                }

                // --- Optional: Close other open FAQ items ---
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
 * --- NEW: Sets up a subtle parallax effect for the hero section background gradient ---
 */
const setupHeroParallax = () => {
    const heroSection = document.getElementById('hero-section'); // Use the ID added in HTML
    if (!heroSection) {
        console.warn("Hero section element not found for parallax effect.");
        return;
    }

    // Apply effect only on larger screens (optional)
    if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint
        heroSection.style.backgroundPositionY = '0px'; // Reset on mobile
        return;
    }


    window.addEventListener('scroll', () => {
        // Calculate a slower scroll speed for the background position
        // Adjust the multiplier (e.g., 0.3) to control the speed difference
        const scrollPosition = window.scrollY;
        const parallaxOffset = scrollPosition * 0.3; // Move background slower than scroll

        // Apply the calculated offset to the background-position-y
        // Use requestAnimationFrame for smoother performance (optional but recommended)
        window.requestAnimationFrame(() => {
             heroSection.style.backgroundPositionY = `${parallaxOffset}px`;
        });
    });
};


/**
 * Main function to run when the DOM is fully loaded.
 * Initializes all the different functionalities.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    setupMobileMenu();
    setupNavbarScroll();
    setupBackToTopButton();
    updateCopyrightYear();
    setupContactForm(); // Initialize contact form handling (simulation)
    setupFAQAccordion(); // Initialize FAQ accordion
    setupHeroParallax(); // <<< NEW: Initialize hero parallax effect

    // Prepare elements for fade-in animation
    const sections = document.querySelectorAll('section'); // Apply to all sections now
    sections.forEach(section => {
        section.classList.add('fade-in'); // Add class to elements that should fade in
    });
    setupFadeInAnimation(); // Start observing the elements

    // Add the global click listener for smooth scrolling links
    document.body.addEventListener('click', handleSmoothScroll);
});
