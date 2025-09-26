/*
// Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    setTimeout(() => {
        follower.style.left = e.clientX - 10 + 'px';
        follower.style.top = e.clientY - 10 + 'px';
    }, 100);
});
*/

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fade out on first scroll
window.addEventListener('scroll', () => {
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator && !indicator.classList.contains('hide')) {
        indicator.classList.add('hide');
    }
}, { once: true });

// Fade in when hero section is in view
const hero = document.getElementById('hero');
const indicator = document.querySelector('.scroll-indicator');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && indicator) {
            indicator.classList.remove('hide');
        }
    });
}, { threshold: 0.7 });

if (hero && indicator) {
    observer.observe(hero);
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', async () => {
    const body = document.querySelector("body");
    body.setAttribute("loading", "")
    const loader = document.createElement("div");
    loader.classList.add("loader");
    body.appendChild(loader);

    try {
        const url = "/2025/assets/data/payload.json"
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const content = await response.json();

        // data population
        populateHero(content.hero);
        populateAbout(content.about);
        populateGallery(content.gallery);
        populateWhyJDC(content.whyJdc);
        populateSpeakers(content.speakers);
        populateCountdown(content.countdown, content.hero);
        populateTeam(content.ourTeam)
        populateLocation(content.location);
        populateFooter(content.footer);

    } catch (e) {
        console.error(e.message)
    } finally {
        body.removeChild(loader);
        body.removeAttribute("loading");
    }
});

const populateHero = (heroContent) => {
    const hero = document.getElementById("hero").querySelector('.hero-content');
    hero.innerHTML = ''; // Clear existing content
    const title = document.createElement("h1");
    title.classList.add('hero-title', 'glitch');
    title.innerHTML = heroContent.title;

    const subtitle = document.createElement("p");
    subtitle.classList.add('hero-subtitle');
    subtitle.innerHTML = heroContent.edition;

    const cta = document.createElement("a");
    cta.classList.add('cta-button');
    cta.innerHTML = heroContent.cta.text;
    cta.setAttribute("href", heroContent.cta.link);
    cta.setAttribute("target", "_blank");

    hero.appendChild(title);
    hero.appendChild(subtitle);
    hero.appendChild(cta);
}

const populateAbout = (aboutContent) => {
    const about = document.getElementById("about");
    about.innerHTML = ''; // Clear existing content

    const aboutContentDiv = document.createElement("div");
    aboutContentDiv.classList.add("about-content");

    const aboutText = document.createElement("div");
    aboutText.classList.add("about-text");

    const sectionTag = document.createElement("span");
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "▲ About the Event"

    const title = document.createElement("h2");
    title.classList.add('section-title', 'gradient-text');
    title.innerHTML = aboutContent.title;

    const description = document.createElement("p");
    description.classList.add('about-description');
    description.innerHTML = aboutContent.description;

    aboutText.appendChild(sectionTag);
    aboutText.appendChild(title);
    aboutText.appendChild(description);

    const aboutImage = document.createElement("div");
    aboutImage.classList.add('about-image');
    const image = document.createElement("img");
    image.src = aboutContent.image;
    image.alt = "JDC 2024 Event";
    aboutImage.appendChild(image);

    aboutContentDiv.appendChild(aboutText);
    aboutContentDiv.appendChild(aboutImage);
    about.appendChild(aboutContentDiv);
};

const populateGallery = (galleryImages) => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear existing content

    const title = document.createElement("h2");
    title.innerHTML = "Gallery";
    title.classList.add('section-title', 'gradient-text', 'text-center');

    const galleryWrapper = document.createElement("div");
    galleryWrapper.classList.add("gallery-wrapper");

    const carousel = document.createElement('div');
    carousel.classList.add('carousel');

    galleryImages.forEach(imagePath => {
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = 'Gallery Image';
        img.classList.add('carousel-image');
        carousel.appendChild(img);
    });

    const indicators = document.createElement('div');
    indicators.classList.add('carousel-indicators');
    galleryImages.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicators.appendChild(indicator);
    });

    galleryWrapper.appendChild(carousel);
    galleryWrapper.appendChild(indicators);
    gallery.appendChild(title);
    gallery.appendChild(galleryWrapper);

    // Initialize carousel
    let currentIndex = 0;
    const images = carousel.querySelectorAll('.carousel-image');
    const allIndicators = indicators.querySelectorAll('.indicator');

    const updateCarousel = () => {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        allIndicators.forEach(ind => ind.classList.remove('active'));
        allIndicators[currentIndex].classList.add('active');
    };

    const autoSlide = () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateCarousel();
    };

    let slideInterval = setInterval(autoSlide, 3000);

    allIndicators.forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            clearInterval(slideInterval);
            currentIndex = parseInt(e.target.dataset.index, 10);
            updateCarousel();
            slideInterval = setInterval(autoSlide, 3000);
        });
    });

    updateCarousel();
};

