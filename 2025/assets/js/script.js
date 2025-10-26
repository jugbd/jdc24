

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance optimization
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// SCROLL INDICATOR
// ============================================

// Show/hide scroll indicator based on scroll position
window.addEventListener('scroll', () => {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    if (window.scrollY === 0) {
        indicator.classList.remove('hide');
    } else {
        indicator.classList.add('hide');
    }
});

// ============================================
// ENHANCED LOADING STATE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const loader = showLoader('Loading content...');

    try {
        const content = await fetchData("./assets/data/payload.json");

        // Populate all sections
        populateHero(content.hero);
        populateAbout(content.about);
        populateGallery(content.gallery);
        populateWhyJDC(content.whyJdc);
        populateSpeakers(content.speakers);
        populateSessionPreview(content.sessions);
        populateCountdown(content.countdown, content.hero);
        populateSponsors(content.sponsors);
        populateTeam(content.ourTeam);
        populateLocation(content.location);
        populateFooter(content.footer);
        handleHashScroll();
    } catch (e) {
        console.error(e.message);
        if (loader && loader.element) {
            const loaderText = loader.element.querySelector('.loader-text');
            if (loaderText) {
                loaderText.textContent = 'Error loading content. Please refresh.';
            }
        }
    } finally {
        hideLoader(loader);
        initializeIntersectionObserver();
        initializeBackToTop();
    }
});

function handleHashScroll() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
}


// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

function initializeIntersectionObserver() {
    // Fallback: if IntersectionObserver is not supported, reveal all sections immediately
    if (typeof window.IntersectionObserver !== 'function') {
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('fade-in-section', 'visible');
        });
        return;
    }

    // Be more permissive so elements reveal as user scrolls down
    const observerOptions = {
        threshold: 0, // trigger as soon as any pixel is visible
        rootMargin: '0px 0px -20% 0px' // allow earlier trigger before fully in view
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve once visible to prevent repeated work
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections (including those without IDs, to avoid missing content)
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });
}

// ============================================
// HERO SECTION
// ============================================

const populateHero = (heroContent) => {
    const hero = document.getElementById("hero")?.querySelector('.hero-content');
    if (!hero) return;
    hero.innerHTML = '';
    hero.setAttribute('role', 'banner');

    const title = document.createElement("h1");
    title.classList.add('hero-title', 'glitch');
    title.innerHTML = heroContent.title;

    const subtitle = document.createElement("p");
    subtitle.classList.add('hero-subtitle');
    subtitle.innerHTML = heroContent.edition;

    // TODO: Enable link to register
    // const cta = document.createElement("a");
    const cta = document.createElement("div");
    cta.classList.add('cta-button');
    cta.innerHTML = heroContent.cta.text;
    // cta.setAttribute("href", heroContent.cta.link);
    // cta.setAttribute("target", "_blank");
    // cta.setAttribute("rel", "noopener noreferrer");

    hero.appendChild(title);
    hero.appendChild(subtitle);
    hero.appendChild(cta);
};

// ============================================
// ABOUT SECTION
// ============================================

const populateAbout = (aboutContent) => {
    const about = document.getElementById("about");
    if (!about) return;
    about.innerHTML = '';

    const aboutContentDiv = document.createElement("div");
    aboutContentDiv.classList.add("about-content");

    const aboutText = document.createElement("div");
    aboutText.classList.add("about-text");

    const sectionTag = document.createElement("span");
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "About the Event";

    const title = document.createElement("h2");
    title.classList.add('section-title', 'gradient-text');
    title.innerHTML = aboutContent.title;

    const description = document.createElement("p");
    description.classList.add('about-description');
    description.innerHTML = aboutContent.description;

    aboutText.appendChild(sectionTag);
    aboutText.appendChild(title);
    aboutText.appendChild(description);
    aboutContentDiv.appendChild(aboutText);
    about.appendChild(aboutContentDiv);
};

// ============================================
// GALLERY SECTION
// ============================================

