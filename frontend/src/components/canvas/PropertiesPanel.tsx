import React from "react"
import useEditorStore from "../../stores/useEditorStore"

// ─── Field configuration types ───────────────────────────────────────────────
type FieldType = "text" | "select" | "toggle" | "number" | "password" | "textarea"
interface FieldConfig {
  key: string
  label: string
  type: FieldType
  options?: string[]
  unit?: string
  placeholder?: string
  section?: string
}

// ─── Shared option lists (matching modals) ────────────────────────────────────
const INSTANCE_TYPES = ["t2.micro","t2.small","t2.medium","t3.micro","t3.small","t3.medium","t3.large","t3.xlarge","m5.large","m5.xlarge","c5.large","c5.xlarge"]
const REGIONS = ["us-east-1","us-east-2","us-west-1","us-west-2","eu-west-1","eu-west-2","eu-central-1","ap-southeast-1","ap-southeast-2","ap-northeast-1"]
const AZS = ["us-east-1a","us-east-1b","us-east-1c","eu-west-1a","eu-west-1b","eu-west-1c"]
const RUNTIMES = ["nodejs18.x","nodejs16.x","python3.11","python3.10","python3.9","java17","go1.x","dotnet6"]
const DB_ENGINES = ["mysql","postgres","mariadb","oracle-se2","sqlserver-ex"]
const DB_INSTANCE_CLASSES = ["db.t3.micro","db.t3.small","db.t3.medium","db.m5.large","db.m5.xlarge","db.r5.large"]