const populateWhyJDC = (whyJDC) => {
    const whySection = document.getElementById("why-jdc");
    whySection.innerHTML = ''; // Clear existing content

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "Why Attend";
    whySection.appendChild(sectionTag);

    const title = document.createElement('h2');
    title.innerHTML = whyJDC.why.title;
    title.classList.add('section-title', 'gradient-text');
    whySection.appendChild(title);

    const itemsGrid = document.createElement('div');
    itemsGrid.classList.add('why-grid'); // Using a grid for card layout

    whyJDC.why.items.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('why-card'); // Card element

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
}


const populateSpeakers = (speakers) => {
    const speakersSection = document.getElementById('speakers');
    speakersSection.innerHTML = ''; // Clear existing content

    const header = document.createElement('div');
    header.classList.add('speakers-header');

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "▲ Featured Speakers";

    const title = document.createElement('h2');
    title.innerHTML = "Learn from the Best";
    title.classList.add('section-title', 'gradient-text');
    header.appendChild(sectionTag);
    header.appendChild(title);
    speakersSection.appendChild(header);

    const speakerGrid = document.createElement('div');
    speakerGrid.classList.add('speakers-grid');

    speakers.forEach(speaker => {
        const speakerCard = document.createElement('div');
        speakerCard.classList.add('speaker-card');

        speakerCard.innerHTML = `
        <img src="${speaker.image}" alt="${speaker.fullName}" class="speaker-image">
            <div class="speaker-info">
                <h3 class="speaker-name">${speaker.fullName}</h3>
                <p class="speaker-title">${speaker.company}</p>
                <p class="speaker-bio">${speaker.bio}</p>
            </div>
        `;

        speakerGrid.appendChild(speakerCard);
    });

    speakersSection.appendChild(speakerGrid);
};

const populateTeam = (teamMembers) => {
    const teamSection = document.getElementById('our-team');
    teamSection.innerHTML = ''; // Clear existing content

    const header = document.createElement('div');
    header.classList.add('speakers-header');

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "▲ Our Team";

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
            <img src="${member.image}" alt="${member.fullName}" class="speaker-image">
            <div class="speaker-info">
                <h3 class="speaker-name">${member.fullName}</h3>
                <p class="speaker-title">${member.company}</p>
                <p class="speaker-bio">${member.bio}</p>
            </div>
        `;

        teamGrid.appendChild(teamCard);
    });

    teamSection.appendChild(teamGrid);
};
const populateCountdown = (cdC) => {
    const countdown = document.getElementById('countdown');
    countdown.innerHTML = ''; // Clear existing content

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

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }, 1000);
};

const populateLocation = (location) => {
    const venue = document.getElementById('venue');
    venue.innerHTML = ''; // Clear existing content

    const venueContent = document.createElement('div');
    venueContent.classList.add('venue-content');

    const venueInfo = document.createElement('div');
    venueInfo.classList.add('venue-info');

    const sectionTag = document.createElement('span');
    sectionTag.classList.add('section-tag');
    sectionTag.innerHTML = "▲ Event Venue";
    venueInfo.appendChild(sectionTag);

    const title = document.createElement('h2');
    title.classList.add('section-title', 'gradient-text');
    title.innerHTML = location.title;
    venueInfo.appendChild(title);

    const description = document.createElement('p');
    description.classList.add('about-description');
    description.innerHTML = location.description;
    venueInfo.appendChild(description);

    const addressCard = document.createElement('div');
    addressCard.classList.add('address-card');

    addressCard.innerHTML = `
        <h3>Conference Center</h3>
        <p>📍 Tech Hub Convention Center</p>
        <p>🏢 123 Innovation Drive</p>
        <p>🌆 Dhaka, Bangladesh</p>
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

const populateFooter = (footerContent) => {
    const footer = document.querySelector('footer');
    footer.innerHTML = ''; // Clear existing content

    const footerContentDiv = document.createElement('div');
    footerContentDiv.classList.add('footer-content');

    const socialLinks = document.createElement('div');
    socialLinks.classList.add('social-links');

    footerContent.social.forEach((social) => {
        const link = document.createElement('a');
        link.href = social.link;
        link.textContent = social.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.classList.add('social-link');

        socialLinks.appendChild(link);
    });

    const copyright = document.createElement('p');
    copyright.classList.add('copyright');
    copyright.innerHTML = footerContent.copyright.replace('{{YYYY}}', new Date().getFullYear());

    footerContentDiv.appendChild(socialLinks);
    footerContentDiv.appendChild(copyright);
    footer.appendChild(footerContentDiv);
};

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Parallax Effect on Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - scrolled / 1000;
    }
});

// Dynamic Background Orbs
document.addEventListener('mousemove', (e) => {
    const orb1 = document.querySelector('.orb1');
    const orb2 = document.querySelector('.orb2');

    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

    if (orb1) {
        orb1.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
    if (orb2) {
        orb2.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
    }
});

// Add hover effect to CTA buttons
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mouseenter', function(e) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255,255,255,0.5)';
        ripple.style.width = ripple.style.height = '0';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
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

// Loading Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});


