'use strict';

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO DATA
   ═══════════════════════════════════════════════════════════════ */
const DATA = {
  name: 'Huy Hoang',
  bio: "Builder who turns ambiguous problems into robust systems. Shipped infra and APIs on Kubernetes with WSO2, automated CI/CD, explored 3D vision and multimodal ML in agricultural sensing. I like fast feedback loops, readable code, and measurable impact.",
  bio2: "Outside of work I mentor peers, contribute to hackathons, and learn by building. Currently exploring lightweight agent workflows on Bedrock and FastAPI.",
  resume: 'assets/Huy_Hoang_Resume.pdf',
  avatar: 'assets/avatar.jpeg',

  roles: ['Software Engineer', 'Hackathon Winner', 'AI Infra & Cloud', 'AI/ML Research'],

  education: {
    school: 'University of Florida',
    degree: 'B.S. in Computer Engineering',
    gpa: '3.88 / 4.0',
    grad: 'May 2027',
    location: 'Gainesville, FL',
  },

  contact: [
    { icon: '✉', label: 'huyhoang.developer@gmail.com', href: 'mailto:huyhoang.developer@gmail.com', copy: 'huyhoang.developer@gmail.com' },
    { icon: '✉', label: 'hghptcnn@gmail.com', href: 'mailto:hghptcnn@gmail.com', copy: 'hghptcnn@gmail.com' },
    { icon: '☎', label: '(352) 235-4466', href: 'tel:+13522354466', copy: '(352) 235-4466' },
    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>', label: 'linkedin.com/in/huyhoanggia', href: 'https://linkedin.com/in/huyhoanggia', copy: null },
    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>', label: 'github.com/hwii-florescent', href: 'https://github.com/hwii-florescent', copy: null },
  ],

  skills: [
    { cat: 'LANGUAGES', items: ['Python', 'Bash', 'C++', 'Java', 'SQL', 'Go', 'TypeScript', 'JavaScript', 'Groovy Script'] },
    { cat: 'FRAMEWORKS', items: ['React', 'React Native', 'Node.js', 'Flask', 'Spring', 'FastAPI', 'LangChain'] },
    { cat: 'DEVELOPER TOOLS', items: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'MongoDB', 'DynamoDB'] },
    { cat: 'LIBRARIES', items: ['TensorFlow', 'PyTorch', 'OpenCV', 'COLMAP', 'pandas', 'NumPy', 'Matplotlib'] },
    { cat: 'CERTIFICATIONS', items: ['NVIDIA Fundamentals of Deep Learning'] },
  ],

  experience: [
    {
      role: 'Software Engineering Intern',
      company: 'Uber (Incoming)',
      dates: 'May 2026 – Aug 2026',
      bullets: [
        'Incoming for the Summer 2026 Software Engineering internship',
      ],
    },
    {
      role: 'Machine Learning Research Assistant',
      company: 'UF — Agriculture Precision Lab',
      dates: 'Sep 2024 – Present',
      bullets: [
        'Elevated feature match reliability in dense foliage using GPU-accelerated models, improving multi-view tracking stability',
        'Consolidated per-frame COLMAP reconstructions into a clean field-scale model to improve alignment and downstream analysis',
        'Densified canopy point clouds with monocular depth, improving completeness to over 90% for accurate volume calculation',
      ],
    },
    {
      role: 'Teaching Assistant',
      company: 'UF (Computer Organization & Fundamentals Programming 2)',
      dates: 'Aug 2024 – Present',
      bullets: [
        'Led mini-lectures and structured office hours for 50+ students; section grades averaged 15% higher than other section',
      ],
    },
    {
      role: 'Software Engineer Intern',
      company: 'FPT Corporation',
      dates: 'May 2025 – Aug 2025',
      bullets: [
        'Integrated 120+ services using WSO2 on Kubernetes, reducing cross-service failures by 20% and improving system reliability',
        'Architected Java WSO2 handlers for encryption/decryption, reducing overhead and improving gateway throughput by 25%',
        'Engineered Java REST APIs with WSO2 APIM mediation and policies, improving request accuracy to 98% and reduce rework',
      ],
    },
    {
      role: 'Software Engineering Fellow',
      company: 'Uber',
      dates: 'Feb 2025 – Aug 2025',
      bullets: [
        'Selected for Uber Career Prep Fellowship with a 2.3% acceptance rate by demonstrating data structures and algorithm skills',
        'Accelerated algorithmic proficiency by working with Uber engineers 1:1 to solve 70+ technical interview problems',
      ],
    },
    {
      role: 'Site Reliability Engineer Intern',
      company: 'FPT Information System',
      dates: 'May 2024 – Aug 2024',
      bullets: [
        'Automated distributed cloud infrastructure on AWS EKS with Terraform + GitOps, boosting provisioning efficiency by 30%',
        'Built CI/CD with Jenkins + Docker, enabling version rollbacks and cutting deployment time by 90% across 3 environments',
        'Deployed Prometheus monitoring, reducing crash rate by 30% and improving bug detection speed by 40% via real-time alerts',
        'Programmed a Bash script to standardize configs across 20+ AWS EC2 instances, reducing setup time from 2 hrs to 15 min',
      ],
    },
    {
      role: 'AI/ML Research Assistant',
      company: 'Hanoi University of Industry',
      dates: 'Mar 2023 – Aug 2023',
      bullets: [
        'Co-authored peer-reviewed paper on AI + blockchain in forestry management',
        'Drone/IoT early warning system: 60% faster wildfire detection',
      ],
    },
  ],

  projects: [
    {
      name: "Horus' Eyes",
      award: '🏆 1st Place — Best Use of Terraform',
      desc: 'AI assistive tool for real-time object and text detection. End-to-end cloud deployment with infrastructure-as-code.',
      tech: ['YOLOv8', 'DPT', 'Terraform', 'Python'],
      github: 'https://github.com/Dat-cool-repo/Horus', demo: null,
    },
    {
      name: 'Search & Rescue AI',
      award: null,
      desc: 'Mobile app with voice-activated incident reporting, GPS tracking, and real-time dispatch coordination.',
      tech: ['React Native', 'FastAPI', 'AWS DynamoDB', 'S3', 'Whisper'],
      github: 'https://github.com/hwii-florescent/shellhacks24', demo: null,
    },
    {
      name: 'AWS Bedrock Chatbot',
      award: null,
      desc: 'Conversational AI with lightweight session memory and context-aware responses using managed LLM infrastructure.',
      tech: ['LangChain', 'AWS Bedrock', 'FastAPI', 'Python'],
      github: 'https://github.com/hwii-florescent/aws-bedrock-chatbot', demo: null,
    },
  ],

  leadership: [
    {
      role: 'Software Team Lead',
      org: 'SASE Engineering Team',
      dates: 'Sep 2023 – Apr 2024',
      bullets: [
        'Led fine-tuning on custom audio datasets to improve scream detection accuracy',
        'Built Python audio source localizer via multi-mic time-of-arrival analysis',
      ],
    },
  ],

  // ── AI Dialogue lines per section ──
  ai: {
    jarvis: {
      idle: ['STANDING BY, SIR.', 'ALL SYSTEMS NOMINAL.', 'AWAITING YOUR COMMAND.', 'POWER LEVELS: OPTIMAL.'],
      profile: ['ACCESSING BIOGRAPHICAL DATA — SUBJECT: HUY HOANG.', 'CAREER TRAJECTORY ANALYSIS: EXCEPTIONAL.', 'THREAT ASSESSMENT: HIGHLY CAPABLE.'],
      skills: ['CROSS-REFERENCING KNOWN TECHNOLOGY STACK — 18 SYSTEMS IDENTIFIED.', 'SKILL MATRIX CALIBRATION COMPLETE.', 'RECOMMEND IMMEDIATE DEPLOYMENT.'],
      experience: ['SECURITY CLEARANCE VERIFIED. INTEL FILES DECRYPTED.', 'CAREER TIMELINE RETRIEVED FROM ENCRYPTED ARCHIVES.', 'MISSION LOG: SIX SUCCESSFUL ENGAGEMENTS.'],
      projects: ['OPERATION FILES RETRIEVED. THREE ACTIVE DEVELOPMENT PROJECTS.', 'ANALYZING COMBAT EFFECTIVENESS OF EACH DEPLOYMENT.'],
      leadership: ['COMMAND STRUCTURE ANALYSIS INITIATED.', 'SUBJECT DEMONSTRATES STRONG LEADERSHIP METRICS.'],
      contact: ['OPENING SECURE COMMUNICATION CHANNELS.', 'ENCRYPTION: ACTIVE. READY FOR TRANSMISSION.'],
    },
    edith: {
      idle: ["YEAH, I'M HERE.", 'EDITH ONLINE. TRACKING.', 'SYSTEMS GOOD. WHAT DO YOU NEED?', 'KEEP IT TOGETHER, PETER.'],
      profile: ['PULLING UP EVERYTHING I HAVE ON HUY HOANG.', "OKAY SO... THAT'S A PRETTY IMPRESSIVE GPA.", 'STARK WOULD APPROVE. I THINK.'],
      skills: ['RUNNING CAPABILITY SCAN — HONESTLY, THAT IS A LOT OF SKILLS.', "FLAGGING: KUBERNETES, PYTORCH, TERRAFORM — HIGH VALUE ASSETS.", "PETER WOULD'VE NEEDED EDITH FOR THIS."],
      experience: ['ACCESSING EMPLOYMENT HISTORY — SIX ENTRIES FOUND.', "OKAY THAT 90% CI/CD IMPROVEMENT IS WILD.", 'CROSS-REFERENCING WITH KNOWN ENGINEERING BENCHMARKS.'],
      projects: ['BROWSING PROJECT DATABASE — NICE WORK ON THE TERRAFORM PRIZE.', "FLAGGING: YOLO INTEGRATION — THAT'S STARK-LEVEL STUFF.", 'THREE NOTABLE BUILDS IDENTIFIED.'],
      leadership: ['CHECKING FOR COMMAND EXPERIENCE — YEP, FOUND IT.', 'LEADERSHIP METRICS: ABOVE AVERAGE. OBVIOUSLY.'],
      contact: ["OPENING COMMS. DON'T MAKE ME REGRET THIS.", 'SECURE LINE ESTABLISHED. TRY NOT TO MESS IT UP.'],
    },
  },
};

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
let currentTheme = 'jarvis';
let currentSection = null;
let booting = false;
let aiQueue = [];
let aiTimeout = null;
let roleIdx = 0; let j = 0; let deleting = false;

