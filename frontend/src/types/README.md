# types

Shared TypeScript type definitions used across multiple parts of the application.

## Files

| File | Description |
|------|-------------|
| `aws.ts` | `AwsComponentType`, `AwsNodeData`, `AWS_COMPONENTS` catalogue with default properties |
| `cloud.ts` | `CloudProvider` union type (`aws` \| `azure` \| `gcp`) |
| `connections.ts` | `validateConnection` function and allowed connection rules between node types |
| `git.ts` | `GitRepository`, `GitBranch`, `GitCommit`, `GitProvider` types |
| `security.ts` | `SecurityRule`, `SecurityFinding`, `SecuritySeverity` types |
| `simulation.ts` | `SimulationScenario`, `SimulationPacket`, `LatencyResult` types |
| `terraform.ts` | Terraform HCL generation helpers and resource type maps |
| `workspace.ts` | `Workspace`, `TerraformVariable`, `TerraformOutput`, `TerraformBackend`, `TerraformProvider`, `ProjectSettings` types |

