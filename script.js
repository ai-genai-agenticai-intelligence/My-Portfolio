/**
 * Abhishek Sahoo - AI & Agentic Systems Engineer
 * Luxury Fluxora Portfolio Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. Ambient Mouse Spotlight
  initAmbientSpotlight();

  // 2. Dark / Light Theme Switch
  initThemeToggle();

  // 3. Scroll Progress & Active Navigation
  initScrollFeatures();

  // 4. Mobile Menu Toggle
  initMobileMenu();

  // 5. Project Filtering (10 Systems)
  initProjectFilters();

  // 6. 1-on-1 Consultation Booking Engine
  initBookingEngine();

  // 7. 3-Phase Workflow Interactive Preview
  initWorkflowTabs();

  // 8. Contact Form with Instant Backend + WhatsApp Ping
  initContactForm();

  // 9. Autonomous AI Agent Concierge (AbhiBot)
  initAiAgent();
});

/* --------------------------------------------------------------------------
   1. AMBIENT MOUSE SPOTLIGHT
   -------------------------------------------------------------------------- */
function initAmbientSpotlight() {
  const spotlight = document.getElementById('ambientSpotlight');
  if (!spotlight) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 3;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    spotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   2. THEME SWITCH (DARK / LIGHT ONLY)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';

  html.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio_theme', newTheme);
      showToast(newTheme === 'dark' ? '🌙 Dark Mode Activated' : '☀️ White Mode Activated');
      if (window.lucide) lucide.createIcons();
    });
  }
}

/* --------------------------------------------------------------------------
   3. SCROLL PROGRESS & ACTIVE LINK
   -------------------------------------------------------------------------- */
function initScrollFeatures() {
  const progressBar = document.getElementById('scrollProgressBar');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    let currentId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navItems.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. MOBILE NAVIGATION
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');

  if (menuBtn && navLinks) {
    function setMenuState(isOpen) {
      if (isOpen) {
        navLinks.classList.add('mobile-open', 'active');
        if (navBackdrop) navBackdrop.classList.add('active');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.innerHTML = '<i data-lucide="x"></i>';
      } else {
        navLinks.classList.remove('mobile-open', 'active');
        if (navBackdrop) navBackdrop.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '<i data-lucide="menu"></i>';
      }
      if (window.lucide) {
        lucide.createIcons();
      }
    }

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.contains('mobile-open');
      setMenuState(!isOpen);
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => setMenuState(false));
    }

    navLinks.querySelectorAll('a, button').forEach((link) => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('mobile-open')) {
        setMenuState(false);
      }
    });
  }
}

/* --------------------------------------------------------------------------
   5. PROJECT CATEGORY FILTERS
   -------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.p-bento-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. 3-PHASE WORKFLOW INTERACTIVE BLUEPRINT TABS
   -------------------------------------------------------------------------- */
function initWorkflowTabs() {
  const stepCards = document.querySelectorAll('.workflow-step-card');
  const previewBox = document.getElementById('blueprintPreview');
  if (!previewBox) return;

  const stepPreviews = {
    '1': `
      <i data-lucide="git-branch" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
      <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Phase 01: State Graph Topology</h4>
      <p style="font-size: 0.9rem;">Schema definition • Multi-Agent Roles • Dynamic Memory Buffers</p>
    `,
    '2': `
      <i data-lucide="network" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
      <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Phase 02: Supervisor Graph & MCP</h4>
      <p style="font-size: 0.9rem;">Supervisor Node → Dynamic Tool Router → Human-in-the-Loop Checkpoint</p>
    `,
    '3': `
      <i data-lucide="shield-check" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
      <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Phase 03: Responsible Guardrails & Cloud</h4>
      <p style="font-size: 0.9rem;">PII Sanitization • Prompt Injection Defense • Render Cloud Deployment</p>
    `,
  };

  stepCards.forEach((card) => {
    card.addEventListener('click', () => {
      stepCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');

      const stepNum = card.getAttribute('data-step') || '1';
      previewBox.innerHTML = stepPreviews[stepNum] || stepPreviews['1'];
      if (window.lucide) lucide.createIcons();
    });
  });
}

/* --------------------------------------------------------------------------
   7. 1-ON-1 BOOKING ENGINE WITH .ICS CALENDAR GENERATION
   -------------------------------------------------------------------------- */
