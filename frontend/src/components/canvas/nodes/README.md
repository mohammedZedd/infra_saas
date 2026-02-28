# components/editor/nodes

Custom React Flow node components for the infrastructure canvas.

## Files

| File | Description |
|------|-------------|
| `AwsIcon.tsx` | Renders the correct AWS service icon (emoji or SVG) for a given node type |
| `AwsNode.tsx` | Default node for individual AWS services (EC2, Lambda, S3, RDS, etc.) |
| `SubnetNode.tsx` | Resizable container node representing an AWS subnet |
| `VpcNode.tsx` | Resizable container node representing an AWS VPC |
| `nodeTypes.ts` | `nodeTypes` map passed to `<ReactFlow>` registering all custom node types |

