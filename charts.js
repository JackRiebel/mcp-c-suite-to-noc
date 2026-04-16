// ── MCP Blog — Charts, Diagram & Interactivity ────────────────────────────
(function () {
  'use strict';

  // ── Chart.js global defaults ──────────────────────────────────────────────
  Chart.defaults.color = '#888894';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 14;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10,10,15,0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#fff';
  Chart.defaults.plugins.tooltip.bodyColor = '#e0e0e8';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.padding = 10;

  const CYAN = '#22d3ee';
  const PURPLE = '#a78bfa';
  const BLUE = '#60a5fa';
  const GREEN = '#34d399';
  const RED = '#f87171';
  const ORANGE = '#fb923c';
  const YELLOW = '#fbbf24';

  // ── Utility ───────────────────────────────────────────────────────────────
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  // ── 1. Reading Progress Bar ───────────────────────────────────────────────
  const progressBar = $('#readingProgress');
  window.addEventListener('scroll', function () {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  });

  // ── 2. Sticky Nav Scroll-Spy ──────────────────────────────────────────────
  const navLinks = $$('.nav-link');
  const sections = [];
  navLinks.forEach(function (link) {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });

  function updateNav() {
    let current = sections[0];
    const scrollY = window.scrollY + 120;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollY >= sections[i].el.offsetTop) { current = sections[i]; break; }
    }
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (current) current.link.classList.add('active');
  }
  window.addEventListener('scroll', updateNav);
  updateNav();

  // Smooth scroll for nav links
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.getElementById(this.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── 3. Alert Fatigue Chart ────────────────────────────────────────────────
  new Chart($('#alertFatigueChart'), {
    type: 'bar',
    data: {
      labels: ['Alerts/Day', 'Unaddressed', 'False Positives\n(46% rate)'],
      datasets: [{
        data: [
          SOC_PAIN.alertsPerDay,
          SOC_PAIN.alertsPerDay * SOC_PAIN.alertsUnaddressedPct / 100,
          SOC_PAIN.alertsPerDay * SOC_PAIN.falsePositiveRate / 100,
        ],
        backgroundColor: [RED, ORANGE, YELLOW],
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.parsed.y.toLocaleString() + ' alerts'; },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: function (v) { return v.toLocaleString(); } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: { grid: { display: false } },
      },
    },
  });

  // ── 4. Tool Sprawl Chart ──────────────────────────────────────────────────
  new Chart($('#toolSprawlChart'), {
    type: 'bar',
    data: {
      labels: TOOL_SPRAWL.bySize.map(function (d) { return d.label; }),
      datasets: [{
        label: 'Security Tools',
        data: TOOL_SPRAWL.bySize.map(function (d) { return d.tools; }),
        backgroundColor: [BLUE + '99', BLUE, PURPLE, RED],
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: function (ctx) { return ctx.parsed.x + ' tools'; } },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: { grid: { display: false } },
      },
    },
  });

  // Charts 5-7 (Coverage Gap, Downtime Cost, MTTR) removed — data woven into prose

  // ── 8. SDK Growth Chart ───────────────────────────────────────────────────
  new Chart($('#sdkGrowthChart'), {
    type: 'line',
    data: {
      labels: SDK_GROWTH.map(function (d) { return d.month; }),
      datasets: [{
        label: 'Monthly Downloads (M)',
        data: SDK_GROWTH.map(function (d) { return d.downloads; }),
        borderColor: CYAN,
        backgroundColor: CYAN + '18',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: CYAN,
        pointBorderColor: '#0a0a0f',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: function (ctx) { return ctx.parsed.y + 'M downloads'; } },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: function (v) { return v + 'M'; } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        x: {
          grid: { display: false },
          ticks: { maxRotation: 45, font: { size: 10 } },
        },
      },
    },
  });

  // Chart 9 (Enterprise Adoption) removed — data woven into prose

  // ── 10. Interactive MCP Diagram (Canvas) ──────────────────────────────────
  var canvas = $('#mcpDiagram');
  var ctx = canvas.getContext('2d');
  var animProgress = 0;
  var animTarget = 0;
  var hoveredNode = null;
  var dpr = window.devicePixelRatio || 1;
  var frameCount = 0;

  var tools = [
    { label: 'Splunk' },
    { label: 'ThousandEyes' },
    { label: 'ServiceNow' },
  ];
  var ais = [
    { label: 'Claude', color: CYAN },
    { label: 'GPT', color: BLUE },
    { label: 'Gemini', color: PURPLE },
  ];

  function resizeCanvas() {
    var wrapper = canvas.parentElement;
    var w = Math.max(wrapper.clientWidth, 300);
    var h = Math.max(wrapper.clientHeight, 280);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function hex(alpha) {
    var v = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
    return (v < 16 ? '0' : '') + v.toString(16);
  }

  function drawRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawDiagram() {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    var t = animProgress;
    frameCount++;

    var compact = w < 500;
    var cardW = compact ? 100 : 130;
    var cardH = compact ? 140 : 160;
    var portR = 6;
    var gap = compact ? 20 : 40;
    var totalW = tools.length * cardW + (tools.length - 1) * gap;
    var startX = (w - totalW) / 2;
    var cardY = 50;
    var portSpacing = 30;
    var portStartY = cardY + 50;
    var mcpY = cardY + cardH + 60;
    var aiY = mcpY + 50;

    // Draw tool cards
    tools.forEach(function (tool, ti) {
      var cx = startX + ti * (cardW + gap) + cardW / 2;
      var cardLeft = cx - cardW / 2;

      // Card background
      drawRoundRect(cardLeft, cardY, cardW, cardH, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tool name
      ctx.fillStyle = '#fff';
      ctx.font = '600 ' + (compact ? '11' : '13') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tool.label, cx, cardY + 24);

      // Connector ports
      ais.forEach(function (ai, ai_i) {
        var portY = portStartY + ai_i * portSpacing;

        // "Before" state: each tool has 3 different colored ports
        var beforeAlpha = 1 - t;
        if (beforeAlpha > 0.01) {
          // Port circle
          ctx.beginPath();
          ctx.arc(cx - 20, portY, portR, 0, Math.PI * 2);
          ctx.fillStyle = ai.color + hex(beforeAlpha * 0.3);
          ctx.fill();
          ctx.strokeStyle = ai.color + hex(beforeAlpha * 0.8);
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Port label
          ctx.fillStyle = ai.color + hex(beforeAlpha * 0.9);
          ctx.font = '500 ' + (compact ? '9' : '10') + 'px Inter, system-ui';
          ctx.textAlign = 'left';
          ctx.fillText(ai.label, cx - 10, portY);

          // Cable from port going down and out (messy)
          ctx.strokeStyle = ai.color + hex(beforeAlpha * 0.25);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 20, portY + portR);
          var endX = cx - 20 + (ai_i - 1) * 25;
          ctx.bezierCurveTo(cx - 20, portY + 40, endX, cardY + cardH + 15, endX, cardY + cardH + 30);
          ctx.stroke();

          // Dangling connector end
          ctx.beginPath();
          ctx.arc(endX, cardY + cardH + 32, 3, 0, Math.PI * 2);
          ctx.fillStyle = ai.color + hex(beforeAlpha * 0.5);
          ctx.fill();
        }
      });

      // "After" state: each tool has 1 green MCP port
      if (t > 0.01) {
        var afterAlpha = t;
        var mcpPortY = portStartY + portSpacing;

        // MCP port
        ctx.beginPath();
        ctx.arc(cx, mcpPortY, portR + 2, 0, Math.PI * 2);
        ctx.fillStyle = GREEN + hex(afterAlpha * 0.35);
        ctx.fill();
        ctx.strokeStyle = GREEN + hex(afterAlpha);
        ctx.lineWidth = 2;
        ctx.stroke();

        // MCP label
        ctx.fillStyle = GREEN + hex(afterAlpha);
        ctx.font = '600 11px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('MCP', cx, mcpPortY + 22);

        // Clean line down to MCP bar
        ctx.strokeStyle = GREEN + hex(afterAlpha * 0.5);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, mcpPortY + portR + 2);
        ctx.lineTo(cx, mcpY - 12);
        ctx.stroke();
      }
    });

    // "Before" bottom label
    var beforeAlpha = 1 - t;
    if (beforeAlpha > 0.3) {
      ctx.fillStyle = RED + hex(beforeAlpha * 0.7);
      ctx.font = '500 11px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Each tool maintains a custom connector for every AI platform', w / 2, cardY + cardH + 46);
    }

    // "After" MCP bar + AI models
    if (t > 0.01) {
      var afterAlpha = t;
      var pulse = Math.sin(frameCount * 0.04) * 0.1 + 0.9;

      // MCP bar
      var barW = totalW * 0.85;
      var barH = 28;
      var barX = (w - barW) / 2;
      drawRoundRect(barX, mcpY - barH / 2, barW, barH, barH / 2);
      ctx.fillStyle = 'rgba(10,10,15,' + (afterAlpha * 0.95) + ')';
      ctx.fill();
      drawRoundRect(barX, mcpY - barH / 2, barW, barH, barH / 2);
      ctx.fillStyle = GREEN + hex(afterAlpha * 0.15);
      ctx.fill();
      ctx.strokeStyle = GREEN + hex(afterAlpha * pulse);
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.globalAlpha = afterAlpha;
      ctx.font = '700 12px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Model Context Protocol', w / 2, mcpY);
      ctx.globalAlpha = 1;

      // AI model circles below
      var aiSpacing = totalW / (ais.length + 1);
      ais.forEach(function (ai, i) {
        var ax = startX + aiSpacing * (i + 1);

        // Line from MCP bar down to AI
        ctx.strokeStyle = ai.color + hex(afterAlpha * 0.4);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax, mcpY + barH / 2);
        ctx.lineTo(ax, aiY);
        ctx.stroke();

        // AI circle
        ctx.beginPath();
        ctx.arc(ax, aiY + 16, 18, 0, Math.PI * 2);
        ctx.fillStyle = ai.color + hex(afterAlpha * 0.15);
        ctx.fill();
        ctx.strokeStyle = ai.color + hex(afterAlpha * 0.8);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.globalAlpha = afterAlpha;
        ctx.font = '500 11px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ai.label, ax, aiY + 16);
        ctx.globalAlpha = 1;
      });

      // "Works with any AI" label
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = afterAlpha * 0.6;
      ctx.font = '500 10px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Works with any AI model', w / 2, aiY + 44);
      ctx.globalAlpha = 1;
    }

    // Bottom count
    ctx.fillStyle = '#fff';
    ctx.font = '600 14px Inter, system-ui';
    ctx.textAlign = 'center';
    var countLabel = t < 0.5
      ? (tools.length * ais.length) + ' custom connectors to build and maintain'
      : tools.length + ' MCP servers \u2014 every AI model works automatically';
    ctx.fillText(countLabel, w / 2, h - 14);
  }

  function animateDiagram() {
    if (Math.abs(animProgress - animTarget) > 0.005) {
      animProgress += (animTarget - animProgress) * 0.12;
      if (Math.abs(animProgress - animTarget) < 0.005) animProgress = animTarget;
    }
    drawDiagram();
    requestAnimationFrame(animateDiagram);
  }

  // Toggle buttons
  $$('.diagram-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.diagram-btn').forEach(function (b) { b.classList.remove('active', 'active-red'); });
      if (this.dataset.view === 'before') {
        animTarget = 0;
        this.classList.add('active-red');
      } else {
        animTarget = 1;
        this.classList.add('active');
      }
    });
  });

  // Init diagram — with delayed fallback for layout timing
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 150);
  requestAnimationFrame(animateDiagram);

  // ── 11. Scroll-triggered fade-in ──────────────────────────────────────────
  var fadeEls = $$('.chart-card, .callout-banner, .conclusion-box, .workflow-col');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        // Force Chart.js to recalculate dimensions for canvas charts
        setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  fadeEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

})();
