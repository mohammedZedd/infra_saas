# components/editor/modals/ec2

AWS-style EC2 instance configuration wizard.

Mirrors the real AWS EC2 "Launch an instance" console UI with collapsible sections,
a left-side navigation sidebar, and a right-side live summary panel.

## Files

| File | Description |
|------|-------------|
| `EC2Modal.tsx` | Root modal shell: layout, scroll tracking, save/validation logic |
| `EC2ModalSidebar.tsx` | Left navigation sidebar showing sections and completion status |
| `EC2SummaryPanel.tsx` | Right panel summarising the current configuration |
| `index.ts` | Barrel re-exports for all public EC2 modal components and types |

## Sub-directories

| Directory | Description |
|-----------|-------------|
| `data/` | Static AMI catalogue and instance-type catalogue |
| `steps/` | Individual collapsible section components (Name, AMI, Type, etc.) |
| `types/` | `EC2FullConfig` type and `defaultEC2Config` constant |

