<div align="center">

# KodLyft FSM

### Open-source field service management for the missing middle

[![CI](https://github.com/kodlyft/fsm/actions/workflows/ci.yml/badge.svg)](https://github.com/kodlyft/fsm/actions/workflows/ci.yml)
[![Frontend](https://github.com/kodlyft/fsm/actions/workflows/frontend.yml/badge.svg)](https://github.com/kodlyft/fsm/actions/workflows/frontend.yml)
[![Linters](https://github.com/kodlyft/fsm/actions/workflows/linter.yml/badge.svg)](https://github.com/kodlyft/fsm/actions/workflows/linter.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-1D9E75.svg)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-1D9E75.svg)](https://www.conventionalcommits.org)
[![Code style: prettier](https://img.shields.io/badge/code_style-prettier-1D9E75.svg)](https://prettier.io)

Scheduling, dispatch, mobile work orders, quoting, invoicing and a live customer portal —
built on [Frappe](https://frappeframework.com) + [ERPNext](https://erpnext.com), with no lock-in and transparent pricing.

</div>

---

## Why KodLyft

Field service software for small and mid-sized contractors (HVAC, plumbing, electrical, pest control,
appliance repair, …) is either too thin or too expensive, and there is **no credible open-source
option**. KodLyft fills that gap:

- **Complete core, done elegantly** — scheduling, work orders, mobile + offline, quoting, invoicing,
  CRM and reporting that just work.
- **No lock-in** — self-host it, own your data, export anything. Open core, transparent pricing.
- **No-code customization nearly for free** — the Frappe DocType engine lets owners build their own
  forms, fields and workflows, the single feature that most improves retention.
- **The differentiators incumbents skip** — Uber-like customer tracking, recurring-revenue service
  contracts, and AI call intake that captures revenue lost before a job is booked.

## Architecture

KodLyft runs as one Frappe app with three frontends that share **one design language** (a single
`tokens.json` source of truth) and one backend.

```
                ┌──────────────────────── Frappe + ERPNext ────────────────────────┐
                │  Native FSM doctypes (Job, Appointment, Technician, Contract …)    │
                │  reusing ERPNext masters (Customer, Item, Quotation, Invoice …)    │
                └───────────────▲───────────────▲───────────────▲───────────────────┘
                                │ REST / realtime │               │
        ┌───────────────────────┴───┐   ┌─────────┴─────────┐   ┌─┴───────────────────────┐
        │  Console (back office)     │   │  Portal (customer) │   │  Mobile (technician)     │
        │  Vue 3 + Tailwind v4       │   │  Vue 3 + Tailwind  │   │  Ionic + Vue + Capacitor │
        │  dispatch board, jobs,     │   │  booking, live ETA,│   │  offline jobs, checklist,│
        │  reporting                 │   │  self-service      │   │  photos, signature, pay  │
        └────────────────────────────┘   └────────────────────┘   └──────────────────────────┘
```

| Surface     | Stack                                            | Served as                              |
| ----------- | ------------------------------------------------ | -------------------------------------- |
| **Console** | Vue 3 · TypeScript · Tailwind v4 · Vite          | `/fsm-console` (Frappe www route)      |
| **Portal**  | Vue 3 · TypeScript · Tailwind v4 · Vite          | `/book` (Frappe www route, public)     |
| **Mobile**  | Ionic Vue 8 · Capacitor 8 · Tailwind v4          | Native Android + iOS app               |
| **Backend** | Frappe v16 · ERPNext v16 · Python 3.14           | DocTypes + whitelisted API + realtime  |

The frontends live in a Yarn-workspaces monorepo under [`frontend/`](./frontend):
`design` (tokens) · `ui` (shared components) · `api` (typed Frappe client) · `console` · `portal` · `mobile`.

## Installation

Requires a working [Frappe bench](https://github.com/frappe/bench) on the `version-16` (or `develop`) branch
with ERPNext installed.

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app fsm $URL_OF_THIS_REPO --branch develop
bench --site $YOUR_SITE install-app fsm
bench build
```

## Frontend development

```bash
cd apps/fsm/frontend
yarn install            # installs all workspaces + sets up git hooks

yarn dev:console        # back-office console  (Vite dev server, proxied to bench :8000)
yarn dev:portal         # customer portal
yarn dev:mobile         # technician app in the browser

yarn tokens             # regenerate design tokens (CSS + Ionic vars + TS) from tokens.json
yarn build              # build tokens + all three surfaces into the Frappe app
yarn lint && yarn format:check && yarn typecheck
```

### Mobile (Capacitor)

```bash
cd apps/fsm/frontend/mobile
yarn build
npx cap add android      # first time only
npx cap add ios          # first time only (requires macOS + Xcode)
yarn android:dev         # build + sync + assemble a debug APK
yarn ios:dev             # build + sync the iOS project, then open in Xcode
```

## Design system

Every color, type, spacing, radius and elevation value lives in
[`frontend/design/tokens.json`](./frontend/design/tokens.json) and is generated into CSS variables for the
web surfaces, Ionic variables for mobile, and a Tailwind v4 theme — so one edit updates all three apps.
Brand `#1D9E75`, Plus Jakarta Sans + JetBrains Mono, a 4px spacing scale, full dark-mode parity, and
status colors reserved strictly for state. **Never hard-code a hex or px in a component.**

## Documentation

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — how to develop, test and submit changes
- [`SECURITY.md`](./SECURITY.md) — reporting vulnerabilities

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md). Commits and PR titles
follow [Conventional Commits](https://www.conventionalcommits.org).

## License

[MIT](./LICENSE) © KodLyft
