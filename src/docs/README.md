# HoH Finance Tracker Documentation

> **Living Documentation**: This documentation is continuously updated as the project evolves. Last updated: January 23, 2026

Welcome to the HoH Finance Tracker documentation hub. This collection provides comprehensive information about the product vision, requirements, and technical implementation details.

---

## Table of Contents

### Product Requirements Documents (PRD)

#### Core Vision & Planning

- **[idea_dump.md](./prd/idea_dump.md)** - Initial brainstorming and feature wishlist
  - Raw product ideas and design inspiration
  - Feature descriptions for v1 and v2
  - Early architectural thinking
  - **Status:** Reference material, being refined into formal PRDs

- **[v1.md](./prd/v1/v1.md)** - Version 1.0 Product Requirements
  - Complete MVP specification
  - Offline-first, single-user personal finance tracker
  - Platform support: iOS, Android, Web
  - Core features: Dashboard, Transactions, Manual entry
  - Non-goals and boundaries for v1
  - **Status:** Active development

- **[v2.md](./prd/v2.md)** - Version 2.0 Future Vision
  - Family and multi-user support
  - Role-based access control (RBAC)
  - AI-powered insights and pattern detection
  - Shared financial management for families and co-owners
  - **Status:** Planning phase, not yet implemented

---

### Feature Documentation

#### Dashboard

- **[dashboard.md](./prd/v1/dashboard.md)** - Dashboard Feature Specification
  - Complete implementation guide for the main dashboard screen
  - Period navigation (Month/Year/All views)
  - View modes: Overview, Cash Flow, Accounts, Net Worth
  - Monthly view deep-dive:
    - Budget tracking with progress visualization
    - Daily cash flow calendar (Google Calendar-inspired)
    - Category spending breakdown with donut chart
  - Architecture: Repository pattern, hooks, state management
  - Visual design philosophy and component hierarchy
  - Performance optimizations and future considerations
  - **Status:** Monthly Overview view complete, Year/All views pending

---

## Documentation Organization

```
docs/
├── README.md              # This file - central navigation hub
└── prd/                   # Product Requirements Documents
    ├── idea_dump.md       # Raw feature ideas and brainstorming
    ├── v2.md              # Future vision (multi-user, AI)
    └── v1/                # Version 1 documentation
        ├── v1.md          # Core MVP requirements
        └── dashboard.md   # Dashboard feature specification
```

---

## How to Use This Documentation

### For Product Managers & Stakeholders

Start with:
1. **[v1.md](./prd/v1/v1.md)** - Understand what's being built in the MVP
2. **[v2.md](./prd/v2.md)** - See the future roadmap
3. Feature docs like **[dashboard.md](./prd/v1/dashboard.md)** - Track implementation progress

### For Developers

Start with:
1. **[v1.md](./prd/v1/v1.md)** - Understand product requirements and constraints
2. Feature-specific docs (e.g., **[dashboard.md](./prd/v1/dashboard.md)**) - Technical implementation details
3. **[Project README](../../README.md)** and **[CLAUDE.md](../../CLAUDE.md)** - Setup and architecture

### For Designers

Start with:
1. **[idea_dump.md](./prd/idea_dump.md)** - Original design inspiration
2. **[v1.md](./prd/v1/v1.md)** - Design principles and UI patterns
3. **[dashboard.md](./prd/v1/dashboard.md)** - Detailed UI specifications with visual examples

---

## Documentation Standards

Each feature document follows a consistent structure:

1. **Overview** - High-level summary accessible to non-technical readers
2. **What Changed** - Recent updates and modifications
3. **Visual Guide** - Diagrams, flowcharts, or ASCII art
4. **Technical Details** - Implementation specifics for developers
5. **Files Modified** - Changed files with descriptions
6. **How to Use** - Practical examples and usage instructions
7. **Future Considerations** - Known limitations and planned improvements

---

## Version Status Overview

| Version | Status | Focus | Timeline |
|---------|--------|-------|----------|
| **v1** | In Active Development | Single-user MVP with core finance tracking | Current |
| **v2** | Planning | Multi-user, family features, AI insights | Future |

---

## Quick Links

### External Resources

- **Main Project README**: [../../README.md](../../README.md)
- **Development Guide**: [../../CLAUDE.md](../../CLAUDE.md)
- **Source Code**: `src/` directory in project root

### Key Configuration Files

- **App Config**: `/src/config/app.config.ts` - Feature flags, budget defaults, currencies
- **Theme System**: `/src/theme/` - Colors, tokens, light/dark mode
- **Database Schema**: `/src/lib/db/migrations/` - SQLite migrations

---

## Contributing to Documentation

When adding new documentation:

1. **File Naming**: Use format `YYYY-MM-DD_descriptive-name.md` for dated docs
2. **Location**:
   - PRDs go in `docs/prd/v1/` or `docs/prd/v2/`
   - Feature docs go in `docs/prd/v1/` or appropriate version folder
3. **Structure**: Follow the documentation standards outlined above
4. **Update This README**: Add new documents to the appropriate section
5. **Cross-Reference**: Link to related documents where relevant

---

## Recent Updates

### January 2026

- **Dashboard Infrastructure Refactoring** - Major architectural improvement introducing repository pattern, data mappers, and infrastructure layer separation
- **Monthly View Implementation** - Complete implementation of budget tracking, daily cash flow calendar, and category spending visualization
- **Documentation Consolidation** - Created this central README to organize all project documentation

---

## Contact & Feedback

For questions about documentation or to suggest improvements, please reference the main project repository.

---

## Legend

Throughout the documentation, you'll see these status indicators:

- **Complete** - Feature is fully implemented and tested
- **In Progress** - Currently under active development
- **Pending** - Planned but not yet started
- **TBD** - To be determined, needs further specification
- **Not Started** - On roadmap but no work begun

---

**Note:** This documentation grows as the project evolves. Check the "Last updated" date at the top of each document to understand currency.