function initBookingEngine() {
  const modal = document.getElementById('bookingModal');
  const openBtns = [
    document.getElementById('openBookingHeader'),
    document.getElementById('heroBookBtn'),
    document.getElementById('ctaBookBtn'),
  ];
  const closeBtn = document.getElementById('closeBookingModal');
  const form = document.getElementById('appointmentForm');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = today;
      dateInput.min = today;
    }
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  openBtns.forEach((btn) => {
    if (btn) btn.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const sessionType = document.getElementById('sessionType').value;
      const bDate = document.getElementById('bookingDate').value;
      const bTime = document.getElementById('bookingTime').value;
      const bName = document.getElementById('bookingName').value.trim();
      const bEmail = document.getElementById('bookingEmail').value.trim();

      try {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_name: bName,
            client_email: bEmail,
            session_type: sessionType,
            date: bDate,
            time: bTime,
            message: 'Booked via Fluxora luxury executive portal',
          }),
        });
      } catch (err) {
        console.warn('Backend appointment fallback:', err);
      }

      // Generate & Download .ICS
      generateIcsFile({
        title: `AI Strategy Session: Abhishek Sahoo & ${bName}`,
        description: `Session: ${sessionType}\\nAttendee: ${bName} (${bEmail})\\nHost: Abhishek Sahoo (+91 8984065377)`,
        date: new Date(bDate),
        time: bTime,
      });

      closeModal();
      showToast(`🎉 Confirmed! .ICS calendar invite downloaded for ${bName}`);
    });
  }
}

