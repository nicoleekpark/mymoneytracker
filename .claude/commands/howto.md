# MyMoneyTracker - Claude Code Commands

Show this guide: `/how-to`

## Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/jam` | Product + UX exploration | Early ideation, exploring options |
| `/jam-sharp` | Concise jam session | Quick decisions, tight scope |
| `/build` | Implement a feature | Ready to code |
| `/debug` | Fix an error | Something broke |
| `/refactor` | Improve existing code | Cleanup, optimization |
| `/ux` | UX/UI critique | Review screen design |
| `/arch` | Architecture decision | Choosing patterns/approaches |

## Example Usage

```bash
# Explore a feature idea (asks clarifying questions)
/jam add recurring transactions feature

# Quick, focused exploration
/jam-sharp redesign the category picker

# Debug an error
/debug TypeError: Cannot read property 'map' of undefined

# Refactor a file
/refactor src/features/dashboard/monthly/useMonthlySummary.ts

# Build a feature (produces code)
/build income vs expense toggle on dashboard

# Review UX of a screen
/ux transactions list screen

# Make an architecture decision
/arch should tags be stored in SQLite or just config?
```

## Tips

- **Start with `/jam`** if requirements are unclear
- **Use `/jam-sharp`** when you know the scope but need quick alignment
- **Use `/build`** when requirements are clear and you want code
- **Add context** in follow-up messages if needed
- Commands auto-load project rules from `.claude/rules/`

## Project Structure Quick Reference

```
src/
├── app/            # Screens (Expo Router)
├── features/       # Feature-specific code
├── shared/         # Cross-feature components, hooks
├── domain/         # Pure business logic (no I/O)
├── infrastructure/ # Database, repositories
├── store/          # Zustand state
└── config/         # App configuration
```

## Common Dev Commands

```bash
npm run start:dev:ios     # Run with SQLite support
npm run db:migration:new  # Create migration
npm run db:dev:pull       # Export DB for inspection
```

## Prompt Journaling

Keep track of effective prompts in `.claude/sessions/`.

See `.claude/sessions/README.md` for:
- How to structure prompts
- Do/Don't patterns
- Reusable prompt templates