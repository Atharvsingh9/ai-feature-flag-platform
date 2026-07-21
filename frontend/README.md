# Aegis Flags — AI Feature Flag Platform Dashboard

A premium, production-grade dashboard for an AI feature flag platform: gradual rollouts,
live quality monitoring, canary analysis, shadow deployments, and automatic rollback.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · React Router · Recharts · Lucide Icons · Framer Motion

## Getting started
```bash
npm install
npm run dev       # start dev server
npm run build      # production build
npm run preview    # preview the production build
```

## Pages
- **Dashboard** — KPI cards, quality/traffic/error charts, activity feed, system health
- **Feature Flags** — searchable, filterable, paginated flag table
- **Flag Details** — baseline vs experimental config, rollout status, recent evaluations
- **Rollouts** — visual stage timeline (1% → 5% → 25% → 50% → 100%) per active rollout
- **Quality Monitoring** — quality/latency/judge-score/error analytics with rolling window
- **Canary Analysis** — baseline vs experimental metric comparison with confidence score
- **Rollback History** — timeline and table views of every rollback event

## Notes
- All data is served through a mock service layer (`src/services`) simulating latency,
  so it is easy to swap in real API calls behind the same function signatures.
- Dark mode toggle is wired up via Tailwind's `class` strategy from the navbar.
