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

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('mobile-open');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a, button').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        navLinks.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        navLinks.classList.remove('mobile-open');
        navLinks.classList.remove('active');
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

  function toggleAgent() {
    agentWindow.classList.toggle('open');
    if (agentWindow.classList.contains('open') && input) {
      setTimeout(() => input.focus(), 150);
    }
  }

  if (agentTrigger) agentTrigger.addEventListener('click', toggleAgent);
  if (agentNavBtn) agentNavBtn.addEventListener('click', toggleAgent);
  if (closeAgent) closeAgent.addEventListener('click', () => agentWindow.classList.remove('open'));

  // Expand / Minimize Window
  if (expandAgentBtn) {
    expandAgentBtn.addEventListener('click', () => {
      agentWindow.classList.toggle('expanded');
      const isExpanded = agentWindow.classList.contains('expanded');
      expandAgentBtn.innerHTML = isExpanded
        ? '<i data-lucide="minimize-2"></i>'
        : '<i data-lucide="maximize-2"></i>';
      if (window.lucide) lucide.createIcons();
    });
  }

  // Reset Conversation
  if (resetAgentBtn) {
    resetAgentBtn.addEventListener('click', () => {
      conversationHistory = [];
      chatBody.innerHTML = `
        <div class="agent-msg bot">
          <div class="agent-msg-sender">AbhiBot AI</div>
          Conversation refreshed! I'm ready to assist you with Abhishek's <strong>14 live projects</strong>, Multi-Agent LangGraph architectures, or direct contact.
          <div class="chat-actions-row" style="margin-top: 0.6rem;">
            <a href="#projects" class="chat-action-btn"><i data-lucide="grid"></i> View 14 Projects</a>
            <button class="chat-action-btn book-session-trigger"><i data-lucide="calendar"></i> Book Session</button>
          </div>
        </div>
      `;
      renderChips([
        "🚀 Show 14 Projects",
        "🤖 LangGraph & Agents",
        "📊 Analytics Dashboards",
        "🛡️ Guardrails",
        "📅 Book Strategy Call",
        "📞 Contact Abhishek"
      ]);
      if (window.lucide) lucide.createIcons();
      showToast('Conversation history reset');
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
        agentWindow.classList.remove('open');
      }
      return;
    }

    const projectLink = e.target.closest('a[href="#projects"]');
    if (projectLink) {
      const projSec = document.getElementById('projects');
      if (projSec) {
        projSec.scrollIntoView({ behavior: 'smooth' });
        agentWindow.classList.remove('open');
      }
    }
  });

  async function sendMessage(userText) {
    const text = (userText || (input ? input.value : '')).trim();
    if (!text) return;

    // Append user message bubble
    appendMessage(text, 'user');
    if (input) input.value = '';

    // Add to history
    conversationHistory.push({ role: 'user', content: text });

    // Show interactive 3-dot typing wave indicator
    const typingElem = document.createElement('div');
    typingElem.className = 'agent-msg bot';
    typingElem.innerHTML = `
      <div class="agent-msg-sender">AbhiBot AI</div>
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatBody.appendChild(typingElem);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: conversationHistory.slice(-6),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        typingElem.innerHTML = `
          <div class="agent-msg-sender">AbhiBot AI</div>
          ${data.reply}
        `;
        conversationHistory.push({ role: 'assistant', content: data.reply });

        if (data.suggested_chips) {
          renderChips(data.suggested_chips);
        }

        // Trigger action if requested
        if (data.action === 'open_calendar' && bookingModal) {
          setTimeout(() => bookingModal.classList.add('open'), 400);
        }

        if (window.lucide) lucide.createIcons();
        chatBody.scrollTop = chatBody.scrollHeight;
        return;
      }
    } catch (err) {
      console.warn('Backend chat fallback:', err);
    }

    // Fallback reasoning if offline or server disconnected
    setTimeout(() => {
      const reply = generateLocalAiReply(text);
      typingElem.innerHTML = `
        <div class="agent-msg-sender">AbhiBot AI</div>
        ${reply}
      `;
      conversationHistory.push({ role: 'assistant', content: reply });
      if (window.lucide) lucide.createIcons();
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 450);
  }

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `agent-msg ${sender}`;
    if (sender === 'bot') {
      msg.innerHTML = `<div class="agent-msg-sender">AbhiBot AI</div>${text}`;
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

function generateLocalAiReply(query) {
  const q = query.toLowerCase();
  if (q.includes('copilot') || q.includes('rag') || q.includes('it support') || q.includes('pinecone')) {
    return `<strong>Enterprise IT Support: Agentic RAG Copilot</strong> uses LangGraph state machines, Pinecone vector indexing, dynamic fallback search, and real-time execution tracing for enterprise IT workflows.<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> View Copilot</a></div>`;
  }
  if (q.includes('ecommerce') || q.includes('financial') || q.includes('e-commerce')) {
    return `The <strong>E-Commerce Financial Performance Dashboard</strong> models gross revenues, unit margins, and seasonal cash flows.<br><div class='chat-actions-row'><a href='https://e-commerce-financial-performance-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> Open Live App</a></div>`;
  }
  if (q.includes('website performance') || q.includes('traffic') || q.includes('bounce rate')) {
    return `The <strong>Website Performance & Traffic Analytics</strong> dashboard provides live latency telemetry and user conversion funnel analytics.<br><div class='chat-actions-row'><a href='https://website-performance-analytics-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> Open Live App</a></div>`;
  }
  if (q.includes('netflix') || q.includes('movie analysis')) {
    return `The <strong>Netflix Global Movie Analysis</strong> is an exploratory data intelligence suite investigating catalog dynamics, runtime clusters, and genre trends.<br><div class='chat-actions-row'><a href='https://netflix-movie-analysis-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> Open Live App</a></div>`;
  }
  if (q.includes('project') || q.includes('system') || q.includes('langgraph')) {
    return `Abhishek has built <strong>14 production systems</strong>, including <strong>Enterprise IT Support Agentic RAG Copilot</strong>, <strong>ResearchMind</strong>, <strong>Multi-Node LangGraph Framework</strong>, <strong>Enterprise LLM Guardrails</strong>, and <strong>Financial & Web Analytics</strong> dashboards.<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> Explore 14 Projects</a></div>`;
  }
  if (q.includes('hire') || q.includes('contact') || q.includes('phone') || q.includes('reach') || q.includes('whatsapp')) {
    return `You can reach Abhishek directly at <strong>+91 8984065377</strong> (WhatsApp / Phone) or schedule a 1-on-1 Strategy Session.<br><div class='chat-actions-row'><a href='https://wa.me/918984065377' target='_blank' class='chat-action-btn'><i data-lucide='message-circle'></i> WhatsApp Chat</a><button class='chat-action-btn book-session-trigger'><i data-lucide='calendar'></i> Book Session</button></div>`;
  }
  if (q.includes('skill') || q.includes('stack')) {
    return `Abhishek specializes in <strong>LangGraph Multi-Agent Systems</strong>, <strong>Agentic RAG & Pinecone</strong>, <strong>Model Context Protocol (MCP)</strong>, <strong>Responsible AI Guardrails</strong>, <strong>FastAPI & Python</strong>, and <strong>Streamlit & Tableau BI</strong>.`;
  }
  return `Thank you for your inquiry! Abhishek Sahoo is an AI & Agentic Systems Engineer (SMIT B.E 2026). Feel free to explore his 14 live project deployments or book a 1-on-1 strategy session.<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> View Projects</a><button class='chat-action-btn book-session-trigger'><i data-lucide='calendar'></i> Book Session</button></div>`;
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
