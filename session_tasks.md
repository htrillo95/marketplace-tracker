# Parallel Agent Session Tasks

## Session A

**Branch name:** feature/agent-a

**Worktree directory:** ../marketradar-agent-a

**Task:**
Create a root README.md that explains what MarketRadar is, its project structure, prerequisites, installation, environment variables, and how to run the frontend and backend locally.

**Files or folders the agent may write to:**
- README.md

**Files or folders the agent may read but not write to:**
- tracker-api/**
- tracker-client/**
- setup.md
- package.json files
- .env.example files

**Commands the agent may run:**
- ls
- cat
- find

**Definition of done:**
- README accurately documents the project.
- Setup instructions are correct.
- No files besides README.md are modified.

---

## Session B

**Branch name:** feature/agent-b

**Worktree directory:** ../marketradar-agent-b

**Task:**
Create documentation describing the current REST API by inspecting the existing Express routes.

**Files or folders the agent may write to:**
- docs/api.md

**Files or folders the agent may read but not write to:**
- tracker-api/src/**
- tracker-client/**
- package.json files

**Commands the agent may run:**
- ls
- cat
- find

**Definition of done:**
- docs/api.md documents the existing API endpoints.
- No application code is modified.
- No files outside docs/api.md are modified.