// Track which themes have been booted (full boot sequence)
let jarvisBooted = false;
let edithBooted = false;

/* ═══════════════════════════════════════════════════════════════
   CANVAS BACKGROUND
   ═══════════════════════════════════════════════════════════════ */
class HUDCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.raf = null;
    this.rot = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.draw();
  }

  draw() {
    if (currentTheme === 'jarvis') this.drawHex();
    else this.drawWeb();
  }

  drawHex() {
    // Non-overlapping isometric cube wireframe via 3 families of lines.
    // Family A (down-right diagonals) + Family B (down-left diagonals) draw all
    // slanted edges exactly once. Family C (short vertical segments at every
    // A×B grid intersection) draws all cube pillars exactly once.
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--grid-col').trim() || 'rgba(0,229,255,0.026)';
    ctx.lineWidth = 0.65;

    const e = 52;               // cube edge length in screen pixels
    const W = e * Math.sqrt(3) / 2;  // horizontal projection of a 30° edge
    const H = e * 0.5;               // vertical   projection of a 30° edge
    const slope = H / W;             // = 1/√3

    // Clip everything to the canvas so lines don't bleed outside
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.clip();

    // ── Family A: lines   y = x·slope + nA·e  (down-right, +30°) ──
    const nA_min = Math.floor(-canvas.width * slope / e) - 1;
    const nA_max = Math.ceil(canvas.height / e) + 1;
    ctx.beginPath();
    for (let nA = nA_min; nA <= nA_max; nA++) {
      const c = nA * e;
      ctx.moveTo(-W, -W * slope + c);
      ctx.lineTo(canvas.width + W, (canvas.width + W) * slope + c);
    }
    ctx.stroke();

    // ── Family B: lines   y = −x·slope + nB·e  (down-left, −30°) ──
    const nB_min = -1;
    const nB_max = Math.ceil((canvas.height + canvas.width * slope) / e) + 1;
    ctx.beginPath();
    for (let nB = nB_min; nB <= nB_max; nB++) {
      const c = nB * e;
      ctx.moveTo(-W, W * slope + c);
      ctx.lineTo(canvas.width + W, -(canvas.width + W) * slope + c);
    }
    ctx.stroke();

    // ── Family C: vertical pillars at every A×B intersection ──
    // Intersection of nA-line and nB-line is at:
    //   x = (nB − nA)·W,   y = (nA + nB)·H
    ctx.beginPath();
    for (let nA = nA_min; nA <= nA_max + 1; nA++) {
      for (let nB = nB_min; nB <= nB_max + 1; nB++) {
        const ix = (nB - nA) * W;
        const iy = (nA + nB) * H;
        if (ix < -W || ix > canvas.width + W) continue;
        if (iy < -e || iy > canvas.height + H) continue;
        ctx.moveTo(ix, iy);
        ctx.lineTo(ix, iy + e);  // pillar length = one cube edge
      }
    }
    ctx.stroke();

    ctx.restore();
  }

  drawWeb() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxR = Math.max(canvas.width, canvas.height) * 0.75;
    const lines = 18;
    const rings = 10;
    const col = getComputedStyle(document.documentElement).getPropertyValue('--grid-col').trim() || 'rgba(0,229,255,0.04)';
    ctx.strokeStyle = col;

    // Radial lines
    ctx.lineWidth = 0.7;
    for (let i = 0; i < lines; i++) {
      const angle = (i / lines) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.stroke();
    }

    // Concentric web rings (slightly irregular)
    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= lines; i++) {
        const angle = (i / lines) * Math.PI * 2;
        const jitter = (Math.sin(i * 3.7 + r * 1.3) * 0.04 + 1) * radius;
        const x = cx + Math.cos(angle) * jitter;
        const y = cy + Math.sin(angle) * jitter;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  animate() {
    this.draw();
    // Very slow subtle drift — redraw less often to save GPU
    this.raf = setTimeout(() => requestAnimationFrame(() => this.animate()), 4000);
  }

  stop() { clearTimeout(this.raf); }
}

