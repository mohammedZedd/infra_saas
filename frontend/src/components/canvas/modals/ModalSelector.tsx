import type { Node } from "@xyflow/react"
import type { AwsNodeData } from "../../../types/aws"
import { Ec2ConfigModal } from "./Ec2ConfigModal"
import { S3ConfigModal } from "./S3ConfigModal"
import { RdsConfigModal } from "./RdsConfigModal"
import { LambdaConfigModal } from "./LambdaConfigModal"
import VpcConfigModal from "./VpcConfigModal"
import SubnetConfigModal from "./SubnetConfigModal"
import AsgConfigModal from "./AsgConfigModal"
import ElbConfigModal from "./ElbConfigModal"
import SecurityGroupConfigModal from "./SecurityGroupConfigModal"
import { AwsResourceModal, AwsResourceSection, FormField } from "./AwsResourceModal"

interface ModalSelectorProps {
  node: Node<AwsNodeData>
  onClose: () => void
  onSave: (updatedData: Partial<AwsNodeData>) => void
}

/**
 * Given a canvas node, renders the correct AWS configuration modal.
 *
 * Each specific modal receives:
 *   isOpen = true
 *   onClose → close callback
 *   onSave(config) → we translate the config object into a partial AwsNodeData
 *                     update (label + properties + raw config) then call props.onSave
 *   initialConfig → built from the node's existing data
 */
export default function ModalSelector({ node, onClose, onSave }: ModalSelectorProps) {
  const { data } = node
  const nodeType = (data.type ?? "").toLowerCase()

  // ── EC2 ───────────────────────────────────────────────────────────
  if (nodeType.includes("ec2")) {
    return (
      <Ec2ConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.instanceName || data.label,
            properties: {
              instance_name: config.instanceName,
              ami: config.ami,
              instance_type: config.instanceType,
              vpc_id: config.vpcId,
              subnet_id: config.subnetId,
              assign_public_ip: String(config.assignPublicIp),
              key_pair: config.keyPairName,
              iam_role: config.iamRoleName ?? "",
            },
          })
        }
        initialConfig={data.ec2Config as any}
      />
    )
  }

  // ── S3 ────────────────────────────────────────────────────────────
  if (nodeType.includes("s3")) {
    return (
      <S3ConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.bucketName || data.label,
            properties: {
              bucket_name: config.bucketName,
              region: config.region,
              versioning: String(config.versioning),
              encryption: config.encryption,
              block_public_acl: String(config.blockPublicAcl),
            },
          })
        }
        initialConfig={data.s3Config as any}
      />
    )
  }

  // ── RDS ───────────────────────────────────────────────────────────
  if (nodeType.includes("rds")) {
    return (
      <RdsConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.subnetGroupName || data.label,
            properties: {
              engine: config.engine,
              engine_version: config.engineVersion,
              instance_class: config.instanceClass,
              allocated_storage: String(config.allocatedStorage),
              storage_type: config.storageType,
              vpc_id: config.vpcId,
              publicly_accessible: String(config.publiclyAccessible),
            },
          })
        }
        initialConfig={data.rdsConfig as any}
      />
    )
  }

  // ── Lambda ────────────────────────────────────────────────────────
  if (nodeType.includes("lambda")) {
    return (
      <LambdaConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.functionName || data.label,
            properties: {
              function_name: config.functionName,
              runtime: config.runtime,
              handler: config.handler,
              memory: String(config.memory),
              timeout: String(config.timeout),
              iam_role: config.iamRoleName,
            },
          })
        }
        initialConfig={data.lambdaConfig as any}
      />
    )
  }

  // ── VPC ───────────────────────────────────────────────────────────
  if (nodeType.includes("vpc") && !nodeType.includes("subnet")) {
    return (
      <VpcConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.name || data.label,
            properties: {
              vpc_name: config.name,
              cidr_block: config.cidr,
              tenancy: config.tenancy,
              dns_hostnames: String(config.dnsHostnames),
              dns_resolution: String(config.dnsResolution),
            },
          })
        }
        initialConfig={data.vpcConfig as any}
      />
    )
  }

  // ── Subnet ────────────────────────────────────────────────────────
  if (nodeType.includes("subnet")) {
    return (
      <SubnetConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.name || data.label,
            properties: {
              subnet_name: config.name,
              vpc_id: config.vpcId,
              cidr_block: config.cidr,
              availability_zone: config.availabilityZone,
              auto_assign_public_ip: String(config.autoAssignPublicIp),
            },
          })
        }
        initialConfig={data.subnetConfig as any}
      />
    )
  }

  // ── ASG ───────────────────────────────────────────────────────────
  if (nodeType.includes("asg") || nodeType.includes("auto_scaling")) {
    return (
      <AsgConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.name || data.label,
            properties: {
              asg_name: config.name,
              vpc_id: config.vpcId,
              subnets: config.subnets?.join(",") ?? "",
              desired_capacity: String(config.desired),
              min_capacity: String(config.min),
              max_capacity: String(config.max),
              health_check_type: config.healthCheckType,
            },
          })
        }
        initialConfig={data.asgConfig as any}
      />
    )
  }

  // ── ELB ───────────────────────────────────────────────────────────
  if (nodeType.includes("elb") || nodeType.includes("load_balancer") || nodeType.includes("alb") || nodeType.includes("nlb")) {
    return (
      <ElbConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.name || data.label,
            properties: {
              elb_name: config.name,
              type: config.type,
              vpc_id: config.vpcId,
              subnets: config.subnets?.join(",") ?? "",
              listeners_count: String(config.listeners?.length ?? 0),
              internal: String(config.internal),
            },
          })
        }
        initialConfig={data.elbConfig as any}
      />
    )
  }

  // ── Security Group ────────────────────────────────────────────────
  if (nodeType.includes("security_group") || nodeType.includes("sg")) {
    return (
      <SecurityGroupConfigModal
        isOpen
        onClose={onClose}
        onSave={(config) =>
          onSave({
            label: config.name || data.label,
            properties: {
              sg_name: config.name,
              description: config.description,
              vpc_id: config.vpcId,
              inbound_rules_count: String(config.inboundRules?.length ?? 0),
              outbound_rules_count: String(config.outboundRules?.length ?? 0),
            },
          })
        }
        initialConfig={data.securityGroupConfig as any}
      />
    )
  }

  // ── Generic fallback ──────────────────────────────────────────────
  return (
    <AwsResourceModal
      title={`Configure ${data.label}`}
      subtitle={`Edit properties for ${data.type}`}
      isOpen
      onClose={onClose}
      onSave={() => onSave({})}
      sections={[{ id: "props", label: "Properties", icon: "⚙️" }]}
    >
      <AwsResourceSection sectionId="props" activeSection="props">
        <div className="space-y-3">
          {data.properties &&
            Object.entries(data.properties).map(([key, value]) => (
              <FormField key={key} label={key}>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  defaultValue={String(value ?? "")}
                  onBlur={(e) =>
                    onSave({ properties: { ...data.properties, [key]: e.target.value } })
                  }
                />
              </FormField>
            ))}
          {(!data.properties || Object.keys(data.properties).length === 0) && (
            <p className="text-sm text-gray-500">No editable properties for this resource type.</p>
          )}
        </div>
      </AwsResourceSection>
    </AwsResourceModal>
  )
}
