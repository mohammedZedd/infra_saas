# components/editor/modals/ec2/steps

Individual collapsible section components for the EC2 configuration wizard.

Each step maps to one section in the AWS-style "Launch an instance" UI.

## Files

| File | Description |
|------|-------------|
| `Step1NameTags.tsx` | Name field and custom resource tags |
| `Step2AMI.tsx` | Amazon Machine Image selection with search and platform filters |
| `Step3InstanceType.tsx` | Instance type selector with family filters and spec comparison |
| `Step4KeyPair.tsx` | SSH key pair selection or creation |
| `Step5Network.tsx` | VPC, subnet, security groups, and IP address settings |
| `Step6Storage.tsx` | Root EBS volume and additional block device configuration |
| `Step7Advanced.tsx` | IAM profile, monitoring, user data, spot options, placement, metadata |
| `StepSummary.tsx` | Read-only review of the full configuration with Terraform HCL preview |

