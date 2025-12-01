// ===========================================
// COMMON SCRIPT FOR ALL PAGES
// ============================================

// ===========================================
// LOADER
// ============================================

function showLoader(text = 'Loading...') {
    if (document.querySelector('.loader-overlay')) return;

    const body = document.querySelector("body");
    body.setAttribute("loading", "");

    const loaderOverlay = document.createElement("div");
    loaderOverlay.classList.add("loader-overlay");
    loaderOverlay.innerHTML = `
        <div class="loader-logo"></div>
        <div class="loader-progress">
            <div class="loader-progress-bar" id="loaderProgressBar"></div>
        </div>
        <div class="loader-text">${text}</div>
    `;
    body.appendChild(loaderOverlay);

    const progressBar = document.getElementById('loaderProgressBar');
    let progress = 0;

    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 90) progress = 90;
        if (progressBar) progressBar.style.width = progress + '%';
    }, 200);

    return {
        interval: progressInterval,
        element: loaderOverlay,
        progressBar: progressBar
    };
}

function hideLoader(loader) {
    if (!loader || !loader.element) return;

    clearInterval(loader.interval);
    if (loader.progressBar) loader.progressBar.style.width = '100%';

    setTimeout(() => {
        loader.element.classList.add('hidden');
        setTimeout(() => {
            const body = document.querySelector("body");
            if (body && loader.element.parentNode === body) {
                body.removeChild(loader.element);
            }
            body.removeAttribute("loading");
        }, 500);
    }, 500);
}


// ===========================================
// DATA FETCHER
// ============================================

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
}


// ===========================================
// POPULATE FOOTER
// ============================================

function populateFooter(footerContent) {
    const footer = document.querySelector('footer');
    if (!footer) return;

    footer.innerHTML = '';

    const footerContentDiv = document.createElement('div');
    footerContentDiv.classList.add('footer-content');

    const socialLinks = document.createElement('div');
    socialLinks.classList.add('social-links');

    if (footerContent.social) {
        footerContent.social.forEach((social) => {
            const link = document.createElement('a');
            link.href = social.link;
            link.textContent = social.name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.classList.add('social-link');
            socialLinks.appendChild(link);
        });
    }

    const copyright = document.createElement('p');
    copyright.classList.add('copyright');
    if (footerContent.copyright) {
        copyright.innerHTML = footerContent.copyright.replace('{{YYYY}}', new Date().getFullYear());
    }

    footerContentDiv.appendChild(socialLinks);
    footerContentDiv.appendChild(copyright);
    footer.appendChild(footerContentDiv);
}

// ===========================================
// MOBILE MENU
// ============================================

function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        window.addEventListener('scroll', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Handle menu item active states
        const menuItems = navLinks.querySelectorAll('a');
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        menuItems.forEach(item => {
            // For regular page links
            if (item.pathname === currentPath && !item.hash) {
                item.classList.add('active');
            }
            // For hash links on the same page
            else if (currentPath === item.pathname && item.hash === currentHash && currentHash) {
                item.classList.add('active');
            }

            item.addEventListener('click', () => {
                // Only handle activation for hash links on the same page
                if (item.pathname === window.location.pathname) {
                    menuItems.forEach(menuItem => {
                        if (menuItem.pathname === window.location.pathname) {
                            menuItem.classList.remove('active');
                        }
                    });
                    item.classList.add('active');
                }
            });
        });
    }
}
// ===========================================
// NAVBAR SCROLL EFFECT
// ============================================

function initializeNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar && window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else if (navbar) {
            navbar.classList.remove('scrolled');
        }
    });
}


// ===========================================
// SMOOTH SCROLLING
// ============================================

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const target = document.querySelector(targetId);

            if (target) {
                const navbar = document.getElementById('navbar');
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===========================================
// THEME TOGGLE FUNCTIONALITY (shared by all pages)
// ============================================

// Initialize theme ASAP to prevent flash of incorrect theme
(function() {
    try {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (_) {
        // fail silently
    }
})();

function initializeThemeToggle() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Avoid duplicating the toggle if already added
    if (document.getElementById('themeToggle')) return;

    const themeToggleItem = document.createElement('li');
    themeToggleItem.innerHTML = `
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme" title="Toggle theme">
            <div class="theme-toggle-slider">
                <span id="themeIcon">🌙</span>
            </div>
        </button>
    `;
    navLinks.appendChild(themeToggleItem);

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Set initial icon
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

    function setTheme(newTheme) {
        html.setAttribute('data-theme', newTheme);
        try { localStorage.setItem('theme', newTheme); } catch (_) {}
        themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
        if (typeof trackEvent === 'function') {
            try { trackEvent('Theme', 'Toggle', newTheme); } catch (_) {}
        }
    }

    function toggleTheme() {
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }

    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });

    // Listen for system theme changes if user hasn't set preference
    if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        // Newer browsers support addEventListener on MediaQueryList
        const mqListener = (e) => {
            try {
                if (!localStorage.getItem('theme')) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            } catch (_) {}
        };
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', mqListener);
        } else if (typeof mq.addListener === 'function') {
            mq.addListener(mqListener);
        }
    }

    // Sync theme across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme' && e.newValue) {
            html.setAttribute('data-theme', e.newValue);
            themeIcon.textContent = e.newValue === 'dark' ? '🌙' : '☀️';
        }
    });
}

// ===========================================
// INITIALIZE ALL COMMON FUNCTIONS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeToggle();
    initializeMobileMenu();
    initializeNavbarScroll();
    initializeSmoothScroll();

    // Centralized Service Worker registration for all pages in /2025/
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js?v19123200' )
                .then(registration => {
                    console.log('[SW] Registered with scope:', registration.scope);

                    // Proactively check for updates
                    try { registration.update(); } catch (_) {}

                    // Check again whenever tab becomes visible
                    document.addEventListener('visibilitychange', () => {
                        if (document.visibilityState === 'visible') {
                            try { registration.update(); } catch (_) {}
                        }
                    });

                    // Listen for new worker becoming active → reload page
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (!newWorker) return;

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'activated') {
                                console.log('[SW] New version activated → reloading...');
                                window.location.reload();
                            }
                        });
                    });
                })
                .catch(err => console.warn('[SW] Registration failed:', err));
        });
    }
});
