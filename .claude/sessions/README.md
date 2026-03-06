# AI Session Journal

Record of prompts and conversations for learning and documentation.

## Purpose
- Document effective prompts
- Track decision-making conversations
- Improve AI collaboration skills

## Two Types of Records

| Type | Template | When | What to Capture |
|------|----------|------|-----------------|
| **Prompt snapshot** | `_prompt-template.md` | During/after session | The prompt that worked well |
| **Decision record** | `_template.md` | After conclusion | Problem → options → decision |

## Workflow

### During session
When a prompt works well, copy it immediately:
```bash
# Quick capture
echo "prompt text" >> .claude/sessions/drafts.md
```

### After session
Promote good prompts to a numbered file if worth keeping (e.g., `002-topic.md`).

---

## How to Ask Better Questions

### Structure that works

```
[Mode/Command]

Context: [What exists, what's decided]
Goal: [What you want]
Constraints: [What NOT to do]

[Specific ask]
```

### Example (good prompt)

```
presets: product + jam-sharp + ux-critique

Context:
Redesign transactions page

Goal:
Ask me only the next 5 highest-leverage questions (no long explanations)

Constraints:
- Do NOT invent new product requirements
- Avoid duplicate data vs Overview/Assets

Decisions already made:
- Inline edit: YES
- Multi-select: NO
- Search scope: within Transactions only
```

### Why this works

1. **Preset declared** - sets mode/role
2. **Context given** - what you're working on
3. **Goal specific** - "5 highest-leverage questions"
4. **Constraints clear** - what NOT to do
5. **Decisions listed** - prevents re-asking solved questions

### Do / Don't

| Do | Don't |
|----|-------|
| "Ask me 5 questions" | "Help me design this" |
| "Based on what we have" | Start from scratch each time |
| List decisions already made | Let AI re-explore closed paths |
| "Do NOT [specific thing]" | Assume AI remembers constraints |
| Short, focused sessions | One giant session for everything |

---

## Prompt Patterns Worth Saving

### Exploration
```
/jam [topic]
+ "ask max N questions"
+ "do not finalize yet"
```

### Narrowing
```
"Given X, Y, Z are decided, what's left to decide?"
```

### Implementation
```
/build [feature]
+ constraints
+ "v1 only, no overengineering"
```

### Review
```
/ux [screen or component]
+ "focus on [specific aspect]"
```

### Debugging
```
/debug [error]
+ expected vs actual
+ "minimal fix first"
```

---

**Key insight**: Your best prompts are reusable. Journal them.
