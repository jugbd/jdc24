
// ============================================
// SESSIONS PAGE SCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const loader = showLoader('Loading sessions...');

    try {
        const content = await fetchData("./assets/data/payload.json");

        // Build a lookup map for speakers by fullName and by slug name (if provided)
        const speakers = Array.isArray(content.speakers) ? content.speakers : [];
        const speakerMap = new Map();
        speakers.forEach(sp => {
            if (sp.fullName) speakerMap.set(sp.fullName.trim().toLowerCase(), sp);
            if (sp.name) speakerMap.set(sp.name.trim().toLowerCase(), sp);
        });

        // Ensure modal structure exists for this page
        createSpeakerModal();

        // Populate sessions
        if (content.sessions) {
            populateSessions(content.sessions, speakerMap);
        }

        // Populate footer
        if (content.footer) {
            populateFooter(content.footer);
        }

    } catch (e) {
        console.error(e.message);
        if (loader && loader.element) {
            const loaderText = loader.element.querySelector('.loader-text');
            if (loaderText) {
                loaderText.textContent = 'Error loading sessions. Please try again later.';
            }
        }
    } finally {
        hideLoader(loader);
    }
});

// ============================================
// POPULATE SESSIONS
// ============================================

function populateSessions(sessionsData, speakerMap) {
    const grid = document.getElementById('sessionsGrid');
    if (!grid) return;

    grid.innerHTML = '';


    sessionsData.forEach((session, index) => {
        const card = document.createElement('div');
        card.classList.add('session-card');
        card.dataset.track = session.track;
        card.style.animationDelay = `${index * 0.1}s`;

        const speakerName = session.speaker?.name || '';

        card.innerHTML = `
            <div class="session-content">
                <div class="session-time">
                    <span class="time">${session.time}</span>
                    <span class="duration">${session.duration}</span>
                </div>
                <div class="session-info">
                    <span class="session-category">${session.track}</span>
                    <h2 class="session-title">${session.title}</h2>
                    <div class="session-abstract">${session.abstract}
                        <button type="button" class="read-more" aria-expanded="false" aria-label="Expand session abstract">See more</button>
                    </div>
                    
                    <div class="session-speaker" role="button" tabindex="0" title="Click to view bio" aria-label="View ${speakerName}'s bio" data-speaker-name="${speakerName}" data-speaker-bio="${encodeURIComponent(session.speaker.bio || '')}">
                        <img src="${session.speaker.image}" alt="${speakerName}" class="speaker-avatar speaker-avatar-large" loading="lazy">
                        <div class="speaker-details">
                            <div class="speaker-name">${speakerName}</div>
                            <div class="speaker-role">${session.speaker.role || ''}</div>
                        </div>
                    </div>

                    <div class="session-tags">
                        ${session.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    initializeSessionInteractions(sessionsData, speakerMap);
}

// ============================================
// SPEAKER MODAL (sessions page local implementation)
// ============================================

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
        </div>`;
    document.body.appendChild(modalOverlay);

    // overlay click to close
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeSpeakerModal();
    });
    // close button
    const closeBtn = modalOverlay.querySelector('.speaker-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSpeakerModal);
    // esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSpeakerModal();
    });
}

function showSpeakerModal(speaker) {
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    if (!modalOverlay) return;

    const modal = modalOverlay.querySelector('.speaker-modal');
    const img = modal.querySelector('.speaker-modal-image');
    const nameEl = modal.querySelector('.speaker-modal-name');
    const titleEl = modal.querySelector('.speaker-modal-title');
    const companyEl = modal.querySelector('.speaker-modal-company');
    const bioEl = modal.querySelector('.speaker-modal-bio p');

    if (img) {
        img.src = speaker.image || '';
        img.alt = speaker.fullName || speaker.name || 'Speaker';
    }
    if (nameEl) nameEl.textContent = speaker.fullName || speaker.name || 'Speaker';
    if (titleEl) titleEl.textContent = speaker.title || speaker.designation || '';
    if (companyEl) companyEl.textContent = speaker.company || '';
    if (bioEl) bioEl.innerHTML = speaker.bio || 'Biography coming soon...';

    modalOverlay.classList.add('active');
    const closeBtn = modalOverlay.querySelector('.speaker-modal-close');
    if (closeBtn) closeBtn.focus();
}

function closeSpeakerModal() {
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
}

// ============================================
// SESSION INTERACTIONS
// ============================================

