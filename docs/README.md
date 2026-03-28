# HoH Ledger Documentation

> Centralized documentation for HoH Finance Tracker.

---

## Quick Start

| Role | Start Here |
|------|------------|
| **New Developer** | [getting-started/walkthrough.md](getting-started/walkthrough.md) |
| **Contributor** | [guides/contributing.md](guides/contributing.md) → [guides/testing.md](guides/testing.md) |
| **Product/Design** | [getting-started/overview.md](getting-started/overview.md) → [planning/prd-v1.md](planning/prd-v1.md) |
| **Architecture** | [architecture/overview.md](architecture/overview.md) |
| **QA** | [qa/test-plan.md](qa/test-plan.md) |

---

## Structure

```
docs/
├── README.md                    # This file
├── todos.md                     # TODO tracker
│
├── getting-started/             # Onboarding
│   ├── overview.md              # What is HoH? Goals, principles
│   └── walkthrough.md           # Codebase walkthrough (1200+ lines)
│
├── architecture/                # Technical architecture
│   ├── overview.md              # Architecture overview
│   └── adr/                     # Architecture Decision Records
│       ├── template.md
│       └── 0002-clean-architecture.md
│
├── guides/                      # How-to guides
│   ├── contributing.md          # PR workflow, code standards
│   ├── deployment.md            # App Store publishing
│   └── testing.md               # Test patterns, running tests
│
├── reference/                   # Reference material
│   ├── glossary.md              # Domain terminology
│   ├── ui-terminology.md        # UI component naming
│   ├── design-system.md         # Color tokens, typography, styles
│   └── dev-tools.md             # Developer tools & commands
│
├── planning/                    # Product planning
│   ├── prd-v1.md                # V1 requirements (current)
│   ├── prd-v2.md                # V2 vision (future)
│   ├── backlog.md               # Ideas & open questions
│   └── feature-specs/           # Detailed feature specs
│       ├── notifications.md
│       ├── price-tracker.md
│       └── settings.md
│
├── qa/                          # Quality Assurance
│   ├── test-plan.md             # Functional test cases
│   ├── design-checklist.md      # Visual consistency checks
│   └── test-reports/            # Test results
│       ├── functional.md
│       └── design.md
│
└── archive/                     # Historical documents
    ├── changelog.md             # Version history
    └── refactoring-2026-03.md   # Completed refactoring
```

---

## Key Documents

### Getting Started
| Document | Purpose |
|----------|---------|
| [walkthrough.md](getting-started/walkthrough.md) | Comprehensive codebase tour for new developers |
| [overview.md](getting-started/overview.md) | Product overview, goals, target users |

### Architecture
| Document | Purpose |
|----------|---------|
| [architecture/overview.md](architecture/overview.md) | Clean Architecture, layers, patterns |
| [ADR-0002](architecture/adr/0002-clean-architecture.md) | Why we adopted Clean Architecture |

### Guides
| Document | Purpose |
|----------|---------|
| [contributing.md](guides/contributing.md) | PR workflow, code standards, adding features |
| [testing.md](guides/testing.md) | Test patterns, running tests, mocking |
| [deployment.md](guides/deployment.md) | App Store publishing |

### Planning
| Document | Purpose |
|----------|---------|
| [prd-v1.md](planning/prd-v1.md) | Current product requirements |
| [prd-v2.md](planning/prd-v2.md) | Future vision (family, AI, sync) |
| [backlog.md](planning/backlog.md) | Feature ideas and open questions |

### Reference
| Document | Purpose |
|----------|---------|
| [glossary.md](reference/glossary.md) | Domain terminology definitions |
| [ui-terminology.md](reference/ui-terminology.md) | UI component naming conventions |
| [design-system.md](reference/design-system.md) | Color tokens, typography, component styles |
| [dev-tools.md](reference/dev-tools.md) | Developer tools and debug commands |

---

## Testing

See [guides/testing.md](guides/testing.md) for comprehensive testing guide.

```bash
npm test              # Run all tests (260 tests)
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

---

## Contributing

See [guides/contributing.md](guides/contributing.md) for full contribution guidelines.

**Quick links**:
- **Adding a feature idea**: [planning/backlog.md](planning/backlog.md)
- **Making an architectural decision**: [architecture/adr/template.md](architecture/adr/template.md)
- **Adding a TODO**: [todos.md](todos.md)

---

**Last Updated**: March 2026