// ─── Per-service field definitions (mirrors config modals exactly) ────────────
const FIELD_CONFIGS: Record<string, FieldConfig[]> = {
  /* ────── EC2 (Ec2ConfigModal) ────── */
  ec2: [
    { key: "instance_name", label: "Instance Name", type: "text", placeholder: "my-ec2-instance", section: "Instance Details" },
    { key: "ami", label: "AMI ID", type: "text", placeholder: "ami-0c55b159cbfafe1f0", section: "Instance Details" },
    { key: "instance_type", label: "Instance Type", type: "select", options: INSTANCE_TYPES, section: "Instance Details" },
    { key: "vpc_id", label: "VPC", type: "text", placeholder: "vpc-default", section: "Networking" },
    { key: "subnet_id", label: "Subnet", type: "text", placeholder: "subnet-1", section: "Networking" },
    { key: "assign_public_ip", label: "Assign Public IP", type: "toggle", section: "Networking" },
    { key: "security_group_ids", label: "Security Groups", type: "text", placeholder: "sg-default", section: "Networking" },
    { key: "root_volume_size", label: "Root Volume Size", type: "number", unit: "GB", section: "Storage" },
    { key: "root_volume_type", label: "Root Volume Type", type: "select", options: ["gp2","gp3","io1","standard"], section: "Storage" },
    { key: "root_volume_iops", label: "IOPS", type: "number", section: "Storage" },
    { key: "key_pair", label: "Key Pair Name", type: "text", section: "Security" },
    { key: "iam_role", label: "IAM Role", type: "text", section: "Security" },
    { key: "monitoring", label: "Detailed Monitoring", type: "toggle", section: "Advanced" },
    { key: "t2_unlimited", label: "T2/T3 Unlimited", type: "toggle", section: "Advanced" },
    { key: "number_of_instances", label: "Number of Instances", type: "number", section: "Advanced" },
    { key: "purchase_option", label: "Purchase Option", type: "select", options: ["On-Demand","Spot"], section: "Advanced" },
    { key: "user_data", label: "User Data", type: "textarea", placeholder: "#!/bin/bash", section: "Advanced" },
  ],
  /* ────── S3 (S3ConfigModal) ────── */
  s3: [
    { key: "bucket_name", label: "Bucket Name", type: "text", placeholder: "my-bucket", section: "General" },
    { key: "region", label: "Region", type: "select", options: REGIONS, section: "General" },
    { key: "versioning", label: "Versioning", type: "toggle", section: "Versioning" },
    { key: "block_public_acl", label: "Block Public ACLs", type: "toggle", section: "Public Access" },
    { key: "block_public_policy", label: "Block Public Policy", type: "toggle", section: "Public Access" },
    { key: "ignore_public_acl", label: "Ignore Public ACLs", type: "toggle", section: "Public Access" },
    { key: "restrict_public_buckets", label: "Restrict Public Buckets", type: "toggle", section: "Public Access" },
    { key: "encryption", label: "Encryption", type: "select", options: ["none","sse-s3","sse-kms"], section: "Encryption" },
    { key: "kms_key_id", label: "KMS Key ID", type: "text", placeholder: "arn:aws:kms:...", section: "Encryption" },
  ],
  /* ────── RDS (RdsConfigModal) ────── */
  rds: [
    { key: "engine", label: "Engine", type: "select", options: DB_ENGINES, section: "Engine" },
    { key: "engine_version", label: "Engine Version", type: "text", placeholder: "8.0", section: "Engine" },
    { key: "instance_class", label: "Instance Class", type: "select", options: DB_INSTANCE_CLASSES, section: "Instance" },
    { key: "storage_type", label: "Storage Type", type: "select", options: ["gp2","gp3","io1"], section: "Storage" },
    { key: "allocated_storage", label: "Allocated Storage", type: "number", unit: "GB", section: "Storage" },
    { key: "iops", label: "IOPS", type: "number", section: "Storage" },
    { key: "vpc_id", label: "VPC", type: "text", placeholder: "vpc-default", section: "Networking" },
    { key: "subnet_group_name", label: "Subnet Group", type: "text", section: "Networking" },
    { key: "publicly_accessible", label: "Publicly Accessible", type: "toggle", section: "Networking" },
    { key: "security_group_ids", label: "Security Groups", type: "text", placeholder: "sg-default", section: "Networking" },
    { key: "encryption", label: "Encryption at Rest", type: "toggle", section: "Security" },
    { key: "kms_key_id", label: "KMS Key ID", type: "text", placeholder: "arn:aws:kms:...", section: "Security" },
    { key: "backup_retention_period", label: "Backup Retention", type: "number", unit: "days", section: "Backup" },
    { key: "backup_window", label: "Backup Window", type: "text", placeholder: "03:00-04:00", section: "Backup" },
    { key: "maintenance_window", label: "Maintenance Window", type: "text", placeholder: "mon:04:00-mon:05:00", section: "Maintenance" },
  ],
  /* ────── Lambda (LambdaConfigModal) ────── */
  lambda: [
    { key: "function_name", label: "Function Name", type: "text", section: "Basic Settings" },
    { key: "runtime", label: "Runtime", type: "select", options: RUNTIMES, section: "Basic Settings" },
    { key: "handler", label: "Handler", type: "text", placeholder: "index.handler", section: "Basic Settings" },
    { key: "memory", label: "Memory", type: "select", options: ["128","256","512","1024","2048","3008","4096","8192","10240"], unit: "MB", section: "Memory & Timeout" },
    { key: "timeout", label: "Timeout", type: "number", unit: "seconds", section: "Memory & Timeout" },
    { key: "iam_role", label: "IAM Role", type: "text", section: "IAM" },
  ],
  /* ────── VPC (VpcConfigModal) ────── */
  vpc: [
    { key: "vpc_name", label: "VPC Name", type: "text", placeholder: "my-vpc", section: "VPC Settings" },
    { key: "cidr_block", label: "CIDR Block", type: "text", placeholder: "10.0.0.0/16", section: "VPC Settings" },
    { key: "tenancy", label: "Instance Tenancy", type: "select", options: ["default","dedicated"], section: "VPC Settings" },
    { key: "dns_hostnames", label: "DNS Hostnames", type: "toggle", section: "DNS" },
    { key: "dns_resolution", label: "DNS Resolution", type: "toggle", section: "DNS" },
  ],
  /* ────── Subnet (SubnetConfigModal) ────── */
  subnet: [
    { key: "subnet_name", label: "Subnet Name", type: "text", placeholder: "my-subnet", section: "Settings" },
    { key: "vpc_id", label: "VPC", type: "text", placeholder: "vpc-default", section: "Settings" },
    { key: "cidr_block", label: "CIDR Block", type: "text", placeholder: "10.0.1.0/24", section: "Settings" },
    { key: "availability_zone", label: "Availability Zone", type: "select", options: AZS, section: "Settings" },
    { key: "auto_assign_public_ip", label: "Auto-Assign Public IP", type: "toggle", section: "Public IP" },
  ],
  /* ────── Security Group (SecurityGroupConfigModal) ────── */
  sg: [
    { key: "sg_name", label: "Security Group Name", type: "text", section: "Details" },
    { key: "description", label: "Description", type: "textarea", section: "Details" },
    { key: "vpc_id", label: "VPC", type: "text", placeholder: "vpc-default", section: "Details" },
    { key: "inbound_rules_count", label: "Inbound Rules", type: "number", section: "Rules" },
    { key: "outbound_rules_count", label: "Outbound Rules", type: "number", section: "Rules" },
  ],
  security_group: [
    { key: "sg_name", label: "Security Group Name", type: "text", section: "Details" },
    { key: "description", label: "Description", type: "textarea", section: "Details" },
    { key: "vpc_id", label: "VPC", type: "text", placeholder: "vpc-default", section: "Details" },
    { key: "inbound_rules_count", label: "Inbound Rules", type: "number", section: "Rules" },
    { key: "outbound_rules_count", label: "Outbound Rules", type: "number", section: "Rules" },
  ],
  /* ────── ELB (ElbConfigModal) ────── */
  elb: [
    { key: "elb_name", label: "Load Balancer Name", type: "text", section: "Details" },
    { key: "type", label: "Type", type: "select", options: ["ALB","NLB"], section: "Details" },
    { key: "vpc_id", label: "VPC", type: "text", placeholder: "vpc-default", section: "Details" },
    { key: "subnets", label: "Subnets", type: "text", placeholder: "subnet-1,subnet-2", section: "Details" },
    { key: "internal", label: "Internal Only", type: "toggle", section: "Security" },
    { key: "security_groups", label: "Security Groups", type: "text", placeholder: "sg-default", section: "Security" },
    { key: "health_check_protocol", label: "Health Check Protocol", type: "select", options: ["HTTP","TCP"], section: "Health Check" },
    { key: "health_check_port", label: "Health Check Port", type: "number", section: "Health Check" },
    { key: "health_check_path", label: "Health Check Path", type: "text", placeholder: "/healthcheck", section: "Health Check" },
    { key: "listeners_count", label: "Listeners", type: "number", section: "Listeners" },
  ],
  /* ────── ASG (AsgConfigModal) ────── */
  auto_scaling_group: [
    { key: "asg_name", label: "Auto Scaling Group Name", type: "text", section: "Group Details" },
    { key: "vpc_id", label: "VPC", type: "text", placeholder: "vpc-default", section: "Group Details" },
    { key: "subnets", label: "Subnets", type: "text", placeholder: "subnet-1,subnet-2", section: "Group Details" },
    { key: "launch_template", label: "Launch Template", type: "text", section: "Launch Template" },
    { key: "instance_type_override", label: "Instance Type Override", type: "text", section: "Launch Template" },
    { key: "ami_override", label: "AMI Override", type: "text", section: "Launch Template" },
    { key: "desired_capacity", label: "Desired Capacity", type: "number", section: "Scaling" },
    { key: "min_capacity", label: "Min Capacity", type: "number", section: "Scaling" },
    { key: "max_capacity", label: "Max Capacity", type: "number", section: "Scaling" },
    { key: "health_check_type", label: "Health Check Type", type: "select", options: ["EC2","ELB"], section: "Health Checks" },
    { key: "health_check_grace_period", label: "Grace Period", type: "number", unit: "seconds", section: "Health Checks" },
  ],
  /* ────── DynamoDB ────── */
  dynamodb: [
    { key: "table_name", label: "Table Name", type: "text" },
    { key: "billing_mode", label: "Billing Mode", type: "select", options: ["PAY_PER_REQUEST","PROVISIONED"] },
    { key: "read_capacity", label: "Read Capacity", type: "number" },
    { key: "write_capacity", label: "Write Capacity", type: "number" },
    { key: "hash_key", label: "Hash Key", type: "text", placeholder: "id" },
    { key: "hash_key_type", label: "Hash Key Type", type: "select", options: ["S","N","B"] },
  ],
  /* ────── EKS ────── */
  eks: [
    { key: "cluster_name", label: "Cluster Name", type: "text" },
    { key: "kubernetes_version", label: "Kubernetes Version", type: "select", options: ["1.28","1.27","1.26","1.25"] },
    { key: "node_instance_type", label: "Node Instance Type", type: "select", options: INSTANCE_TYPES },
    { key: "node_min_size", label: "Node Min Size", type: "number" },
    { key: "node_max_size", label: "Node Max Size", type: "number" },
    { key: "node_desired_size", label: "Node Desired Size", type: "number" },
  ],
  /* ────── ECS ────── */
  ecs: [
    { key: "cluster_name", label: "Cluster Name", type: "text" },
    { key: "launch_type", label: "Launch Type", type: "select", options: ["FARGATE","EC2"] },
    { key: "cpu", label: "CPU", type: "select", options: ["256","512","1024","2048","4096"] },
    { key: "memory", label: "Memory", type: "select", options: ["512","1024","2048","4096","8192"] },
  ],
  /* ────── SQS ────── */
  sqs: [
    { key: "queue_name", label: "Queue Name", type: "text" },
    { key: "fifo_queue", label: "FIFO Queue", type: "toggle" },
    { key: "visibility_timeout_seconds", label: "Visibility Timeout", type: "number" },
    { key: "message_retention_seconds", label: "Message Retention", type: "number" },
    { key: "max_message_size", label: "Max Message Size", type: "number" },
  ],
  /* ────── SNS ────── */
  sns: [
    { key: "topic_name", label: "Topic Name", type: "text" },
    { key: "fifo_topic", label: "FIFO Topic", type: "toggle" },
    { key: "content_based_deduplication", label: "Content Deduplication", type: "toggle" },
  ],
  /* ────── CloudFront ────── */
  cloudfront: [
    { key: "comment", label: "Comment", type: "text" },
    { key: "enabled", label: "Enabled", type: "toggle" },
    { key: "default_root_object", label: "Default Root Object", type: "text", placeholder: "index.html" },
    { key: "price_class", label: "Price Class", type: "select", options: ["PriceClass_100","PriceClass_200","PriceClass_All"] },
    { key: "minimum_protocol_version", label: "Min Protocol Version", type: "select", options: ["TLSv1.2_2021","TLSv1.2_2019"] },
  ],
  /* ────── ElastiCache ────── */
  elasticache: [
    { key: "cluster_id", label: "Cluster ID", type: "text" },
    { key: "engine", label: "Engine", type: "select", options: ["redis","memcached"] },
    { key: "node_type", label: "Node Type", type: "select", options: ["cache.t3.micro","cache.t3.small","cache.t3.medium","cache.m5.large"] },
    { key: "num_cache_nodes", label: "Num Cache Nodes", type: "number" },
    { key: "engine_version", label: "Engine Version", type: "text", placeholder: "7.0" },
  ],
}

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px", fontSize: "13px", color: "#111827",
  backgroundColor: "#FAFBFC", border: "1px solid #D1D5DB", borderRadius: "6px",
  outline: "none", boxSizing: "border-box",
}
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "4px",
}
const sectionHeaderStyle: React.CSSProperties = {
  fontSize: "11px", fontWeight: 600, color: "#6366F1", textTransform: "uppercase",
  letterSpacing: "0.05em", margin: 0, paddingTop: "8px", paddingBottom: "2px",
  borderBottom: "1px solid #E5E7EB",
}