function initializeSessionInteractions(sessionsData, speakerMap) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sessionCards = document.querySelectorAll('.session-card');
    const emptyState = document.getElementById('emptyState');

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            let visibleCount = 0;
            sessionCards.forEach((card, index) => {
                const track = card.dataset.track;

                if (filter === 'all' || track === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animationDelay = `${index * 0.1}s`;
                        card.style.animation = 'fadeInUp 0.6s ease forwards';
                    }, 10);
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show/hide empty state
            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    });

    // SEE MORE/LESS for abstracts
    const setupReadMore = () => {
        document.querySelectorAll('.session-card').forEach(card => {
            const abstract = card.querySelector('.session-abstract');
            const btn = card.querySelector('.read-more');
            if (!abstract || !btn) return;

            // Determine if content overflows (i.e., is clamped)
            const needsToggle = abstract.scrollHeight > abstract.clientHeight + 1; // allow small rounding diff
            btn.style.display = needsToggle ? 'inline-flex' : 'none';

            // Reset collapsed state if not needed
            if (!needsToggle) {
                card.classList.remove('expanded');
                btn.setAttribute('aria-expanded', 'false');
                btn.textContent = 'See more';
            }

            // Attach click handler once
            if (!btn._bound) {
                btn.addEventListener('click', (e) => {
                    const expanded = card.classList.toggle('expanded');
                    btn.textContent = expanded ? 'See less' : 'See more';
                    btn.setAttribute('aria-expanded', String(expanded));
                });
                btn._bound = true;
            }
        });
    };

    // Initial setup
    setupReadMore();

    // Re-evaluate on window resize (simple debounce)
    let _rmTimer;
    window.addEventListener('resize', () => {
        clearTimeout(_rmTimer);
        _rmTimer = setTimeout(setupReadMore, 150);
    });

    // Speaker click functionality
    document.querySelectorAll('.session-speaker').forEach(speakerElement => {
        const activate = () => {
            const clickEvent = new Event('click', { bubbles: true });
            speakerElement.dispatchEvent(clickEvent);
        };
        // Keyboard accessibility: Enter/Space activates
        speakerElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
            }
        });

        // Click opens modal (existing listener below)
        speakerElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card from toggling if that functionality is re-added
            const speakerNameRaw = speakerElement.dataset.speakerName || '';
            const speakerName = speakerNameRaw.trim().toLowerCase();

            // 1) Prefer bio provided directly in the session payload
            const bioEncoded = speakerElement.dataset.speakerBio || '';
            const bioFromSession = bioEncoded ? decodeURIComponent(bioEncoded) : '';
            if (bioFromSession && bioFromSession.trim().length > 0) {
                const modalSpeaker = {
                    fullName: speakerElement.querySelector('.speaker-name')?.textContent || speakerNameRaw || 'Speaker',
                    name: speakerNameRaw,
                    image: speakerElement.querySelector('img')?.getAttribute('src') || '',
                    title: speakerElement.querySelector('.speaker-role')?.textContent || '',
                    company: '',
                    bio: bioFromSession
                };
                if (typeof showSpeakerModal === 'function') {
                    showSpeakerModal(modalSpeaker);
                } else if (typeof window.showSpeakerModal === 'function') {
                    window.showSpeakerModal(modalSpeaker);
                }
                return; // Do not fallback if session bio is present
            }

            // 2) Fallback: try to find a full speaker object with bio from the global map
            let fullSpeaker = speakerMap && speakerMap.get(speakerName);
            
            // Fallback: attempt to match by full name in sessionsData if not found by key
            if (!fullSpeaker) {
                const session = Array.from(sessionsData).find(s => (s.speaker?.name || '').trim().toLowerCase() === speakerName);
                const guessName = session?.speaker?.name?.trim().toLowerCase();
                if (guessName && speakerMap) fullSpeaker = speakerMap.get(guessName);
            }

            if (fullSpeaker) {
                // Ensure required fields expected by showSpeakerModal
                const modalSpeaker = {
                    ...fullSpeaker,
                    fullName: fullSpeaker.fullName || fullSpeaker.name || (speakerElement.querySelector('.speaker-name')?.textContent) || 'Speaker',
                };
                if (typeof showSpeakerModal === 'function') {
                    showSpeakerModal(modalSpeaker);
                } else if (typeof window.showSpeakerModal === 'function') {
                    window.showSpeakerModal(modalSpeaker);
                }
            } else {
                console.warn('Speaker bio not found for:', speakerName);
                // As a graceful fallback, open minimal modal from the card speaker data
                const fallback = {
                    fullName: speakerElement.querySelector('.speaker-name')?.textContent || 'Speaker',
                    image: speakerElement.querySelector('img')?.getAttribute('src') || '',
                    title: speakerElement.querySelector('.speaker-role')?.textContent || '',
                    company: '',
                    bio: 'Biography will be available soon.'
                };
                if (typeof showSpeakerModal === 'function') {
                    showSpeakerModal(fallback);
                }
            }
        });
    });
}