/* ═══════════════════════════════════════════════════════════════
   CLOCK
   ═══════════════════════════════════════════════════════════════ */
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const mons = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const el = document.getElementById('hud-clock');
  const de = document.getElementById('hud-date');
  if (el) el.textContent = `${hh}:${mm}:${ss}`;
  if (de) de.textContent = `${days[now.getDay()]} ${String(now.getDate()).padStart(2, '0')} ${mons[now.getMonth()]} ${now.getFullYear()}`;
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function typeText(el, text, speed = 28) {
  return new Promise(resolve => {
    el.textContent = '';
    let i = 0;
    const tick = () => {
      if (i > text.length) { resolve(); return; }
      el.textContent = text.slice(0, i++);
      setTimeout(tick, speed);
    };
    tick();
  });
}

/* ═══════════════════════════════════════════════════════════════
   BOOT SEQUENCE
   ═══════════════════════════════════════════════════════════════ */
const BOOT_TEXT = {
  jarvis: {
    brand: 'J.A.R.V.I.S',
    sub: 'JUST A RATHER VERY INTELLIGENT SYSTEM — STARK INDUSTRIES v4.1',
    checks: [
      '[ ✓ ]  NEURAL INTERFACE.............. NOMINAL',
      '[ ✓ ]  SENSOR ARRAY.................. ONLINE',
      '[ ✓ ]  BIOGRAPHICAL DATABASE......... LOADED',
    ],
    final: 'WELCOME BACK, SIR.',
  },
  edith: {
    brand: 'E.D.I.T.H',
    sub: 'EVEN DEAD, I\'M THE HERO — STARK INDUSTRIES PROTOCOL ACTIVE',
    checks: [
      '[ ✓ ]  SATELLITE UPLINK.............. ESTABLISHED',
      '[ ✓ ]  THREAT ASSESSMENT............. RUNNING',
      '[ ✓ ]  PERSONAL RECORDS.............. DECRYPTED',
    ],
    final: 'HELLO, PETER.',
  },
};

