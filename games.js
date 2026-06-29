document.addEventListener('DOMContentLoaded', () => {
  // Check if games dataset is loaded
  if (typeof GAMES_DATA === 'undefined') {
    console.error('GAMES_DATA is not defined. Make sure games-data.js is loaded first.');
    return;
  }

  const gridContainer = document.getElementById('games-grid');
  const searchInput = document.getElementById('game-search');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let activeFilter = 'all';
  let searchQuery = '';

  // Initial render
  renderGames();

  // Search Event Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderGames();
    });
  }

  // Filter Buttons Event Listener
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderGames();
    });
  });

  // Render Games Function
  function renderGames() {
    gridContainer.innerHTML = '';

    // Filter games
    const filteredGames = GAMES_DATA.filter(game => {
      // 1. Filter by category
      let matchesFilter = true;
      if (activeFilter === 'masterpiece') {
        matchesFilter = game.verdict.toLowerCase() === 'masterpiece';
      } else if (activeFilter === 'playing') {
        matchesFilter = game.status.toLowerCase() === 'currently playing';
      } else if (activeFilter === 'completed') {
        matchesFilter = game.status.toLowerCase() === 'completed';
      }

      // 2. Filter by search query
      const matchesSearch = game.title.toLowerCase().includes(searchQuery) ||
                            game.review.toLowerCase().includes(searchQuery);

      return matchesFilter && matchesSearch;
    });

    // Check empty state
    if (filteredGames.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎮</div>
          <p class="empty-state-text">No games found matching your search.</p>
        </div>
      `;
      return;
    }

    // Generate HTML for each card
    filteredGames.forEach(game => {
      const card = document.createElement('div');
      card.className = 'game-item-card';
      card.setAttribute('data-fade', '');

      // Image or AppID cover
      const coverUrl = game.steamAppId 
        ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/library_600x900_2x.jpg`
        : (game.coverUrl || '');

      const ratingStars = Array(5).fill(0).map((_, idx) => {
        const starClass = idx < game.rating ? '' : 'style="opacity: 0.15;"';
        return `<svg ${starClass} width="14" height="14" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      }).join('');

      const statusClass = game.status.toLowerCase() === 'currently playing' ? 'status-playing' : '';

      card.innerHTML = `
        <div class="game-item-cover-wrapper">
          ${coverUrl ? `
            <img class="game-item-cover" src="${coverUrl}" alt="${game.title} cover art" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="game-cover-fallback" style="display: none;">
              <div class="game-fallback-icon">🎮</div>
              <div class="game-fallback-title">${game.title}</div>
            </div>
          ` : `
            <div class="game-cover-fallback">
              <div class="game-fallback-icon">🎮</div>
              <div class="game-fallback-title">${game.title}</div>
            </div>
          `}
          <div class="game-item-overlay"></div>
          <div class="game-badges-container">
            <span class="verdict-badge">${game.verdict}</span>
            <span class="status-badge ${statusClass}">${game.status}</span>
          </div>
        </div>
        <div class="game-item-info">
          <h3 class="game-item-title">${game.title}</h3>
          <div class="game-rating">${ratingStars}</div>
          <p class="game-review">${game.review}</p>
        </div>
      `;

      gridContainer.appendChild(card);
    });

    // Fade in effect
    setTimeout(() => {
      const cards = gridContainer.querySelectorAll('.game-item-card');
      cards.forEach((c, idx) => {
        setTimeout(() => {
          c.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(0.2, 0.8, 0.2, 1)';
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        }, idx * 45); // stagger animation
      });
    }, 10);
  }
});
