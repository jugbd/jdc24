// loader with some hacks
document.addEventListener('DOMContentLoaded', async () => {
    const body = document.querySelector("body");
    body.setAttribute("loading", "")
    const loader = document.createElement("div");
    loader.classList.add("loader");
    body.appendChild(loader);

    try {
        const url = "assets/data/payload.json"
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const content = await response.json();

        // data population
        populateHero(content.hero);
        populateAbout(content.about);
        populateGallery(content.gallery);
        populateSpeakers(content.speakers);
        populateTimeline(content.timeline);
        populateLocation(content.location);
        populateFooter(content.footer);

        // todo: populate page with content
    } catch (e) {
        console.error(e.message)
    } finally {
        body.removeChild(loader);
        body.removeAttribute("loading");
    }
});

const populateHero = (heroContent) => {
    const hero = document.getElementById("hero");
    const title = document.createElement("h1");
    title.innerText = heroContent.title;

    const edition = document.createElement("h3");
    edition.innerText = heroContent.edition;

    const cta = document.createElement("a");
    cta.innerText = heroContent.cta.text;
    cta.setAttribute("href", heroContent.cta.link);

    hero.appendChild(title);
    hero.appendChild(edition);
    hero.appendChild(cta);
}
const populateAbout = (aboutContent) => {
    const about = document.querySelector('.intro');
    if (!about) return;

    const description = about.querySelector('p');
    if (description) {
        description.textContent = aboutContent.description;
    }
};

const populateGallery = (galleryImages) => {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    const carousel = document.createElement('div');
    carousel.classList.add('carousel');

    galleryImages.forEach(imagePath => {
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = 'Gallery Image';
        img.classList.add('carousel-image');
        carousel.appendChild(img);
    });

    gallery.appendChild(carousel);

    const indicators = document.createElement('div');
    indicators.classList.add('carousel-indicators');
    galleryImages.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicators.appendChild(indicator);
    });
    gallery.appendChild(indicators);

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


const populateSpeakers = (speakers) => {
    const speakersSection = document.querySelector('.speakers');
    if (!speakersSection) return;

    speakersSection.innerHTML = '<h2>Speakers</h2>';
    const speakerGrid = document.createElement('div');
    speakerGrid.classList.add('speaker-grid');

    speakers.forEach(speaker => {
        const speakerCard = document.createElement('div');
        speakerCard.classList.add('speaker-card');

        speakerCard.innerHTML = `
            <img src="${speaker.image}" alt="${speaker.name}" loading="lazy">
            <div class="speaker-info">
                <h3>${speaker.name}</h3>
                <p>${speaker.emp}</p>
            </div>
        `;

        speakerGrid.appendChild(speakerCard);
    });

    speakersSection.appendChild(speakerGrid);
};

const populateTimeline = (timeline) => {
    const whySection = document.querySelector('.why-jdc');
    if (!whySection) return;

    whySection.innerHTML = `
        <h2>Timeline</h2>
        <p>${timeline.title.replace('\n', '<br>')}</p>
        <div class="subsection">
            <h3>${timeline.subsection.title}</h3>
            <p>${timeline.subsection.body.replace('[JUGBD]', `<a href="https://www.facebook.com/groups/jugbd">JUGBD</a>`)}</p>
        </div>
    `;
};

const populateLocation = (location) => {
    const venue = document.querySelector('.venue');
    if (!venue) return;

    venue.innerHTML = `
        <h2>${location.title}</h2>
        <p>${location.description}</p>
        <p>Contact: <a href="mailto:${location.email}">${location.email}</a></p>
        <div class="map">
            ${location.mapEmbed}
        </div>
    `;
};

const populateFooter = (footerContent) => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const socialLinks = document.createElement('div');
    socialLinks.classList.add('social-links');

    footerContent.social.forEach(social => {
        const link = document.createElement('a');
        link.href = social.link;
        link.textContent = social.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        socialLinks.appendChild(link);
    });

    footer.innerHTML = '';
    footer.appendChild(socialLinks);

    const copyright = document.createElement('p');
    copyright.innerHTML = footerContent.copyright.replace('{{YYYY}}', new Date().getFullYear());
    footer.appendChild(copyright);
};

// am i hungry?
const burger = document.querySelector(".burger");
const navContainer = document.querySelector("nav ul");

burger.addEventListener("click", () => {
    navContainer.toggleAttribute("active");
    burger.toggleAttribute("active");
})


// todo: do more stuff here