const populateGallery = (galleryImages) => {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return;

    gallerySection.innerHTML = `
        <div class="gallery-header">
            <span class="section-tag">Memories</span>
            <h2 class="section-title gradient-text">From Our Past Events</h2>
        </div>
        <div class="image-carousel-container" role="region" aria-label="Image Carousel">
            <div class="carousel-track-container">
                <ul class="carousel-track"></ul>
            </div>
            <div class="carousel-nav">
                <button class="carousel-button prev" aria-label="Previous Slide">&#10094;</button>
                <button class="carousel-button next" aria-label="Next Slide">&#10095;</button>
            </div>
            <div class="carousel-indicators"></div>
        </div>
    `;

    const track = gallerySection.querySelector('.carousel-track');
    const indicatorsContainer = gallerySection.querySelector('.carousel-indicators');

    galleryImages.forEach((image, index) => {
        // Create slide
        const slide = document.createElement('li');
        slide.className = 'carousel-slide';
        if (index === 0) slide.classList.add('active');
        slide.innerHTML = `<img src="${image}" alt="Gallery image ${index + 1}" loading="lazy">`;
        track.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('button');
        indicator.className = 'carousel-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
        indicator.dataset.index = index;
        indicatorsContainer.appendChild(indicator);
    });

    const slides = Array.from(track.children);
    const indicators = Array.from(indicatorsContainer.children);
    const nextButton = gallerySection.querySelector('.next');
    const prevButton = gallerySection.querySelector('.prev');
    const slideWidth = slides.length > 0 ? slides[0].getBoundingClientRect().width : 0;

    let currentIndex = 0;
    let autoPlayInterval;

    const updateCarousel = (targetIndex) => {
        if(slides.length === 0) return;
        const currentSlide = slides[currentIndex];
        const targetSlide = slides[targetIndex];

        // Move slides
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('active');
        targetSlide.classList.add('active');

        // Update indicators
        indicators[currentIndex].classList.remove('active');
        indicators[targetIndex].classList.add('active');

        currentIndex = targetIndex;
    };

    const setSlidePositions = () => {
        if(slides.length === 0) return;
        const currentSlideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach((slide, index) => {
            slide.style.left = currentSlideWidth * index + 'px';
        });
    };

    const nextSlide = () => {
        if(slides.length === 0) return;
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
    };

    const prevSlide = () => {
        if(slides.length === 0) return;
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel(prevIndex);
    };

    const startAutoPlay = () => {
        stopAutoPlay(); // Prevent multiple intervals
        autoPlayInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    // Event Listeners
    nextButton.addEventListener('click', () => {
        stopAutoPlay();
        nextSlide();
        startAutoPlay();
    });

    prevButton.addEventListener('click', () => {
        stopAutoPlay();
        prevSlide();
        startAutoPlay();
    });

    indicatorsContainer.addEventListener('click', e => {
        const targetIndicator = e.target.closest('button');
        if (!targetIndicator) return;

        stopAutoPlay();
        const targetIndex = parseInt(targetIndicator.dataset.index, 10);
        updateCarousel(targetIndex);
        startAutoPlay();
    });

    // Swipe support
    let touchstartX = 0;
    let touchendX = 0;

    track.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        if (touchendX < touchstartX - 50) nextSlide();
        if (touchendX > touchstartX + 50) prevSlide();
        startAutoPlay();
    });

    // Initial setup
    setSlidePositions();
    startAutoPlay();

    // Recalculate on resize
    window.addEventListener('resize', debounce(() => {
        setSlidePositions();
        track.style.transition = 'none'; // Disable transition during resize adjustment
        if(slides.length > 0){
             track.style.transform = 'translateX(-' + slides[currentIndex].style.left + ')';
        }
        setTimeout(() => {
            track.style.transition = '';
        }, 50);
    }, 250));
};


// ============================================
// WHY JDC SECTION
// ============================================