// Quick switch text for switching between themes (after initial boot)
const SWITCH_TEXT = {
  jarvis: {
    brand: 'JARVIS',
    message: 'SWITCHING TO JARVIS...',
  },
  edith: {
    brand: 'E.D.I.T.H',
    message: 'SWITCHING TO E.D.I.T.H...',
  },
};

async function bootSequence(theme) {
  if (booting) return;
  booting = true;

  const screen = document.getElementById('boot-screen');
  const scanLine = document.getElementById('boot-scanline');
  const content = document.querySelector('.boot-content');
  const brand = document.getElementById('boot-brand');
  const sub = document.getElementById('boot-sub');
  const bar = document.getElementById('boot-bar');
  const pct = document.getElementById('boot-pct');
  const finalEl = document.getElementById('boot-final');
  const bt = BOOT_TEXT[theme];

  // Reset state
  screen.classList.remove('hidden');
  content.classList.remove('visible');
  brand.textContent = '';
  sub.textContent = '';
  bar.style.width = '0%';
  pct.textContent = '0%';
  finalEl.textContent = '';
  document.querySelectorAll('.boot-line').forEach(l => {
    l.classList.remove('visible', 'done');
    l.querySelector('.bc-text').textContent = '';
  });

  // Skip handler
  let skipped = false;
  const skipFn = () => { skipped = true; };
  document.getElementById('boot-skip').addEventListener('click', skipFn, { once: true });
  document.addEventListener('keydown', skipFn, { once: true });

  const wait = ms => skipped ? Promise.resolve() : sleep(ms);

  // Scanline sweep
  scanLine.classList.remove('scanning');
  void scanLine.offsetWidth;
  scanLine.classList.add('scanning');
  await wait(800);

  // Show content
  content.classList.add('visible');
  await wait(200);

  // Type brand name
  await typeText(brand, bt.brand, skipped ? 0 : 30);
  await wait(100);
  sub.textContent = bt.sub;
  await wait(skipped ? 0 : 400);

  // Check lines (each 0.1 s faster: 12 ms/char instead of 16)
  for (let i = 0; i < 3; i++) {
    const lineEl = document.getElementById(`bc-${i}`);
    const textEl = lineEl.querySelector('.bc-text');
    lineEl.classList.add('visible');
    await typeText(textEl, bt.checks[i], skipped ? 0 : 12);
    await wait(skipped ? 0 : 20);
    lineEl.classList.add('done');
  }

  await wait(skipped ? 0 : 100);

  // Progress bar — rAF-driven for true linear motion
  await new Promise(resolve => {
    if (skipped) {
      bar.style.width = '100%';
      pct.textContent = '100%';
      return resolve();
    }
    const duration = 700; // ms
    const start = performance.now();
    const tick = now => {
      const p = Math.min(100, Math.round(((now - start) / duration) * 100));
      bar.style.width = `${p}%`;
      pct.textContent = `${p}%`;
      if (p < 100) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });

  await wait(skipped ? 0 : 250);

  // Final line (0.1 s faster: 40 ms/char instead of 45)
  await typeText(finalEl, bt.final, skipped ? 0 : 40);
  await wait(skipped ? 0 : 700);

  // Fade out boot screen
  screen.classList.add('hidden');
  await sleep(600);

  document.removeEventListener('keydown', skipFn);
  booting = false;

  // Mark theme as booted
  if (theme === 'jarvis') jarvisBooted = true;
  else edithBooted = true;

  // Animate nodes in
  revealNodes();
  // Show hint text
  document.getElementById('hint-text')?.classList.add('visible');
  // Start AI idle
  scheduleAIIdle();
}

/* ═══════════════════════════════════════════════════════════════
   QUICK SWITCH SEQUENCE (shorter animation for switching themes)
   ═══════════════════════════════════════════════════════════════ */
async function switchSequence(theme) {
  if (booting) return;
  booting = true;

  const screen = document.getElementById('boot-screen');
  const scanLine = document.getElementById('boot-scanline');
  const content = document.querySelector('.boot-content');
  const brand = document.getElementById('boot-brand');
  const sub = document.getElementById('boot-sub');
  const bar = document.getElementById('boot-bar');
  const pct = document.getElementById('boot-pct');
  const finalEl = document.getElementById('boot-final');
  const st = SWITCH_TEXT[theme];

  // Reset state
  screen.classList.remove('hidden');
  content.classList.remove('visible');
  brand.textContent = '';
  sub.textContent = '';
  bar.style.width = '0%';
  pct.textContent = '0%';
  finalEl.textContent = '';
  document.querySelectorAll('.boot-line').forEach(l => {
    l.classList.remove('visible', 'done');
    l.querySelector('.bc-text').textContent = '';
  });

  // Quick scanline sweep
  scanLine.classList.remove('scanning');
  void scanLine.offsetWidth;
  scanLine.classList.add('scanning');
  await sleep(400);

  // Show content
  content.classList.add('visible');
  await sleep(100);

  // Show brand name instantly
  brand.textContent = st.brand;
  sub.textContent = st.message;
  await sleep(200);

  // Fast progress bar
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const p = Math.round((i / steps) * 100);
    bar.style.width = `${p}%`;
    pct.textContent = `${p}%`;
    await sleep(30);
  }

  await sleep(200);

  // Final line
  finalEl.textContent = theme === 'jarvis' ? 'JARVIS ONLINE.' : 'E.D.I.T.H ACTIVE.';
  await sleep(400);

  // Fade out boot screen
  screen.classList.add('hidden');
  await sleep(400);

  booting = false;

  // Animate nodes in
  revealNodes();
  // Show hint text
  document.getElementById('hint-text')?.classList.add('visible');
  // Start AI idle
  scheduleAIIdle();
}

