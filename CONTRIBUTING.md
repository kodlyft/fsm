# Contributing to KodLyft FSM

Thanks for your interest in improving KodLyft FSM! This guide covers everything you need to develop,
test and submit changes.

## Code of conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating you agree to
uphold it. Report unacceptable behavior to **hello@kodlyft.com**.

## Prerequisites

- A working [Frappe bench](https://github.com/frappe/bench) on `version-16`/`develop` with ERPNext.
- Python 3.14, Node 24 (`nvm use` reads [`.nvmrc`](./.nvmrc)), Yarn 1.x.
- [`pre-commit`](https://pre-commit.com) for the Python/desk side.

## Repository layout

```
fsm/                 Frappe app (Python): doctypes, API, www host pages, hooks
frontend/            Yarn-workspaces monorepo (all JS surfaces)
  design/            @kodlyft/design  — tokens.json + token build (CSS / Ionic / TS)
  ui/                @kodlyft/ui      — shared Vue components
  api/               @kodlyft/api     — typed Frappe client + auth + realtime
  console/           @kodlyft/console — back-office (Vue 3 + Tailwind v4)
  portal/            @kodlyft/portal  — customer portal (Vue 3 + Tailwind v4)
  mobile/            @kodlyft/mobile  — technician app (Ionic + Vue + Capacitor)
.github/             CI, templates, dependabot, release automation
```

## Getting started

```bash
# Backend
bench get-app fsm <repo-url> --branch develop
bench --site <site> install-app fsm

# Python/desk hooks
cd apps/fsm && pre-commit install

# Frontend (also installs git hooks via husky)
cd apps/fsm/frontend && yarn install
```

## Running the apps

| Command (in `frontend/`) | What it does                                  |
| ------------------------ | --------------------------------------------- |
| `yarn dev:console`       | Console dev server (proxied to bench `:8000`) |
| `yarn dev:portal`        | Portal dev server                             |
| `yarn dev:mobile`        | Mobile app in the browser                     |
| `yarn tokens`            | Regenerate design tokens from `tokens.json`   |
| `yarn build`             | Build tokens + all surfaces into the app      |

For native mobile builds see the [Mobile section of the README](./README.md#mobile-capacitor).
iOS builds require macOS + Xcode; Android builds work on Linux/macOS/Windows with the Android SDK.

## Coding standards

- **Design tokens only.** No hard-coded hex colors or px sizes in components — reference tokens.
  New colors must map to an existing role (brand or a status).
- **Sentence case** in UI copy — never Title Case or ALL CAPS.
- **TypeScript everywhere**, Vue SFCs use `<script setup lang="ts">`.
- Accessibility: WCAG-AA contrast, 44px minimum touch targets on mobile.

### Linting & formatting

- **Frontend** is owned by the Node toolchain: ESLint 9 (flat config) + Prettier 3, run automatically
  on staged files via husky + lint-staged. Run manually with `yarn lint`, `yarn format`, `yarn typecheck`.
- **Python/desk** is owned by `pre-commit` (ruff, plus prettier/eslint for desk JS). Run with
  `pre-commit run --all-files`.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint (locally via
the `commit-msg` hook and in CI). Format:

```
<type>(<scope>): <subject>
```

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **scope** (optional): `design`, `ui`, `api`, `console`, `portal`, `mobile`, `backend`, `deps`, `release`, `repo`

Examples:

```
feat(console): add drag-and-drop dispatch board
fix(mobile): persist offline job edits across restarts
docs: document the token build pipeline
```

## Tests

- Backend: `bench --site <site> run-tests --app fsm`
- Frontend: `yarn test` (Vitest) at the workspace root, or per package.

## Pull requests

1. Branch from `develop`.
2. Keep PRs focused; update docs and tests with your change.
3. Ensure CI is green (server tests, linters, frontend build, commitlint, CodeQL).
4. Fill in the PR template, including screenshots for any UI change.

Releases are automated from `main` via [release-please](https://github.com/googleapis/release-please)
using your conventional commits — you don't need to bump versions or edit the changelog manually.