const populateWhyJDC = (whyJDC) => {
    const whySection = document.getElementById("why-jdc");
    if (!whySection) return;
    whySection.innerHTML = '';

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "Why Attend";
    whySection.appendChild(sectionTag);

    const title = document.createElement('h2');
    title.innerHTML = whyJDC.why.title;
    title.classList.add('section-title', 'gradient-text');
    whySection.appendChild(title);

    const itemsGrid = document.createElement('div');
    itemsGrid.classList.add('why-grid');

    whyJDC.why.items.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('why-card');
        card.style.animationDelay = `${index * 0.1}s`;

        const itemTitle = document.createElement('h3');
        itemTitle.textContent = item.title;
        itemTitle.classList.add('why-card-title');

        const itemBody = document.createElement('p');
        itemBody.textContent = item.body;
        itemBody.classList.add('why-card-body');

        card.append(itemTitle, itemBody);
        itemsGrid.appendChild(card);
    });

    whySection.appendChild(itemsGrid);
};

// ============================================
// SPEAKERS SECTION WITH MODAL
// ============================================

const populateSpeakers = (speakers) => {
    const speakersSection = document.getElementById('speakers');
    if (!speakersSection) return;
    speakersSection.innerHTML = '';

    const header = document.createElement('div');
    header.classList.add('speakers-header');

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "Featured Speakers";

    const title = document.createElement('h2');
    title.innerHTML = "Learn from the Best";
    title.classList.add('section-title', 'gradient-text');

    header.appendChild(sectionTag);
    header.appendChild(title);
    speakersSection.appendChild(header);

    const speakerGrid = document.createElement('div');
    speakerGrid.classList.add('speakers-grid');

    createSpeakerModal();

    speakers.forEach((speaker, idx) => {
        const speakerCard = document.createElement('div');
        speakerCard.classList.add('speaker-card');
        speakerCard.setAttribute('tabindex', '0');
        speakerCard.setAttribute('role', 'button');
        speakerCard.setAttribute('aria-label', `View ${speaker.fullName}'s details`);

        speakerCard.innerHTML = `
            <img src="${speaker.image}" alt="${speaker.fullName}" class="speaker-image" loading="lazy">
            <div class="speaker-info">
                <h3 class="speaker-name">${speaker.fullName}</h3>
                <p class="speaker-company">${speaker.company}</p>
            </div>
        `;

        speakerCard.addEventListener('click', () => showSpeakerModal(speaker));
        speakerCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showSpeakerModal(speaker);
            }
        });

        speakerGrid.appendChild(speakerCard);
    });

    speakersSection.appendChild(speakerGrid);
};