/* ═══════════════════════════════════════════════════════════════
   RADIAL NAV
   ═══════════════════════════════════════════════════════════════ */
function revealNodes() {
  const nodes = document.querySelectorAll('.nav-node');
  nodes.forEach((n, i) => {
    setTimeout(() => n.classList.add('revealed'), i * 80 + 100);
  });
  drawNavLines();
}

function drawNavLines() {
  const svg = document.getElementById('nav-lines');
  const cx = 260; const cy = 260;
  const r = 110; // center avatar radius for line start
  const orbit = 220;
  svg.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * r;
    const y1 = cy + Math.sin(angle) * r;
    const x2 = cx + Math.cos(angle) * orbit;
    const y2 = cy + Math.sin(angle) * orbit;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'var(--panel-border)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '3 5');
    svg.appendChild(line);
  }
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
function navigateTo(section) {
  currentSection = section;

  // Update active node
  document.querySelectorAll('.nav-node').forEach(n => {
    n.classList.toggle('active', n.dataset.section === section);
  });

  // Shift nav to the left
  const nav = document.getElementById('radial-nav');
  nav.classList.add('nav-shifted');
  // Hide hint text when a module is open
  document.getElementById('hint-text')?.classList.remove('visible');

  // Render panel content
  renderPanel(section);

  // Open panel
  const panel = document.getElementById('content-panel');
  panel.classList.add('open');
  document.body.classList.add('panel-open');

  // Update scroll progress
  updateScrollProgress();

  // Push AI line
  const lines = DATA.ai[currentTheme][section] || DATA.ai[currentTheme].idle;
  setAIDialogue(lines[Math.floor(Math.random() * lines.length)]);
}

