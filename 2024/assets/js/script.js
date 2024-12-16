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
    const hero = document.getElementById("hero");
    const title = document.createElement("h1");
    title.innerHTML = heroContent.title;

    const edition = document.createElement("h3");
    edition.innerHTML = heroContent.edition;

    const cta = document.createElement("a");
    cta.innerHTML = heroContent.cta.text;
    cta.setAttribute("href", heroContent.cta.link);
    cta.setAttribute("target", "_blank");

    hero.appendChild(title);
    hero.appendChild(edition);
    hero.appendChild(cta);
}

const populateAbout = (aboutContent) => {
    const about = document.getElementById("intro");

    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");

    const image = document.createElement("img");
    image.src = aboutContent.image;
    image.alt = "blah blah blah";


    const subtitle = document.createElement("h3");
    subtitle.innerHTML = "<span>▲</span>About the Event"

    const title = document.createElement("h2");
    title.innerHTML = aboutContent.title;

    const description = document.createElement("p");
    description.innerHTML = aboutContent.description;

    wrapper.appendChild(subtitle);
    wrapper.appendChild(title);
    wrapper.appendChild(description);

    about.appendChild(wrapper);
    about.appendChild(image);
};

const populateGallery = (galleryImages) => {
    const gallery = document.getElementById('gallery');

    const title = document.createElement("h2");


    const galleryWrapper = document.createElement("div");
    galleryWrapper.classList.add("galler-wrapper");

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

const populateSpeakers = (speakers) => {
    const speakersSection = document.getElementById('speakers');

    const title = document.createElement('h2');
    title.innerHTML = "Featured Speakers";
    const speakerGrid = document.createElement('div');
    speakerGrid.classList.add('speaker-grid');

    speakers.forEach(speaker => {
        const speakerCard = document.createElement('div');
        speakerCard.classList.add('speaker-card');

        speakerCard.innerHTML = `
        <div class="speaker-img" style="background-image: url(${speaker.image})"></div>
            <div class="speaker-info">
                <h3><a href="${speaker.linkedin}" target="_blank">${speaker.fullName}</h3>
                <p><a href="${speaker.companyWebsite}" target="_blank">${speaker.company}</p>
            </div>
        `;

        speakerGrid.appendChild(speakerCard);
    });

    speakersSection.appendChild(title);
    speakersSection.appendChild(speakerGrid);
};

const populateTeam = (teamMembers) => {
    const teamSection = document.getElementById('our-team');

    const title = document.createElement('h2');
    title.innerHTML = "Our Team";
    const teamGrid = document.createElement('div');
    teamGrid.classList.add('team-grid');

    teamMembers.forEach(member => {
        const teamCard = document.createElement('div');
        teamCard.classList.add('team-card');

        teamCard.innerHTML = `
            <div class="team-img" style="background-image: url(${member.image})"></div>
            <div class="team-info">
                <h3><a href="${member.linkedin}" target="_blank">${member.fullName}</a></h3>
                <p><a href="${member.companyWebsite}" target="_blank">${member.company}</a></p>
            </div>
        `;

        teamGrid.appendChild(teamCard);
    });

    teamSection.appendChild(title);
    teamSection.appendChild(teamGrid);
};
const populateCountdown = (cdC, hero) => {
    const countdown = document.getElementById('countdown');
    const linkStart = cdC.subsection.body.indexOf("{{link}}");

    countdown.innerHTML = `
        <h3>${cdC.title.replace('\n', '<br>')}</h3>
        <div class="timer-container">
            <div class="timer-block">
                <span id="days">00</span>
                <label>Days</label>
            </div>
            <div class="timer-block">
                <span id="hours">00</span>
                <label>Hours</label>
            </div>
            <div class="timer-block">
                <span id="minutes">00</span>
                <label>Minutes</label>
            </div>
            <div class="timer-block">
                <span id="seconds">00</span>
                <label>Seconds</label>
            </div>
        </div>
        <p class="date">${cdC.subsection.date}</p>
        <div class="subsection">
            <p class="title">${cdC.subsection.title}</p>
            <p>${cdC.subsection.body.substring(0, linkStart)}
                <a href="${cdC.subsection.link.url}" target="_blank" rel="noopener">${cdC.subsection.link.text}</a>
                ${cdC.subsection.body.substring(linkStart + 8)}
            </p>
        </div>
    `;

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

    const socialLinks = document.createElement('div');
    socialLinks.classList.add('social-links');

    footerContent.social.forEach((social) => {
        const link = document.createElement('a');
        link.href = social.link;
        link.textContent = social.name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        socialLinks.appendChild(link);
    });


    const copyright = document.createElement('p');
    copyright.innerHTML = footerContent.copyright.replace('{{YYYY}}', new Date().getFullYear());

    footer.appendChild(socialLinks);
    footer.appendChild(copyright);
};

// am i hungry?
const burger = document.querySelector(".burger");
const navContainer = document.querySelector("nav ul");

burger.addEventListener("click", () => {
    navContainer.toggleAttribute("active");
    burger.toggleAttribute("active");
})
