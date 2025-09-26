// Modern script for JDC 2025

document.addEventListener('DOMContentLoaded', () => {
    // Navbar menu toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Theme toggle button logic
    let themeBtn = document.querySelector('.theme-toggle');
    if (!themeBtn) {
        themeBtn = document.createElement('button');
        themeBtn.className = 'theme-toggle';
        themeBtn.innerHTML = '🌙';
        document.querySelector('.nav-content').appendChild(themeBtn);
    }
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeBtn.innerHTML = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    });

    // Populate hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.innerHTML = `
            <h1>Java Developers' Conference 2025</h1>
            <p>Join the brightest minds in Java for a day of learning, networking, and inspiration.</p>
            <a href="#about" class="cta-btn">Learn More</a>
        `;
    }

    // Populate about section
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        aboutSection.innerHTML = `
            <h2>About the Event</h2>
            <p>The Java Developers' Conference 2025 brings together enthusiasts, professionals, and experts to share knowledge and build community.</p>
        `;
    }

    // Populate gallery section
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
        gallerySection.innerHTML = `
            <h2>Gallery</h2>
            <div class="gallery-grid">
                <img src="assets/images/gallery/01-slider.jpg" alt="Gallery Image 1">
                <img src="assets/images/gallery/02-slider.jpg" alt="Gallery Image 2">
                <img src="assets/images/gallery/03-slider.jpg" alt="Gallery Image 3">
            </div>
        `;
    }

    // Populate why-jdc section
    const whyJdcSection = document.getElementById('why-jdc');
    if (whyJdcSection) {
        whyJdcSection.innerHTML = `
            <h2>Why Attend JDC?</h2>
            <ul>
                <li>Expert speakers</li>
                <li>Hands-on sessions</li>
                <li>Networking opportunities</li>
            </ul>
        `;
    }

    // Populate speakers section
    const speakersSection = document.querySelector('.speakers');
    if (speakersSection) {
        speakersSection.innerHTML = `
            <h2>Speakers</h2>
            <div class="speakers-list">
                <div class="speaker-card">Speaker 1</div>
                <div class="speaker-card">Speaker 2</div>
                <div class="speaker-card">Speaker 3</div>
            </div>
        `;
    }

    // Populate our team section
    const teamSection = document.getElementById('our-team');
    if (teamSection) {
        teamSection.innerHTML = `
            <h2>Our Team</h2>
            <div class="team-list">
                <div class="team-card">Team Member 1</div>
                <div class="team-card">Team Member 2</div>
                <div class="team-card">Team Member 3</div>
            </div>
        `;
    }

    // Populate countdown section
    const countdownSection = document.querySelector('.countdown');
    if (countdownSection) {
        countdownSection.innerHTML = `
            <h2>Countdown to JDC 2025</h2>
            <div class="countdown-timer">1 Day Left!</div>
        `;
    }

    // Populate venue section
    const venueSection = document.querySelector('.venue');
    if (venueSection) {
        venueSection.innerHTML = `
            <h2>Venue</h2>
            <p>Dhaka, Bangladesh</p>
        `;
    }

    // Populate footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = `
            <p>&copy; 2025 Java Developers' Conference. All rights reserved.</p>
        `;
    }
});
