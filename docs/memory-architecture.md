# Memory Architecture

## What this workflow needs to remember

This workflow supports an agent that helps maintain and develop MarketRadar, a marketplace tracking application, across many separate sessions rather than a single continuous conversation. Because architectural context and project state don't persist between sessions on their own, the agent needs to remember important architectural decisions, the current state of in-progress and completed features, unresolved issues, work that has been deliberately deferred, and standing project priorities, so that each new session can pick up where the last one left off instead of rediscovering context from scratch. It does not need to memorize anything already clearly represented by the source code, tests, configuration, or existing documentation, since that information is authoritative and always available by inspection. It must never store credentials, authentication tokens, scraped user or private data, or transient debugging details, since these are either sensitive or too ephemeral to be useful in future sessions. Finally, because MarketRadar is intended to eventually support both web and iOS/mobile clients, any remembered backend or API decisions should be framed in a way that keeps them reusable across clients rather than coupled to the web frontend alone.

### What kind of information is this?

Before storing anything, classify it against these six categories:

- **Persistent project memory** — project-specific state that changes over time: feature status, decisions tied to specific work, deferred tasks, known blockers. Lives in `.memory/project/`, agent-writable.
- **Human-maintained knowledge** — stable rules that apply to every session regardless of what feature is in progress: coding standards, architectural constraints, security rules. Lives in `.memory/knowledge/`, human-owned and read-only to the agent.
- **Skills/procedures** — repeatable step-by-step actions (how to run builds, tests, or deployments). These are not memory at all; they belong in skills, not in any `.memory/` layer.
- **Temporary session details** — in-progress reasoning, individual debugging output, one-off scrape results. Never persisted anywhere; useful only for the current session and stale immediately after.
- **Repository-preserved information** — anything already authoritative in source code, tests, configuration, or existing documentation. Never duplicated into memory; read from the repository instead.
- **Secrets/sensitive information** — credentials, tokens, cookies, database URLs, scraped personal data. Never stored in any memory layer under any circumstance.

## Data Classification

Before writing anything to a memory file, classify it:

- **Public** — Safe to commit to the repo and share broadly. Most project decisions and coding standards fall here.
- **Internal** — Safe within the team but not for public repos. Store in a non-committed volume or .gitignore the containing folder.
- **Confidential** — Sensitive business data. Do not store in agent memory. Retrieve from secure systems on demand.
- **Secret** — Credentials, tokens, API keys, PII. Must never appear in any memory file. If the agent encounters a secret during a run, use it for the immediate task only and explicitly do not write it to any memory layer. Reference the environment variable name instead.

### Guardrails

A pre-commit hook at .git/hooks/pre-commit scans .memory/ for common credential patterns before each commit. If a pattern is found, the commit is blocked.

This hook is local to this Git clone only — it lives under `.git/`, which Git never tracks or transmits, so it is not committed with the repository and will not be present in a fresh clone unless it is reinstalled there.

## Layer 1: Project memory directory

### Belongs here
- Current state and next steps of the price-drop tracking feature.
- The decision to preserve full price history using append-only PriceObservation records.
- The architectural intent to keep backend/API features reusable for future web and iOS/mobile clients.
- Known limitations or blockers that affect future work, such as a migration that still needs to be applied.
- Important deferred work that a future session needs to know about.

### Does not belong here
- Credentials, tokens, or database secrets because secrets must never be stored in memory.
- Temporary debugging output or individual scrape results because they are session-specific and quickly become stale.
- Implementation details already obvious from the current source code unless a short pointer is necessary.

### Governance
- Scope: Project-scoped to the MarketRadar repository.
- Write permissions: The agent may create and update project-memory entries when significant project state or decisions change.
- Pruning policy: Feature/branch-specific entries are reviewed or archived when that work is merged or abandoned. Project-wide entries are reviewed every 90 days and replaced when superseded.

## Layer 2: Knowledge files

### Belongs here
- TypeScript coding standards and naming conventions used across MarketRadar.
- Backend/API architectural rules that keep business logic reusable across web and future iOS/mobile clients.
- Security rules such as never hardcoding credentials, tokens, or secrets.
- API conventions for consistent validation and error handling.
- Rules requiring human review before changing stable architectural constraints.

