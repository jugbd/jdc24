// Java Developers' Conference 2025 - JavaScript
// Main functionality for the landing page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initThemeSystem();
    initScrollAnimations();
    initCountdown();
    initSmoothScrolling();
    initLoadingAnimations();
    initPerformanceOptimizations();
    initFormHandling();
    initAccessibility();
});

/**
 * Initialize theme switching system
 */
function initThemeSystem() {
    // Create theme toggle button
    createThemeToggle();

    // Load saved theme or detect system preference
    loadTheme();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Create theme toggle button
 */
function createThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.setAttribute('title', 'Toggle between light and dark theme');
    themeToggle.innerHTML = '🌓';

    themeToggle.addEventListener('click', toggleTheme);

    document.body.appendChild(themeToggle);
}

/**
 * Load theme from localStorage or detect system preference
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(systemPrefersDark ? 'dark' : 'light');
    }
}

/**
 * Set theme and update UI
 * @param {string} theme - Theme name ('light', 'dark', or custom theme name)
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        switch(theme) {
            case 'dark':
                themeToggle.innerHTML = '☀️';
                themeToggle.setAttribute('title', 'Switch to light theme');
                break;
            case 'light':
                themeToggle.innerHTML = '🌙';
                themeToggle.setAttribute('title', 'Switch to dark theme');
                break;
            default:
                themeToggle.innerHTML = '🌓';
                themeToggle.setAttribute('title', 'Toggle theme');
        }
    }

    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    // Add visual feedback
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.style.transform = 'scale(1.2) rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    }
}

/**
 * Apply custom theme colors
 * @param {Object} colors - Object containing CSS custom property values
 * @example
 * applyCustomTheme({
 *   '--color-primary': '#3498db',
 *   '--color-bg-secondary': '#2c3e50'
 * })
 */
function applyCustomTheme(colors) {
    const root = document.documentElement;

    Object.entries(colors).forEach(([property, value]) => {
        if (property.startsWith('--')) {
            root.style.setProperty(property, value);
        }
    });

    // Save custom theme to localStorage
    localStorage.setItem('customTheme', JSON.stringify(colors));
    setTheme('custom');
}

/**
 * Load custom theme from localStorage
 */
function loadCustomTheme() {
    const customTheme = localStorage.getItem('customTheme');
    if (customTheme) {
        try {
            const colors = JSON.parse(customTheme);
            applyCustomTheme(colors);
        } catch (e) {
            console.error('Failed to load custom theme:', e);
        }
    }
}

/**
 * Reset to default theme
 */
function resetTheme() {
    localStorage.removeItem('theme');
    localStorage.removeItem('customTheme');

    // Remove custom properties
    const root = document.documentElement;
    const customProperties = Array.from(root.style).filter(prop => prop.startsWith('--'));
    customProperties.forEach(prop => {
        root.style.removeProperty(prop);
    });

    // Detect system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemPrefersDark ? 'dark' : 'light');
}

/**
 * Get current theme colors for dynamic styling
 * @returns {Object} Current theme color values
 */
function getCurrentThemeColors() {
    const computedStyle = getComputedStyle(document.documentElement);

    return {
        primary: computedStyle.getPropertyValue('--color-primary').trim(),
        primaryDark: computedStyle.getPropertyValue('--color-primary-dark').trim(),
        bgPrimary: computedStyle.getPropertyValue('--color-bg-primary').trim(),
        bgSecondary: computedStyle.getPropertyValue('--color-bg-secondary').trim(),
        textPrimary: computedStyle.getPropertyValue('--color-text-primary').trim(),
        textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim()
    };
}

/**
 * Update dynamic elements based on theme change
 */
function updateDynamicElements() {
    const colors = getCurrentThemeColors();

    // Update any dynamically generated elements
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.style.color = colors.textSecondary;
    });
}

// Listen for theme changes and update dynamic elements
window.addEventListener('themeChanged', updateDynamicElements);