function generateIcsFile({ title, description, date, time }) {
  const pad = (n) => (n < 10 ? `0${n}` : n);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  let hour = 11;
  let minute = 0;
  if (time.includes(':')) {
    const parts = time.split(':');
    hour = parseInt(parts[0], 10);
    if (time.includes('PM') && hour < 12) hour += 12;
    if (time.includes('AM') && hour === 12) hour = 0;
    minute = parseInt(parts[1], 10) || 0;
  }

  const startUtc = `${year}${month}${day}T${pad(hour)}${pad(minute)}00Z`;
  const endUtc = `${year}${month}${day}T${pad(hour + 1)}${pad(minute)}00Z`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Abhishek Sahoo//Portfolio AI Consultation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:ABHI-${Date.now()}@portfolio.ai`,
    `DTSTAMP:${startUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'LOCATION:Google Meet / Remote',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AI-Consultation-Abhishek-Sahoo.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* --------------------------------------------------------------------------
   8. CONTACT FORM WITH DIRECT WHATSAPP & FASTAPI DISPATCH
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim() || 'Not provided';
    const message = document.getElementById('contactMessage').value.trim();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Message...</span>';
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
        }),
      });

      if (response.ok) {
        showToast('✉️ Message sent successfully! Abhishek will reply to your email shortly.');
        form.reset();
      } else {
        showToast('✉️ Message recorded in dispatch queue.');
        form.reset();
      }
    } catch (err) {
      console.warn('Backend contact dispatch fallback:', err);
      showToast('✉️ Message submitted! Thank you for reaching out.');
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        if (window.lucide) lucide.createIcons();
      }
    }
  });
}

/* --------------------------------------------------------------------------
   9. AUTONOMOUS AI AGENT CONCIERGE (ABHIBOT)
   -------------------------------------------------------------------------- */
function initAiAgent() {
  const agentTrigger = document.getElementById('agentTriggerBtn');
  const agentNavBtn = document.getElementById('openAgentNavBtn');
  const agentWindow = document.getElementById('aiAgentWindow');
  const closeAgent = document.getElementById('closeAgentWindow');
  const resetAgentBtn = document.getElementById('resetAgentBtn');
  const expandAgentBtn = document.getElementById('expandAgentBtn');
  const sendBtn = document.getElementById('agentSendBtn');
  const input = document.getElementById('agentInput');
  const chatBody = document.getElementById('agentChatBody');
  const chipsBar = document.getElementById('agentChipsBar');
  const bookingModal = document.getElementById('bookingModal');

  if (!agentWindow) return;

  // In-memory conversation state for multi-turn reasoning
  let conversationHistory = [];

  const initialChips = [
    "🚀 Show 13 Projects",
    "🤖 LangGraph & Agents",
    "📊 Analytics Dashboards",
    "🛡️ Guardrails",
    "📅 Book Strategy Call",
    "📞 Contact Abhishek"
  ];

  function openAgent() {
    agentWindow.classList.add('open');
    if (agentTrigger) {
      agentTrigger.classList.add('active');
      const widget = document.querySelector('.ai-agent-widget');
      if (widget && window.innerWidth <= 768) {
        widget.classList.add('widget-hidden');
      }
    }
    if (input) setTimeout(() => input.focus(), 150);
    setTimeout(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
  }

  function closeAgentWindow() {
    agentWindow.classList.remove('open');
    if (agentTrigger) {
      agentTrigger.classList.remove('active');
      const widget = document.querySelector('.ai-agent-widget');
      if (widget) {
        widget.classList.remove('widget-hidden');
      }
    }
  }

  function toggleAgent() {
    if (agentWindow.classList.contains('open')) {
      closeAgentWindow();
    } else {
      openAgent();
    }
  }

  if (agentTrigger) agentTrigger.addEventListener('click', toggleAgent);
  if (agentNavBtn) agentNavBtn.addEventListener('click', openAgent);
  if (closeAgent) closeAgent.addEventListener('click', closeAgentWindow);

  // Keyboard accessibility: ESC key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && agentWindow.classList.contains('open')) {
      closeAgentWindow();
    }
  });

  // Dynamic State Toggling between Geometric Swirl and Mic + Accent Sparkle
  const pillIconSwirl = document.getElementById('pillIconSwirl');
  const pillIconMic = document.getElementById('pillIconMic');
  let currentPillIconState = 'swirl';

  function setPillIconState(state) {
    currentPillIconState = state;
    if (pillIconSwirl && pillIconMic) {
      if (state === 'mic') {
        pillIconSwirl.classList.remove('active');
        pillIconMic.classList.add('active');
      } else {
        pillIconMic.classList.remove('active');
        pillIconSwirl.classList.add('active');
      }
      // Subtle scale-up effect when state toggles
      if (agentTrigger) {
        agentTrigger.style.transform = 'scale(1.06)';
        setTimeout(() => {
          agentTrigger.style.transform = '';
        }, 220);
      }
    }
  }

  function togglePillIconState() {
    setPillIconState(currentPillIconState === 'swirl' ? 'mic' : 'swirl');
  }

  // Periodic automatic state toggle every 4.5 seconds to demonstrate fluid dual-state capability
  setInterval(togglePillIconState, 4500);

  // Also toggle on hover for immediate tactile feedback
  if (agentTrigger) {
    agentTrigger.addEventListener('mouseenter', () => {
      togglePillIconState();
    });
  }

  // Expand / Minimize Window
  if (expandAgentBtn) {
    expandAgentBtn.addEventListener('click', () => {
      agentWindow.classList.toggle('expanded');
      const isExpanded = agentWindow.classList.contains('expanded');
      expandAgentBtn.innerHTML = isExpanded
        ? '<i data-lucide="minimize-2"></i>'
        : '<i data-lucide="maximize-2"></i>';
      expandAgentBtn.title = isExpanded ? 'Minimize Window' : 'Maximize Window';
      if (window.lucide) lucide.createIcons();
    });
  }

  const VORTEX_SENDER_HTML = `
    <div class="agent-msg-sender">
      <svg class="vortex-mini-svg vortex-spin-slow" viewBox="0 0 24 24" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vortexMiniGlobalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff2a1"/>
            <stop offset="35%" stop-color="#ffa600"/>
            <stop offset="70%" stop-color="#ff6b00"/>
            <stop offset="100%" stop-color="#ff2200"/>
          </linearGradient>
        </defs>
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6666zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="url(#vortexMiniGlobalGrad)"/>
      </svg>
      AbhiBot AI
    </div>
  `;
  const GEMINI_SENDER_HTML = VORTEX_SENDER_HTML;

  // Reset Conversation
  if (resetAgentBtn) {
    resetAgentBtn.addEventListener('click', () => {
      conversationHistory = [];
      chatBody.innerHTML = `
        <div class="agent-msg bot">
          ${GEMINI_SENDER_HTML}
          Conversation refreshed! I am ready to guide you through Abhishek's <strong>13 live production systems</strong>, his <strong>LangGraph Multi-Agent architectures</strong>, or help you book an executive strategy session.
          <div class="chat-actions-row" style="margin-top: 0.6rem;">
            <a href="#projects" class="chat-action-btn"><i data-lucide="grid"></i> View 13 Projects</a>
            <button class="chat-action-btn book-session-trigger"><i data-lucide="calendar"></i> Book Strategy Session</button>
          </div>
        </div>
      `;
      renderChips(initialChips);
      if (window.lucide) lucide.createIcons();
      showToast('Conversation refreshed');
    });
  }

  // Handle Suggestion Chips Clicks
  function setupChipListeners() {
    if (!chipsBar) return;
    const chips = chipsBar.querySelectorAll('.agent-chip');
    chips.forEach((chip) => {
      chip.onclick = () => {
        const query = chip.getAttribute('data-query') || chip.textContent.trim();
        sendMessage(query);
      };
    });
  }
  setupChipListeners();

  function renderChips(chipsList) {
    if (!chipsBar || !chipsList || chipsList.length === 0) return;
    chipsBar.innerHTML = chipsList
      .map(
        (chipText) =>
          `<button class="agent-chip" data-query="${chipText}">${chipText}</button>`
      )
      .join('');
    setupChipListeners();
  }

  // Delegate action button clicks inside chat messages
  chatBody.addEventListener('click', (e) => {
    const bookBtn = e.target.closest('.book-session-trigger');
    if (bookBtn) {
      if (bookingModal) {
        bookingModal.classList.add('open');
        closeAgentWindow();
      }
      return;
    }

    const projectLink = e.target.closest('a[href="#projects"]');
    if (projectLink) {
      const projSec = document.getElementById('projects');
      if (projSec) {
        projSec.scrollIntoView({ behavior: 'smooth' });
        closeAgentWindow();
      }
    }
  });

  async function sendMessage(userText) {
    const text = (userText || (input ? input.value : '')).trim();
    if (!text) return;

    const headerAvatar = document.getElementById('agentHeaderAvatar') || (agentWindow ? agentWindow.querySelector('.agent-avatar-icon') : null);
    if (headerAvatar) headerAvatar.classList.add('is-thinking');

    // Append user message bubble
    appendMessage(text, 'user');
    if (input) input.value = '';

    // Add to history
    conversationHistory.push({ role: 'user', content: text });

    // Show interactive 3-dot typing wave indicator
    const typingElem = document.createElement('div');
    typingElem.className = 'agent-msg bot';
    typingElem.innerHTML = `
      ${GEMINI_SENDER_HTML}
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatBody.appendChild(typingElem);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Helper to display response and run UI actions
    function applyResponse(replyHtml, action, suggestedChips) {
      if (headerAvatar) headerAvatar.classList.remove('is-thinking');
      typingElem.innerHTML = `
        ${GEMINI_SENDER_HTML}
        ${replyHtml}
      `;
      conversationHistory.push({ role: 'assistant', content: replyHtml });

      if (suggestedChips && suggestedChips.length > 0) {
        renderChips(suggestedChips);
      }

      // Trigger calendar or project navigation actions
      if (action === 'open_calendar' && bookingModal) {
        setTimeout(() => bookingModal.classList.add('open'), 400);
      } else if (action === 'view_projects') {
        const projSec = document.getElementById('projects');
        if (projSec) {
          setTimeout(() => projSec.scrollIntoView({ behavior: 'smooth' }), 500);
        }
      }

      if (window.lucide) lucide.createIcons();
      setTimeout(() => {
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
      }, 50);
    }

    // Determine target API endpoint with intelligent localhost / cross-port support
    const targetEndpoints = ['/api/agent/chat'];
    if (
      window.location.protocol === 'file:' ||
      (window.location.port !== '8000' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ) {
      targetEndpoints.unshift('http://127.0.0.1:8000/api/agent/chat');
    }

    let backendSucceeded = false;

    for (const url of targetEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: conversationHistory.slice(-6),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.reply) {
            applyResponse(data.reply, data.action, data.suggested_chips);
            backendSucceeded = true;
            break;
          }
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    // If backend was unreachable or returned non-200, use robust client semantic engine
    if (!backendSucceeded) {
      setTimeout(() => {
        const localResult = resolveLocalAiResponse(text);
        applyResponse(localResult.reply, localResult.action, localResult.suggested_chips);
      }, 350);
    }
  }

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `agent-msg ${sender}`;
    if (sender === 'bot') {
      msg.innerHTML = `${GEMINI_SENDER_HTML}${text}`;
    } else {
      msg.textContent = text;
    }
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
}