// ─── Single field renderer ────────────────────────────────────────────────────
function FieldRow({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (v: string) => void }) {
  const val = value ?? ""
  if (field.type === "toggle") {
    const on = val === "true"
    return (
      <div>
        <label style={labelStyle}>{field.label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => onChange(on ? "false" : "true")}>
          <div style={{ width: "36px", height: "20px", borderRadius: "10px", backgroundColor: on ? "#4F46E5" : "#D1D5DB", position: "relative", transition: "background-color 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: "2px", left: on ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: "12px", color: on ? "#4F46E5" : "#9CA3AF" }}>{on ? "Enabled" : "Disabled"}</span>
        </div>
      </div>
    )
  }
  if (field.type === "select") {
    return (
      <div>
        <label style={labelStyle}>{field.label}</label>
        <select value={val} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          {!val && <option value="">Select…</option>}
          {field.options?.map((o) => <option key={o} value={o}>{o}{field.unit ? ` ${field.unit}` : ""}</option>)}
        </select>
      </div>
    )
  }
  if (field.type === "textarea") {
    return (
      <div>
        <label style={labelStyle}>{field.label}</label>
        <textarea value={val} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace" }} />
      </div>
    )
  }
  return (
    <div>
      <label style={labelStyle}>{field.label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input type={field.type} value={val} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4F46E5")} onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")} />
        {field.unit && <span style={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{field.unit}</span>}
      </div>
    </div>
  )
}

// ─── Group fields by section ──────────────────────────────────────────────────
function groupBySection(fields: FieldConfig[]): { section: string | null; fields: FieldConfig[] }[] {
  const groups: { section: string | null; fields: FieldConfig[] }[] = []
  let current: { section: string | null; fields: FieldConfig[] } | null = null
  for (const f of fields) {
    const sec = f.section ?? null
    if (!current || current.section !== sec) {
      current = { section: sec, fields: [] }
      groups.push(current)
    }
    current.fields.push(f)
  }
  return groups
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PropertiesPanel() {
  const nodes = useEditorStore((s) => s.nodes)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const updateNodeProperties = useEditorStore((s) => s.updateNodeProperties)
  const deleteNode = useEditorStore((s) => s.deleteNode)
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  if (!selectedNode) {
    return (
      <div
        style={{
          width: "280px",
          backgroundColor: "white",
          borderLeft: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <p style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center" }}>
          Select a component to edit its properties
        </p>
      </div>
    )
  }

  const { data } = selectedNode
  const properties = (data.properties ?? {}) as Record<string, string>
  const fields = FIELD_CONFIGS[data.type as string] ?? []
  const groups = groupBySection(fields)

  const handleChange = (field: string, value: string) => {
    updateNodeProperties(selectedNode.id, { [field]: value })
  }

  return (
    <div style={{ width: "280px", backgroundColor: "white", borderLeft: "1px solid #E5E7EB", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `${data.color ?? "#6366F1"}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
            {data.icon}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>{data.label}</p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, textTransform: "uppercase" }}>{data.type}</p>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          style={{ width: "24px", height: "24px", borderRadius: "4px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ×
        </button>
      </div>

      {/* Fields grouped by section */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {fields.length > 0
          ? groups.map((group, gi) => (
              <React.Fragment key={gi}>
                {group.section && (
                  <p style={sectionHeaderStyle}>{group.section}</p>
                )}
                {group.fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={properties[field.key] ?? ""}
                    onChange={(v) => handleChange(field.key, v)}
                  />
                ))}
              </React.Fragment>
            ))
          : (
            <>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                Properties
              </p>
              {data.properties && Object.keys(data.properties).length > 0
                ? Object.entries(data.properties).map(([key, value]) => (
                    <FieldRow
                      key={key}
                      field={{ key, label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), type: "text" }}
                      value={String(value ?? "")}
                      onChange={(v) => handleChange(key, v)}
                    />
                  ))
                : <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>No configuration fields for this type.</p>
              }
            </>
          )
        }
      </div>

      {/* Delete */}
      <div style={{ padding: "16px", borderTop: "1px solid #F3F4F6" }}>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          style={{ width: "100%", padding: "8px", fontSize: "13px", fontWeight: 500, color: "#DC2626", backgroundColor: "white", border: "1px solid #FECACA", borderRadius: "6px", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEF2F2")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
        >
          Delete Component
        </button>
      </div>
    </div>
  )
}