// Create speaker modal structure
function createSpeakerModal() {
    if (document.getElementById('speaker-modal-overlay')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'speaker-modal-overlay';
    modalOverlay.className = 'speaker-modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'speaker-modal-name');

    modalOverlay.innerHTML = `
        <div class="speaker-modal">
            <button class="speaker-modal-close" aria-label="Close modal"></button>
            <div class="speaker-modal-content">
                <div class="speaker-modal-header">
                    <img class="speaker-modal-image" src="" alt="">
                    <div class="speaker-modal-info">
                        <h2 class="speaker-modal-name" id="speaker-modal-name"></h2>
                        <p class="speaker-modal-title"></p>
                        <p class="speaker-modal-company"></p>
                    </div>
                </div>
                <div class="speaker-modal-bio">
                    <h3>Biography</h3>
                    <p></p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeSpeakerModal();
        }
    });

    // Close button
    const closeBtn = modalOverlay.querySelector('.speaker-modal-close');
    closeBtn.addEventListener('click', closeSpeakerModal);

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSpeakerModal();
        }
    });
}

// Show speaker modal
function showSpeakerModal(speaker) {
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    if (!modalOverlay) return;

    const previouslyFocused = document.activeElement;

    const modal = modalOverlay.querySelector('.speaker-modal');
    modal.querySelector('.speaker-modal-image').src = speaker.image;
    modal.querySelector('.speaker-modal-image').alt = speaker.fullName;
    modal.querySelector('.speaker-modal-name').textContent = speaker.fullName;
    modal.querySelector('.speaker-modal-title').textContent = speaker.title || speaker.designation || 'Speaker';
    modal.querySelector('.speaker-modal-company').textContent = speaker.company;
    modal.querySelector('.speaker-modal-bio p').innerHTML = speaker.bio || 'Biography coming soon...';

    if (speaker.experience) {
        detailsContainer.innerHTML += `
            <div class="speaker-detail-item">
                <div class="speaker-detail-label">Experience</div>
                <div class="speaker-detail-value">${speaker.experience}</div>
            </div>
        `;
    }

    if (speaker.expertise) {
        detailsContainer.innerHTML += `
            <div class="speaker-detail-item">
                <div class="speaker-detail-label">Expertise</div>
                <div class="speaker-detail-value">${speaker.expertise}</div>
            </div>
        `;
    }

    if (speaker.sessionTopic) {
        detailsContainer.innerHTML += `
            <div class="speaker-detail-item">
                <div class="speaker-detail-label">Session Topic</div>
                <div class="speaker-detail-value">${speaker.sessionTopic}</div>
            </div>
        `;
    }

    modalOverlay.classList.add('active');
    document.body.classList.add('modal-open');

    modalOverlay.dataset.previousFocus = previouslyFocused;
    setTimeout(() => {
        modalOverlay.querySelector('.speaker-modal-close').focus();
    }, 100);
}

// Close speaker modal
function closeSpeakerModal() {
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');

        const previousFocus = modalOverlay.dataset.previousFocus;
        if (previousFocus) {
            previousFocus.focus();
        }
    }
}

// Mobile swipe to close modal
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    const modal = document.querySelector('.speaker-modal');
    if (modal && modal.contains(e.target)) {
        touchStartY = e.changedTouches[0].screenY;
    }
});

document.addEventListener('touchend', (e) => {
    const modal = document.querySelector('.speaker-modal');
    if (modal && modal.contains(e.target)) {
        touchEndY = e.changedTouches[0].screenY;
        if (touchEndY - touchStartY > 100) {
            closeSpeakerModal();
        }
    }
});

// ============================================
// TEAM SECTION
// ============================================

const populateTeam = (teamMembers) => {
    const teamSection = document.getElementById('our-team');
    if (!teamSection) return;
    teamSection.innerHTML = '';

    const header = document.createElement('div');
    header.classList.add('speakers-header');

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "Our Team";

    const title = document.createElement('h2');
    title.innerHTML = "Meet the Organizers";
    title.classList.add('section-title', 'gradient-text');

    header.appendChild(sectionTag);
    header.appendChild(title);
    teamSection.appendChild(header);

    const teamGrid = document.createElement('div');
    teamGrid.classList.add('speakers-grid');

    teamMembers.forEach(member => {
        const teamCard = document.createElement('div');
        teamCard.classList.add('speaker-card');

        teamCard.innerHTML = `
            <img src="${member.image}" alt="${member.fullName}" class="speaker-image" loading="lazy">
            <div class="speaker-info">
                <h3 class="speaker-name">${member.fullName}</h3>
                <p class="speaker-company">${member.company}</p>
            </div>
        `;

        teamGrid.appendChild(teamCard);
    });

    teamSection.appendChild(teamGrid);
};

// ============================================
// SPONSORS SECTION
// ============================================

const populateSponsors = (sponsors) => {
    const sponsorsSection = document.getElementById('sponsors');
    if (!sponsorsSection || !sponsors) return;
    sponsorsSection.innerHTML = '';

    const header = document.createElement('div');
    header.classList.add('sponsors-header');

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "Partners & Sponsors";

    const subtitle = document.createElement('h2');
    const title = document.createElement('h1');
    subtitle.innerHTML = "Fueling the Future of Java";
    title.innerHTML = "This year our proud sponsor";
    subtitle.classList.add('section-subtitle');
    title.classList.add('section-title', 'gradient-text');

    header.appendChild(sectionTag);
    header.appendChild(subtitle);
    header.appendChild(title);
    sponsorsSection.appendChild(header);

    const sponsorGrid = document.createElement('div');
    sponsorGrid.classList.add('sponsors-grid');

    sponsors.forEach(sponsor => {
        const sponsorCard = document.createElement('a');
        sponsorCard.classList.add('sponsor-card');
        sponsorCard.href = sponsor.website;
        sponsorCard.target = '_blank';
        sponsorCard.rel = 'noopener noreferrer';
        sponsorCard.setAttribute('aria-label', `Visit ${sponsor.name}`);

        sponsorCard.innerHTML = `
            <img src="${sponsor.logo}" alt="${sponsor.name} Logo" class="sponsor-logo" loading="lazy">
        `;

        sponsorGrid.appendChild(sponsorCard);
    });

    sponsorsSection.appendChild(sponsorGrid);
};


// ============================================
// COUNTDOWN SECTION
// ============================================

const populateCountdown = (cdC) => {
    const countdown = document.getElementById('countdown');
    if (!countdown) return;
    countdown.innerHTML = '';

    const countdownContent = document.createElement('div');
    countdownContent.classList.add('countdown-content');

    const title = document.createElement('h2');
    title.classList.add('countdown-title', 'gradient-text');
    title.innerHTML = cdC.title.replace('\n', '<br>');

    const timerContainer = document.createElement('div');
    timerContainer.classList.add('timer-container');

    timerContainer.innerHTML = `
        <div class="timer-block">
            <span class="timer-number" id="days">00</span>
            <span class="timer-label">Days</span>
        </div>
        <div class="timer-block">
            <span class="timer-number" id="hours">00</span>
            <span class="timer-label">Hours</span>
        </div>
        <div class="timer-block">
            <span class="timer-number" id="minutes">00</span>
            <span class="timer-label">Minutes</span>
        </div>
        <div class="timer-block">
            <span class="timer-number" id="seconds">00</span>
            <span class="timer-label">Seconds</span>
        </div>
    `;

    const eventDate = document.createElement('p');
    eventDate.classList.add('event-date');
    eventDate.innerHTML = cdC.subsection.date;

    const ctaButton = document.createElement('a');
    ctaButton.classList.add('cta-button');
    ctaButton.href = cdC.subsection.link.url;
    ctaButton.target = '_blank';
    ctaButton.rel = 'noopener noreferrer';
    ctaButton.innerHTML = cdC.subsection.link.text;

    countdownContent.appendChild(title);
    countdownContent.appendChild(timerContainer);
    countdownContent.appendChild(eventDate);
    countdownContent.appendChild(ctaButton);
    countdown.appendChild(countdownContent);

    const targetDate = new Date(cdC.targetDate).getTime();

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = targetDate - now;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
};

// ============================================
// VENUE/LOCATION SECTION
// ============================================

const populateLocation = (location) => {
    const venue = document.getElementById('venue');
    if (!venue) return;
    venue.innerHTML = '';

    const venueContent = document.createElement('div');
    venueContent.classList.add('venue-content');

    const venueInfo = document.createElement('div');
    venueInfo.classList.add('venue-info');

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.textContent = "Event Venue";
    venueInfo.appendChild(sectionTag);

    const title = document.createElement('h2');
    title.classList.add('section-title', 'gradient-text');
    title.textContent = location.title;
    venueInfo.appendChild(title);

    const description = document.createElement('p');
    description.classList.add('about-description');
    description.textContent = location.description;
    venueInfo.appendChild(description);

    const addressCard = document.createElement('div');
    addressCard.classList.add('address-card');

    addressCard.innerHTML = `
        <h3>Conference Center</h3>
        <p>📍 ${location.address?.name || 'N/A'}</p>
        <p>🏢 ${location.address?.street || ''}</p>
        <p>🌆 ${location.address?.city || ''}</p>
        <p>📧 <a href="mailto:${location.email}">${location.email}</a></p>
    `;
    venueInfo.appendChild(addressCard);

    const venueMap = document.createElement('div');
    venueMap.classList.add('venue-map');
    venueMap.innerHTML = location.mapEmbed;

    venueContent.appendChild(venueMap);
    venueContent.appendChild(venueInfo);
    venue.appendChild(venueContent);
};

// ============================================
// SESSION SECTION POPULATION
// ============================================

const populateSessionPreview = (sessionsData) => {
    const sessionSection = document.getElementById('session');
    if (!sessionSection) return;

    // Hide featured session items and show a Coming Soon card instead
    sessionSection.innerHTML = '';

    const header = document.createElement('div');
    header.classList.add('session-preview-header');
    header.innerHTML = `
        <span class="section-tag">Conference Sessions</span>
        <h2 class="section-title gradient-text">Sessions</h2>
        <p class="section-description">
            Our team is curating an amazing set of talks. Stay tuned!
        </p>
    `;
    sessionSection.appendChild(header);

    const comingSoon = document.createElement('div');
    comingSoon.classList.add('session-preview-grid');
    comingSoon.innerHTML = `
        <div class="session-preview-card" style="text-align:center; padding: 2rem; width:100%;">
            <h3 class="session-preview-title">Sessions are coming soon</h3>
            <p class="session-preview-excerpt">Check back later to see the featured sessions for JDC 2025.</p>
        </div>
    `;

    sessionSection.appendChild(comingSoon);

    // Keep original rendering logic commented out for future use
    // The original homepage session preview rendering is preserved below as comments.
    // To re-enable featured sessions, remove the comment markers and adjust as needed.
    //
    // const previewGrid = document.createElement('div');
    // previewGrid.classList.add('session-preview-grid');
    //
    // const featuredSessions = sessionsData.slice(0, 3);
    //
    // featuredSessions.forEach((session, index) => {
    //     const card = document.createElement('div');
    //     card.classList.add('session-preview-card');
    //     card.style.animationDelay = `${index * 0.1}s`;
    //
    //     card.innerHTML = `
    //         <div class="session-preview-badge">${session.track}</div>
    //         <div class="session-preview-time">
    //             <span class="preview-time">${session.time}</span>
    //             <span class="preview-duration">${session.duration}</span>
    //         </div>
    //         <h3 class="session-preview-title">${session.title}</h3>
    //         <p class="session-preview-excerpt">${session.abstract.substring(0, 150)}...</p>
    //         <div class="session-preview-speaker">
    //             <img src="${session.speaker.image}" alt="${session.speaker.name}" class="preview-speaker-avatar">
    //             <div>
    //                 <div class="preview-speaker-name">${session.speaker.name}</div>
    //                 <div class="preview-speaker-role">${session.speaker.role}</div>
    //             </div>
    //         </div>
    //     `;
    //
    //     previewGrid.appendChild(card);
    // });
    //
    // sessionSection.appendChild(previewGrid);

    // Do not render the CTA for now
    // const ctaContainer = document.createElement('div');
    // ctaContainer.classList.add('session-preview-cta');
    // ctaContainer.innerHTML = `
    //     <a href="./sessions.html" class="cta-button">
    //         View All Sessions
    //         <span class="cta-arrow">→</span>
    //     </a>
    //     <p class="cta-subtitle">Explore ${sessionsData.length}+ sessions from industry experts</p>
    // `;
    // sessionSection.appendChild(ctaContainer);
};

// ============================================
// PARALLAX EFFECT ON HERO (Optimized)
// ============================================

let ticking = false;

const handleParallax = () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');

    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = Math.max(0, 1 - scrolled / 800);
    }

    ticking = false;
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(handleParallax);
        ticking = true;
    }
});