/**
 * Initialize scroll-triggered animations
 * Sections fade in when they come into view
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('section:not(.hero)');

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections except hero
    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Initialize countdown timer
 * Counts down to the conference date: March 15, 2025
 */
function initCountdown() {
    // Conference date: March 15, 2025, 9:00 AM PST
    const conferenceDate = new Date('March 15, 2025 09:00:00 PST').getTime();

    // Get countdown elements
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    // Check if elements exist
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
        console.error('Countdown elements not found');
        return;
    }

    // Update countdown every second
    const countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const timeRemaining = conferenceDate - now;

        // Check if conference date has passed
        if (timeRemaining < 0) {
            clearInterval(countdownInterval);
            displayEventStarted();
            return;
        }

        // Calculate time units
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        // Update display with leading zeros
        daysElement.textContent = padZero(days);
        hoursElement.textContent = padZero(hours);
        minutesElement.textContent = padZero(minutes);
        secondsElement.textContent = padZero(seconds);

        // Add animation class for number changes
        animateCountdownChange(daysElement);
        animateCountdownChange(hoursElement);
        animateCountdownChange(minutesElement);
        animateCountdownChange(secondsElement);

    }, 1000);

    // Initial call to avoid delay
    const now = new Date().getTime();
    const timeRemaining = conferenceDate - now;

    if (timeRemaining > 0) {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        daysElement.textContent = padZero(days);
        hoursElement.textContent = padZero(hours);
        minutesElement.textContent = padZero(minutes);
        secondsElement.textContent = padZero(seconds);
    } else {
        displayEventStarted();
    }
}

/**
 * Add leading zero to numbers less than 10
 * @param {number} num - Number to format
 * @returns {string} - Formatted number with leading zero
 */
function padZero(num) {
    return num < 10 ? '0' + num : num.toString();
}

/**
 * Animate countdown number changes
 * @param {Element} element - Element to animate
 */
function animateCountdownChange(element) {
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

/**
 * Display message when event has started
 */
function displayEventStarted() {
    const countdownTimer = document.getElementById('countdown-timer');
    if (countdownTimer) {
        countdownTimer.innerHTML = `
            <div class="countdown-item" style="min-width: auto; padding: 2rem 3rem;">
                <span class="countdown-number" style="font-size: 2rem;">🎉</span>
                <span class="countdown-label">Event Started!</span>
            </div>
        `;
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    // Get all anchor links that start with #
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Calculate offset for better positioning
                const headerOffset = 80;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                // Smooth scroll to target
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Add visual feedback
                addScrollFeedback(targetElement);
            }
        });
    });
}

/**
 * Add visual feedback when scrolling to a section
 * @param {Element} element - Target element
 */
function addScrollFeedback(element) {
    element.style.transform = 'scale(1.02)';
    element.style.transition = 'transform 0.3s ease';

    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 300);
}

/**
 * Initialize loading animations for page elements
 */
function initLoadingAnimations() {
    // Hero section is already visible via CSS
    // Just ensure other sections can animate in
    const allSections = document.querySelectorAll('section');
    allSections.forEach(section => {
        if (section.classList.contains('hero')) {
            // Hero is already visible, just remove loading class if present
            section.classList.remove('loading');
        }
    });

    // Add entrance animations to interactive elements
    initButtonAnimations();
    initCardAnimations();
    initImageAnimations();
}

/**
 * Initialize button hover animations
 */
function initButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            // Remove ripple after animation
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize card hover animations
 */
function initCardAnimations() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // Add mouse move effect for subtle 3D tilt
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);

            // Apply subtle tilt effect
            this.style.transform = `
                perspective(1000px) 
                rotateX(${deltaY * 5}deg) 
                rotateY(${deltaX * 5}deg) 
                translateZ(10px)
            `;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

/**
 * Initialize image and carousel animations
 */
