# Decision 002 - Separate /tests Directory for Test Files

**Date:** 2026-09-15
**Review by:** 2026-12-14
**Status:** Planned — not yet implemented

**Decision:** MarketRadar will organize test files in a separate `/tests` directory rather than placing them alongside their corresponding source files. This is a planned convention for future test files; no `/tests` directory, test tooling, or test files currently exist in the repository. This entry describes intent, not current repository state, and should not be treated as evidence that this structure is already in place.

**Rationale:** Keeping tests in a dedicated `/tests` directory keeps source directories focused on implementation, gives the test suite a consistent structure that mirrors the source tree, and matches the common convention expected by the project's test tooling.

**Alternatives rejected:** Co-locating test files next to their source files (e.g. `foo.ts` + `foo.test.ts` in the same directory) was considered, but was rejected in favor of a single, consistent `/tests` directory.
