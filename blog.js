document.addEventListener('DOMContentLoaded', () => {
  // Check if blog dataset is loaded
  if (typeof BLOG_DATA === 'undefined') {
    console.error('BLOG_DATA is not defined. Make sure blog-data.js is loaded first.');
    return;
  }

  const blogLayout = document.getElementById('blog-layout');
  const searchInput = document.getElementById('blog-search');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let activeFilter = 'all';
  let searchQuery = '';

  // Setup scroll animator observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  // Initial render
  renderBlog();

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderBlog();
    });
  }

  // Filter Chip Click Listeners
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderBlog();
    });
  });

  // Helper to map tags to appropriate icons
  function getTagIcon(tag) {
    switch (tag.toLowerCase()) {
      case 'security': return '🛡️';
      case 'docker': return '🐳';
      case 'systems': return '⚙️';
      default: return '✍️';
    }
  }

  // Render Blog Function
  function renderBlog() {
    blogLayout.innerHTML = '';

    // Filter list
    const filteredPosts = BLOG_DATA.filter(post => {
      // 1. Filter by category
      let matchesFilter = true;
      if (activeFilter !== 'all') {
        matchesFilter = post.tag.toLowerCase() === activeFilter;
      }

      // 2. Filter by search query
      const matchesSearch = post.title.toLowerCase().includes(searchQuery) ||
                            post.summary.toLowerCase().includes(searchQuery) ||
                            post.tag.toLowerCase().includes(searchQuery);

      return matchesFilter && matchesSearch;
    });

    // Check empty state
    if (filteredPosts.length === 0) {
      blogLayout.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✍️</div>
          <p class="empty-state-text">No articles found matching your search.</p>
        </div>
      `;
      return;
    }

    // Split into Featured vs. Grid items
    const featuredPost = filteredPosts[0];
    const gridPosts = filteredPosts.slice(1);

    // 1. Render Featured Post
    if (featuredPost) {
      const featuredCard = document.createElement('div');
      featuredCard.className = 'featured-card';
      featuredCard.setAttribute('data-fade', '');
      featuredCard.onclick = () => window.location.href = featuredPost.link;

      featuredCard.innerHTML = `
        <div class="featured-img-wrapper">
          <div class="featured-img-icon">${getTagIcon(featuredPost.tag)}</div>
          <div class="game-card-overlay"></div>
        </div>
        <div class="featured-info">
          <div class="post-meta">
            <span class="post-tag">${featuredPost.tag}</span>
            <span>•</span>
            <span>${featuredPost.date}</span>
            <span>•</span>
            <span>${featuredPost.readTime}</span>
          </div>
          <h2 class="post-title">${featuredPost.title}</h2>
          <p class="post-summary">${featuredPost.summary}</p>
          <a href="${featuredPost.link}" class="read-more-btn">
            Read writeup
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
      `;
      blogLayout.appendChild(featuredCard);
    }

    // 2. Render Secondary Grid
    if (gridPosts.length > 0) {
      const gridContainer = document.createElement('div');
      gridContainer.className = 'posts-grid';
      
      gridPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.setAttribute('data-fade', '');
        card.onclick = () => window.location.href = post.link;

        card.innerHTML = `
          <div class="post-meta">
            <span class="post-tag">${post.tag}</span>
            <span>•</span>
            <span>${post.date}</span>
          </div>
          <h3 class="post-title">${post.title}</h3>
          <p class="post-summary">${post.summary}</p>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto;">
            <span style="font-size:12px; color:var(--text-dark); font-weight:500;">${post.readTime}</span>
            <a href="${post.link}" class="read-more-btn">
              Read
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        `;
        gridContainer.appendChild(card);
      });
      blogLayout.appendChild(gridContainer);
    }

    // Register fading animations
    const fadeElements = blogLayout.querySelectorAll('[data-fade]');
    fadeElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      observer.observe(el);
    });
  }
});