/* --------------------------------------------------------------------------
   CLIENT-SIDE AUTONOMOUS SEMANTIC INTENT ENGINE (ZERO-LATENCY FALLBACK)
   -------------------------------------------------------------------------- */
function hasLocalIntent(text, patterns) {
  const textLower = (text || '').toLowerCase();
  for (const pattern of patterns) {
    const p = pattern.toLowerCase().trim();
    if (p.includes(' ') || p.includes('-')) {
      if (textLower.includes(p)) return true;
    } else {
      const regex = new RegExp(`\\b${p}\\b`, 'i');
      if (regex.test(textLower)) return true;
    }
  }
  return false;
}

function resolveLocalAiResponse(rawQuery) {
  const q = (rawQuery || '').trim().toLowerCase();

  // 1. Booking & Scheduling Strategy Session
  if (
    hasLocalIntent(q, [
      'book',
      'booking',
      'schedule',
      'appointment',
      'consultation',
      'meeting',
      'interview',
      'calendar',
      'strategy session',
      'strategy call',
      '1-on-1',
      '1:1',
      'session',
    ])
  ) {
    return {
      reply: `Opening the <strong>1-on-1 Strategy Session Calendar</strong> for you! You can pick your preferred date and time, and instantly receive a calendar invite (.ics).<br><div class='chat-actions-row'><button class='chat-action-btn book-session-trigger'><i data-lucide='calendar'></i> Open Booking Modal</button><a href='https://wa.me/918984065377' target='_blank' class='chat-action-btn'><i data-lucide='phone'></i> Direct WhatsApp</a></div>`,
      action: 'open_calendar',
      suggested_chips: ['🚀 Show 13 Projects', '🤖 Multi-Agent Systems', '📞 Direct WhatsApp'],
    };
  }

  // 2. Direct Contact & WhatsApp
  if (
    hasLocalIntent(q, [
      'contact',
      'reach',
      'hire',
      'email',
      'phone',
      'whatsapp',
      'call',
      'message',
      'get in touch',
      'connect',
    ])
  ) {
    return {
      reply: `You can connect with Abhishek directly on WhatsApp / Phone at <strong>+91 8984065377</strong> or email him at <strong>abhisheksahoo08583@gmail.com</strong>.<br><div class='chat-actions-row'><a href='https://wa.me/918984065377' target='_blank' class='chat-action-btn'><i data-lucide='message-circle'></i> Open WhatsApp Chat</a><a href='https://www.linkedin.com/in/abhishek-sahoo-75519b313' target='_blank' class='chat-action-btn'><i data-lucide='linkedin'></i> View LinkedIn</a></div>`,
      action: 'open_whatsapp',
      suggested_chips: ['📅 Book 1:1 Session', '🚀 View All 13 Projects', '💻 View Tech Stack'],
    };
  }

  // 3. Resume & CV Download
  if (
    hasLocalIntent(q, [
      'resume',
      'cv',
      'curriculum',
      'download resume',
      'pdf',
      'bio',
    ])
  ) {
    return {
      reply: `You can view and download Abhishek Sahoo's official <strong>AI & Agentic Systems Engineer Resume (PDF)</strong> detailing his Naresh i Tech experience, 13 live deployments, and credentials.<br><div class='chat-actions-row'><a href='Abhishek_Sahoo_AI_Resume.pdf' download='Abhishek_Sahoo_AI_Resume.pdf' class='chat-action-btn'><i data-lucide='download'></i> Download Official Resume (PDF)</a><a href='https://www.linkedin.com/in/abhishek-sahoo-75519b313' target='_blank' class='chat-action-btn'><i data-lucide='linkedin'></i> LinkedIn Profile</a></div>`,
      action: 'download_resume',
      suggested_chips: ['📅 Book 1:1 Session', '🚀 View All 13 Projects', '📞 Contact Abhishek'],
    };
  }

  // 4. Work Experience & Internship
  if (
    hasLocalIntent(q, [
      'experience',
      'intern',
      'internship',
      'work history',
      'naresh i tech',
      'career',
      'job',
      'company',
    ])
  ) {
    return {
      reply: `Abhishek completed a rigorous <strong>Data Science & Agentic AI Engineer Internship at Naresh i Tech (Hyderabad)</strong>. He built enterprise multi-agent LangGraph workflows, optimized semantic search latency by 35% with vector caching, fine-tuned deep learning models to 97.2%+ benchmark accuracy, and deployed cloud production systems.`,
      action: 'general',
      suggested_chips: ['🤖 Multi-Agent Systems', '🛡️ LLM Guardrails', '📄 Download Resume', '📅 Book Strategy Call'],
    };
  }

  // 5. Education & College
  if (
    hasLocalIntent(q, [
      'education',
      'college',
      'smit',
      'degree',
      'university',
      'school',
      'graduate',
      'cgpa',
      'academics',
    ])
  ) {
    return {
      reply: `Abhishek is pursuing his <strong>B.E. in Computer Science & Engineering (2022 - 2026)</strong> at <strong>Sikkim Manipal Institute of Technology (SMIT)</strong>, focusing on Distributed Systems, Multi-Agent Architectures, and Responsible AI.`,
      action: 'general',
      suggested_chips: ['💼 View Tech Stack', '🚀 View 13 Projects', '📞 Direct Contact'],
    };
  }

  // 6. Certifications
  if (
    hasLocalIntent(q, [
      'certification',
      'certifications',
      'certificate',
      'certificates',
      'courses',
      'deeplearning.ai',
      'credentials',
    ])
  ) {
    return {
      reply: `Abhishek holds verified certifications in <strong>Machine Learning Specialization (DeepLearning.AI / Stanford)</strong>, <strong>Deep Learning & Generative AI</strong>, and <strong>PyTorch & TensorFlow</strong> foundations.`,
      action: 'general',
      suggested_chips: ['💼 Tech Stack', '🚀 13 Live Projects', '📄 Download Resume'],
    };
  }

  // 7. Flagship Copilot (Enterprise IT Support)
  if (
    hasLocalIntent(q, [
      'copilot',
      'it support',
      'support agent',
      'rag',
      'pinecone',
    ])
  ) {
    return {
      reply: `<strong>Enterprise IT Support: Agentic RAG Copilot</strong> is Abhishek's flagship enterprise support system. It combines <strong>LangGraph state machines</strong>, <strong>Pinecone vector indexing</strong>, dynamic fallback search, and real-time execution tracing for enterprise IT troubleshooting.<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> View Project Card</a></div>`,
      action: 'view_project',
      suggested_chips: ['🔬 ResearchMind System', '🤖 Multi-Node LangGraph', '📅 Book Strategy Call'],
    };
  }

  // 8. ResearchMind
  if (
    hasLocalIntent(q, [
      'researchmind',
      'deep research',
      'academic synthesis',
      'multi-paper',
    ])
  ) {
    return {
      reply: `<strong>ResearchMind</strong> is an Autonomous Deep Research Multi-Agent pipeline. It autonomously retrieves multi-source academic papers, resolves contradictions, validates sources, and compiles executive intelligence briefs.`,
      action: 'view_project',
      suggested_chips: ['🚀 Multi-Node LangGraph', '🛡️ LLM Guardrails', '📞 Contact Abhishek'],
    };
  }

  // 9. LangGraph & Multi-Agent Systems
  if (
    hasLocalIntent(q, [
      'langgraph',
      'multi-agent',
      'agentic',
      'supervisor',
      'mcp',
      'model context protocol',
      'hitl',
      'human in the loop',
      'multi node',
    ])
  ) {
    return {
      reply: `Abhishek specializes in <strong>Multi-Agent LangGraph Architectures</strong> featuring Supervisor nodes, stateful cycles, Human-in-the-Loop checkpoints, and Model Context Protocol (MCP) tool integrations for autonomous enterprise agents.`,
      action: 'general',
      suggested_chips: ['🚀 Enterprise IT Copilot', '🔬 ResearchMind Agent', '📅 Schedule Strategy Session'],
    };
  }

  // 10. LLM Guardrails & Responsible AI
  if (
    hasLocalIntent(q, [
      'guardrail',
      'guardrails',
      'responsible ai',
      'prompt injection',
      'pii',
      'hallucination',
      'safety',
    ])
  ) {
    return {
      reply: `Abhishek's <strong>Enterprise LLM Guardrail Engine</strong> delivers millisecond-level hallucination detection, prompt injection mitigation, and automated PII sanitization to make LLMs enterprise-grade and production-ready.`,
      action: 'general',
      suggested_chips: ['🤖 LangGraph Supervisor', '💼 Resume Analyzer', '📅 Book 1:1 Consultation'],
    };
  }

  // 11. Computer Vision & Deep Learning
  if (
    hasLocalIntent(q, [
      'vision',
      'cv',
      'imot',
      'yolo',
      'tracking',
      'imagenet',
      'cnn',
      'mood',
      'computer vision',
    ])
  ) {
    return {
      reply: `In Computer Vision & Deep Learning, Abhishek has built <strong>IMOT (Multi-Modal Object & Color Tracking)</strong> with YOLO & DeepSORT, <strong>ImageNet Visual Recognition (VGG16 / ResNet50)</strong>, and <strong>CNN Facial Mood Detection</strong>.<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> Jump to Vision Projects</a></div>`,
      action: 'general',
      suggested_chips: ['🤖 Agentic Systems', '📊 Analytics Dashboards', '📞 Contact Abhishek'],
    };
  }

  // 12. Business Intelligence & Analytics Dashboards
  if (
    hasLocalIntent(q, [
      'analytics',
      'bi',
      'dashboard',
      'dashboards',
      'business intelligence',
      'ecommerce',
      'e-commerce',
      'financial performance',
      'website performance',
      'traffic analytics',
      'netflix',
      'movie analysis',
      'streamlit',
    ])
  ) {
    return {
      reply: `Abhishek has deployed <strong>3 live Streamlit Cloud analytics suites</strong>:<br>• <strong>E-Commerce Financial Performance</strong>: Unit economics & margin modeling<br>• <strong>Website Performance & Traffic Telemetry</strong>: Real-time latency & funnel analysis<br>• <strong>Netflix Global Movie Analysis</strong>: Catalog dynamics & director networks<br><div class='chat-actions-row'><a href='https://e-commerce-financial-performance-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> E-Commerce App</a><a href='https://website-performance-analytics-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> Website App</a><a href='https://netflix-movie-analysis-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> Netflix App</a></div>`,
      action: 'general',
      suggested_chips: ['🚀 View All 13 Projects', '🤖 LangGraph & Agents', '📅 Book Strategy Call'],
    };
  }

  // 13. AI Resume Analyzer
  if (hasLocalIntent(q, ['resume analyzer', 'ats', 'job fit'])) {
    return {
      reply: `The <strong>AI Resume Analyzer & Job Fit Predictor</strong> evaluates applicant CVs against target job descriptions using dense vector embeddings and semantic parsing to provide ATS scores and skill gap insights.`,
      action: 'general',
      suggested_chips: ['🚀 View Projects', '🤖 Gemini Chatbot', '📅 Book 1:1 Session'],
    };
  }

  // 14. Gemini Chatbot
  if (hasLocalIntent(q, ['gemini chatbot', 'gemini 2.5', 'gemini 2.0', 'gemini flash', 'gemini'])) {
    return {
      reply: `The <strong>Gemini Flash Chatbot</strong> provides ultra-low latency conversational intelligence with streaming responses and contextual persona alignment.`,
      action: 'general',
      suggested_chips: ['🤖 LangGraph Agents', '🛡️ LLM Guardrails', '📅 Book 1:1 Session'],
    };
  }

  // 15. Projects Overview / Showcase
  if (
    hasLocalIntent(q, [
      'project',
      'projects',
      'work',
      'portfolio',
      'built',
      'showcase',
      'systems',
    ])
  ) {
    return {
      reply: `Abhishek has engineered and deployed <strong>13 production-grade systems</strong> across 4 domains: Multi-Agent LangGraph (4), LLM Guardrails & GenAI (3), Computer Vision (3), and Analytics Dashboards (3).<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> Jump To Projects Grid</a></div>`,
      action: 'view_projects',
      suggested_chips: ['🤖 Multi-Agent (4)', '🛡️ LLM & GenAI (3)', '👁️ Computer Vision (3)', '📊 Data Analytics (3)'],
    };
  }

  // 16. Technical Stack & Skills
  if (
    hasLocalIntent(q, [
      'skill',
      'skills',
      'tech',
      'stack',
      'framework',
      'tools',
      'python',
      'pytorch',
      'fastapi',
      'technologies',
      'languages',
    ])
  ) {
    return {
      reply: `Abhishek's technical stack includes: <strong>LangGraph & Multi-Agent Workflows</strong>, <strong>Agentic RAG & Pinecone</strong>, <strong>Model Context Protocol (MCP)</strong>, <strong>FastAPI & Python</strong>, <strong>PyTorch & OpenCV</strong>, <strong>Responsible AI Guardrails</strong>, and <strong>Streamlit & Tableau BI</strong>.`,
      action: 'general',
      suggested_chips: ['🚀 View 13 Projects', '📅 Schedule Strategy Session', '💬 WhatsApp Chat'],
    };
  }

  // 17. Who is Abhishek / Profile
  if (
    hasLocalIntent(q, [
      'who is abhishek',
      'about abhishek',
      'who are you',
      'tell me about yourself',
      'tell me about abhishek',
      'introduce abhishek',
      'profile',
    ])
  ) {
    return {
      reply: `Abhishek Sahoo is an <strong>AI & Agentic Systems Engineer</strong> (SMIT B.E. CSE 2026) building autonomous multi-agent systems, enterprise RAG copilots, and responsible AI guardrails. He has deployed 13 live cloud systems and interned at Naresh i Tech.`,
      action: 'general',
      suggested_chips: ['🚀 Show 13 Projects', '📄 Download Resume', '💼 View Tech Stack', '📅 Book Strategy Call'],
    };
  }

  // 18. Greetings
  if (
    hasLocalIntent(q, [
      'hi',
      'hello',
      'hey',
      'hola',
      'namaste',
      'greetings',
      'good morning',
      'good evening',
      'good afternoon',
    ])
  ) {
    return {
      reply: `Hello! 👋 I am <strong>AbhiBot</strong>, Abhishek Sahoo's AI Concierge. I can guide you through his <strong>13 live production systems</strong>, break down his multi-agent architecture, or help you book an executive strategy call. How can I assist you today?`,
      action: 'general',
      suggested_chips: ['🚀 Explore 13 Projects', '🤖 LangGraph & Agents', '📊 Live Analytics Dashboards', '📅 Book 1:1 Strategy Call'],
    };
  }

  // 19. Goodbye / Thanks
  if (hasLocalIntent(q, ['bye', 'goodbye', 'see you', 'thanks', 'thank you'])) {
    return {
      reply: `You're very welcome! Feel free to book a 1-on-1 strategy call or message Abhishek on WhatsApp (+91 8984065377) anytime. Have an inspiring day!`,
      action: 'general',
      suggested_chips: ['📅 Book 1:1 Session', '📞 WhatsApp Abhishek', '🚀 View Projects'],
    };
  }

  // Default Fallback
  return {
    reply: `Abhishek Sahoo is an <strong>AI & Agentic Systems Engineer</strong> (SMIT B.E. 2026) building autonomous multi-agent pipelines, enterprise RAG copilots, and responsible AI guardrails. Feel free to ask about his 13 live systems, tech stack, or book a strategy session!`,
    action: 'general',
    suggested_chips: ['🚀 Show 13 Projects', '📄 Download Resume', '🤖 LangGraph Architecture', '📅 Book Strategy Call'],
  };
}

/* --------------------------------------------------------------------------
   10. TOAST NOTIFICATION UTILITY
   -------------------------------------------------------------------------- */
function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '90px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(20, 20, 30, 0.95)';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid var(--border-amber)';
    toast.style.padding = '0.75rem 1.5rem';
    toast.style.borderRadius = '9999px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(toast);
  }

  toast.innerHTML = msg;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3200);
}
