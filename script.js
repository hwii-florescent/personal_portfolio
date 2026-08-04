'use strict';

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO DATA
   ═══════════════════════════════════════════════════════════════ */
const DATA = {
  name: 'Huy Hoang',
  focus: 'Cloud Infrastructure',
  orientation: 'Software Engineer / AI/ML Oriented',
  bio: "Software engineer building reliable systems and agentic tools across Go, Python, cloud infrastructure, and applied ML. At Uber, I work on experimentation platforms, zero-downtime migrations, MCP integrations, and LLM-assisted review workflows.",
  bio2: "Outside of work I mentor peers, lead engineering teams, and learn by building. I am especially interested in developer tools, production ML systems, and practical AI that makes complex workflows easier to understand.",
  resume: 'assets/Huy_Hoang_Resume.pdf',
  avatar: 'assets/avatar.jpeg',

  roles: ['Software Engineer', 'Hackathon Winner', 'AI Systems Builder', 'Cloud Infrastructure', 'ML Researcher'],

  education: {
    school: 'University of Florida',
    degree: 'B.S. in Computer Engineering',
    gpa: '3.9 / 4.0',
    grad: 'May 2027',
    location: 'Gainesville, FL',
  },

  contact: [
    { icon: '✉', label: 'huyhoang.developer@gmail.com', href: 'mailto:huyhoang.developer@gmail.com', copy: 'huyhoang.developer@gmail.com' },
    { icon: '✉', label: 'hghptcnn@gmail.com', href: 'mailto:hghptcnn@gmail.com', copy: 'hghptcnn@gmail.com' },
    { icon: '☎', label: '(352) 235-4466', href: 'tel:+13522354466', copy: '(352) 235-4466' },
    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>', label: 'linkedin.com/in/huyhoanggia', href: 'https://linkedin.com/in/huyhoanggia', copy: null },
    { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>', label: 'github.com/hwii-florescent', href: 'https://github.com/hwii-florescent', copy: null },
    { icon: '↗', label: 'huyhg.dev', href: 'https://huyhg.dev', copy: null },
  ],

  skills: [
    { cat: 'LANGUAGES', items: ['Python', 'Go', 'C++', 'Java', 'Shell', 'SQL', 'Protobuf', 'TypeScript', 'JavaScript'] },
    { cat: 'FRAMEWORKS', items: ['FastAPI', 'Flask', 'Spring', 'Node.js', 'React Native', 'React'] },
    { cat: 'DEVELOPER TOOLS', items: ['AWS', 'Terraform', 'Kubernetes', 'Kafka', 'MySQL', 'Docker', 'Jenkins', 'OpenSearch', 'Cadence'] },
    { cat: 'AI/ML & LIBRARIES', items: ['Model Context Protocol (MCP)', 'LangChain', 'PyTorch', 'TensorFlow', 'OpenCV', 'NumPy', 'pandas', 'COLMAP'] },
    { cat: 'CERTIFICATIONS', items: ['NVIDIA Fundamentals of Deep Learning'] },
  ],

  experience: [
    {
      role: 'Software Engineering Intern',
      company: 'Uber',
      dates: 'May 2026 – Jul 2026',
      bullets: [
        'Led search improvements for an A/B experimentation platform end-to-end, engineering OpenSearch-native sort and filter on Go gRPC endpoints for 120k+ experiments with 27k+ searches/day',
        'Ran a zero-downtime schema migration in Go across Protobuf, MySQL, Kafka, and OpenSearch, dual-writing on the live path and backfilling 120k+ production experiments through idempotent Cadence workflows at 99.8% completion',
        'Built a Go service exposing 7 experiment-management tools over Model Context Protocol (MCP), integrating it into an agentic debugging pipeline for 1k+ services running experiments',
        'Architected a Python LLM reviewer for A/B experiment configs across 500 diffs/day, cutting agent context by 50% and measuring 94% precision and 86% recall with an evaluation harness',
      ],
    },
    {
      role: 'Machine Learning Research Assistant',
      company: 'University of Florida — AI Lab',
      dates: 'Sep 2024 – Sep 2025',
      bullets: [
        'Developed GPU-accelerated PyTorch pipelines for dense feature matching, enabling high-throughput 3D inference',
        'Architected a distributed pipeline consolidating multi-view 3D reconstructions into a unified field-scale model',
        'Applied monocular depth estimation to densify point clouds, achieving 90%+ data completeness for volumetric analysis',
      ],
    },
    {
      role: 'Software Engineer Intern',
      company: 'FPT Corporation',
      dates: 'May 2025 – Aug 2025',
      bullets: [
        'Implemented RESTful APIs in Java Spring Boot with WSO2 mediation policies, deployed with AWS EC2 and Docker, achieving 98% request accuracy and improving response time by 20ms',
        'Configured and integrated 12+ enterprise microservices using WSO2 API Gateway on Kubernetes, reducing cross-service failures by 20% and increasing production resilience',
        'Developed custom Java WSO2 handlers for payload encryption/decryption and token validation using JWT and OAuth2, improving gateway throughput by 25%',
      ],
    },
    {
      role: 'Site Reliability Engineer Intern',
      company: 'FPT Information System',
      dates: 'May 2024 – Aug 2024',
      bullets: [
        'Automated AWS EKS infrastructure provisioning with Terraform and GitOps, improving deployment efficiency by 30%',
        'Built CI/CD pipelines with Jenkins and Docker, enabling instant rollbacks and cutting deployment time by 90%',
        'Deployed Prometheus monitoring across 20+ EC2 instances, cutting network setup from 2h to 15min and crash rates by 30%',
      ],
    },
    {
      role: 'Teaching Assistant',
      company: 'University of Florida (Computer Organization & Fundamentals Programming 2)',
      dates: 'Aug 2024 – Present',
      bullets: [
        'Led mini-lectures and structured office hours for 50+ students; section grades averaged 15% higher than other section',
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
      role: 'AI/ML Research Assistant',
      company: 'Hanoi University of Industry',
      dates: 'Mar 2023 – Aug 2023',
      bullets: [
        'Co-authored peer-reviewed paper on AI + blockchain in forestry management',
        'Built a drone/IoT early warning system that enabled 60% faster wildfire detection',
      ],
    },
  ],

  projects: [
    {
      name: "Horus’ Eyes AI Platform",
      award: '🏆 1st Place — Best Use of Terraform (SwampHacks)',
      desc: 'AI assistive platform for visually impaired users, with automated cloud infrastructure and a low-latency real-time inference pipeline.',
      tech: ['Terraform', 'AWS', 'YOLOv8', 'Flask', 'Docker', 'AWS Bedrock'],
      github: 'https://github.com/Dat-cool-repo/Horus', demo: null,
    },
    {
      name: 'Context-Aware LLM Application',
      award: null,
      desc: 'Generative AI application with optimized state and memory management for accurate multi-turn conversations without latency degradation.',
      tech: ['LangChain', 'AWS Bedrock', 'Python', 'FastAPI', 'Docker'],
      github: 'https://github.com/hwii-florescent/aws-bedrock-chatbot', demo: null,
    },
    {
      name: 'Crave',
      award: null,
      desc: 'Native social food discovery prototype for sharing restaurant visits, dish ratings, and cuisine rankings with ordering, reservations, and ride integrations.',
      tech: ['SwiftUI', 'Kotlin', 'Jetpack Compose', 'Material 3'],
      github: 'https://github.com/hwii-florescent/crave', demo: null,
    },
    {
      name: 'Perch',
      award: null,
      desc: 'Personal AI IDE and agent app with a WebSocket server, headless Claude Code runner, terminal manager, and shared web/desktop client architecture.',
      tech: ['TypeScript', 'Node.js', 'WebSockets', 'SQLite', 'Rust'],
      github: 'https://github.com/hwii-florescent/perch', demo: null,
    },
    {
      name: 'Hower',
      award: null,
      desc: 'Time management system that helps users track and manage how they spend their time through a Flask backend and Electron desktop application.',
      tech: ['Python', 'Flask', 'SQLAlchemy', 'Electron'],
      github: 'https://github.com/hwii-florescent/hower', demo: null,
    },
    {
      name: 'Search & Rescue AI',
      award: null,
      desc: 'Mobile app with voice-activated incident reporting, GPS tracking, and real-time dispatch coordination.',
      tech: ['React Native', 'FastAPI', 'AWS DynamoDB', 'S3', 'Whisper'],
      github: 'https://github.com/hwii-florescent/shellhacks24', demo: null,
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
      skills: ['CROSS-REFERENCING KNOWN TECHNOLOGY STACK — 32 SYSTEMS IDENTIFIED.', 'SKILL MATRIX CALIBRATION COMPLETE.', 'RECOMMEND IMMEDIATE DEPLOYMENT.'],
      experience: ['SECURITY CLEARANCE VERIFIED. INTEL FILES DECRYPTED.', 'CAREER TIMELINE RETRIEVED FROM ENCRYPTED ARCHIVES.', 'MISSION LOG: FIVE SUCCESSFUL ENGAGEMENTS.'],
      projects: ['OPERATION FILES RETRIEVED. TWO ACTIVE DEVELOPMENT PROJECTS.', 'ANALYZING COMBAT EFFECTIVENESS OF EACH DEPLOYMENT.'],
      leadership: ['COMMAND STRUCTURE ANALYSIS INITIATED.', 'SUBJECT DEMONSTRATES STRONG LEADERSHIP METRICS.'],
      contact: ['OPENING SECURE COMMUNICATION CHANNELS.', 'ENCRYPTION: ACTIVE. READY FOR TRANSMISSION.'],
    },
    edith: {
      idle: ["YEAH, I'M HERE.", 'EDITH ONLINE. TRACKING.', 'SYSTEMS GOOD. WHAT DO YOU NEED?', 'KEEP IT TOGETHER, PETER.'],
      profile: ['PULLING UP EVERYTHING I HAVE ON HUY HOANG.', "OKAY SO... THAT'S A PRETTY IMPRESSIVE GPA.", 'STARK WOULD APPROVE. I THINK.'],
      skills: ['RUNNING CAPABILITY SCAN — HONESTLY, THAT IS A LOT OF SKILLS.', "FLAGGING: KUBERNETES, PYTORCH, TERRAFORM — HIGH VALUE ASSETS.", "PETER WOULD'VE NEEDED EDITH FOR THIS."],
      experience: ['ACCESSING EMPLOYMENT HISTORY — FIVE ENTRIES FOUND.', "OKAY THAT 90% CI/CD IMPROVEMENT IS WILD.", 'CROSS-REFERENCING WITH KNOWN ENGINEERING BENCHMARKS.'],
      projects: ['BROWSING PROJECT DATABASE — NICE WORK ON THE TERRAFORM PRIZE.', "FLAGGING: YOLO INTEGRATION — THAT'S STARK-LEVEL STUFF.", 'TWO NOTABLE BUILDS IDENTIFIED.'],
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
let lastPanelScrollTop = 0;
let navigationTarget = null;
let navigationRaf = 0;
let scrollInputCancelled = false;
let lastScrollInputAt = 0;
let scrollInputQuietTimer = 0;
let targetingTimer = 0;
// Trackpad momentum arrives as a stream of wheel events. We cannot cancel the
// operating system's gesture, but we can drain that stream until it has been
// quiet for 50ms before accepting a fresh gesture.
const SCROLL_INPUT_QUIET_WINDOW = 50;

// Track which themes have been booted (full boot sequence)
let jarvisBooted = false;
let edithBooted = false;

const CONTENT_SECTIONS = ['profile', 'skills', 'experience', 'projects', 'leadership', 'contact'];
const SECTION_ANCHOR_CLEARANCE = 44;

/* ═══════════════════════════════════════════════════════════════
   CANVAS BACKGROUND
   ═══════════════════════════════════════════════════════════════ */
class HUDCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    // Do not claim a 2D context before WebGLRenderer gets the canvas.
    // Browsers do not allow a second rendering context on the same canvas.
    this.ctx = null;
    this.THREE = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.stage = null;
    this.raf = 0;
    this.pointer = { x: 0, y: 0 };
    this.pointerTarget = { x: 0, y: 0 };
    this.themables = [];
    this.spinGroups = [];
    this.beamMaterials = [];
    this.scanline = null;
    this.ready = this.loadThree();

    this.resize = this.resize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.resize();
  }

  async loadThree() {
    try {
      // Dynamic loading keeps the portfolio usable if a static host is offline;
      // the fallback below still preserves the original low-cost HUD texture.
      const module = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      this.THREE = module;
      this.createThreeScene();
      this.draw();
    } catch (error) {
      console.warn('Three.js visor scene unavailable; using fallback HUD canvas.', error);
      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.drawFallback();
    }
  }

  getPalette() {
    return currentTheme === 'edith'
      ? { red: 0x18d9e6, redSoft: 0x0b7280, cyan: 0xb7ffff, blue: 0x47e8ff, gold: 0x9bf6ff }
      : { red: 0xd62824, redSoft: 0x74151a, cyan: 0x8ff9ff, blue: 0x2ac7e8, gold: 0xf2c75f };
  }

  trackMaterial(material, jarvis, edith = jarvis) {
    this.themables.push({ material, jarvis, edith });
    return material;
  }

  makeLine(points, jarvis, edith = jarvis, opacity = 0.6, dashed = false) {
    const { THREE } = this;
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map(point => new THREE.Vector3(point[0], point[1], point[2] || 0)),
    );
    const material = this.trackMaterial(
      dashed
        ? new THREE.LineDashedMaterial({ color: jarvis, transparent: true, opacity, dashSize: 0.12, gapSize: 0.1 })
        : new THREE.LineBasicMaterial({ color: jarvis, transparent: true, opacity }),
      jarvis,
      edith,
    );
    const line = dashed ? new THREE.Line(geometry, material) : new THREE.Line(geometry, material);
    if (dashed) line.computeLineDistances();
    return line;
  }

  makeRing(radius, jarvis, edith = jarvis, opacity = 0.55, segments = 160, z = 0) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const depth = z + Math.sin(angle * 5) * 0.012;
      points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, depth]);
    }
    const ring = this.makeLine(points, jarvis, edith, opacity);
    ring.userData.baseRotation = (Math.random() - 0.5) * 0.12;
    return ring;
  }

  makeArc(radius, start, end, jarvis, edith = jarvis, opacity = 0.62, segments = 72, z = 0, dashed = false) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = start + (end - start) * (i / segments);
      points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, z]);
    }
    return this.makeLine(points, jarvis, edith, opacity, dashed);
  }

  makeCurve(points, jarvis, edith = jarvis, opacity = 0.7) {
    const { THREE } = this;
    const curve = new THREE.CatmullRomCurve3(
      points.map(point => new THREE.Vector3(point[0], point[1], point[2] || 0)),
    );
    return this.makeLine(curve.getPoints(90).map(point => [point.x, point.y, point.z]), jarvis, edith, opacity);
  }

  createThreeScene() {
    const { THREE } = this;
    document.documentElement.classList.add('three-ready');
    const palette = this.getPalette();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.setClearColor(0x020609, 0.12);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.16;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020609, 0.026);
    this.camera = new THREE.PerspectiveCamera(34, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 100);
    this.camera.position.set(0, 0, 15);
    this.camera.lookAt(0, 0, 0);

    this.stage = new THREE.Group();
    this.scene.add(this.stage);

    const ambient = new THREE.AmbientLight(0x19333c, 1.8);
    this.scene.add(ambient);
    const redLight = new THREE.PointLight(palette.red, 4.5, 18, 2);
    redLight.position.set(-5, 2, 4);
    const cyanLight = new THREE.PointLight(palette.blue, 5, 16, 2);
    cyanLight.position.set(5, -1, 4);
    this.scene.add(redLight, cyanLight);

    // Smoked visor surface: real depth behind the live HTML interface.
    const visorShape = new THREE.Shape();
    visorShape.moveTo(-7.8, 3.8);
    visorShape.quadraticCurveTo(-6.1, 4.7, 0, 4.95);
    visorShape.quadraticCurveTo(6.1, 4.7, 7.8, 3.8);
    visorShape.lineTo(8.55, -2.9);
    visorShape.quadraticCurveTo(6.5, -4.25, 0, -4.45);
    visorShape.quadraticCurveTo(-6.5, -4.25, -8.55, -2.9);
    visorShape.closePath();
    const visorGeometry = new THREE.ExtrudeGeometry(visorShape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.08,
      bevelThickness: 0.06,
    });
    visorGeometry.translate(0, 0, -1.2);
    const visorMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x07161d,
      transparent: true,
      opacity: 0.13,
      metalness: 0.24,
      roughness: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    }), 0x07161d, 0x061b22);
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.renderOrder = -5;
    this.stage.add(visor);

    const visorEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(visorGeometry),
      this.trackMaterial(new THREE.LineBasicMaterial({ color: palette.red, transparent: true, opacity: 0.34 }), palette.red, 0x2fe8f2),
    );
    visorEdges.renderOrder = -4;
    this.stage.add(visorEdges);

    // Low-profile 3D armor ribs catch the red/cyan point lights as the viewer
    // moves, while the detailed bitmap beneath supplies the physical texture.
    const hardwareGroup = new THREE.Group();
    const armorMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: 0x17191c,
      metalness: 0.92,
      roughness: 0.25,
    }), 0x17191c, 0x102126);
    const seamMaterial = this.trackMaterial(new THREE.MeshStandardMaterial({
      color: palette.red,
      emissive: palette.red,
      emissiveIntensity: 1.4,
      metalness: 0.5,
      roughness: 0.3,
    }), palette.red, 0x31dce9);
    seamMaterial.userData.themeEmissive = true;
    [
      [-4.8, 4.28, 2.55, 0.13, -0.08], [-1.72, 4.55, 2.4, 0.16, -0.02],
      [1.72, 4.55, 2.4, 0.16, 0.02], [4.8, 4.28, 2.55, 0.13, 0.08],
      [-4.65, -3.98, 2.75, 0.2, 0.12], [0, -4.38, 3.35, 0.3, 0],
      [4.65, -3.98, 2.75, 0.2, -0.12],
    ].forEach(([x, y, width, height, rotation]) => {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.28), armorMaterial);
      rib.position.set(x, y, -0.12);
      rib.rotation.z = rotation;
      hardwareGroup.add(rib);
      const seam = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 0.025, 0.3), seamMaterial);
      seam.position.set(x, y + (y > 0 ? -height * 0.6 : height * 0.6), 0.04);
      seam.rotation.z = rotation;
      hardwareGroup.add(seam);
    });
    this.stage.add(hardwareGroup);

    // Curved armor rails and illuminated brow / cheek seams.
    this.stage.add(
      this.makeCurve([[-7.9, 3.76, -0.74], [-5.8, 4.48, -0.62], [-2.1, 4.72, -0.55], [0, 4.82, -0.52], [2.1, 4.72, -0.55], [5.8, 4.48, -0.62], [7.9, 3.76, -0.74]], palette.red, 0x35e8f0, 0.78),
      this.makeCurve([[-8.45, 2.9, -0.7], [-8.85, 1.2, -0.58], [-8.72, -1.15, -0.56], [-7.62, -3.1, -0.64]], palette.redSoft, 0x0b8293, 0.62),
      this.makeCurve([[8.45, 2.9, -0.7], [8.85, 1.2, -0.58], [8.72, -1.15, -0.56], [7.62, -3.1, -0.64]], palette.redSoft, 0x0b8293, 0.62),
      this.makeCurve([[-7.55, -3.1, -0.72], [-4.7, -4.14, -0.58], [0, -4.45, -0.5], [4.7, -4.14, -0.58], [7.55, -3.1, -0.72]], palette.red, 0x35e8f0, 0.7),
    );

    // Layered HUD rings: the camera sees real parallax between each plane.
    const ringGroup = new THREE.Group();
    ringGroup.position.z = -0.32;
    [3.9, 3.58, 3.05, 2.7].forEach((radius, index) => {
      const ring = this.makeRing(radius, index % 2 ? palette.blue : palette.red, index % 2 ? 0x68f5ff : 0x15c9d8, 0.18 + index * 0.06, 160, index * 0.02);
      ring.scale.y = 0.84 + index * 0.018;
      ringGroup.add(ring);
      this.spinGroups.push({ object: ring, speed: (index % 2 ? -1 : 1) * (0.00008 + index * 0.000035) });
    });
    const segmented = this.makeRing(3.36, palette.red, 0x24d7e8, 0.64, 48, 0.08);
    segmented.scale.y = 0.84;
    ringGroup.add(segmented);
    this.spinGroups.push({ object: segmented, speed: -0.00024 });

    // Partial targeting arcs and real line-segment ticks add hierarchy without
    // flattening the WebGL scene into a single circular grid.
    [
      [3.78, -2.88, -2.18, palette.blue, 0x77f7ff],
      [3.78, -0.96, -0.23, palette.red, 0x28d5df],
      [3.78, 0.25, 0.94, palette.blue, 0x77f7ff],
      [3.78, 2.17, 2.91, palette.red, 0x28d5df],
      [3.18, -2.5, -1.74, palette.red, 0x28d5df],
      [3.18, 0.65, 1.42, palette.blue, 0x77f7ff],
    ].forEach(([radius, start, end, jarvis, edith]) => {
      const arc = this.makeArc(radius, start, end, jarvis, edith, 0.72, 64, 0.11, true);
      arc.scale.y = 0.84;
      ringGroup.add(arc);
    });

    const tickPositions = [];
    for (let i = 0; i < 96; i++) {
      const angle = (i / 96) * Math.PI * 2;
      const outer = 3.72;
      const inner = outer - (i % 8 === 0 ? 0.24 : i % 4 === 0 ? 0.16 : 0.08);
      tickPositions.push(
        Math.cos(angle) * inner, Math.sin(angle) * inner * 0.84, 0.12,
        Math.cos(angle) * outer, Math.sin(angle) * outer * 0.84, 0.12,
      );
    }
    const tickGeometry = new THREE.BufferGeometry();
    tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tickPositions, 3));
    const tickMaterial = this.trackMaterial(new THREE.LineBasicMaterial({
      color: palette.red,
      transparent: true,
      opacity: 0.46,
    }), palette.red, 0x51eaf2);
    const targetTicks = new THREE.LineSegments(tickGeometry, tickMaterial);
    ringGroup.add(targetTicks);
    this.spinGroups.push({ object: targetTicks, speed: 0.000045 });
    this.stage.add(ringGroup);

    // Radial beam geometry matches the six live HTML module buttons.
    const beamGroup = new THREE.Group();
    beamGroup.position.z = 0.04;
    CONTENT_SECTIONS.forEach((section, index) => {
      const angle = (150 - index * 60) * Math.PI / 180;
      const x1 = Math.cos(angle) * 1.03;
      const y1 = -Math.sin(angle) * 1.03;
      const x2 = Math.cos(angle) * 3.3;
      const y2 = -Math.sin(angle) * 3.3;
      const beam = this.makeLine([[x1, y1, 0], [x2, y2, 0]], palette.red, palette.blue, 0.42, true);
      beam.userData.section = section;
      beamGroup.add(beam);
      this.beamMaterials.push({ section, material: beam.material });
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        this.trackMaterial(new THREE.MeshBasicMaterial({ color: palette.red, wireframe: true, transparent: true, opacity: 0.62 }), palette.red, palette.cyan),
      );
      node.position.set(x2, y2, 0.08);
      node.userData.section = section;
      beamGroup.add(node);
    });
    this.stage.add(beamGroup);

    // Layered 3D triangular reactor: luminous toruses, segmented vanes, and a
    // hollow energy triangle replace the generic polyhedral placeholder.
    const reactor = new THREE.Group();
    reactor.position.z = 0.32;
    const additive = THREE.AdditiveBlending;
    const reactorOuter = new THREE.Mesh(
      new THREE.TorusGeometry(1.02, 0.055, 10, 96),
      this.trackMaterial(new THREE.MeshBasicMaterial({ color: palette.red, transparent: true, opacity: 0.56, blending: additive }), palette.red, palette.blue),
    );
    const reactorInner = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.075, 12, 72),
      this.trackMaterial(new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.64, blending: additive }), palette.cyan, 0xbaffff),
    );
    const vaneGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const vane = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.36, 0.08),
        this.trackMaterial(new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.66, blending: additive }), palette.cyan, 0xc9ffff),
      );
      vane.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0.05);
      vane.rotation.z = angle - Math.PI / 2;
      vaneGroup.add(vane);
    }
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0.64);
    triangleShape.lineTo(0.59, -0.38);
    triangleShape.lineTo(-0.59, -0.38);
    triangleShape.closePath();
    const triangleHole = new THREE.Path();
    triangleHole.moveTo(0, 0.35);
    triangleHole.lineTo(-0.31, -0.2);
    triangleHole.lineTo(0.31, -0.2);
    triangleHole.closePath();
    triangleShape.holes.push(triangleHole);
    const reactorTriangle = new THREE.Mesh(
      new THREE.ShapeGeometry(triangleShape),
      this.trackMaterial(new THREE.MeshBasicMaterial({ color: 0xdfffff, transparent: true, opacity: 0.74, side: THREE.DoubleSide, blending: additive }), 0xdfffff, 0xeaffff),
    );
    reactorTriangle.position.z = 0.14;
    const reactorGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 24, 24),
      this.trackMaterial(new THREE.MeshBasicMaterial({ color: palette.blue, transparent: true, opacity: 0.24, blending: additive }), palette.blue, 0x9effff),
    );
    reactor.add(reactorOuter, reactorInner, vaneGroup, reactorTriangle, reactorGlow);
    this.reactorBaseScale = 0.72;
    reactor.scale.setScalar(this.reactorBaseScale);
    this.stage.add(reactor);
    this.spinGroups.push({ object: reactorOuter, speed: 0.0005 });
    this.spinGroups.push({ object: reactorInner, speed: -0.00075 });
    this.spinGroups.push({ object: vaneGroup, speed: -0.00036 });
    this.reactor = reactor;

    // Scanner band and sparse particles create motion without competing with text.
    this.scanline = new THREE.Mesh(
      new THREE.PlaneGeometry(13.2, 0.012),
      this.trackMaterial(new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }), palette.cyan, 0xcaffff),
    );
    this.scanline.position.set(0, 0, 0.64);
    this.stage.add(this.scanline);

    const particlePositions = new Float32Array(210 * 3);
    for (let i = 0; i < 210; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 15.2;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8.4;
      particlePositions[i * 3 + 2] = -0.4 - Math.random() * 2.5;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = this.trackMaterial(new THREE.PointsMaterial({
      color: palette.blue,
      size: 0.025,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }), palette.blue, 0xaafcff);
    this.stage.add(new THREE.Points(particleGeometry, particleMaterial));

    this.applyTheme();
  }

  applyTheme() {
    const palette = this.getPalette();
    this.themables.forEach(entry => {
      const color = currentTheme === 'edith' ? entry.edith : entry.jarvis;
      entry.material.color.setHex(color);
      if (entry.material.userData.themeEmissive && entry.material.emissive) {
        entry.material.emissive.setHex(color);
      }
    });
    if (this.scene) {
      const lights = this.scene.children.filter(child => child.isLight);
      if (lights[1]) lights[1].color.setHex(palette.red);
      if (lights[2]) lights[2].color.setHex(palette.blue);
    }
  }

  setSectionState(section, state = 'idle') {
    const palette = this.getPalette();
    this.beamMaterials.forEach(entry => {
      const match = Boolean(section && entry.section === section);
      entry.material.opacity = match
        ? state === 'selected' ? 0.98 : 0.78
        : state === 'idle' ? 0.34 : 0.16;
      entry.material.color.setHex(match ? palette.blue : palette.red);
    });
  }

  onPointerMove(event) {
    this.pointerTarget.x = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    this.pointerTarget.y = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
  }

  resize() {
    if (this.renderer && this.camera) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera.updateProjectionMatrix();
      const layoutScale = Math.min(1, Math.max(0.42, this.camera.aspect / 1.62));
      this.stage.scale.setScalar(layoutScale);
    } else if (this.ctx) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    this.draw();
  }

  drawFallback() {
    if (!this.ctx) return;
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = currentTheme === 'edith' ? 'rgba(90,245,255,0.18)' : 'rgba(232,50,39,0.15)';
    ctx.lineWidth = 1;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    [0.22, 0.28, 0.35, 0.42].forEach(factor => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.canvas.width * factor, this.canvas.height * factor * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  draw() {
    if (this.renderer && this.scene && this.camera) {
      this.applyTheme();
      this.renderer.render(this.scene, this.camera);
    } else if (!this.THREE) {
      this.drawFallback();
    }
  }

  animate() {
    if (this.raf) return;
    const tick = time => {
      this.raf = requestAnimationFrame(tick);
      if (!this.renderer || !this.scene || !this.camera) return;
      const delta = Math.min(32, time - (this.lastTime || time));
      this.lastTime = time;
      this.pointer.x += (this.pointerTarget.x - this.pointer.x) * 0.025;
      this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.025;
      if (this.stage) {
        this.stage.rotation.y = this.pointer.x * 0.018;
        this.stage.rotation.x = -this.pointer.y * 0.012;
      }
      this.spinGroups.forEach(entry => { entry.object.rotation.z += entry.speed * delta; });
      if (this.reactor) {
        this.reactor.rotation.x += delta * 0.00018;
        this.reactor.rotation.y -= delta * 0.00032;
        const baseScale = this.reactorBaseScale || 1;
        this.reactor.scale.setScalar(baseScale * (1 + Math.sin(time * 0.0022) * 0.035));
      }
      if (this.scanline) this.scanline.position.y = Math.sin(time * 0.00026) * 3.2;
      this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.raf = 0;
  }
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
  const r = 94; // reactor radius for line start
  const orbit = 220;
  const sections = CONTENT_SECTIONS;
  svg.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    // Profile starts lower-left, then clockwise through Skills, Experience,
    // Projects, Leadership, and Contact.
    const angle = (150 - i * 60) * Math.PI / 180;
    const x1 = cx + Math.cos(angle) * r;
    const y1 = cy + Math.sin(angle) * r;
    const x2 = cx + Math.cos(angle) * orbit;
    const y2 = cy + Math.sin(angle) * orbit;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('class', 'nav-connector');
    line.dataset.section = sections[i];
    line.setAttribute('stroke', 'var(--primary)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '4 7');
    svg.appendChild(line);
  }
}

function updateModuleStatus(section, ready = false) {
  const status = document.getElementById('module-status');
  const topTag = document.querySelector('#target-label-top .target-tag');
  const bottomTag = document.querySelector('#target-label-bottom .target-tag');
  const title = SECTION_TITLES[section] || '';
  const message = section
    ? `${title} // ${ready ? 'MODULE READY' : 'TARGET ACQUIRED'}`
    : 'SELECT A MODULE';
  if (status) status.textContent = message;
  if (topTag) topTag.textContent = section
    ? `◈ ${ready ? 'TARGETING' : 'TARGET ACQUIRED'} // ${title}`
    : '◈ TARGET STANDBY';
  if (bottomTag) bottomTag.textContent = section ? `▸ ${message}` : '▸ SELECT A MODULE TO BEGIN';
}

function setModulePreview(section, active) {
  const nav = document.getElementById('radial-nav');
  nav?.classList.toggle('module-hovering', active);
  nav?.classList.toggle('preview-pulse', active);
  hudCanvas?.setSectionState(active ? section : currentSection, active ? 'preview' : 'selected');
  document.querySelectorAll('.nav-node').forEach(node => {
    const isTarget = node.dataset.section === section;
    node.classList.toggle('is-hovered', active && isTarget);
  });
  document.querySelectorAll('.nav-connector').forEach(line => {
    line.classList.toggle('is-active', active && line.dataset.section === section);
  });
  updateModuleStatus(active ? section : currentSection, Boolean(active));
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
function navigateTo(section) {
  releaseScrollInput();
  const nav = document.getElementById('radial-nav');
  nav.classList.remove('targeting');
  void nav.offsetWidth;
  nav.classList.add('targeting');
  clearTimeout(targetingTimer);
  targetingTimer = setTimeout(() => nav.classList.remove('targeting'), 720);
  const panel = document.getElementById('content-panel');
  const panelBody = document.getElementById('panel-body');
  const wasOpen = panel.classList.contains('open');

  if (!panel.dataset.rendered) {
    renderPanel();
    panel.dataset.rendered = 'true';
  }

  setActiveSection(section);

  // Hide hint text when a module is open
  document.getElementById('hint-text')?.classList.remove('visible');

  // Open panel
  panel.classList.add('open');
  document.body.classList.add('panel-open');

  // Entering the archive from HOME must consume the rest of the gesture that
  // opened it. Otherwise a strong trackpad flick continues into the newly
  // mounted scroll surface and can skip PROFILE before it can be read.
  if (!wasOpen && panelBody) cancelCurrentScrollInput(panelBody);

  const target = document.getElementById(`panel-section-${section}`);
  if (target && panelBody && (!wasOpen || Math.abs(panelBody.scrollTop - target.offsetTop) > 12)) {
    // Leave enough room for the sticky section heading and the first content
    // row so a click never opens with the top of a section visually clipped.
    animatePanelScroll(panelBody, Math.max(0, target.offsetTop - SECTION_ANCHOR_CLEARANCE), section);
  } else {
    navigationTarget = null;
    updateRadialFocusFromScroll();
  }

  // Update scroll progress
  updateScrollProgress();

  // Push AI line
  const lines = DATA.ai[currentTheme][section] || DATA.ai[currentTheme].idle;
  setAIDialogue(lines[Math.floor(Math.random() * lines.length)]);
}

function animatePanelScroll(panelBody, destination, section) {
  cancelAnimationFrame(navigationRaf);
  navigationTarget = section;
  const start = panelBody.scrollTop;
  const distance = destination - start;
  if (Math.abs(distance) < 1) {
    navigationTarget = null;
    updateRadialFocusFromScroll();
    return;
  }

  // A short, deterministic animation keeps the content scroll, orbit angle,
  // and active-node scale on the same frame. Native smooth scrolling can
  // continue after a click and compete with the HUD updates.
  const duration = Math.min(900, Math.max(460, Math.abs(distance) * 0.55));
  const startedAt = performance.now();
  const ease = t => (t < 0.5
    ? 4 * t * t * t
    : 1 - (((-2 * t) + 2) ** 3) / 2);

  const step = now => {
    const progress = Math.min(1, (now - startedAt) / duration);
    panelBody.scrollTop = start + distance * ease(progress);
    updateRadialFocusFromScroll();
    if (progress < 1 && navigationTarget === section) {
      navigationRaf = requestAnimationFrame(step);
    } else if (navigationTarget === section) {
      navigationTarget = null;
      lastPanelScrollTop = panelBody.scrollTop;
      updateActiveSectionFromScroll();
    }
  };

  navigationRaf = requestAnimationFrame(step);
}

function closePanel() {
  cancelAnimationFrame(navigationRaf);
  navigationTarget = null;
  releaseScrollInput();
  document.getElementById('content-panel').classList.remove('open');
  document.body.classList.remove('panel-open');
  document.querySelectorAll('.nav-node').forEach(n => n.classList.remove('active', 'is-hovered'));
  document.querySelectorAll('.nav-connector').forEach(line => line.classList.remove('is-selected', 'is-active'));
  hudCanvas?.setSectionState(null, 'idle');
  document.getElementById('radial-nav').classList.remove('nav-shifted', 'module-hovering', 'preview-pulse', 'targeting');
  const nav = document.getElementById('radial-nav');
  nav.style.setProperty('--nav-rotation', '0deg');
  nav.style.setProperty('--nav-zoom', '1');
  // A closed panel represents HOME. Reset the continuous stream so the next
  // scroll-open always begins at PROFILE instead of the last clicked section.
  const panelBody = document.getElementById('panel-body');
  if (panelBody) panelBody.scrollTop = 0;
  lastPanelScrollTop = 0;
  currentSection = null;
  updateModuleStatus(null);
  renderMobileSectionSwitcher(null);
  updateContinuousScrollProgress();
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

const SECTION_DETAIL_META = {
  profile: { id: 'PRF-01', kicker: 'BIOGRAPHICAL DOSSIER', state: 'IDENTITY VERIFIED' },
  skills: { id: 'SKL-02', kicker: 'CAPABILITY MATRIX', state: 'SYSTEMS INDEXED' },
  experience: { id: 'EXP-03', kicker: 'MISSION HISTORY', state: 'TIMELINE DECRYPTED' },
  projects: { id: 'PRJ-04', kicker: 'PROJECT ARCHIVE', state: 'OPERATIONS LOADED' },
  leadership: { id: 'LDR-05', kicker: 'COMMAND PROFILE', state: 'COMMAND DATA READY' },
  contact: { id: 'COM-06', kicker: 'SECURE COMMUNICATIONS', state: 'CHANNELS ONLINE' },
};

function renderMobileSectionSwitcher(activeSection = null) {
  const switcher = document.getElementById('mobile-section-switcher');
  if (!switcher) return;
  if (!switcher.dataset.ready) {
    CONTENT_SECTIONS.forEach(section => {
      const source = document.querySelector(`.nav-node[data-section="${section}"] .node-icon`);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.section = section;
      button.setAttribute('aria-label', `Focus ${SECTION_TITLES[section]} section`);
      button.innerHTML = `${source ? source.innerHTML : '<span aria-hidden="true">◈</span>'}<small>${SECTION_TITLES[section]}</small>`;
      button.addEventListener('click', () => navigateTo(section));
      switcher.appendChild(button);
    });
    switcher.dataset.ready = 'true';
  }
  switcher.querySelectorAll('button').forEach(button => {
    const selected = button.dataset.section === activeSection;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function updatePanelChrome(section) {
  const meta = SECTION_DETAIL_META[section];
  if (!meta) return;
  const sourceIcon = document.querySelector(`.nav-node[data-section="${section}"] .node-icon svg`);
  document.getElementById('panel-title').textContent = SECTION_TITLES[section];
  document.getElementById('panel-kicker').textContent = meta.kicker;
  document.getElementById('panel-module-id').textContent = meta.id;
  document.getElementById('panel-module-state').textContent = meta.state;
  document.getElementById('panel-system-name').textContent = currentTheme === 'jarvis' ? 'JARVIS MODULE' : 'E.D.I.T.H MODULE';
  document.getElementById('panel-tag').innerHTML = sourceIcon ? sourceIcon.outerHTML : '◈';
  renderMobileSectionSwitcher(section);
}

function updateContinuousScrollProgress() {
  const body = document.getElementById('panel-body');
  const progress = document.querySelector('#panel-scroll-progress i');
  if (!body || !progress) return;
  const maximum = Math.max(0, body.scrollHeight - body.clientHeight);
  const percentage = maximum ? Math.min(100, (body.scrollTop / maximum) * 100) : 0;
  progress.style.width = `${percentage}%`;
  const guide = document.getElementById('scroll-guide-direction');
  if (guide) guide.textContent = percentage >= 99
    ? 'END OF ARCHIVE // ESC RETURNS HOME'
    : 'SCROLL TO ROTATE MODULE FOCUS';
}

function renderPanel() {
  document.getElementById('panel-title').textContent = 'PORTFOLIO ARCHIVE';
  const body = document.getElementById('panel-body');
  body.innerHTML = CONTENT_SECTIONS.map(section => `
    <section class="panel-section" id="panel-section-${section}" data-section="${section}">
      <div class="panel-section-heading">
        <span class="panel-section-index">${String(CONTENT_SECTIONS.indexOf(section) + 1).padStart(2, '0')}</span>
        <span>${SECTION_TITLES[section]}</span>
      </div>
      <div class="panel-section-content"></div>
    </section>
  `).join('');

  CONTENT_SECTIONS.forEach(section => {
    const content = document.querySelector(`#panel-section-${section} .panel-section-content`);
    switch (section) {
      case 'profile': renderProfile(content); break;
      case 'skills': renderSkills(content); break;
      case 'experience': renderExperience(content); break;
      case 'projects': renderProjects(content); break;
      case 'leadership': renderLeadership(content); break;
      case 'contact': renderContact(content); break;
    }
  });
  renderMobileSectionSwitcher(currentSection);
  updateContinuousScrollProgress();

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

function setActiveSection(section) {
  if (!CONTENT_SECTIONS.includes(section)) return;
  currentSection = section;
  document.querySelectorAll('.nav-node').forEach(n => {
    n.classList.toggle('active', n.dataset.section === section);
  });
  document.querySelectorAll('.nav-connector').forEach(line => {
    line.classList.toggle('is-selected', line.dataset.section === section);
  });
  hudCanvas?.setSectionState(section, 'selected');
  document.querySelectorAll('.panel-section').forEach(panelSection => {
    panelSection.classList.toggle(
      'focus-active',
      panelSection.dataset.section === section,
    );
  });

  const nav = document.getElementById('radial-nav');
  nav.classList.add('nav-shifted');
  updateModuleStatus(section);
  updatePanelChrome(section);
  updateScrollProgress();

  const lines = DATA.ai[currentTheme][section] || DATA.ai[currentTheme].idle;
  setAIDialogue(lines[Math.floor(Math.random() * lines.length)]);
}

function updateRadialFocusFromScroll() {
  const nav = document.getElementById('radial-nav');
  const panel = document.getElementById('content-panel');
  const panelBody = document.getElementById('panel-body');
  if (!nav || !panel || !panelBody || !panel.classList.contains('open')) return;

  const sections = [...panelBody.querySelectorAll('.panel-section')];
  if (!sections.length) return;
  updateContinuousScrollProgress();

  // Each section has a stable anchor. Interpolate between adjacent anchors so
  // the orbit reaches a section's final angle exactly as its header reaches
  // the top clearance line, instead of jumping at the midpoint.
  const anchors = sections.map(section => Math.max(
    0,
    section.offsetTop - SECTION_ANCHOR_CLEARANCE,
  ));
  const scrollTop = panelBody.scrollTop;
  let leftIndex = 0;

  for (let i = 0; i < anchors.length - 1; i += 1) {
    if (scrollTop >= anchors[i]) leftIndex = i;
    else break;
  }

  const nextIndex = Math.min(leftIndex + 1, anchors.length - 1);
  const span = Math.max(1, anchors[nextIndex] - anchors[leftIndex]);
  const progress = nextIndex === leftIndex
    ? 0
    : Math.min(1, Math.max(0, (scrollTop - anchors[leftIndex]) / span));
  const rotation = -((leftIndex + progress) * 60);
  nav.style.setProperty('--nav-rotation', `${rotation}deg`);

  const active = sections.find(section => section.dataset.section === currentSection);
  if (active) {
    const activeIndex = CONTENT_SECTIONS.indexOf(currentSection);
    const focusPosition = leftIndex + progress;
    // Do not clamp focus to the section's viewport coverage: a long section
    // can fill the viewport for a long time while the next section is already
    // approaching. The distance from the current section anchor is the true
    // continuous ratio shared by orbit rotation and zoom.
    const focusProgress = Math.max(0, Math.min(1, 1 - Math.abs(focusPosition - activeIndex)));
    nav.style.setProperty('--active-scale', (1.12 + focusProgress * 0.53).toFixed(3));
    nav.style.setProperty('--nav-zoom', (0.90 + focusProgress * 0.20).toFixed(3));
  }
}

function getVisibleSectionPortion(section, panelBody) {
  if (!section || !panelBody) return 0;
  const bodyRect = panelBody.getBoundingClientRect();
  const rect = section.getBoundingClientRect();
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, bodyRect.bottom) - Math.max(rect.top, bodyRect.top),
  );
  const effectiveHeight = Math.min(section.offsetHeight, panelBody.clientHeight);
  return Math.min(1, visibleHeight / Math.max(1, effectiveHeight));
}

function releaseScrollInput() {
  scrollInputCancelled = false;
  clearTimeout(scrollInputQuietTimer);
  const panelBody = document.getElementById('panel-body');
  panelBody?.classList.remove('input-cancelled');
}

function cancelCurrentScrollInput(panelBody) {
  scrollInputCancelled = true;
  lastScrollInputAt = performance.now();
  panelBody?.classList.add('input-cancelled');
  clearTimeout(scrollInputQuietTimer);

  const waitForQuiet = () => {
    if (performance.now() - lastScrollInputAt >= SCROLL_INPUT_QUIET_WINDOW) {
      releaseScrollInput();
    } else {
      scrollInputQuietTimer = setTimeout(waitForQuiet, SCROLL_INPUT_QUIET_WINDOW);
    }
  };
  scrollInputQuietTimer = setTimeout(waitForQuiet, SCROLL_INPUT_QUIET_WINDOW);
}

function focusSectionAtHeading(section, panelBody, freezeUntilNewAction = false) {
  if (!section || !panelBody) return;
  if (freezeUntilNewAction) cancelCurrentScrollInput(panelBody);
  setActiveSection(section.dataset.section);
  animatePanelScroll(
    panelBody,
    Math.max(0, section.offsetTop - SECTION_ANCHOR_CLEARANCE),
    section.dataset.section,
  );
}

function updateActiveSectionFromScroll() {
  const panel = document.getElementById('content-panel');
  const panelBody = document.getElementById('panel-body');
  if (!panel || !panelBody || !panel.classList.contains('open')) return;

  const sections = [...panelBody.querySelectorAll('.panel-section')];
  if (!sections.length) return;

  // A click owns the active state until its controlled scroll arrives. This
  // prevents intermediate scroll events from bouncing the selection through
  // the long Projects section.
  if (navigationTarget) {
    lastPanelScrollTop = panelBody.scrollTop;
    updateRadialFocusFromScroll();
    return;
  }

  const anchors = sections.map(section => Math.max(
    0,
    section.offsetTop - SECTION_ANCHOR_CLEARANCE,
  ));
  let anchorIndex = 0;
  for (let i = 0; i < anchors.length - 1; i += 1) {
    if (panelBody.scrollTop >= anchors[i]) anchorIndex = i;
    else break;
  }
  const nextAnchor = Math.min(anchorIndex + 1, anchors.length - 1);
  const anchorSpan = Math.max(1, anchors[nextAnchor] - anchors[anchorIndex]);
  const anchorProgress = nextAnchor === anchorIndex
    ? 0
    : Math.min(1, Math.max(0, (panelBody.scrollTop - anchors[anchorIndex]) / anchorSpan));

  const currentIndex = CONTENT_SECTIONS.indexOf(currentSection);
  const direction = panelBody.scrollTop > lastPanelScrollTop ? 1
    : panelBody.scrollTop < lastPanelScrollTop ? -1
      : 0;

  // Fast scrolls can cross multiple anchors before a scroll event runs. In
  // that case the old active section is no longer a useful reference for the
  // 50% handoff rule, so recover from the actual scroll position first.
  if (currentIndex < 0 || Math.abs(currentIndex - anchorIndex) > 1) {
    const recoveredIndex = Math.min(
      sections.length - 1,
      anchorIndex + (anchorProgress >= 0.5 ? 1 : 0),
    );
    focusSectionAtHeading(sections[recoveredIndex], panelBody, true);
    lastPanelScrollTop = panelBody.scrollTop;
    return;
  }

  if (currentIndex >= 0) {
    const next = sections[currentIndex + 1];
    const previous = sections[currentIndex - 1];
    const nextPortion = getVisibleSectionPortion(next, panelBody);
    const previousPortion = getVisibleSectionPortion(previous, panelBody);

    const handoff = direction > 0 && nextPortion >= 0.5
      ? next
      : direction < 0 && previousPortion >= 0.5
        ? previous
        : null;
    if (handoff) {
      focusSectionAtHeading(handoff, panelBody, true);
      lastPanelScrollTop = panelBody.scrollTop;
      return;
    }
  }

  lastPanelScrollTop = panelBody.scrollTop;
  updateRadialFocusFromScroll();
}

/* ── PROFILE ── */
function renderProfile(body) {
  body.innerHTML = `
    <div class="profile-grid profile-hero stagger-item">
      <div class="profile-avatar-stage">
        <div class="profile-avatar-target" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="profile-avatar">
          <img src="${DATA.avatar}" alt="${DATA.name}" onerror="this.parentElement.style.background='var(--node-bg)'">
        </div>
      </div>
      <div class="profile-info">
        <div class="name">${DATA.name}</div>
        <div class="profile-signal profile-signal-focus"><i></i>${DATA.focus.toUpperCase()}</div>
        <div class="profile-signal profile-signal-role"><i></i>${DATA.orientation.toUpperCase()}</div>
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

    <a href="${DATA.resume}" target="_blank" rel="noopener" class="btn-resume stagger-item">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      DOWNLOAD RESUME
    </a>
  `;
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
  body.innerHTML = `<div class="skills-grid">${DATA.skills.map(cat => `
    <article class="skill-category stagger-item">
      <div class="skill-cat-title"><span>${cat.cat}</span><small>${String(cat.items.length).padStart(2, '0')} CAPABILITIES</small></div>
      <div class="skill-signal" aria-hidden="true">${'<i></i>'.repeat(8)}</div>
      <div class="skill-tags">${cat.items.map(item => `<span class="skill-tag">${item}</span>`).join('')}</div>
    </article>
  `).join('')}</div>`;
}

/* ── EXPERIENCE ── */
function renderExperience(body) {
  body.innerHTML = `<div class="timeline">` +
    DATA.experience.map((exp, index) => `
      <div class="timeline-entry">
        <span class="timeline-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
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
    DATA.projects.map((p, index) => `
      <div class="project-card stagger-item">
        <span class="project-index">OP-${String(index + 1).padStart(2, '0')}</span>
        <div class="project-name">${p.name}</div>
        ${p.award ? `<div class="project-award">${p.award}</div>` : ''}
        <p class="project-desc">${p.desc}</p>
        <div class="project-tags">
          ${p.tech.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          <a href="${p.github}" class="project-link" target="_blank" rel="noopener">⌥ GitHub</a>
          ${p.demo
        ? `<a href="${p.demo}" class="project-link" target="_blank" rel="noopener">▶ Demo</a>`
        : `<span class="project-link project-link-disabled" aria-disabled="true">▶ Demo</span>`}
        </div>
      </div>
    `).join('') +
    `</div>`;
}

/* ── LEADERSHIP ── */
function renderLeadership(body) {
  body.innerHTML = DATA.leadership.map(l => `
    <div class="leadership-status stagger-item"><span>COMMAND AUTHORITY</span><strong>VERIFIED</strong><i aria-hidden="true"></i></div>
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
    ${c.copy ? `<button class="contact-link stagger-item" type="button" data-copy="${c.copy}" aria-label="Copy ${c.label}">` : `<a class="contact-link stagger-item" href="${c.href}" target="_blank" rel="noopener" aria-label="Open ${c.label}">`}
      <span class="cl-icon">${c.icon}</span>
      <span>${c.label}</span>
      ${c.copy ? `<span class="cl-copy">[ COPY ]</span>` : `<span class="cl-copy">[ OPEN ]</span>`}
    ${c.copy ? '</button>' : '</a>'}
  `).join('');

  body.innerHTML = `
    <div class="contact-layout">
      <section class="contact-channels" aria-labelledby="secure-channel-title">
        <div class="contact-availability stagger-item"><i aria-hidden="true"></i><span>COMMUNICATION ARRAY</span><strong>AVAILABLE FOR NEW OPPORTUNITIES</strong></div>
        <div class="hud-label stagger-item" id="secure-channel-title">◈ SECURE CHANNELS</div>
        <div class="contact-links">${links}</div>
      </section>
      <form class="contact-transmission stagger-item" id="contact-form">
        <div class="hud-label">◈ ENCRYPTED TRANSMISSION</div>
        <label for="contact-name">IDENTIFICATION</label>
        <input id="contact-name" name="name" autocomplete="name" required placeholder="YOUR NAME">
        <label for="contact-email">RETURN CHANNEL</label>
        <input id="contact-email" name="email" type="email" autocomplete="email" required placeholder="YOU@DOMAIN.COM">
        <label for="contact-message">MESSAGE PAYLOAD</label>
        <textarea id="contact-message" name="message" required rows="5" placeholder="ENTER TRANSMISSION"></textarea>
        <button class="contact-submit" type="submit">TRANSMIT MESSAGE <span aria-hidden="true">↗</span></button>
      </form>
    </div>
  `;

  body.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', () => copyToClipboard(button.dataset.copy, button));
  });
  body.querySelector('#contact-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Portfolio contact from ${formData.get('name')}`);
    const message = encodeURIComponent(`${formData.get('message')}\n\nReply to: ${formData.get('email')}`);
    window.location.href = `mailto:huyhoang.developer@gmail.com?subject=${subject}&body=${message}`;
  });
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
  const savedPrompt = document.getElementById('ai-prompt');
  if (saved === 'edith') {
    if (badge) badge.textContent = '◈ E.D.I.T.H';
    if (version) version.textContent = 'BANNER PROTOCOL — STARK INDUSTRIES';
    if (label) label.textContent = '⇄ JARVIS';
    if (savedPrompt) savedPrompt.textContent = 'E.D.I.T.H ▸';
  }

  // Wire nav nodes
  document.querySelectorAll('.nav-node').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.section));
    btn.addEventListener('pointerenter', () => setModulePreview(btn.dataset.section, true));
    btn.addEventListener('focus', () => setModulePreview(btn.dataset.section, true));
    btn.addEventListener('pointerleave', () => setModulePreview(btn.dataset.section, false));
    btn.addEventListener('blur', () => setModulePreview(btn.dataset.section, false));
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

  // The portfolio is one continuous scroll stream. Wheel input over the HUD
  // background is routed into the same panel body so there is no inside/outside
  // scroll mode to discover.
  window.addEventListener('wheel', e => {
    const now = performance.now();

    if (document.body.classList.contains('panel-open')) {
      // Own wheel movement before the browser applies native scrolling. Some
      // trackpads report a single momentum delta large enough to cross several
      // archive anchors before a scroll event is emitted. Capping each applied
      // step lets the existing 50% handoff gate stop the gesture at the very
      // next section instead of recovering two or three sections later.
      e.preventDefault();
      if (scrollInputCancelled) {
        // Cancel every remaining event from the gesture that caused the
        // handoff. Unlocking is driven by an actual quiet period, not a fixed
        // post-section delay.
        lastScrollInputAt = now;
        return;
      }
      const panelBody = document.getElementById('panel-body');
      if (!panelBody || navigationTarget) return;

      const normalizedDelta = e.deltaMode === 1
        ? e.deltaY * 16
        : e.deltaMode === 2
          ? e.deltaY * panelBody.clientHeight
          : e.deltaY;
      const maximumStep = Math.max(72, panelBody.clientHeight * 0.32);
      const controlledDelta = Math.sign(normalizedDelta) * Math.min(
        Math.abs(normalizedDelta),
        maximumStep,
      );
      panelBody.scrollTop += controlledDelta;
      updateActiveSectionFromScroll();
      return;
    }
    e.preventDefault();
    scrollNav(e.deltaY > 0 ? 1 : -1);
  }, { passive: false, capture: true });

  // Touch swipes only change sections while the continuous panel is closed.
  // When it is open, the panel body owns the gesture and scrolls naturally.
  let touchStartY = 0;
  window.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  // Keyboard scrolling participates in the same section-entry gate. Escape
  // remains available because it is intentionally not part of this set.
  const blockedScrollKeys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']);
  document.addEventListener('keydown', e => {
    if (!scrollInputCancelled || !document.body.classList.contains('panel-open')) return;
    if (!blockedScrollKeys.has(e.key)) return;
    e.preventDefault();
    lastScrollInputAt = performance.now();
  }, { capture: true });

  window.addEventListener('touchmove', e => {
    if (document.body.classList.contains('panel-open') && scrollInputCancelled) {
      e.preventDefault();
      lastScrollInputAt = performance.now();
    }
  }, { passive: false });

  window.addEventListener('touchend', e => {
    if (document.body.classList.contains('panel-open') || e.target.closest('#content-panel')) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) {
      scrollNav(dy > 0 ? 1 : -1);
    }
  }, { passive: true });

  const panelBody = document.getElementById('panel-body');
  panelBody?.addEventListener('scroll', updateActiveSectionFromScroll, { passive: true });
  window.addEventListener('resize', updateActiveSectionFromScroll, { passive: true });
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
