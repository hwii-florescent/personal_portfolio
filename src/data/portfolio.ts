export const portfolio = {
  "name": "Huy Hoang",
  "bio": "Software engineer building reliable systems and agentic tools across Go, Python, cloud infrastructure, and applied ML. At Uber, I work on experimentation platforms, zero-downtime migrations, MCP integrations, and LLM-assisted review workflows.",
  "bio2": "Outside of work I mentor peers, lead engineering teams, and learn by building. I am especially interested in developer tools, production ML systems, and practical AI that makes complex workflows easier to understand.",
  "roles": [
    "Software Engineer",
    "Hackathon Winner",
    "AI Systems Builder",
    "Cloud Infrastructure",
    "ML Researcher"
  ],
  "education": {
    "school": "University of Florida",
    "degree": "B.S. in Computer Engineering",
    "gpa": "3.9 / 4.0",
    "grad": "May 2027",
    "location": "Gainesville, FL"
  },
  "contact": [
    {
      "kind": "email",
      "label": "huyhoang.developer@gmail.com",
      "href": "mailto:huyhoang.developer@gmail.com"
    },
    {
      "kind": "email",
      "label": "hghptcnn@gmail.com",
      "href": "mailto:hghptcnn@gmail.com"
    },
    {
      "kind": "phone",
      "label": "(352) 235-4466",
      "href": "tel:+13522354466"
    },
    {
      "kind": "linkedin",
      "label": "linkedin.com/in/huyhoanggia",
      "href": "https://linkedin.com/in/huyhoanggia"
    },
    {
      "kind": "github",
      "label": "github.com/hwii-florescent",
      "href": "https://github.com/hwii-florescent"
    },
    {
      "kind": "web",
      "label": "huyhg.dev",
      "href": "https://huyhg.dev"
    }
  ],
  "skills": [
    {
      "cat": "LANGUAGES",
      "items": [
        "Python",
        "Go",
        "C++",
        "Java",
        "Shell",
        "SQL",
        "Protobuf",
        "TypeScript",
        "JavaScript"
      ]
    },
    {
      "cat": "FRAMEWORKS",
      "items": [
        "FastAPI",
        "Flask",
        "Spring",
        "Node.js",
        "React Native",
        "React"
      ]
    },
    {
      "cat": "DEVELOPER TOOLS",
      "items": [
        "AWS",
        "Terraform",
        "Kubernetes",
        "Kafka",
        "MySQL",
        "Docker",
        "Jenkins",
        "OpenSearch",
        "Cadence"
      ]
    },
    {
      "cat": "AI/ML & LIBRARIES",
      "items": [
        "Model Context Protocol (MCP)",
        "LangChain",
        "PyTorch",
        "TensorFlow",
        "OpenCV",
        "NumPy",
        "pandas",
        "COLMAP"
      ]
    },
    {
      "cat": "CERTIFICATIONS",
      "items": [
        "NVIDIA Fundamentals of Deep Learning"
      ]
    }
  ],
  "experience": [
    {
      "role": "Software Engineering Intern",
      "company": "Uber",
      "dates": "May 2026 – Jul 2026",
      "bullets": [
        "Led search improvements for an A/B experimentation platform end-to-end, engineering OpenSearch-native sort and filter on Go gRPC endpoints for 120k+ experiments with 27k+ searches/day",
        "Ran a zero-downtime schema migration in Go across Protobuf, MySQL, Kafka, and OpenSearch, dual-writing on the live path and backfilling 120k+ production experiments through idempotent Cadence workflows at 99.8% completion",
        "Built a Go service exposing 7 experiment-management tools over Model Context Protocol (MCP), integrating it into an agentic debugging pipeline for 1k+ services running experiments",
        "Architected a Python LLM reviewer for A/B experiment configs across 500 diffs/day, cutting agent context by 50% and measuring 94% precision and 86% recall with an evaluation harness"
      ]
    },
    {
      "role": "Machine Learning Research Assistant",
      "company": "University of Florida — AI Lab",
      "dates": "Sep 2024 – Sep 2025",
      "bullets": [
        "Developed GPU-accelerated PyTorch pipelines for dense feature matching, enabling high-throughput 3D inference",
        "Architected a distributed pipeline consolidating multi-view 3D reconstructions into a unified field-scale model",
        "Applied monocular depth estimation to densify point clouds, achieving 90%+ data completeness for volumetric analysis"
      ]
    },
    {
      "role": "Software Engineer Intern",
      "company": "FPT Corporation",
      "dates": "May 2025 – Aug 2025",
      "bullets": [
        "Implemented RESTful APIs in Java Spring Boot with WSO2 mediation policies, deployed with AWS EC2 and Docker, achieving 98% request accuracy and improving response time by 20ms",
        "Configured and integrated 12+ enterprise microservices using WSO2 API Gateway on Kubernetes, reducing cross-service failures by 20% and increasing production resilience",
        "Developed custom Java WSO2 handlers for payload encryption/decryption and token validation using JWT and OAuth2, improving gateway throughput by 25%"
      ]
    },
    {
      "role": "Site Reliability Engineer Intern",
      "company": "FPT Information System",
      "dates": "May 2024 – Aug 2024",
      "bullets": [
        "Automated AWS EKS infrastructure provisioning with Terraform and GitOps, improving deployment efficiency by 30%",
        "Built CI/CD pipelines with Jenkins and Docker, enabling instant rollbacks and cutting deployment time by 90%",
        "Deployed Prometheus monitoring across 20+ EC2 instances, cutting network setup from 2h to 15min and crash rates by 30%"
      ]
    },
    {
      "role": "Teaching Assistant",
      "company": "University of Florida (Computer Organization & Fundamentals Programming 2)",
      "dates": "Aug 2024 – Present",
      "bullets": [
        "Led mini-lectures and structured office hours for 50+ students; section grades averaged 15% higher than other section"
      ]
    },
    {
      "role": "Software Engineering Fellow",
      "company": "Uber",
      "dates": "Feb 2025 – Aug 2025",
      "bullets": [
        "Selected for Uber Career Prep Fellowship with a 2.3% acceptance rate by demonstrating data structures and algorithm skills",
        "Accelerated algorithmic proficiency by working with Uber engineers 1:1 to solve 70+ technical interview problems"
      ]
    },
    {
      "role": "AI/ML Research Assistant",
      "company": "Hanoi University of Industry",
      "dates": "Mar 2023 – Aug 2023",
      "bullets": [
        "Co-authored peer-reviewed paper on AI + blockchain in forestry management",
        "Built a drone/IoT early warning system that enabled 60% faster wildfire detection"
      ]
    }
  ],
  "projects": [
    {
      "name": "Horus’ Eyes AI Platform",
      "award": "🏆 1st Place — Best Use of Terraform (SwampHacks)",
      "desc": "AI assistive platform for visually impaired users, with automated cloud infrastructure and a low-latency real-time inference pipeline.",
      "tech": [
        "Terraform",
        "AWS",
        "YOLOv8",
        "Flask",
        "Docker",
        "AWS Bedrock"
      ],
      "github": "https://github.com/Dat-cool-repo/Horus",
      "demo": null
    },
    {
      "name": "Context-Aware LLM Application",
      "award": null,
      "desc": "Generative AI application with optimized state and memory management for accurate multi-turn conversations without latency degradation.",
      "tech": [
        "LangChain",
        "AWS Bedrock",
        "Python",
        "FastAPI",
        "Docker"
      ],
      "github": "https://github.com/hwii-florescent/aws-bedrock-chatbot",
      "demo": null
    },
    {
      "name": "Crave",
      "award": null,
      "desc": "Native social food discovery prototype for sharing restaurant visits, dish ratings, and cuisine rankings with ordering, reservations, and ride integrations.",
      "tech": [
        "SwiftUI",
        "Kotlin",
        "Jetpack Compose",
        "Material 3"
      ],
      "github": "https://github.com/hwii-florescent/crave",
      "demo": null
    },
    {
      "name": "Perch",
      "award": null,
      "desc": "Personal AI IDE and agent app with a WebSocket server, headless Claude Code runner, terminal manager, and shared web/desktop client architecture.",
      "tech": [
        "TypeScript",
        "Node.js",
        "WebSockets",
        "SQLite",
        "Rust"
      ],
      "github": "https://github.com/hwii-florescent/perch",
      "demo": null
    },
    {
      "name": "Hower",
      "award": null,
      "desc": "Time management system that helps users track and manage how they spend their time through a Flask backend and Electron desktop application.",
      "tech": [
        "Python",
        "Flask",
        "SQLAlchemy",
        "Electron"
      ],
      "github": "https://github.com/hwii-florescent/hower",
      "demo": null
    },
    {
      "name": "Search & Rescue AI",
      "award": null,
      "desc": "Mobile app with voice-activated incident reporting, GPS tracking, and real-time dispatch coordination.",
      "tech": [
        "React Native",
        "FastAPI",
        "AWS DynamoDB",
        "S3",
        "Whisper"
      ],
      "github": "https://github.com/hwii-florescent/shellhacks24",
      "demo": null
    }
  ],
  "leadership": [
    {
      "role": "Software Team Lead",
      "org": "SASE Engineering Team",
      "dates": "Sep 2023 – Apr 2024",
      "bullets": [
        "Led fine-tuning on custom audio datasets to improve scream detection accuracy",
        "Built Python audio source localizer via multi-mic time-of-arrival analysis"
      ]
    }
  ]
} as const;

export const resumeUrl = "/Huy_Hoang_Resume.pdf";
export const avatarUrl = "/avatar.jpeg";

/** Headline numbers for the HUD overview. Keep in sync with the bullets above. */
export const stats = [
  { value: "120k+", label: "Experiments migrated" },
  { value: "99.8%", label: "Backfill completion" },
  { value: "94%", label: "LLM review precision" },
  { value: "3.9", label: "GPA / 4.0" },
] as const;