// ============================================
// DYNAMIC BACKGROUND ORBS (Optimized)
// ============================================

let orbTicking = false;

const handleOrbMovement = (e) => {
    const orb1 = document.querySelector('.orb1');
    const orb2 = document.querySelector('.orb2');

    if (!orb1 || !orb2) return;

    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

    orb1.style.transform = `translate(${moveX}px, ${moveY}px)`;
    orb2.style.transform = `translate(${-moveX}px, ${-moveY}px)`;

    orbTicking = false;
};

document.addEventListener('mousemove', (e) => {
    if (!orbTicking) {
        window.requestAnimationFrame(() => handleOrbMovement(e));
        orbTicking = true;
    }
});

// ============================================
// CTA BUTTON RIPPLE EFFECT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const ctaButtons = document.querySelectorAll('.cta-button');

        ctaButtons.forEach(button => {
            button.addEventListener('mouseenter', function(e) {
                const ripple = document.createElement('span');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255,255,255,0.5)';
                ripple.style.width = ripple.style.height = '0';
                ripple.style.top = '50%';
                ripple.style.left = '50%';
                ripple.style.transform = 'translate(-50%, -50%)';
                ripple.style.pointerEvents = 'none';
                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.style.width = ripple.style.height = '200px';
                    ripple.style.opacity = '0';
                    ripple.style.transition = 'all 0.5s ease';
                }, 10);

                setTimeout(() => {
                    ripple.remove();
                }, 500);
            });
        });
    }, 1000);
});