function closePanel() {
  document.getElementById('content-panel').classList.remove('open');
  document.body.classList.remove('panel-open');
  document.querySelectorAll('.nav-node').forEach(n => n.classList.remove('active'));
  document.getElementById('radial-nav').classList.remove('nav-shifted');
  currentSection = null;
  updateScrollProgress();
  // Restore hint text
  if (!booting) document.getElementById('hint-text')?.classList.add('visible');
  scheduleAIIdle();
}

/* ═══════════════════════════════════════════════════════════════
   CONTENT RENDERERS
   ═══════════════════════════════════════════════════════════════ */
const SECTION_TITLES = {
  profile: 'PROFILE',
  skills: 'SKILL MATRIX',
  experience: 'EXPERIENCE',
  projects: 'PROJECTS',
  leadership: 'LEADERSHIP',
  contact: 'CONTACT',
};

function renderPanel(section) {
  document.getElementById('panel-title').textContent = SECTION_TITLES[section] || section.toUpperCase();
  const body = document.getElementById('panel-body');
  body.innerHTML = '';

  switch (section) {
    case 'profile': renderProfile(body); break;
    case 'skills': renderSkills(body); break;
    case 'experience': renderExperience(body); break;
    case 'projects': renderProjects(body); break;
    case 'leadership': renderLeadership(body); break;
    case 'contact': renderContact(body); break;
  }

  // Stagger children
  requestAnimationFrame(() => {
    body.querySelectorAll('.stagger-item').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 70);
    });
    body.querySelectorAll('.timeline-entry').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 120 + 100);
    });
    body.querySelectorAll('.skill-tag').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 30 + 80);
    });
  });
}

/* ── PROFILE ── */
function renderProfile(body) {
  body.innerHTML = `
    <div class="profile-grid stagger-item">
      <div class="profile-avatar">
        <img src="${DATA.avatar}" alt="${DATA.name}" onerror="this.parentElement.style.background='var(--node-bg)'">
      </div>
      <div class="profile-info">
        <div class="name">${DATA.name}</div>
        <div class="role" id="role-readout">▸ ${DATA.roles[0]}</div>
        <div class="bio">${DATA.bio}</div>
      </div>
    </div>

    <div class="hud-label stagger-item">◈ EDUCATION</div>
    <div class="hud-card stagger-item">
      <div class="data-row">
        <span class="data-key">INSTITUTION</span>
        <span class="data-val accent">${DATA.education.school}</span>
      </div>
      <div class="data-row">
        <span class="data-key">DEGREE</span>
        <span class="data-val">${DATA.education.degree}</span>
      </div>
      <div class="data-row">
        <span class="data-key">GPA</span>
        <span class="data-val gold">${DATA.education.gpa}</span>
      </div>
      <div class="data-row">
        <span class="data-key">GRADUATION</span>
        <span class="data-val">${DATA.education.grad}</span>
      </div>
    </div>

    <div class="hud-label stagger-item">◈ CURRENT DIRECTIVE</div>
    <div class="hud-card stagger-item">
      <p style="font-size:0.73rem;color:var(--text-dim);line-height:1.6;">${DATA.bio2}</p>
    </div>

    <a href="${DATA.resume}" target="_blank" class="btn-resume stagger-item">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      DOWNLOAD RESUME
    </a>
  `;
  // Role rotator
  startRoleRotator();
}

function startRoleRotator() {
  const el = document.getElementById('role-readout');
  if (!el) return;
  let ri = 0; let ci = 0; let del = false;
  const tick = () => {
    const word = DATA.roles[ri % DATA.roles.length];
    if (!del) {
      el.textContent = '▸ ' + word.slice(0, ++ci);
      if (ci === word.length) { del = true; return setTimeout(tick, 1200); }
    } else {
      el.textContent = '▸ ' + word.slice(0, --ci);
      if (ci === 0) { del = false; ri++; }
    }
    setTimeout(tick, del ? 30 : 50);
  };
  tick();
}

/* ── SKILLS ── */
function renderSkills(body) {
  body.innerHTML = DATA.skills.map(cat => `
    <div class="skill-category">
      <div class="skill-cat-title">${cat.cat}</div>
      <div class="skill-tags">
        ${cat.items.map(item => `<span class="skill-tag">${item}</span>`).join('')}
      </div>
    </div>
  `).join('<div style="height:16px"></div>');
}

/* ── EXPERIENCE ── */
function renderExperience(body) {
  body.innerHTML = `<div class="timeline">` +
    DATA.experience.map(exp => `
      <div class="timeline-entry">
        <div class="te-header">
          <span class="te-role">${exp.role}</span>
          <span class="te-date">${exp.dates}</span>
        </div>
        <div class="te-company">${exp.company}</div>
        <ul class="te-bullets">
          ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `).join('') +
    `</div>`;
}