### Does not belong here
- Current feature progress or unfinished tasks because those change frequently and belong in project memory.
- Temporary debugging information or scrape failures because they are session-specific.
- Step-by-step procedures such as how to run builds, tests, or deployments because those belong in skills.

### Governance
- Scope: Project-wide for MarketRadar.
- Write permissions: Human-maintained and read-only for the agent.
- Pruning policy: Review every 90 days or whenever major architecture, tooling, or project standards change. Replace outdated rules rather than keeping conflicting versions active.

## Layer 3: Indexed reference documents

### Current status

This layer is currently empty — MarketRadar has no indexed reference documents yet. It should stay empty until a document becomes large enough, or infrequent enough in need, that loading it into every session would waste context. Adding a document here is justified once, for example, a pull request description needs to be preserved after merge to explain a past change, a feature accumulates a design write-up too long for project memory, or a technical investigation (such as scraping approach notes) produces findings worth keeping but not worth re-reading every session. See `.memory/reference/REFERENCE_INDEX.md` for the current index and retrieval rule.

### Belongs here
- Historical pull request descriptions that explain why major MarketRadar changes were made.
- Longer architecture or design documents that provide background for specific features.
- Previous technical investigation notes about scraping approaches and production limitations.
- Detailed API or integration reference material that is useful occasionally but does not need to load every session.

### Does not belong here
- Current feature state or immediate next steps because those belong in project memory.
- Stable coding or architectural rules because those belong in knowledge files.
- Credentials, tokens, cookies, or other secrets because sensitive information must never be stored here.

### Governance
- Scope: Project-wide for MarketRadar.
- Write permissions: Human-maintained and read-only for the agent.
- Pruning policy: Review references when their related system or integration changes significantly. Archive or remove documents that describe approaches no longer used.
- Retrieval: The agent should use the reference index to locate relevant documents and read only what is needed for the current task rather than loading the entire directory.

## Allocation decision table

| Information | Memory layer | Why |
|---|---|---|
| Current price-drop tracking feature status | Project memory directory | Active feature state that changes frequently between sessions. |
| Decision to preserve full price history with PriceObservation | Project memory directory | Project-specific architectural decision, not yet reflected everywhere in code. |
| Future iOS/mobile client architectural intent | Project memory directory | Forward-looking project priority that shapes current decisions. |
| TypeScript coding standards | Knowledge files | Stable, project-wide convention that applies to every session. |
| Backend/API rules for reusable business logic | Knowledge files | Durable architectural rule, not tied to a specific feature or moment. |
| Security rule prohibiting credentials and secrets | Knowledge files | Standing rule that must always be enforced, never situational. |
| Historical scraping investigation notes | Indexed reference documents | Useful background, but too long and infrequently needed to load every session. |
| Long architecture/design documents | Indexed reference documents | Detailed reference material retrieved on demand rather than kept in active context. |
| Credentials, tokens, cookies, and secrets | Do not store | Sensitive data must never be persisted in agent memory. |
| Temporary scrape/debugging output | Do not store | Session-specific noise that becomes stale immediately. |

## Alternatives considered

### Alternative 1: Store everything in one project memory file
Rejected because frequently changing project state, stable human-owned rules, and large background documents have different lifecycles and permissions. Mixing them increases stale context and makes pruning harder.

### Alternative 2: Rely only on source code and Git history
Rejected because important intent, deferred work, architectural direction, and decisions such as future iOS/mobile support may not be obvious from the current code.

### Alternative 3: Load all documentation into every agent session
Rejected because large reference material would consume context unnecessarily. Indexed reference documents should instead be retrieved only when relevant.

### Alternative 4: Let the agent freely modify every memory layer
Rejected because stable knowledge files and reference documents should remain human-maintained. The agent may update project memory, but durable rules require human control.

The three-layer architecture was chosen because it matches memory scope and write permissions to how frequently each kind of information changes, keeping active context small while still making stable rules and deep background material available when needed.