// ============================================
// BACK TO TOP BUTTON
// ============================================

function initializeBackToTop() {
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.id = 'backToTop';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.innerHTML = '↑';
    document.body.appendChild(backToTopBtn);

    // Show/hide button on scroll
    const handleBackToTopScroll = throttle(() => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, 100);

    window.addEventListener('scroll', handleBackToTopScroll);

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Keyboard accessibility
    backToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}


// ============================================
// CARD INTERACTIONS (for Why JDC cards)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Limit interactive card effects to .why-card only; remove tilt from .speaker-card (speakers and our-team)
        const cards = document.querySelectorAll('.why-card');

        cards.forEach(card => {
            // Ripple effect on click
            card.addEventListener('click', function(e) {
                // Skip if it's already a speaker card (has its own click handler)
                if (this.classList.contains('speaker-card')) return;

                const ripple = document.createElement('span');
                ripple.classList.add('card-ripple');

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: ripple-animation 0.6s ease-out;
                    pointer-events: none;
                `;

                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });

            // 3D tilt effect on mouse move
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                this.style.transform = `
                    translateY(-10px) 
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg)
                `;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }, 1000);
});

// ============================================
// IMAGE LAZY LOADING FALLBACK (for older browsers)
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }, 1000);
    });
}

// ============================================
// SMOOTH REVEAL ANIMATIONS
// ============================================

function addRevealAnimations() {
    const elements = document.querySelectorAll('.speaker-card, .why-card, .timer-block');

    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ============================================
// ERROR HANDLING FOR IMAGES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            img.addEventListener('error', function() {
                // Create a placeholder if image fails to load
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                this.style.display = 'flex';
                this.style.alignItems = 'center';
                this.style.justifyContent = 'center';
                this.alt = 'Image not available';
            });
        });
    }, 1000);
});



// ============================================
// ENHANCED FOCUS INDICATORS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    let isUsingKeyboard = false;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            isUsingKeyboard = true;
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', () => {
        isUsingKeyboard = false;
        document.body.classList.remove('keyboard-nav');
    });
});



// ============================================
// REDUCE MOTION FOR ACCESSIBILITY
// ============================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable animations
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');

    // Remove auto-slide from carousel
    const carouselTrack = document.querySelector('.modern-carousel-track');
    if (carouselTrack) {
        carouselTrack.style.animation = 'none';
    }
}

// ============================================
// VIEWPORT HEIGHT FIX FOR MOBILE
// ============================================

function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', debounce(setVH, 250));
setVH();

// ============================================
// NETWORK STATUS INDICATOR
// ============================================

function handleNetworkChange() {
    if (!navigator.onLine) {
        const offlineNotice = document.createElement('div');
        offlineNotice.id = 'offline-notice';
        offlineNotice.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6b6b;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        offlineNotice.textContent = 'You are offline. Some features may not work.';
        document.body.appendChild(offlineNotice);
    } else {
        const notice = document.getElementById('offline-notice');
        if (notice) notice.remove();
    }
}

window.addEventListener('online', handleNetworkChange);
window.addEventListener('offline', handleNetworkChange);

console.log('✅ JDC 2025 Website Initialized Successfully');
