# Claude Code Configuration

## Memory Configuration

### Layer 1: Project Memory

Location: `.memory/project/`

Stores project-specific decisions, current feature state, unresolved issues, and deliberately deferred work.

Claude may create and update project memory when significant project state or decisions change.

### Layer 2: Knowledge Files

Location: `.memory/knowledge/`

Stores stable, human-maintained rules such as coding standards, architecture rules, API conventions, and security requirements.

Knowledge files are read-only for Claude. Claude must not create, modify, or delete these files.

### Layer 3: Indexed Reference Documents

Location: `.memory/reference/`

Stores longer background material that is useful occasionally but should not be loaded into every session.

Claude should retrieve only the reference documents relevant to the current task.

### Memory Policies

- At the start of a session, read `.memory/SCOPE.md` and `.memory/project/MEMORY_INDEX.md`.
- Verify that `.memory/SCOPE.md` matches the current project before using project memory.
- Do not use memory belonging to another project or repository.
- Treat source code, tests, configuration, and current documentation as authoritative when memory conflicts with the repository.
- Treat stale or conflicting memory as needing review rather than silently relying on it.
- Never store credentials, authentication tokens, cookies, secrets, personal data, or transient debugging output in memory.
- Claude may write to project memory but must not write to `.memory/knowledge/` or `.memory/reference/`.

### Data Classification Before Writing

Before writing anything to any memory layer, classify it first:

- Public: may be written to appropriate memory.
- Internal: only store in a non-committed location.
- Confidential: do not write to agent memory; retrieve from the secure source when needed.
- Secret: never write to any memory layer. Use only for the immediate task and reference environment-variable names instead of values.
- If a secret is already found in memory, flag it and stop until a human removes/remediates it.

### Knowledge File Permission Policy

Never modify file permissions in `.memory/knowledge/` without explicit human instruction. If a write fails because the knowledge directory is read-only, stop and ask the human rather than changing permissions.

### Required Session Startup

Before responding to the user's first task in every new Claude Code session:

1. Read `.memory/SCOPE.md` and verify it matches the current repository.
2. Read `.memory/project/MEMORY_INDEX.md`.
3. Read every active Project Memory entry listed in the index.
4. Read active Knowledge Files listed in the index.
5. Complete these memory reads before responding to the user's request.

Do not wait for the user to explicitly ask you to load project memory.