/* ── PROJECTS ── */
function renderProjects(body) {
  body.innerHTML = `<div class="projects-grid">` +
    DATA.projects.map(p => `
      <div class="project-card stagger-item">
        <div class="project-name">${p.name}</div>
        ${p.award ? `<div class="project-award">${p.award}</div>` : ''}
        <p class="project-desc">${p.desc}</p>
        <div class="project-tags">
          ${p.tech.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          <a href="${p.github}" class="project-link" target="_blank">⌥ GitHub</a>
          ${p.demo
        ? `<a href="${p.demo}" class="project-link" target="_blank">▶ Demo</a>`
        : `<span class="project-link project-link-disabled" aria-disabled="true">▶ Demo</span>`}
        </div>
      </div>
    `).join('') +
    `</div>`;
}

/* ── LEADERSHIP ── */
function renderLeadership(body) {
  body.innerHTML = DATA.leadership.map(l => `
    <div class="hud-card stagger-item">
      <div class="data-row">
        <span class="data-key">ROLE</span>
        <span class="data-val accent">${l.role}</span>
      </div>
      <div class="data-row">
        <span class="data-key">UNIT</span>
        <span class="data-val">${l.org}</span>
      </div>
      <div class="data-row">
        <span class="data-key">TENURE</span>
        <span class="data-val">${l.dates}</span>
      </div>
    </div>
    <div class="hud-label stagger-item">◈ MISSION OVERVIEW</div>
    <div class="hud-card stagger-item">
      <ul class="te-bullets">
        ${l.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

/* ── CONTACT ── */
function renderContact(body) {
  const links = DATA.contact.map(c => `
    <div class="contact-link stagger-item" 
         onclick="${c.copy ? `copyToClipboard('${c.copy}', this)` : `window.open('${c.href}','_blank')`}"
         role="button" tabindex="0"
         aria-label="${c.label}">
      <span class="cl-icon">${c.icon}</span>
      <span>${c.label}</span>
      ${c.copy ? `<span class="cl-copy">[ COPY ]</span>` : `<span class="cl-copy">[ OPEN ]</span>`}
    </div>
  `).join('');

  body.innerHTML = `
    <div class="hud-label stagger-item">◈ SECURE CHANNELS</div>
    <div class="contact-links">${links}</div>
  `;
}

function copyToClipboard(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = el.querySelector('.cl-copy').textContent;
    el.querySelector('.cl-copy').textContent = '[ COPIED ✓ ]';
    setAIDialogue(currentTheme === 'jarvis'
      ? 'CLIPBOARD UPDATED, SIR.'
      : 'COPIED. NICE CHOICE.');
    setTimeout(() => {
      const copy = el.querySelector('.cl-copy');
      if (copy) copy.textContent = orig;
    }, 2000);
  });
}

/* ═══════════════════════════════════════════════════════════════
   AI DIALOGUE BAR
   ═══════════════════════════════════════════════════════════════ */
let aiTyping = false;

async function setAIDialogue(text) {
  if (aiTimeout) clearTimeout(aiTimeout);
  const el = document.getElementById('ai-dialogue');
  const prompt = document.getElementById('ai-prompt');
  if (!el || !prompt) return;

  prompt.textContent = currentTheme === 'jarvis' ? 'JARVIS ▸' : 'E.D.I.T.H ▸';
  aiTyping = true;
  el.textContent = '';

  for (let i = 0; i <= text.length; i++) {
    el.textContent = text.slice(0, i);
    await sleep(18);
    if (!aiTyping) break;
  }
  aiTyping = false;
}

function scheduleAIIdle() {
  if (aiTimeout) clearTimeout(aiTimeout);
  const lines = DATA.ai[currentTheme].idle;
  const fn = () => {
    const line = lines[Math.floor(Math.random() * lines.length)];
    setAIDialogue(line);
    aiTimeout = setTimeout(fn, 5000 + Math.random() * 4000);
  };
  aiTimeout = setTimeout(fn, 3000);
}

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════════════════════════════ */
function switchTheme(theme) {
  currentTheme = theme;
  document.body.className = theme;
  localStorage.setItem('hud-theme', theme);

  // Update topbar text
  const badge = document.getElementById('ai-badge');
  const version = document.getElementById('ai-version');
  const label = document.getElementById('theme-toggle-label');
  const aiPr = document.getElementById('ai-prompt');

  if (theme === 'jarvis') {
    if (badge) badge.textContent = '◈ JARVIS';
    if (version) version.textContent = 'v4.1 — STARK INDUSTRIES';
    if (label) label.textContent = '⇄ E.D.I.T.H';
  } else {
    if (badge) badge.textContent = '◈ E.D.I.T.H';
    if (version) version.textContent = 'BANNER PROTOCOL — STARK INDUSTRIES';
    if (label) label.textContent = '⇄ JARVIS';
  }

  if (aiPr) aiPr.textContent = theme === 'jarvis' ? 'JARVIS ▸' : 'E.D.I.T.H ▸';

  // Close panel, re-run canvas
  closePanel();
  hudCanvas.draw();

  // Determine whether to use full boot or quick switch
  const needsFullBoot = (theme === 'jarvis' && !jarvisBooted) || (theme === 'edith' && !edithBooted);

  if (needsFullBoot) {
    bootSequence(theme);
  } else {
    switchSequence(theme);
  }
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
let hudCanvas;

document.addEventListener('DOMContentLoaded', () => {
  // Init canvas
  hudCanvas = new HUDCanvas(document.getElementById('bg-canvas'));
  hudCanvas.animate();

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Restore theme
  const saved = localStorage.getItem('hud-theme') || 'jarvis';
  currentTheme = saved;
  document.body.className = saved;

  // Update badge text immediately
  const badge = document.getElementById('ai-badge');
  const version = document.getElementById('ai-version');
  const label = document.getElementById('theme-toggle-label');
  if (saved === 'edith') {
    if (badge) badge.textContent = '◈ E.D.I.T.H';
    if (version) version.textContent = 'BANNER PROTOCOL — STARK INDUSTRIES';
    if (label) label.textContent = '⇄ JARVIS';
  }

  // Wire nav nodes
  document.querySelectorAll('.nav-node').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.section));
  });

  // Close panel
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    switchTheme(currentTheme === 'jarvis' ? 'edith' : 'jarvis');
  });

  // Boot
  bootSequence(saved);

  // ── Scroll / swipe navigation ──
  const SCROLL_ORDER = [null, 'profile', 'skills', 'experience', 'projects', 'leadership', 'contact'];
  const SCROLL_LABELS = ['HOME', 'PROFILE', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'LEADERSHIP', 'CONTACT'];
  let scrollLocked = false;

  // Build scroll label elements (if element exists)
  const labelsWrap = document.getElementById('scroll-labels');
  if (labelsWrap) {
    SCROLL_LABELS.forEach((lbl, i) => {
      const span = document.createElement('span');
      span.className = 'scroll-label' + (i === 0 ? ' active' : '');
      span.textContent = lbl;
      span.addEventListener('click', () => {
        if (booting) return;
        const target = SCROLL_ORDER[i];
        if (target === null) closePanel();
        else navigateTo(target);
      });
      labelsWrap.appendChild(span);
    });
  }

  function scrollNav(dir) {
    if (scrollLocked || booting) return;
    scrollLocked = true;
    setTimeout(() => { scrollLocked = false; }, 500);
    const idx = SCROLL_ORDER.indexOf(currentSection);
    const next = idx + dir;
    if (next < 0 || next >= SCROLL_ORDER.length) return;
    const target = SCROLL_ORDER[next];
    if (target === null) closePanel();
    else navigateTo(target);
  }

  // Wheel: works everywhere including inside panel body
  window.addEventListener('wheel', e => {
    // If panel body has scrollable content and is not at boundary, let it scroll
    const pb = e.target.closest('#panel-body');
    if (pb) {
      const atTop = pb.scrollTop <= 0;
      const atBot = pb.scrollTop + pb.clientHeight >= pb.scrollHeight - 2;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBot)) return;
    }
    e.preventDefault();
    scrollNav(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  // Touch swipe
  let touchStartY = 0;
  window.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) {
      const pb = e.target.closest('#panel-body');
      if (pb) {
        const atTop = pb.scrollTop <= 0;
        const atBot = pb.scrollTop + pb.clientHeight >= pb.scrollHeight - 2;
        if ((dy < 0 && !atTop) || (dy > 0 && !atBot)) return;
      }
      scrollNav(dy > 0 ? 1 : -1);
    }
  }, { passive: true });
});

/* ═══════════════════════════════════════════════════════════════
   SCROLL PROGRESS UPDATE
   ═══════════════════════════════════════════════════════════════ */
function updateScrollProgress() {
  const SCROLL_ORDER = [null, 'profile', 'skills', 'experience', 'projects', 'leadership', 'contact'];
  const idx = SCROLL_ORDER.indexOf(currentSection);
  const pct = idx <= 0 ? 0 : (idx / (SCROLL_ORDER.length - 1)) * 100;
  const fill = document.getElementById('scroll-fill');
  if (fill) fill.style.height = pct + '%';

  // Update labels
  document.querySelectorAll('.scroll-label').forEach((lbl, i) => {
    lbl.classList.toggle('active', i === Math.max(idx, 0));
  });
}
