
// ============================================
// SESSIONS PAGE SCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const loader = showLoader('Loading sessions...');

    try {
        const content = await fetchData("./assets/data/payload.json");

        // Populate sessions
        if (content.sessions) {
            populateSessions(content.sessions);
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

function populateSessions(sessionsData) {
    const grid = document.getElementById('sessionsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    sessionsData.forEach((session, index) => {
        const card = document.createElement('div');
        card.classList.add('session-card');
        card.dataset.track = session.track;
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="session-content">
                <div class="session-time">
                    <span class="time">${session.time}</span>
                    <span class="duration">${session.duration}</span>
                </div>
                <div class="session-info">
                    <span class="session-category">${session.track}</span>
                    <h2 class="session-title">${session.title}</h2>
                    <p class="session-abstract">${session.abstract}</p>
                    <span class="read-more">Read more</span>
                    
                    <div class="session-speaker">
                        <img src="${session.speaker.image}" alt="${session.speaker.name}" class="speaker-avatar" loading="lazy">
                        <div class="speaker-details">
                            <div class="speaker-name">${session.speaker.name}</div>
                            <div class="speaker-role">${session.speaker.role}</div>
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

    initializeSessionInteractions();
}

// ============================================
// SESSION INTERACTIONS
// ============================================

function initializeSessionInteractions() {
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

    // Read more/less functionality
    document.querySelectorAll('.read-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.session-card');
            card.classList.toggle('expanded');
            btn.textContent = card.classList.contains('expanded') ? 'Read less' : 'Read more';
        });
    });

    // Card click to expand
    sessionCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('read-more') &&
                !e.target.classList.contains('tag')) {
                const readMoreBtn = card.querySelector('.read-more');
                card.classList.toggle('expanded');
                if (readMoreBtn) {
                    readMoreBtn.textContent = card.classList.contains('expanded') ?
                        'Read less' : 'Read more';
                }
            }
        });
    });
}
