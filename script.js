document.addEventListener('DOMContentLoaded', () => {
  // 1. SCROLL ANIMS (IntersectionObserver)
  const fadeElements = document.querySelectorAll('[data-fade]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'opacity .65s ease, transform .65s ease';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07 });

  fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    observer.observe(el);
  });

  // 2. COPY EMAIL TO CLIPBOARD
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('copy-toast');
  let toastTimer;

  if (copyBtn && toast) {
    copyBtn.addEventListener('click', () => {
      const email = 'vinayaktyagi.ed@gmail.com';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email)
          .then(() => showToast())
          .catch(err => console.error('Could not copy email: ', err));
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showToast();
        } catch (err) {
          console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textarea);
      }
    });
  }

  function showToast() {
    toast.classList.add('show');
    copyBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      ✓ Copied!
    `;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        Copy email address
      `;
    }, 2500);
  }

  // 3. DARK MODE TOGGLE
  const themeToggle = document.getElementById('theme-toggle');
  const moonIcon = document.querySelector('.theme-icon-moon');
  const sunIcon = document.querySelector('.theme-icon-sun');
  const htmlEl = document.documentElement;

  // Initialize icon display based on current theme preloader
  if (htmlEl.getAttribute('data-theme') === 'dark') {
    if (moonIcon && sunIcon) {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'inline-block';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      if (newTheme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline-block';
      } else {
        moonIcon.style.display = 'inline-block';
        sunIcon.style.display = 'none';
      }
    });
  }

  // 4. FETCH HONEYPOT STATS
  async function fetchLiveStats() {
    try {
      const response = await fetch('./stats.json');
      if (!response.ok) throw new Error('stats.json not found');
      const data = await response.json();

      const total = data.total_sessions;
      if (total) {
        const heroStat = document.getElementById('hero-stat-sessions');
        const mirageMetric = document.getElementById('mirage-metric-sessions');

        if (heroStat) {
          heroStat.textContent = `${Math.floor(total / 1000)}k+`;
        }
        if (mirageMetric) {
          mirageMetric.textContent = `${total.toLocaleString()}+`;
        }
      }
    } catch (error) {
      console.warn('Stats fetch failed, using fallbacks:', error.message);
    }
  }

  fetchLiveStats();
});

