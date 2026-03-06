# HoH Ledger Documentation

> Centralized documentation for HoH Finance Tracker.

---

## Quick Start

| Role | Start Here |
|------|------------|
| **Product** | [overview.md](overview.md) → [prd/v1.md](prd/v1.md) |
| **Developer** | [overview.md](overview.md) → [CLAUDE.md](../CLAUDE.md) → [adr/](adr/) |
| **QA** | [qa/functional-plan.md](qa/functional-plan.md) |

---

## Structure

```
docs/
├── README.md          # This file
├── overview.md        # Project overview
├── glossary.md        # Term definitions
├── ui-terminology.md  # UI component naming
├── changelog.md       # Version history
├── dev-tools.md       # Developer tools & commands
│
├── prd/               # Product Requirements
│   ├── v1.md          # V1 PRD (current)
│   ├── v2.md          # V2 PRD (future)
│   └── backlog.md     # Ideas & open questions
│
├── adr/               # Architecture Decision Records
│   ├── adr-0002-clean-architecture-adoption.md
│   └── adr-template.md
│
└── qa/                # Quality Assurance
    ├── functional-plan.md
    ├── functional-report.md
    ├── design-plan.md
    └── design-report.md
```

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [overview.md](overview.md) | What is HoH Ledger? Goals, principles |
| [prd/v1.md](prd/v1.md) | V1 requirements and user stories |
| [prd/v2.md](prd/v2.md) | V2 vision (family, AI, sync) |
| [prd/backlog.md](prd/backlog.md) | Feature ideas and open questions |
| [changelog.md](changelog.md) | What changed in each version |
| [glossary.md](glossary.md) | Domain terminology |
| [ui-terminology.md](ui-terminology.md) | UI component naming & layout |

---

## ADRs (Architecture Decision Records)

ADRs document significant technical decisions with rationale.

| ADR | Decision |
|-----|----------|
| [ADR-0002](adr/adr-0002-clean-architecture-adoption.md) | Clean Architecture adoption |

**Creating a new ADR**: Copy [adr-template.md](adr/adr-template.md)

---

## QA Documentation

| Document | Purpose |
|----------|---------|
| [functional-plan.md](qa/functional-plan.md) | Test cases for all features |
| [functional-report.md](qa/functional-report.md) | Test results and bug tracking |
| [design-plan.md](qa/design-plan.md) | Visual consistency checks |
| [design-report.md](qa/design-report.md) | Design QA results |

---

## Contributing

**Adding a feature idea**: Add to [prd/backlog.md](prd/backlog.md)

**Making an architectural decision**: Create ADR using [template](adr/adr-template.md)

**Updating after a release**: Update [changelog.md](changelog.md)

---

**Last Updated**: March 2026