function initImageAnimations() {
    // Initialize carousel
    initCarousel();

    // Animate sponsor logos
    const sponsorLogos = document.querySelectorAll('.sponsor-logo');
    sponsorLogos.forEach((logo, index) => {
        logo.style.animationDelay = `${index * 0.1}s`;
        logo.classList.add('sponsor-animate');
    });

    // Add CSS for sponsor animation
    const style = document.createElement('style');
    style.textContent = `
        .sponsor-animate {
            animation: fadeInScale 0.6s ease forwards;
            opacity: 0;
        }
        
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize carousel functionality
 */
function initCarousel() {
    const track = document.getElementById('carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const nextButton = document.getElementById('carousel-next');
    const prevButton = document.getElementById('carousel-prev');
    const dots = document.querySelectorAll('.carousel-dot');

    if (!track || !slides.length || !nextButton || !prevButton) {
        console.error('Carousel elements not found');
        return;
    }

    let currentSlide = 0;
    let isAnimating = false;
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 seconds

    // Initialize carousel
    updateCarousel();
    startAutoPlay();

    // Next button event
    nextButton.addEventListener('click', () => {
        if (!isAnimating) {
            nextSlide();
        }
    });

    // Previous button event
    prevButton.addEventListener('click', () => {
        if (!isAnimating) {
            prevSlide();
        }
    });

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isAnimating && index !== currentSlide) {
                goToSlide(index);
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !isAnimating) {
            prevSlide();
        } else if (e.key === 'ArrowRight' && !isAnimating) {
            nextSlide();
        }
    });

    // Pause auto-play on hover
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold && !isAnimating) {
            if (diff > 0) {
                nextSlide(); // Swipe left - next slide
            } else {
                prevSlide(); // Swipe right - previous slide
            }
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
        resetAutoPlay();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
        resetAutoPlay();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
        resetAutoPlay();
    }

    function updateCarousel() {
        if (isAnimating) return;

        isAnimating = true;

        // Update track position
        const translateX = -currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;

        // Update active slide
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });

        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        // Reset animation flag after transition
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function startAutoPlay() {
        stopAutoPlay(); // Clear any existing interval
        autoPlayInterval = setInterval(() => {
            if (!isAnimating) {
                nextSlide();
            }
        }, autoPlayDelay);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    function resetAutoPlay() {
        startAutoPlay();
    }

    // Pause auto-play when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
}

/**
 * Utility function to debounce scroll events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
    // Optimize scroll events
    const optimizedScrollHandler = debounce(() => {
        // Add any scroll-based functionality here
        updateScrollProgress();
    }, 16); // ~60fps

    window.addEventListener('scroll', optimizedScrollHandler);
}

/**
 * Update scroll progress indicator (if needed in future)
 */
function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // Can be used to show scroll progress bar
    document.documentElement.style.setProperty('--scroll-progress', `${scrollPercent}%`);
}

/**
 * Handle form submissions (placeholder for future functionality)
 */
function initFormHandling() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Show loading state
            const submitButton = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Processing...';
                submitButton.disabled = true;

                // Simulate form processing
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    showNotification('Form submitted successfully!', 'success');
                }, 2000);
            }
        });
    });
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    // Add keyboard navigation for interactive elements
    const interactiveElements = document.querySelectorAll('.btn, .card, .gallery-item');

    interactiveElements.forEach(element => {
        // Make elements focusable
        if (!element.getAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }

        // Add keyboard event handling
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
        .btn:focus,
        .card:focus,
        .gallery-item:focus {
            outline: 2px solid #ff6b35;
            outline-offset: 2px;
        }
        
        /* Ensure proper contrast for accessibility */
        @media (prefers-contrast: high) {
            .card {
                border-width: 2px;
            }
            
            .btn {
                border-width: 3px;
            }
        }
        
        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initPerformanceOptimizations();
    initFormHandling();
    initAccessibility();
});

// Handle page visibility changes (pause animations when tab is not active)
document.addEventListener('visibilitychange', function() {
    const isVisible = !document.hidden;

    if (!isVisible) {
        // Pause animations when page is not visible
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when page becomes visible
        document.body.style.animationPlayState = 'running';
    }
});
