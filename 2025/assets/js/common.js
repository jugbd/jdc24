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
// CUSTOM CURSOR
// ============================================
function initializeCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    let posX = 0;
    let posY = 0;
    let mouseX = 0;
    let mouseY = 0;

    if (!cursor || !follower) return;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    requestAnimationFrame(function animate() {
        posX += (mouseX - posX) / 9;
        posY += (mouseY - posY) / 9;

        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        follower.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

        requestAnimationFrame(animate);
    });


    document.querySelectorAll('a, button, .filter-btn, .session-card, .menu-toggle').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });
}


// ===========================================
// INITIALIZE ALL COMMON FUNCTIONS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeNavbarScroll();
    initializeSmoothScroll();
    initializeCustomCursor();
});
