/**
 * Abhishek Sahoo Portfolio - Unified Scroll Reveal Engine
 * Shared reveal animation engine for portfolio cards.
 *
 * Requirements:
 * - Whole card animated as one unit (never inner chips or parts separately)
 * - IntersectionObserver: threshold 0, rootMargin "0px 0px -12% 0px"
 * - Reveal: opacity 0 -> 1, translate 48px -> 0, scale 0.96 -> 1 over 0.7s with cubic-bezier(.2,.8,.2,1)
 * - Column stagger: delay = (column index) * 120ms from real grid (getComputedStyle)
 * - Project filter tabs: re-run reveal on newly visible cards
 * - Respect prefers-reduced-motion: immediate display with no movement
 */
(function (global) {
  'use strict';

  const defaults = {
    selector: '.skills-bento-card, .p-bento-card, .reveal, .reveal-card, .reveal-stat, .about-arch-visual, .bento-bio-card, .bento-stat-card, .exp-main-card, .edu-card, .certifications-card, .workflow-step-card, .workflow-preview-panel, .case-study-card, .testimonial-box, .contact-info-card, .contact-form-card, .hero-stat-box, .skills-legend-bar',
    threshold: 0,
    rootMargin: '0px 0px -12% 0px',
    duration: '0.7s',
    distance: '48px',
    scaleFrom: '0.96',
    ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    stagger: 120, // 120ms stagger per column
    counterDuration: 1100,
    accentColor: '#ff5a1f',
    liftHover: '-6px'
  };

  let config = { ...defaults };
  let observer = null;
  const observedElements = new WeakSet();

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Determine real grid column count from computed CSS gridTemplateColumns
   */
  function getGridColumnCount(gridEl) {
    if (!gridEl) return 1;
    const comp = window.getComputedStyle(gridEl);
    if (comp.display !== 'grid') return 1;
    const template = comp.gridTemplateColumns;
    if (!template || template === 'none') return 1;
    const parts = template.split(' ').filter(Boolean);
    return Math.max(1, parts.length);
  }

  /**
   * Compute column stagger: delay = (column index) * 120ms
   */
  function applyStagger(element) {
    if (element.dataset.revealDelay) {
      const d = element.dataset.revealDelay;
      element.style.setProperty('--card-delay', `${d}ms`);
      element.style.setProperty('--reveal-delay', `${d}ms`);
      return;
    }

    const parent = element.parentElement;
    if (!parent) return;

    // Technical Skills 12-Column Grid
    if (parent.classList.contains('skills-bento-grid') || element.closest('.skills-bento-grid')) {
      const isMobile = window.innerWidth <= 860;
      if (isMobile) {
        element.style.setProperty('--card-delay', '0ms');
        element.style.setProperty('--reveal-delay', '0ms');
        return;
      }

      // Column index based on 12-col bento layout:
      // Row 1: card 1 (span 7, col 0) -> 0ms; card 2 (span 5, col 1) -> 120ms
      // Row 2: card 3 (span 5, col 0) -> 0ms; card 4 (span 7, col 1) -> 120ms
      // Row 3: MySQL (col 0) -> 0ms; PostgreSQL (col 1) -> 120ms; Stats (col 2) -> 240ms
      if (element.classList.contains('skills-card-span-7') && !element.previousElementSibling) {
        element.style.setProperty('--card-delay', '0ms');
      } else if (element.classList.contains('skills-card-span-5') && element.previousElementSibling && element.previousElementSibling.classList.contains('skills-card-span-7')) {
        element.style.setProperty('--card-delay', '120ms');
      } else if (element.classList.contains('skills-card-span-5')) {
        element.style.setProperty('--card-delay', '0ms');
      } else if (element.classList.contains('skills-card-span-7')) {
        element.style.setProperty('--card-delay', '120ms');
      } else if (element.classList.contains('skills-card-span-4')) {
        const row3 = Array.from(parent.querySelectorAll('.skills-card-span-4'));
        const idx = row3.indexOf(element);
        const colIdx = idx >= 0 ? (idx % 3) : 0;
        element.style.setProperty('--card-delay', `${colIdx * 120}ms`);
      } else {
        element.style.setProperty('--card-delay', '0ms');
      }
      element.style.setProperty('--reveal-delay', element.style.getPropertyValue('--card-delay'));
      return;
    }

    // Projects Grid (repeat(auto-fill, minmax(300px, 1fr)))
    if (parent.classList.contains('projects-bento-grid') || element.closest('.projects-bento-grid')) {
      const grid = element.closest('.projects-bento-grid') || parent;
      const numCols = getGridColumnCount(grid);
      const visibleCards = Array.from(grid.querySelectorAll('.p-bento-card')).filter(
        c => c.style.display !== 'none' && window.getComputedStyle(c).display !== 'none'
      );
      const idx = visibleCards.indexOf(element);
      const colIdx = idx >= 0 ? (idx % numCols) : 0;
      const delay = colIdx * config.stagger;
      element.style.setProperty('--card-delay', `${delay}ms`);
      element.style.setProperty('--reveal-delay', `${delay}ms`);
      return;
    }

    // Fallback for any other sibling grid/flex items
    const numCols = getGridColumnCount(parent);
    const siblings = Array.from(parent.children).filter(child =>
      child.matches(config.selector) &&
      window.getComputedStyle(child).display !== 'none'
    );
    const index = siblings.indexOf(element);
    const colIndex = index >= 0 ? (index % numCols) : 0;
    const delay = colIndex * config.stagger;
    element.style.setProperty('--card-delay', `${delay}ms`);
    element.style.setProperty('--reveal-delay', `${delay}ms`);
  }

  /**
   * Parse numerical stat strings into components for count-up
   */
  function parseStatNumber(text) {
    if (!text) return null;
    const clean = text.trim();
    const match = clean.match(/^([^0-9\-+<]*?)([-+<]?[\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return null;

    let pre = match[1] || '';
    let numStr = match[2].replace(/,/g, '');
    let suf = match[3] || '';

    if (numStr.startsWith('<')) {
      pre += '<';
      numStr = numStr.slice(1);
    }

    const targetVal = parseFloat(numStr);
    if (isNaN(targetVal)) return null;

    const hasDot = numStr.includes('.');
    const decimals = hasDot ? numStr.split('.')[1].length : 0;

    return {
      prefix: pre,
      targetVal,
      suffix: suf,
      decimals,
      originalText: clean
    };
  }

  /**
   * Animate a stat number counting up from 0 to target
   */
  function animateCountUp(el, duration = config.counterDuration) {
    if (el.dataset.countingDone === 'true') return;

    const raw = el.dataset.statTarget || el.textContent.trim();
    const parsed = parseStatNumber(raw);
    if (!parsed) return;

    el.dataset.countingDone = 'true';
    el.dataset.statTarget = parsed.originalText;

    if (prefersReducedMotion()) {
      el.textContent = parsed.originalText;
      return;
    }

    const startTime = performance.now();
    const startVal = 0;
    const targetVal = parsed.targetVal;

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * ease;

      el.textContent = `${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = parsed.originalText;
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Reveal an element once
   */
  function revealElement(el) {
    if (el.classList.contains('is-revealed')) return;
    el.classList.add('is-revealed');

    // Trigger any child stat counters
    const statTargets = [];
    if (el.matches('.metric-num, .stat-val, [data-stat]')) {
      statTargets.push(el);
    }
    el.querySelectorAll('.metric-num, .stat-val, [data-stat], .reveal-stat-num').forEach(s => {
      statTargets.push(s);
    });

    if (statTargets.length > 0) {
      const delayVal = parseFloat(el.style.getPropertyValue('--card-delay') || el.style.getPropertyValue('--reveal-delay')) || 0;
      setTimeout(() => {
        statTargets.forEach(statEl => animateCountUp(statEl, config.counterDuration));
      }, Math.max(0, delayVal));
    }
  }

  /**
   * IntersectionObserver callback:
   * When a card enters the viewport, reveal it once, then unobserve it immediately.
   */
  function onIntersect(entries, obs) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }

  /**
   * Initialize shared observer and observe cards
   */
  function init(options) {
    if (options) {
      config = { ...config, ...options };
    }

    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.add('js-reveal-ready');
      document.documentElement.classList.add('js-skills-ready');
    }

    if (prefersReducedMotion()) {
      document.querySelectorAll(config.selector).forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    if (!observer && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(onIntersect, {
        threshold: config.threshold, // 0 as required
        rootMargin: config.rootMargin // '0px 0px -12% 0px' as required
      });
    }

    refresh();
  }

  /**
   * Scan for matching elements, apply column stagger, and observe
   */
  function refresh() {
    if (prefersReducedMotion()) {
      document.querySelectorAll(config.selector).forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const elements = document.querySelectorAll(config.selector);
    elements.forEach(el => {
      if (!el.classList.contains('is-revealed')) {
        applyStagger(el);
        if (observer) {
          observer.observe(el);
          observedElements.add(el);
        } else {
          revealElement(el);
        }
      }
    });
  }

  /**
   * Re-run reveal on cards when project filter changes
   */
  function filterChange(gridContainer) {
    const grid = gridContainer || document.getElementById('projectsGrid');
    if (!grid) return;

    if (prefersReducedMotion()) {
      grid.querySelectorAll('.p-bento-card').forEach(c => c.classList.add('is-revealed'));
      return;
    }

    const numCols = getGridColumnCount(grid);
    const visibleCards = Array.from(grid.querySelectorAll('.p-bento-card')).filter(
      c => c.style.display !== 'none' && window.getComputedStyle(c).display !== 'none'
    );

    visibleCards.forEach((card, idx) => {
      card.classList.remove('is-revealed');
      const colIdx = idx % numCols;
      const delay = colIdx * config.stagger;
      card.style.setProperty('--card-delay', `${delay}ms`);
      card.style.setProperty('--reveal-delay', `${delay}ms`);

      // Force style reflow so transition re-triggers cleanly
      void card.offsetWidth;

      if (observer) {
        observer.observe(card);
      } else {
        card.classList.add('is-revealed');
      }
    });
  }

  // Auto-init and route change listeners
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }

    window.addEventListener('popstate', refresh);
    window.addEventListener('hashchange', refresh);
    window.addEventListener('routeChange', refresh);
    window.addEventListener('loadMore', refresh);
  }

  const ScrollReveal = {
    init,
    refresh,
    filterChange,
    countUp: animateCountUp,
    config
  };

  global.ScrollReveal = ScrollReveal;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollReveal;
  }
})(typeof window !== 'undefined' ? window : this);
