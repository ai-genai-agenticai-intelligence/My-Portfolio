/**
 * Abhishek Sahoo Portfolio - Scroll Reveal & Count-Up Engine
 * Standalone, lightweight, high-performance module for card reveals,
 * staggered row animations, stat number counter, and hover lifts.
 */
(function (global) {
  'use strict';

  // Configurable defaults
  const defaults = {
    selector: '.reveal, .reveal-card, .reveal-chip, .reveal-stat',
    threshold: 0.2,
    duration: '0.7s',
    distance: '48px',
    scaleFrom: '0.96',
    ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    stagger: 140, // 140ms stagger per row item (index % 3)
    counterDuration: 1100, // ~1.1s count-up
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
   * Parse numerical stat strings into components.
   * Handles integers, floats, negative values, and prefixes/suffixes like '<220ms', '100%', '-65%', '0.98', '14+'
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
   * Animate a stat number counting up from 0 to target over ~1.1s with smooth easeOutCubic.
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
      // easeOutCubic
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
   * Reveal an element and start child stat counters in sync with appearance
   */
  function revealElement(el) {
    if (el.classList.contains('is-revealed')) return;
    el.classList.add('is-revealed');

    // Find any stat numbers inside this element or on the element itself
    const statTargets = [];
    if (el.matches('.metric-num, .stat-val, [data-stat]')) {
      statTargets.push(el);
    }
    el.querySelectorAll('.metric-num, .stat-val, [data-stat], .reveal-stat-num').forEach(s => {
      statTargets.push(s);
    });

    if (statTargets.length > 0) {
      const delayVal = parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0;
      setTimeout(() => {
        statTargets.forEach(statEl => animateCountUp(statEl, config.counterDuration));
      }, Math.max(0, delayVal));
    }
  }

  /**
   * Compute row stagger: (index % 3) * 140ms
   */
  function applyStagger(element) {
    if (element.dataset.revealDelay) {
      element.style.setProperty('--reveal-delay', `${element.dataset.revealDelay}ms`);
      return;
    }

    if (element.style.getPropertyValue('--reveal-delay')) {
      return;
    }

    const parent = element.parentElement;
    if (!parent) return;

    const siblings = Array.from(parent.children).filter(child =>
      child.matches('.reveal, .reveal-card, .reveal-chip, .reveal-stat, .p-bento-card, .cs-result-metric, .hero-stat-box, .skill-cat-card, .core-lib-card, .skill-tag, .core-lib-tag')
    );

    const index = siblings.indexOf(element);
    const staggerIndex = index >= 0 ? (index % 3) : 0;
    const delay = staggerIndex * config.stagger;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
  }

  /**
   * IntersectionObserver callback
   */
  function onIntersect(entries, obs) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        // Animate only once, then unobserve
        obs.unobserve(entry.target);
      }
    });
  }

  /**
   * Initialize engine and observe cards
   */
  function init(options) {
    if (options) {
      config = { ...config, ...options };
    }

    // Progressive enhancement: only hide unrevealed cards if JS is running
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.add('js-reveal-ready');
    }

    if (prefersReducedMotion()) {
      document.querySelectorAll(config.selector).forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    if (!observer && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(onIntersect, {
        threshold: config.threshold
      });
    }

    refresh();
  }

  /**
   * Scan for matching elements, apply row stagger, and observe
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
        if (observer && !observedElements.has(el)) {
          observer.observe(el);
          observedElements.add(el);
        }
      }
    });
  }

  /**
   * One-line helper to observe an element or selector
   * Usage:
   *   ScrollReveal.reveal(myElement);
   *   ScrollReveal.reveal('.my-custom-card', { delay: 200 });
   */
  function reveal(target, customOptions) {
    const handleEl = (el) => {
      el.classList.add('reveal');
      if (customOptions && customOptions.delay !== undefined) {
        el.dataset.revealDelay = customOptions.delay;
      }
      applyStagger(el);
      if (observer) {
        observer.observe(el);
        observedElements.add(el);
      }
    };

    if (typeof target === 'string') {
      document.querySelectorAll(target).forEach(handleEl);
    } else if (target instanceof Element) {
      handleEl(target);
    }
  }

  // Setup auto-init on DOMContentLoaded and watch for client-side navigation
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }

    window.addEventListener('popstate', refresh);
    window.addEventListener('hashchange', refresh);
    window.addEventListener('routeChange', refresh);
  }

  const ScrollReveal = {
    init,
    refresh,
    reveal,
    countUp: animateCountUp,
    config
  };

  global.ScrollReveal = ScrollReveal;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollReveal;
  }
})(typeof window !== 'undefined' ? window : this);
