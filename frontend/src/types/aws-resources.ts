/** AWS Resource Configuration Types - Centralized for all modals */

/** Security Group Rule */
export interface SGRule {
  id: string
  type: string
  protocol: string
  portRange: string
  cidrOrSource: string
}

/** AWS Security Group Configuration */
export interface SecurityGroupConfig {
  name: string
  description: string
  vpcId: string
  vpcCidr?: string
  inboundRules: SGRule[]
  outboundRules: SGRule[]
  tags: Record<string, string>
}

/** AWS VPC Configuration — mirrors aws_vpc Terraform resource */
export interface VpcConfig {
  // Display
  name: string

  // Section 1 – Network
  cidr_block: string
  instance_tenancy: 'default' | 'dedicated'
  enable_dns_support: boolean
  enable_dns_hostnames: boolean
  enable_network_address_usage_metrics: boolean

  // Section 2 – IPv6
  assign_generated_ipv6_cidr_block: boolean
  ipv6_cidr_block: string
  ipv6_netmask_length: string
  ipv6_cidr_block_network_border_group: string

  // Section 3 – IPAM
  ipv4_ipam_pool_id: string
  ipv4_netmask_length: string
  ipv6_ipam_pool_id: string

  // Tags
  tags: Record<string, string>

  // Read-only (populated after creation)
  arn?: string
  vpc_id?: string
  owner_id?: string
  default_security_group_id?: string
  main_route_table_id?: string
}

/** AWS Subnet Configuration */
export interface SubnetConfig {
  name: string
  vpcId: string
  cidr: string
  availabilityZone: string
  autoAssignPublicIp: boolean
  tags: Record<string, string>
}

/** AWS EC2 Instance Configuration */
export interface EC2Config {
  // Instance Details
  instanceName: string
  ami: string
  instanceType: string

  // Networking
  vpcId: string
  subnetId: string
  assignPublicIp: boolean

  // Storage
  rootVolumeSize: number
  rootVolumeType: 'gp2' | 'gp3' | 'io1' | 'io2'
  rootVolumeIops?: number

  // Security
  securityGroupIds: string[]
  
  // Key Pair
  keyPairName: string

  // IAM Role
  iamRoleName?: string

  // Tags
  tags: Record<string, string>

  // Advanced
  userData?: string
  numberOfInstances?: number
  purchaseOption?: 'on-demand' | 'spot'
  spotBidPrice?: number
  monitoring?: boolean
  t2Unlimited?: boolean
}

/** AWS S3 Bucket Configuration */
export interface S3Config {
  // General Settings
  bucketName: string
  region: string

  // Versioning
  versioning: boolean

  // Public Access
  blockPublicAcl: boolean
  blockPublicPolicy: boolean
  ignorePublicAcl: boolean
  restrictPublicBuckets: boolean

  // Encryption
  encryption: 'none' | 'sse-s3' | 'sse-kms'
  kmsKeyId?: string

  // Tags
  tags: Record<string, string>

  // Lifecycle Rules
  lifecycleRules: Array<{
    id: string
    prefix: string
    expirationDays?: number
    transitionToGlacierDays?: number
  }>
}

/** AWS RDS Database Configuration */
export interface RDSConfig {
  // Engine Options
  engine: 'mysql' | 'postgres' | 'mariadb' | 'oracle' | 'sqlserver'
  engineVersion: string

  // Instance Class
  instanceClass: string

  // Storage
  storageType: 'gp2' | 'gp3' | 'io1'
  allocatedStorage: number
  iops?: number

  // Networking
  vpcId: string
  subnetGroupName: string
  publiclyAccessible: boolean

  // Security
  securityGroupIds: string[]
  encryption: boolean
  kmsKeyId?: string

  // Backup
  backupRetentionPeriod: number
  backupWindow: string

  // Maintenance
  maintenanceWindow: string

  // Tags
  tags: Record<string, string>
}

/** AWS Lambda Trigger Configuration */
export interface LambdaTrigger {
  id: string
  type: 'api-gateway' | 's3' | 'dynamodb' | 'sqs' | 'eventbridge'
  name: string
}

/** AWS Lambda Function Configuration */
export interface LambdaConfig {
  // Basic Settings
  functionName: string
  runtime: string
  handler: string

  // Memory & Timeout
  memory: number // 128 to 10240 MB
  timeout: number // seconds

  // Triggers
  triggers: LambdaTrigger[]

  // Environment Variables
  environmentVariables: Record<string, string>

  // IAM Role
  iamRoleName: string

  // Tags
  tags: Record<string, string>
}

/** Auto Scaling Policy */
export interface ScalingPolicy {
  id: string
  type: string
  value?: string
}

/** Auto Scaling Group Configuration */
export interface AsgConfig {
  name: string
  vpcId: string
  subnets: string[]
  launchTemplate?: string
  instanceTypeOverride?: string
  amiOverride?: string
  desired: number
  min: number
  max: number
  scalingPolicies: ScalingPolicy[]
  healthCheckType: string
  healthCheckGracePeriod: number
  tags: Record<string, string>
}

/** ELB Listener Configuration */
export interface Listener {
  id: string
  protocol: string
  port: number
  targetGroup?: string
  sslCert?: string
}

/** AWS Elastic Load Balancer Configuration */
export interface ElbConfig {
  // Basic
  name: string
  type: 'ALB' | 'NLB' | 'CLB'

  // Networking
  vpcId: string
  subnets: string[]

  // Listeners & Health Checks
  listeners: Listener[]
  healthCheck: {
    protocol: string
    port: number
    path?: string
    healthyThreshold: number
    unhealthyThreshold: number
    timeout: number
    interval: number
  }

  // Security
  securityGroups: string[]
  internal: boolean

  // Tags
  tags: Record<string, string>
}

/** Union type for all AWS resource configurations */
export type AwsResourceConfig = 
  | EC2Config 
  | SecurityGroupConfig 
  | VpcConfig 
  | SubnetConfig 
  | S3Config 
  | RDSConfig 
  | LambdaConfig 
  | AsgConfig 
  | ElbConfig
