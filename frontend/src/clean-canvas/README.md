Quick start for the Clean Canvas example

Files live under `src/clean-canvas/`.

Usage:
1. Import and render the `CleanCanvas` component somewhere in your app (e.g., `App.tsx`):

```tsx
import CleanCanvas from "./clean-canvas/Canvas"

export default function App() {
  return <CleanCanvas />
}
```

2. Run the dev server:

```bash
cd frontend
npm run dev
```

Notes:
- Uses existing `@xyflow/react` binding in the repo.
- Drag items from the left sidebar onto the canvas.
- Selection shows properties on the right.
- Connection validation implemented in `validators.ts`.
