# src

Root source directory for the CloudForge frontend application.

## Structure

| Directory | Description |
|-----------|-------------|
| `assets/` | Static assets (images, SVGs) |
| `components/` | Reusable React components, organised by domain |
| `data/` | Static data (reserved for future data files) |
| `pages/` | Top-level route pages wired in `App.tsx` |
| `security/` | Security scanning rule definitions |
| `stores/` | Zustand global state stores |
| `types/` | Shared TypeScript type definitions |

## Entry Points

- `main.tsx` — Vite entry point, mounts `<App />` into `#root`
- `App.tsx` — React Router route declarations
- `index.css` — Global Tailwind CSS base styles

