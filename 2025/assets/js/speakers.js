document.addEventListener('DOMContentLoaded', async () => {
    const speakersList = document.getElementById('speakers-list');
    // Get speaker id from URL
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    try {
        const response = await fetch('assets/data/payload.json');
        const data = await response.json();
        const speakers = data.speakers;
        speakersList.innerHTML = '';
        if (isNaN(id) || id < 0 || id >= speakers.length) {
            speakersList.innerHTML = '<p>Speaker not found.</p>';
            return;
        }
        const speaker = speakers[id];
        // Speaker detail card
        const card = document.createElement('div');
        card.className = 'speaker-detail-card';
        card.innerHTML = `
            <div class="speaker-detail-img-wrap">
                <img src="${speaker.image}" alt="${speaker.fullName}" class="speaker-detail-image">
            </div>
            <div class="speaker-detail-info">
                <h2 class="speaker-detail-name">${speaker.fullName}</h2>
                <h4 class="speaker-detail-title">${speaker.company}</h4>
                <p class="speaker-detail-bio">${speaker.bio}</p>
                <button class="back-btn" onclick="window.history.back()">&larr; Back</button>
            </div>
        `;
        speakersList.appendChild(card);
    } catch (e) {
        speakersList.innerHTML = '<p>Could not load speaker details.</p>';
    }
});
