# Cleanup Log

This document records all changes made during the initial project cleanup (PROMPT 1).

## Files Deleted

### Dead / Unused Files
| File | Reason |
|------|--------|
| `src/pages/Login.tsx` | 3-line placeholder — no real implementation |
| `src/pages/Pricing.tsx` | 3-line placeholder — no real implementation |
| `src/components/editor/WorkspacePanel.tsx` | Empty file (1 blank line) |
| `src/assets/react.svg` | Default Vite scaffold asset, never imported |
| `src/components/editor/modals/EC2Modal.tsx` | Legacy step-wizard version; replaced by `modals/ec2/EC2Modal.tsx` |
| `src/components/editor/modals/ComponentModal.tsx` | Dead wrapper around legacy EC2Modal; never imported |

### Old EC2 Step Files (replaced by `modals/ec2/steps/`)
| File | Reason |
|------|--------|
| `src/components/editor/modals/ec2/StepAMI.tsx` | Used only by deleted legacy EC2Modal |
| `src/components/editor/modals/ec2/StepAdvanced.tsx` | Used only by deleted legacy EC2Modal |
| `src/components/editor/modals/ec2/StepInstanceType.tsx` | Used only by deleted legacy EC2Modal |
| `src/components/editor/modals/ec2/StepKeyPair.tsx` | Used only by deleted legacy EC2Modal |
| `src/components/editor/modals/ec2/StepNameTags.tsx` | Used only by deleted legacy EC2Modal |
| `src/components/editor/modals/ec2/StepNetwork.tsx` | Used only by deleted legacy EC2Modal |
| `src/components/editor/modals/ec2/StepStorage.tsx` | Used only by deleted legacy EC2Modal |
| `src/components/editor/modals/ec2/StepSummary.tsx` | Used only by deleted legacy EC2Modal |

### Orphaned Data / Type Files
| File | Reason |
|------|--------|
| `src/types/ec2.ts` | Only imported by deleted files |
| `src/data/ec2-amis.ts` | Only imported by deleted legacy step files |
| `src/data/ec2-instances.ts` | Only imported by deleted legacy step files |

## Routes Removed

| Route | Reason |
|-------|--------|
| `/login` | Corresponded to deleted placeholder page |
| `/pricing` | Corresponded to deleted placeholder page |

## Dead Imports / Dead Links Removed

| File | Change |
|------|--------|
| `src/App.tsx` | Removed `Login`, `Pricing` imports and their `<Route>` entries |
| `src/components/layout/Navbar.tsx` | Removed `<Link to="/pricing">` nav item; changed `Sign in` link from `/login` to `/register` |
| `src/components/layout/DashboardNavbar.tsx` | Removed `Upgrade` button linking to `/pricing`; changed logout redirect from `/login` to `/` |
| `src/pages/Register.tsx` | Changed `footerLinkTo` from `/login` to `/register` |

## TODO Comments Removed

| File | Removed comment |
|------|-----------------|
| `src/components/auth/LoginForm.tsx` | `// TODO: connect to backend API` |
| `src/components/auth/RegisterForm.tsx` | `// TODO: connect to backend API` |
| `src/components/layout/DashboardNavbar.tsx` | `// TODO: clear JWT token` |
| `src/components/dashboard/NewProjectModal.tsx` | `// TODO: call backend API to create project` |

## Placeholder Content Replaced

| File | Change |
|------|--------|
| `src/components/editor/Canvas.tsx` | "is coming soon." → "No configurable properties for this resource type." |

## Verification

- `npx tsc --noEmit` → **0 errors**
- `npm run dev` → server starts on http://localhost:5173

