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
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
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

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
        }),
      });
    } catch (err) {
      console.warn('Backend contact dispatch fallback:', err);
    }

    // Direct WhatsApp message prefill
    const waText = encodeURIComponent(
      `Hello Abhishek,\n\nMy name is ${name} (${email}).\nPhone: ${phone}\n\nProject details: ${message}`
    );
    const waUrl = `https://wa.me/918984065377?text=${waText}`;

    showToast('✉️ Message recorded! Redirecting to WhatsApp for instant chat...');
    form.reset();

    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 800);
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
  const sendBtn = document.getElementById('agentSendBtn');
  const input = document.getElementById('agentInput');
  const chatBody = document.getElementById('agentChatBody');

  if (!agentWindow) return;

  function toggleAgent() {
    agentWindow.classList.toggle('open');
    if (agentWindow.classList.contains('open') && input) {
      input.focus();
    }
  }

  if (agentTrigger) agentTrigger.addEventListener('click', toggleAgent);
  if (agentNavBtn) agentNavBtn.addEventListener('click', toggleAgent);
  if (closeAgent) closeAgent.addEventListener('click', () => agentWindow.classList.remove('open'));

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Append user message
    appendMessage(text, 'user');
    input.value = '';

    // Show typing state
    const typingElem = appendMessage('Reasoning through portfolio architecture...', 'bot');

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (response.ok) {
        const data = await response.json();
        typingElem.innerHTML = data.reply;
        return;
      }
    } catch (err) {
      console.warn('Backend chat fallback:', err);
    }

    // Fallback reasoning
    setTimeout(() => {
      const reply = generateLocalAiReply(text);
      typingElem.innerHTML = reply;
    }, 400);
  }

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `agent-msg ${sender}`;
    msg.innerHTML = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

function generateLocalAiReply(query) {
  const q = query.toLowerCase();
  if (q.includes('project') || q.includes('system') || q.includes('langgraph')) {
    return `Abhishek has built <strong>10 production systems</strong>, including <strong>ResearchMind</strong> (Autonomous Deep Research Agent), <strong>Multi-Node LangGraph Framework</strong>, and <strong>Enterprise LLM Guardrails</strong>. You can test all 10 live via the Projects section!`;
  }
  if (q.includes('hire') || q.includes('contact') || q.includes('phone') || q.includes('reach')) {
    return `You can reach Abhishek directly at <strong>+91 8984065377</strong> (WhatsApp / Phone) or schedule a 1-on-1 Strategy Session via the top Book button!`;
  }
  if (q.includes('skill') || q.includes('stack')) {
    return `Abhishek specializes in <strong>LangGraph Multi-Agent Systems</strong>, <strong>Model Context Protocol (MCP)</strong>, <strong>Responsible AI Guardrails</strong>, <strong>FastAPI</strong>, <strong>TensorFlow/PyTorch</strong>, and <strong>OpenCV</strong>.`;
  }
  return `Thank you for your message! Abhishek Sahoo is an AI & Agentic Systems Engineer (SMIT B.E 2026). Feel free to explore his 10 live project deployments or book a 1-on-1 strategy briefing.`;
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
