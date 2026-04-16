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

  var aiModels = [
    { label: 'Claude' },
    { label: 'GPT' },
    { label: 'Gemini' },
    { label: 'Llama' },
    { label: 'Mistral' },
  ];
  var entTools = [
    { label: 'Splunk' },
    { label: 'ThousandEyes' },
    { label: 'ServiceNow' },
    { label: 'XDR' },
    { label: 'Duo' },
    { label: 'Webex' },
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

  function hex(a) {
    var v = Math.round(Math.max(0, Math.min(1, a)) * 255);
    return (v < 16 ? '0' : '') + v.toString(16);
  }

  function rrect(x, y, w, h, r) {
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

    var sm = w < 500;
    var boxW = sm ? 78 : 110;
    var boxH = sm ? 30 : 36;
    var pad = sm ? 16 : 40;
    var leftX = pad;
    var rightX = w - pad - boxW;
    var midX = w / 2;

    // Y positions for left column (5 AI models)
    var aiYs = [];
    var aiTopPad = sm ? 30 : 36;
    var aiUsable = h - aiTopPad * 2 - 30;
    for (var i = 0; i < aiModels.length; i++) {
      aiYs.push(aiTopPad + (aiUsable / (aiModels.length - 1)) * i);
    }

    // Y positions for right column (6 tools)
    var toolYs = [];
    var toolUsable = h - aiTopPad * 2 - 30;
    for (var j = 0; j < entTools.length; j++) {
      toolYs.push(aiTopPad + (toolUsable / (entTools.length - 1)) * j);
    }

    // Column headers
    ctx.font = '600 ' + (sm ? '9' : '10') + 'px Inter, system-ui';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CYAN + '88';
    ctx.textAlign = 'left';
    ctx.fillText('AI MODELS', leftX, aiTopPad - 16);
    ctx.fillStyle = PURPLE + '88';
    ctx.textAlign = 'right';
    ctx.fillText('YOUR TOOLS', rightX + boxW, aiTopPad - 16);

    var ba = 1 - t;
    var aa = t;
    var hovLabel = hoveredNode ? hoveredNode.label : null;

    // ── BEFORE: spaghetti lines ──
    if (ba > 0.01) {
      aiModels.forEach(function (ai, i) {
        var ay = aiYs[i] + boxH / 2;
        entTools.forEach(function (tool, j) {
          var ty = toolYs[j] + boxH / 2;
          var alpha = 0.18 * ba;
          if (hovLabel) {
            alpha = (hovLabel === ai.label || hovLabel === tool.label)
              ? 0.6 * ba : 0.04 * ba;
          }
          ctx.strokeStyle = RED + hex(alpha);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(leftX + boxW, ay);
          var cp = (rightX - leftX - boxW) * 0.4;
          ctx.bezierCurveTo(leftX + boxW + cp, ay, rightX - cp, ty, rightX, ty);
          ctx.stroke();
        });
      });
    }

    // ── AFTER: lines through MCP bar ──
    if (aa > 0.01) {
      // MCP bar
      var barW = sm ? 36 : 48;
      var barH = h - aiTopPad * 2 - 10;
      var barX = midX - barW / 2;
      var barY = aiTopPad - 5;
      var pulse = Math.sin(frameCount * 0.03) * 0.1 + 0.9;

      // Lines from AI to bar
      aiModels.forEach(function (ai, i) {
        var ay = aiYs[i] + boxH / 2;
        var alpha = 0.45 * aa;
        if (hovLabel && hovLabel !== ai.label) {
          var isToolHovered = entTools.some(function(t) { return t.label === hovLabel; });
          if (!isToolHovered) alpha = 0.12 * aa;
        }
        ctx.strokeStyle = CYAN + hex(alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftX + boxW, ay);
        ctx.lineTo(barX, ay);
        ctx.stroke();

        // Flow dot
        var dp = ((frameCount * 0.01 + i * 0.2) % 1);
        var dx = leftX + boxW + dp * (barX - leftX - boxW);
        ctx.beginPath();
        ctx.arc(dx, ay, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = CYAN + hex(aa * 0.7);
        ctx.fill();
      });

      // Lines from bar to tools
      entTools.forEach(function (tool, j) {
        var ty = toolYs[j] + boxH / 2;
        var alpha = 0.45 * aa;
        if (hovLabel && hovLabel !== tool.label) {
          var isAIHovered = aiModels.some(function(a) { return a.label === hovLabel; });
          if (!isAIHovered) alpha = 0.12 * aa;
        }
        ctx.strokeStyle = PURPLE + hex(alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(barX + barW, ty);
        ctx.lineTo(rightX, ty);
        ctx.stroke();

        // Flow dot
        var dp = ((frameCount * 0.01 + j * 0.17) % 1);
        var dx = barX + barW + dp * (rightX - barX - barW);
        ctx.beginPath();
        ctx.arc(dx, ty, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = PURPLE + hex(aa * 0.7);
        ctx.fill();
      });

      // MCP bar background
      ctx.shadowColor = GREEN + hex(aa * 0.35);
      ctx.shadowBlur = 24;
      rrect(barX, barY, barW, barH, barW / 2);
      ctx.fillStyle = 'rgba(8,8,16,' + (aa * 0.97) + ')';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      rrect(barX, barY, barW, barH, barW / 2);
      ctx.fillStyle = GREEN + hex(aa * 0.1);
      ctx.fill();
      ctx.strokeStyle = GREEN + hex(aa * pulse);
      ctx.lineWidth = 2;
      ctx.stroke();

      // MCP label (vertical)
      ctx.save();
      ctx.translate(midX, barY + barH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = aa;
      ctx.font = '700 ' + (sm ? '11' : '13') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M C P', 0, 0);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ── LEFT COLUMN: AI model boxes ──
    aiModels.forEach(function (ai, i) {
      var y = aiYs[i];
      var isHov = hovLabel === ai.label;
      rrect(leftX, y, boxW, boxH, 7);
      ctx.fillStyle = isHov ? 'rgba(34,211,238,0.12)' : 'rgba(20,20,32,0.95)';
      ctx.fill();
      ctx.strokeStyle = isHov ? CYAN + 'cc' : CYAN + '44';
      ctx.lineWidth = isHov ? 2 : 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = (isHov ? '700 ' : '500 ') + (sm ? '11' : '13') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ai.label, leftX + boxW / 2, y + boxH / 2);
    });

    // ── RIGHT COLUMN: tool boxes ──
    entTools.forEach(function (tool, j) {
      var y = toolYs[j];
      var isHov = hovLabel === tool.label;
      rrect(rightX, y, boxW, boxH, 7);
      ctx.fillStyle = isHov ? 'rgba(167,139,250,0.12)' : 'rgba(20,20,32,0.95)';
      ctx.fill();
      ctx.strokeStyle = isHov ? PURPLE + 'cc' : PURPLE + '44';
      ctx.lineWidth = isHov ? 2 : 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = (isHov ? '700 ' : '500 ') + (sm ? '10' : '13') + 'px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tool.label, rightX + boxW / 2, y + boxH / 2);
    });

    // ── BOTTOM LABEL ──
    var total = aiModels.length * entTools.length;
    var label = t < 0.5
      ? total + ' custom integrations to build & maintain'
      : (aiModels.length + entTools.length) + ' connections through one standard';
    ctx.fillStyle = '#fff';
    ctx.font = '600 ' + (sm ? '11' : '14') + 'px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, w / 2, h - (sm ? 8 : 12));
  }

  function animateDiagram() {
    if (Math.abs(animProgress - animTarget) > 0.005) {
      animProgress += (animTarget - animProgress) * 0.12;
      if (Math.abs(animProgress - animTarget) < 0.005) animProgress = animTarget;
    }
    drawDiagram();
    requestAnimationFrame(animateDiagram);
  }

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

  // Hover detection for boxes
  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    var sm = w < 500;
    var boxW = sm ? 78 : 110;
    var boxH = sm ? 30 : 36;
    var pad = sm ? 16 : 40;
    var leftX = pad;
    var rightX = w - pad - boxW;
    var aiTopPad = sm ? 30 : 36;
    var aiUsable = h - aiTopPad * 2 - 30;
    var toolUsable = aiUsable;
    hoveredNode = null;

    for (var i = 0; i < aiModels.length; i++) {
      var y = aiTopPad + (aiUsable / (aiModels.length - 1)) * i;
      if (mx >= leftX && mx <= leftX + boxW && my >= y && my <= y + boxH) {
        hoveredNode = aiModels[i];
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    for (var j = 0; j < entTools.length; j++) {
      var y = aiTopPad + (toolUsable / (entTools.length - 1)) * j;
      if (mx >= rightX && mx <= rightX + boxW && my >= y && my <= y + boxH) {
        hoveredNode = entTools[j];
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    canvas.style.cursor = 'default';
  });

  canvas.addEventListener('mouseleave', function () { hoveredNode = null; });

  // Touch support
  canvas.addEventListener('touchstart', function (e) {
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];
    var mx = touch.clientX - rect.left;
    var my = touch.clientY - rect.top;
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    var sm = w < 500;
    var boxW = sm ? 78 : 110;
    var boxH = sm ? 30 : 36;
    var pad = sm ? 16 : 40;
    var leftX = pad;
    var rightX = w - pad - boxW;
    var aiTopPad = sm ? 30 : 36;
    var aiUsable = h - aiTopPad * 2 - 30;
    hoveredNode = null;

    for (var i = 0; i < aiModels.length; i++) {
      var y = aiTopPad + (aiUsable / (aiModels.length - 1)) * i;
      if (mx >= leftX && mx <= leftX + boxW && my >= y && my <= y + boxH) {
        hoveredNode = aiModels[i]; return;
      }
    }
    for (var j = 0; j < entTools.length; j++) {
      var y = aiTopPad + (aiUsable / (entTools.length - 1)) * j;
      if (mx >= rightX && mx <= rightX + boxW && my >= y && my <= y + boxH) {
        hoveredNode = entTools[j]; return;
      }
    }
  }, { passive: true });

  canvas.addEventListener('touchend', function () {
    setTimeout(function () { hoveredNode = null; }, 1500);
  }, { passive: true });

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
