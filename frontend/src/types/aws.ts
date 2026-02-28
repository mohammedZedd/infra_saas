export type AwsCategory =
  | "compute"
  | "storage"
  | "database"
  | "networking"
  | "security"
  | "serverless"
  | "containers"
  | "monitoring"
  | "cdn_dns"
  | "messaging"
  | "ai_ml"
  | "analytics"
  | "devops"
  | "management"
  // ── Services externes ──
  | "authentication"
  | "error_tracking"
  | "external_dns"
  | "payments"
  | "external_monitoring"
  | "email_service"
  | "frontend_platform"
  | "external_database"

export interface AwsCategoryConfig {
  id: AwsCategory
  label: string
  icon: string
  color: string
}

export const AWS_CATEGORIES: AwsCategoryConfig[] = [
  // ── AWS ──
  { id: "networking", label: "Networking", icon: "🌐", color: "#3B82F6" },
  { id: "compute", label: "Compute", icon: "🖥️", color: "#F59E0B" },
  { id: "storage", label: "Storage", icon: "💾", color: "#22C55E" },
  { id: "database", label: "Database", icon: "🗄️", color: "#8B5CF6" },
  { id: "serverless", label: "Serverless", icon: "⚡", color: "#F97316" },
  { id: "containers", label: "Containers", icon: "📦", color: "#06B6D4" },
  { id: "security", label: "Security", icon: "🛡️", color: "#EF4444" },
  { id: "cdn_dns", label: "CDN & DNS", icon: "🌍", color: "#6366F1" },
  { id: "monitoring", label: "Monitoring", icon: "📊", color: "#EC4899" },
  { id: "messaging", label: "Messaging", icon: "📨", color: "#14B8A6" },
  { id: "ai_ml", label: "AI / ML", icon: "🧠", color: "#A855F7" },
  { id: "analytics", label: "Analytics", icon: "📈", color: "#0EA5E9" },
  { id: "devops", label: "DevOps", icon: "🔧", color: "#84CC16" },
  { id: "management", label: "Management", icon: "⚙️", color: "#78716C" },
  // ── Services externes ──
  { id: "authentication", label: "Authentication", icon: "🔐", color: "#EB5424" },
  { id: "error_tracking", label: "Error Tracking", icon: "🔍", color: "#362D59" },
  { id: "external_dns", label: "External DNS & CDN", icon: "🟠", color: "#F38020" },
  { id: "payments", label: "Payments", icon: "💳", color: "#635BFF" },
  { id: "external_monitoring", label: "External Monitoring", icon: "🐶", color: "#632CA6" },
  { id: "email_service", label: "Email Service", icon: "📧", color: "#00B4AB" },
  { id: "frontend_platform", label: "Frontend Platform", icon: "▲", color: "#000000" },
  { id: "external_database", label: "External Database", icon: "🗃️", color: "#00ED64" },
]

export type AwsComponentType =
  // ── AWS Networking ──
  | "vpc"
  | "subnet"
  | "internet_gateway"
  | "nat_gateway"
  | "route_table"
  | "elastic_ip"
  | "vpc_peering"
  | "transit_gateway"
  // ── AWS Compute ──
  | "ec2"
  | "auto_scaling_group"
  | "launch_template"
  | "elastic_beanstalk"
  // ── AWS Storage ──
  | "s3"
  | "efs"
  | "ebs"
  | "s3_glacier"
  // ── AWS Database ──
  | "rds"
  | "dynamodb"
  | "elasticache"
  | "aurora"
  | "redshift"
  // ── AWS Serverless ──
  | "lambda"
  | "api_gateway"
  | "step_functions"
  | "eventbridge"
  // ── AWS Containers ──
  | "ecs"
  | "ecs_service"
  | "ecr"
  | "eks"
  | "fargate"
  // ── AWS Security ──
  | "sg"
  | "iam_role"
  | "iam_policy"
  | "iam_user"
  | "kms"
  | "waf"
  | "secrets_manager"
  | "acm"
  // ── AWS CDN & DNS ──
  | "cloudfront"
  | "route53"
  | "route53_record"
  // ── AWS Monitoring ──
  | "cloudwatch"
  | "cloudwatch_alarm"
  | "cloudtrail"
  | "sns_monitoring"
  | "xray"
  // ── AWS Messaging ──
  | "sqs"
  | "sns"
  | "kinesis"
  | "ses"
  // ── AWS AI/ML ──
  | "sagemaker"
  | "rekognition"
  | "bedrock"
  // ── AWS Analytics ──
  | "athena"
  | "glue"
  | "quicksight"
  | "emr"
  // ── AWS DevOps ──
  | "codepipeline"
  | "codebuild"
  | "codedeploy"
  | "codecommit"
  // ── AWS Management ──
  | "cloudformation"
  | "systems_manager"
  | "aws_config"
  | "organizations"
  // ── Auth0 ──
  | "auth0_application"
  | "auth0_api"
  | "auth0_connection"
  // ── Sentry ──
  | "sentry_project"
  | "sentry_alert_rule"
  // ── Cloudflare ──
  | "cloudflare_zone"
  | "cloudflare_dns_record"
  // ── Stripe ──
  | "stripe_webhook_endpoint"
  // ── Datadog ──
  | "datadog_monitor"
  | "datadog_dashboard"
  // ── SendGrid ──
  | "sendgrid_domain"
  // ── Vercel ──
  | "vercel_project"
  // ── MongoDB Atlas ──
  | "mongodb_cluster"
  // ── Upstash ──
  | "upstash_redis"

// ── Node data used by React Flow nodes ──
export interface AwsNodeData extends Record<string, unknown> {
  type: AwsComponentType
  label: string
  icon: string
  color: string
  category: AwsCategory
  provider?: string
  properties: Record<string, unknown>
  ec2Config?: Record<string, unknown>
  // Hierarchy tracking
  parentId?: string | null
  isLocked?: boolean
}

// ── Component config for the sidebar catalog ──
export interface AwsComponentConfig {
  type: AwsComponentType
  label: string
  icon: string
  color: string
  category: AwsCategory
  provider?: string
  terraformType: string
  description: string
  defaultProperties: Record<string, string>
}

export const AWS_COMPONENTS: AwsComponentConfig[] = [
  // ======================== NETWORKING ========================
  {
    type: "vpc",
    label: "VPC",
    icon: "🌐",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    terraformType: "aws_vpc",
    description: "Isolated virtual network for AWS resources",
    defaultProperties: {
      cidr_block: "10.0.0.0/16",
      enable_dns_support: "true",
      enable_dns_hostnames: "true",
    },
  },
  {
    type: "subnet",
    label: "Subnet",
    icon: "📡",
    color: "#06B6D4",
    category: "networking",
    provider: "aws",
    terraformType: "aws_subnet",
    description: "Subdivision of a VPC IP address range",
    defaultProperties: {
      cidr_block: "10.0.1.0/24",
      availability_zone: "us-east-1a",
      map_public_ip: "false",
    },
  },
  {
    type: "internet_gateway",
    label: "Internet Gateway",
    icon: "🚀",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    terraformType: "aws_internet_gateway",
    description: "Gateway enabling internet access for a VPC",
    defaultProperties: {
      name: "my-igw",
      tags_environment: "production",
    },
  },
  {
    type: "nat_gateway",
    label: "NAT Gateway",
    icon: "🔄",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    terraformType: "aws_nat_gateway",
    description: "Network address translation for private subnets",
    defaultProperties: {
      name: "my-nat",
      connectivity_type: "public",
      private_ip: "",
    },
  },
  {
    type: "route_table",
    label: "Route Table",
    icon: "🗺️",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    terraformType: "aws_route_table",
    description: "Rules for routing network traffic in a VPC",
    defaultProperties: {
      name: "my-rt",
      route_cidr_block: "0.0.0.0/0",
      propagating_vgws: "",
    },
  },
  {
    type: "elastic_ip",
    label: "Elastic IP",
    icon: "📌",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    terraformType: "aws_eip",
    description: "Static public IPv4 address for dynamic cloud computing",
    defaultProperties: {
      domain: "vpc",
      name: "my-eip",
    },
  },
  {
    type: "vpc_peering",
    label: "VPC Peering",
    icon: "🔗",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    terraformType: "aws_vpc_peering_connection",
    description: "Network connection between two VPCs",
    defaultProperties: {
      name: "my-peering",
      auto_accept: "false",
      peer_region: "us-east-1",
    },
  },
  {
    type: "transit_gateway",
    label: "Transit Gateway",
    icon: "🔀",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    terraformType: "aws_ec2_transit_gateway",
    description: "Hub for connecting VPCs and on-premises networks",
    defaultProperties: {
      name: "my-tgw",
      amazon_side_asn: "64512",
      default_route_table_association: "enable",
      default_route_table_propagation: "enable",
      dns_support: "enable",
      auto_accept_shared_attachments: "disable",
    },
  },

  // ======================== COMPUTE ========================
  {
    type: "ec2",
    label: "EC2 Instance",
    icon: "🖥️",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    terraformType: "aws_instance",
    description: "Virtual server in the AWS cloud",
    defaultProperties: {
      instance_type: "t3.micro",
      ami: "ami-0c55b159cbfafe1f0",
      monitoring: "false",
      associate_public_ip_address: "false",
      ebs_optimized: "false",
      root_block_device_volume_type: "gp3",
      root_block_device_volume_size: "20",
      root_block_device_encrypted: "true",
    },
  },
  {
    type: "auto_scaling_group",
    label: "Auto Scaling Group",
    icon: "📈",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    terraformType: "aws_autoscaling_group",
    description: "Automatic scaling of EC2 instances based on demand",
    defaultProperties: {
      min_size: "1",
      max_size: "3",
      desired_capacity: "2",
      health_check_type: "EC2",
      health_check_grace_period: "300",
      default_cooldown: "300",
      force_delete: "false",
    },
  },
  {
    type: "launch_template",
    label: "Launch Template",
    icon: "📋",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    terraformType: "aws_launch_template",
    description: "Reusable EC2 instance launch configuration",
    defaultProperties: {
      name: "my-template",
      instance_type: "t3.micro",
      ami: "ami-0c55b159cbfafe1f0",
      ebs_optimized: "false",
      monitoring_enabled: "false",
      metadata_http_tokens: "required",
    },
  },
  {
    type: "elastic_beanstalk",
    label: "Elastic Beanstalk",
    icon: "🌱",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    terraformType: "aws_elastic_beanstalk_environment",
    description: "Managed platform for deploying web applications",
    defaultProperties: {
      name: "my-env",
      platform: "Python 3.11",
      tier: "WebServer",
      environment_type: "SingleInstance",
      enhanced_reporting: "enhanced",
    },
  },

  // ======================== STORAGE ========================
  {
    type: "s3",
    label: "S3 Bucket",
    icon: "🪣",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    terraformType: "aws_s3_bucket",
    description: "Scalable object storage service",
    defaultProperties: { bucket_name: "my-bucket", versioning: "false", acl: "private", encryption: "AES256" },
  },
  {
    type: "efs",
    label: "EFS",
    icon: "📂",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    terraformType: "aws_efs_file_system",
    description: "Managed elastic network file system",
    defaultProperties: { performance_mode: "generalPurpose", throughput_mode: "bursting", encrypted: "true" },
  },
  {
    type: "ebs",
    label: "EBS Volume",
    icon: "💽",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    terraformType: "aws_ebs_volume",
    description: "Persistent block storage for EC2 instances",
    defaultProperties: { volume_type: "gp3", size: "20", encrypted: "true" },
  },
  {
    type: "s3_glacier",
    label: "S3 Glacier",
    icon: "🧊",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    terraformType: "aws_glacier_vault",
    description: "Low-cost archival storage service",
    defaultProperties: {
      vault_name: "my-vault",
      tags_environment: "production",
    },
  },

  // ======================== DATABASE ========================
  {
    type: "rds",
    label: "RDS",
    icon: "🗄️",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    terraformType: "aws_db_instance",
    description: "Managed relational database service",
    defaultProperties: {
      engine: "postgresql",
      engine_version: "15.4",
      instance_class: "db.t3.micro",
      allocated_storage: "20",
      multi_az: "false",
      publicly_accessible: "false",
      storage_encrypted: "true",
      backup_retention_period: "7",
      deletion_protection: "false",
      skip_final_snapshot: "true",
      storage_type: "gp3",
      port: "5432",
    },
  },
  {
    type: "dynamodb",
    label: "DynamoDB",
    icon: "⚡",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    terraformType: "aws_dynamodb_table",
    description: "Fully managed NoSQL key-value database",
    defaultProperties: {
      table_name: "my-table",
      billing_mode: "PAY_PER_REQUEST",
      hash_key: "id",
      hash_key_type: "S",
      encryption_enabled: "true",
      point_in_time_recovery_enabled: "true",
      deletion_protection_enabled: "false",
    },
  },
  {
    type: "elasticache",
    label: "ElastiCache",
    icon: "🔴",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    terraformType: "aws_elasticache_cluster",
    description: "In-memory caching service for Redis or Memcached",
    defaultProperties: {
      engine: "redis",
      engine_version: "7.0",
      node_type: "cache.t3.micro",
      num_cache_nodes: "1",
      port: "6379",
      transit_encryption_enabled: "true",
      at_rest_encryption_enabled: "true",
      snapshot_retention_limit: "0",
    },
  },
  {
    type: "aurora",
    label: "Aurora",
    icon: "🌟",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    terraformType: "aws_rds_cluster",
    description: "High-performance managed relational database",
    defaultProperties: {
      engine: "aurora-postgresql",
      engine_version: "15.4",
      instance_class: "db.r6g.large",
      storage_encrypted: "true",
      backup_retention_period: "7",
      deletion_protection: "false",
      skip_final_snapshot: "true",
      preferred_backup_window: "03:00-04:00",
      port: "5432",
    },
  },
  {
    type: "redshift",
    label: "Redshift",
    icon: "📊",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    terraformType: "aws_redshift_cluster",
    description: "Managed data warehouse for analytics",
    defaultProperties: {
      cluster_type: "single-node",
      node_type: "dc2.large",
      number_of_nodes: "1",
      database_name: "mydb",
      master_username: "admin",
      encrypted: "true",
      publicly_accessible: "false",
      skip_final_snapshot: "true",
      port: "5439",
    },
  },

  // ======================== SERVERLESS ========================
  {
    type: "lambda",
    label: "Lambda",
    icon: "⚡",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    terraformType: "aws_lambda_function",
    description: "Serverless compute service for running code",
    defaultProperties: { runtime: "python3.11", memory: "128", timeout: "30", handler: "index.handler" },
  },
  {
    type: "api_gateway",
    label: "API Gateway",
    icon: "🚪",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    terraformType: "aws_apigatewayv2_api",
    description: "Managed REST and WebSocket API gateway",
    defaultProperties: {
      name: "my-api",
      protocol_type: "HTTP",
      stage: "prod",
      cors_allow_origins: "*",
      cors_allow_methods: "GET,POST,PUT,DELETE",
      disable_execute_api_endpoint: "false",
    },
  },
  {
    type: "step_functions",
    label: "Step Functions",
    icon: "🔄",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    terraformType: "aws_sfn_state_machine",
    description: "Serverless workflow orchestration service",
    defaultProperties: {
      name: "my-state-machine",
      type: "STANDARD",
      tracing_enabled: "false",
      logging_level: "OFF",
    },
  },
  {
    type: "eventbridge",
    label: "EventBridge",
    icon: "🎯",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    terraformType: "aws_cloudwatch_event_bus",
    description: "Serverless event bus for application integration",
    defaultProperties: {
      name: "my-event-bus",
      description: "Custom event bus",
      event_pattern: "",
    },
  },

  // ======================== CONTAINERS ========================
  {
    type: "ecs",
    label: "ECS Cluster",
    icon: "📦",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    terraformType: "aws_ecs_cluster",
    description: "Container orchestration service cluster",
    defaultProperties: {
      name: "my-cluster",
      capacity_provider: "FARGATE",
      container_insights: "enabled",
    },
  },
  {
    type: "ecs_service",
    label: "ECS Service",
    icon: "🔧",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    terraformType: "aws_ecs_service",
    description: "Long-running ECS task deployment",
    defaultProperties: {
      name: "my-service",
      desired_count: "2",
      launch_type: "FARGATE",
      deployment_minimum_healthy_percent: "50",
      deployment_maximum_percent: "200",
      enable_execute_command: "false",
    },
  },
  {
    type: "ecr",
    label: "ECR Registry",
    icon: "🐳",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    terraformType: "aws_ecr_repository",
    description: "Docker container image registry",
    defaultProperties: {
      name: "my-repo",
      image_tag_mutability: "MUTABLE",
      scan_on_push: "true",
      encryption_type: "AES256",
      force_delete: "false",
    },
  },
  {
    type: "eks",
    label: "EKS Cluster",
    icon: "☸️",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    terraformType: "aws_eks_cluster",
    description: "Managed Kubernetes cluster",
    defaultProperties: {
      name: "my-eks",
      version: "1.28",
      endpoint_private_access: "true",
      endpoint_public_access: "false",
      enabled_cluster_log_types: "api,audit,authenticator",
    },
  },
  {
    type: "fargate",
    label: "Fargate",
    icon: "🚀",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    terraformType: "aws_ecs_task_definition",
    description: "Serverless compute engine for containers",
    defaultProperties: {
      cpu: "256",
      memory: "512",
      network_mode: "awsvpc",
      requires_compatibilities: "FARGATE",
      runtime_platform_os: "LINUX",
      runtime_platform_cpu: "X86_64",
    },
  },

  // ======================== SECURITY ========================
  {
    type: "sg",
    label: "Security Group",
    icon: "🛡️",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_security_group",
    description: "Virtual firewall for controlling network traffic",
    defaultProperties: {
      name: "my-sg",
      description: "Managed security group",
      ingress_port: "443",
      protocol: "tcp",
      cidr: "10.0.0.0/16",
      egress_port: "0",
      egress_protocol: "-1",
      egress_cidr: "0.0.0.0/0",
    },
  },
  {
    type: "iam_role",
    label: "IAM Role",
    icon: "🔑",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_iam_role",
    description: "Identity with permissions for AWS services",
    defaultProperties: {
      name: "my-role",
      service: "ec2.amazonaws.com",
      max_session_duration: "3600",
      force_detach_policies: "false",
      path: "/",
    },
  },
  {
    type: "iam_policy",
    label: "IAM Policy",
    icon: "📜",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_iam_policy",
    description: "JSON document defining AWS permissions",
    defaultProperties: {
      name: "my-policy",
      effect: "Allow",
      action: "s3:GetObject",
      resource: "*",
      path: "/",
    },
  },
  {
    type: "iam_user",
    label: "IAM User",
    icon: "👤",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_iam_user",
    description: "Individual AWS account identity",
    defaultProperties: {
      name: "my-user",
      path: "/",
      force_destroy: "false",
      permissions_boundary: "",
    },
  },
  {
    type: "kms",
    label: "KMS Key",
    icon: "🔐",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_kms_key",
    description: "Managed encryption key service",
    defaultProperties: { description: "Encryption key", key_usage: "ENCRYPT_DECRYPT", deletion_window: "30" },
  },
  {
    type: "waf",
    label: "WAF",
    icon: "🧱",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_wafv2_web_acl",
    description: "Web application firewall for HTTP filtering",
    defaultProperties: {
      name: "my-waf",
      scope: "REGIONAL",
      default_action: "allow",
      cloudwatch_metrics_enabled: "true",
      sampled_requests_enabled: "true",
    },
  },
  {
    type: "secrets_manager",
    label: "Secrets Manager",
    icon: "🤫",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_secretsmanager_secret",
    description: "Secure storage for secrets and credentials",
    defaultProperties: {
      name: "my-secret",
      recovery_window: "30",
      description: "Managed secret",
      force_overwrite_replica_secret: "false",
    },
  },
  {
    type: "acm",
    label: "ACM Certificate",
    icon: "📃",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    terraformType: "aws_acm_certificate",
    description: "Managed SSL/TLS certificate service",
    defaultProperties: {
      domain_name: "example.com",
      validation_method: "DNS",
      key_algorithm: "RSA_2048",
      subject_alternative_names: "",
    },
  },

  // ======================== CDN & DNS ========================
  {
    type: "cloudfront",
    label: "CloudFront",
    icon: "🌍",
    color: "#6366F1",
    category: "cdn_dns",
    provider: "aws",
    terraformType: "aws_cloudfront_distribution",
    description: "Global content delivery network",
    defaultProperties: {
      price_class: "PriceClass_100",
      default_ttl: "86400",
      http_version: "http2",
      enabled: "true",
      is_ipv6_enabled: "true",
      default_root_object: "index.html",
      viewer_protocol_policy: "redirect-to-https",
      minimum_protocol_version: "TLSv1.2_2021",
    },
  },
  {
    type: "route53",
    label: "Route 53 Zone",
    icon: "🗂️",
    color: "#6366F1",
    category: "cdn_dns",
    provider: "aws",
    terraformType: "aws_route53_zone",
    description: "Managed DNS web service",
    defaultProperties: {
      domain_name: "example.com",
      private_zone: "false",
      comment: "Managed by Terraform",
    },
  },
  {
    type: "route53_record",
    label: "DNS Record",
    icon: "📍",
    color: "#6366F1",
    category: "cdn_dns",
    provider: "aws",
    terraformType: "aws_route53_record",
    description: "DNS record for domain name resolution",
    defaultProperties: {
      name: "www",
      type: "A",
      ttl: "300",
      allow_overwrite: "false",
      records: "",
    },
  },

  // ======================== MONITORING ========================
  {
    type: "cloudwatch",
    label: "CloudWatch",
    icon: "📊",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    terraformType: "aws_cloudwatch_log_group",
    description: "Monitoring and observability service",
    defaultProperties: {
      name: "/aws/my-app",
      retention_in_days: "14",
      namespace: "AWS/EC2",
      period: "300",
    },
  },
  {
    type: "cloudwatch_alarm",
    label: "CW Alarm",
    icon: "🚨",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    terraformType: "aws_cloudwatch_metric_alarm",
    description: "Automated monitoring alarm for metrics",
    defaultProperties: {
      metric_name: "CPUUtilization",
      threshold: "80",
      comparison: "GreaterThanThreshold",
      period: "300",
      evaluation_periods: "2",
      statistic: "Average",
      namespace: "AWS/EC2",
    },
  },
  {
    type: "cloudtrail",
    label: "CloudTrail",
    icon: "🔍",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    terraformType: "aws_cloudtrail",
    description: "AWS API call logging and audit trail",
    defaultProperties: {
      name: "my-trail",
      is_multi_region: "true",
      enable_logging: "true",
      include_global_service_events: "true",
      enable_log_file_validation: "true",
      is_organization_trail: "false",
    },
  },
  {
    type: "sns_monitoring",
    label: "SNS Alert",
    icon: "🔔",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    terraformType: "aws_sns_topic",
    description: "SNS topic for monitoring alerts",
    defaultProperties: {
      name: "alerts-topic",
      protocol: "email",
      display_name: "Monitoring Alerts",
    },
  },
  {
    type: "xray",
    label: "X-Ray",
    icon: "🔬",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    terraformType: "aws_xray_sampling_rule",
    description: "Distributed tracing for application analysis",
    defaultProperties: {
      rule_name: "default",
      priority: "1000",
      reservoir_size: "1",
      fixed_rate: "0.05",
      host: "*",
      service_name: "*",
      http_method: "*",
      url_path: "*",
      version: "1",
    },
  },

  // ======================== MESSAGING ========================
  {
    type: "sqs",
    label: "SQS Queue",
    icon: "📨",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    terraformType: "aws_sqs_queue",
    description: "Fully managed message queuing service",
    defaultProperties: {
      name: "my-queue",
      delay_seconds: "0",
      max_message_size: "262144",
      message_retention: "345600",
      visibility_timeout_seconds: "30",
      receive_wait_time_seconds: "0",
      fifo: "false",
      sqs_managed_sse_enabled: "true",
    },
  },
  {
    type: "sns",
    label: "SNS Topic",
    icon: "📢",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    terraformType: "aws_sns_topic",
    description: "Managed pub/sub messaging service",
    defaultProperties: {
      name: "my-topic",
      fifo: "false",
      display_name: "My Topic",
      kms_master_key_id: "",
    },
  },
  {
    type: "kinesis",
    label: "Kinesis Stream",
    icon: "🌊",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    terraformType: "aws_kinesis_stream",
    description: "Real-time streaming data service",
    defaultProperties: {
      name: "my-stream",
      shard_count: "1",
      retention_period: "24",
      encryption_type: "KMS",
      stream_mode: "PROVISIONED",
    },
  },
  {
    type: "ses",
    label: "SES Email",
    icon: "✉️",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    terraformType: "aws_ses_domain_identity",
    description: "Scalable email sending service",
    defaultProperties: {
      domain: "example.com",
      dkim_signing: "true",
      mail_from_domain: "mail.example.com",
    },
  },

  // ======================== AI / ML ========================
  {
    type: "sagemaker",
    label: "SageMaker",
    icon: "🧠",
    color: "#A855F7",
    category: "ai_ml",
    provider: "aws",
    terraformType: "aws_sagemaker_notebook_instance",
    description: "Machine learning model building platform",
    defaultProperties: {
      instance_type: "ml.t3.medium",
      name: "my-notebook",
      volume_size_in_gb: "5",
      direct_internet_access: "Disabled",
      root_access: "Disabled",
      platform_identifier: "notebook-al2-v2",
    },
  },
  {
    type: "rekognition",
    label: "Rekognition",
    icon: "👁️",
    color: "#A855F7",
    category: "ai_ml",
    provider: "aws",
    terraformType: "aws_rekognition_collection",
    description: "Image and video analysis service",
    defaultProperties: {
      collection_id: "my-collection",
      face_model_version: "",
    },
  },
  {
    type: "bedrock",
    label: "Bedrock",
    icon: "🤖",
    color: "#A855F7",
    category: "ai_ml",
    provider: "aws",
    terraformType: "aws_bedrock_custom_model",
    description: "Foundation model AI service",
    defaultProperties: {
      model_id: "anthropic.claude-v2",
      custom_model_name: "my-custom-model",
      base_model_identifier: "anthropic.claude-v2",
    },
  },

  // ======================== ANALYTICS ========================
  {
    type: "athena",
    label: "Athena",
    icon: "🔎",
    color: "#0EA5E9",
    category: "analytics",
    provider: "aws",
    terraformType: "aws_athena_workgroup",
    description: "Interactive SQL query service for S3 data",
    defaultProperties: {
      name: "my-workgroup",
      state: "ENABLED",
      enforce_workgroup_configuration: "true",
      publish_cloudwatch_metrics_enabled: "true",
      bytes_scanned_cutoff_per_query: "1073741824",
      result_output_location: "s3://my-bucket/athena-results/",
    },
  },
  {
    type: "glue",
    label: "Glue",
    icon: "🧪",
    color: "#0EA5E9",
    category: "analytics",
    provider: "aws",
    terraformType: "aws_glue_job",
    description: "Managed ETL and data integration service",
    defaultProperties: {
      name: "my-glue-job",
      role_arn: "",
      command_type: "glueetl",
      glue_version: "4.0",
      worker_type: "G.1X",
      number_of_workers: "2",
      timeout: "2880",
      max_retries: "0",
    },
  },
  {
    type: "quicksight",
    label: "QuickSight",
    icon: "📊",
    color: "#0EA5E9",
    category: "analytics",
    provider: "aws",
    terraformType: "aws_quicksight_data_source",
    description: "Business intelligence and visualization service",
    defaultProperties: {
      name: "my-datasource",
      type: "ATHENA",
      ssl_properties_disable_ssl: "false",
    },
  },
  {
    type: "emr",
    label: "EMR",
    icon: "⚙️",
    color: "#0EA5E9",
    category: "analytics",
    provider: "aws",
    terraformType: "aws_emr_cluster",
    description: "Big data processing with Hadoop and Spark",
    defaultProperties: {
      name: "my-cluster",
      release_label: "emr-6.15.0",
      instance_type: "m5.xlarge",
      applications: "Spark",
      keep_job_flow_alive_when_no_steps: "true",
      log_uri: "s3://my-bucket/emr-logs/",
      core_instance_count: "2",
      termination_protection: "false",
    },
  },

  // ======================== DEVOPS ========================
  {
    type: "codepipeline",
    label: "CodePipeline",
    icon: "🔄",
    color: "#84CC16",
    category: "devops",
    provider: "aws",
    terraformType: "aws_codepipeline",
    description: "Continuous delivery pipeline service",
    defaultProperties: {
      name: "my-pipeline",
      artifact_store_type: "S3",
      artifact_store_location: "my-pipeline-artifacts",
      restart_execution_on_update: "false",
    },
  },
  {
    type: "codebuild",
    label: "CodeBuild",
    icon: "🏗️",
    color: "#84CC16",
    category: "devops",
    provider: "aws",
    terraformType: "aws_codebuild_project",
    description: "Fully managed build and test service",
    defaultProperties: {
      name: "my-build",
      compute_type: "BUILD_GENERAL1_SMALL",
      image: "aws/codebuild/standard:7.0",
      source_type: "CODECOMMIT",
      environment_type: "LINUX_CONTAINER",
      privileged_mode: "false",
      build_timeout: "60",
    },
  },
  {
    type: "codedeploy",
    label: "CodeDeploy",
    icon: "🚀",
    color: "#84CC16",
    category: "devops",
    provider: "aws",
    terraformType: "aws_codedeploy_app",
    description: "Automated application deployment service",
    defaultProperties: {
      name: "my-app",
      compute_platform: "Server",
      deployment_style: "IN_PLACE",
    },
  },
  {
    type: "codecommit",
    label: "CodeCommit",
    icon: "📝",
    color: "#84CC16",
    category: "devops",
    provider: "aws",
    terraformType: "aws_codecommit_repository",
    description: "Managed Git source control service",
    defaultProperties: {
      repository_name: "my-repo",
      description: "Managed by Terraform",
      default_branch: "main",
    },
  },

  // ======================== MANAGEMENT ========================
  {
    type: "cloudformation",
    label: "CloudFormation",
    icon: "📜",
    color: "#78716C",
    category: "management",
    provider: "aws",
    terraformType: "aws_cloudformation_stack",
    description: "Infrastructure as Code template service",
    defaultProperties: {
      name: "my-stack",
      template_url: "",
      on_failure: "ROLLBACK",
      capabilities: "CAPABILITY_IAM",
      timeout_in_minutes: "60",
    },
  },
  {
    type: "systems_manager",
    label: "Systems Manager",
    icon: "🔧",
    color: "#78716C",
    category: "management",
    provider: "aws",
    terraformType: "aws_ssm_parameter",
    description: "Operational management for AWS resources",
    defaultProperties: {
      name: "/my/param",
      type: "String",
      value: "default",
      tier: "Standard",
      overwrite: "false",
    },
  },
  {
    type: "aws_config",
    label: "AWS Config",
    icon: "📋",
    color: "#78716C",
    category: "management",
    provider: "aws",
    terraformType: "aws_config_configuration_recorder",
    description: "AWS resource configuration tracking",
    defaultProperties: {
      name: "default",
      role_arn: "",
      all_supported: "true",
      include_global_resource_types: "true",
    },
  },
  {
    type: "organizations",
    label: "Organizations",
    icon: "🏢",
    color: "#78716C",
    category: "management",
    provider: "aws",
    terraformType: "aws_organizations_organization",
    description: "Multi-account AWS environment management",
    defaultProperties: {
      feature_set: "ALL",
      enabled_policy_types: "SERVICE_CONTROL_POLICY",
      aws_service_access_principals: "cloudtrail.amazonaws.com",
    },
  },

  // ================================================================
  // ==================== SERVICES EXTERNES =========================
  // ================================================================

  // ======================== AUTH0 ================================
  {
    type: "auth0_application",
    label: "Auth0 Application",
    icon: "📱",
    color: "#EB5424",
    category: "authentication",
    provider: "auth0",
    terraformType: "auth0_client",
    description: "Auth0 client application for authentication",
    defaultProperties: {
      name: "My Web App",
      app_type: "spa",
      callbacks: "https://app.example.com/callback",
      allowed_logout_urls: "https://app.example.com",
      token_endpoint_auth_method: "none",
    },
  },
  {
    type: "auth0_api",
    label: "Auth0 API",
    icon: "🚪",
    color: "#EB5424",
    category: "authentication",
    provider: "auth0",
    terraformType: "auth0_resource_server",
    description: "Auth0 API resource server",
    defaultProperties: {
      name: "My API",
      identifier: "https://api.example.com",
      signing_alg: "RS256",
      token_lifetime: "86400",
    },
  },
  {
    type: "auth0_connection",
    label: "Auth0 Connection",
    icon: "🔗",
    color: "#EB5424",
    category: "authentication",
    provider: "auth0",
    terraformType: "auth0_connection",
    description: "Auth0 identity provider connection",
    defaultProperties: {
      name: "google-oauth2",
      strategy: "google-oauth2",
      enabled_clients: "",
    },
  },

  // ======================== SENTRY ================================
  {
    type: "sentry_project",
    label: "Sentry Project",
    icon: "🔍",
    color: "#362D59",
    category: "error_tracking",
    provider: "sentry",
    terraformType: "sentry_project",
    description: "Sentry error tracking project",
    defaultProperties: {
      organization: "my-org",
      name: "backend-api",
      platform: "python",
    },
  },
  {
    type: "sentry_alert_rule",
    label: "Sentry Alert",
    icon: "🚨",
    color: "#362D59",
    category: "error_tracking",
    provider: "sentry",
    terraformType: "sentry_issue_alert",
    description: "Sentry automated alert rule",
    defaultProperties: {
      organization: "my-org",
      project: "backend-api",
      name: "High Error Rate",
      frequency: "30",
      value: "100",
    },
  },

  // ======================== CLOUDFLARE ============================
  {
    type: "cloudflare_zone",
    label: "Cloudflare Zone",
    icon: "🟠",
    color: "#F38020",
    category: "external_dns",
    provider: "cloudflare",
    terraformType: "cloudflare_zone",
    description: "Cloudflare DNS zone for domain management",
    defaultProperties: {
      zone: "example.com",
      plan: "free",
      paused: "false",
      jump_start: "true",
    },
  },
  {
    type: "cloudflare_dns_record",
    label: "Cloudflare DNS",
    icon: "📍",
    color: "#F38020",
    category: "external_dns",
    provider: "cloudflare",
    terraformType: "cloudflare_record",
    description: "Cloudflare DNS record entry",
    defaultProperties: {
      name: "www",
      type: "A",
      value: "",
      proxied: "true",
      ttl: "1",
    },
  },

  // ======================== STRIPE ================================
  {
    type: "stripe_webhook_endpoint",
    label: "Stripe Webhook",
    icon: "💳",
    color: "#635BFF",
    category: "payments",
    provider: "stripe",
    terraformType: "stripe_webhook_endpoint",
    description: "Stripe webhook for payment events",
    defaultProperties: {
      url: "https://api.example.com/webhooks/stripe",
      enabled_events: "checkout.session.completed,invoice.paid,customer.subscription.updated",
    },
  },

  // ======================== DATADOG ===============================
  {
    type: "datadog_monitor",
    label: "Datadog Monitor",
    icon: "🐶",
    color: "#632CA6",
    category: "external_monitoring",
    provider: "datadog",
    terraformType: "datadog_monitor",
    description: "Datadog monitoring alert",
    defaultProperties: {
      name: "High CPU Usage",
      type: "metric alert",
      query: "avg(last_5m):avg:system.cpu.user{*} > 80",
      message: "CPU usage is above 80%",
    },
  },
  {
    type: "datadog_dashboard",
    label: "Datadog Dashboard",
    icon: "📊",
    color: "#632CA6",
    category: "external_monitoring",
    provider: "datadog",
    terraformType: "datadog_dashboard",
    description: "Datadog visualization dashboard",
    defaultProperties: {
      title: "Infrastructure Overview",
      layout_type: "ordered",
      description: "Infrastructure monitoring dashboard",
      is_read_only: "false",
    },
  },

  // ======================== SENDGRID ==============================
  {
    type: "sendgrid_domain",
    label: "SendGrid Domain",
    icon: "📧",
    color: "#00B4AB",
    category: "email_service",
    provider: "sendgrid",
    terraformType: "sendgrid_domain_authentication",
    description: "SendGrid domain authentication for email",
    defaultProperties: {
      domain: "example.com",
      is_default: "true",
      automatic_security: "true",
    },
  },

  // ======================== VERCEL ================================
  {
    type: "vercel_project",
    label: "Vercel Project",
    icon: "▲",
    color: "#000000",
    category: "frontend_platform",
    provider: "vercel",
    terraformType: "vercel_project",
    description: "Vercel frontend deployment project",
    defaultProperties: {
      name: "my-frontend",
      framework: "nextjs",
      build_command: "npm run build",
      output_directory: ".next",
    },
  },

  // ======================== MONGODB ATLAS =========================
  {
    type: "mongodb_cluster",
    label: "MongoDB Atlas",
    icon: "🍃",
    color: "#00ED64",
    category: "external_database",
    provider: "mongodbatlas",
    terraformType: "mongodbatlas_cluster",
    description: "MongoDB Atlas managed database cluster",
    defaultProperties: {
      name: "production-cluster",
      cluster_type: "REPLICASET",
      provider_name: "AWS",
      region: "US_EAST_1",
      instance_size: "M10",
    },
  },

  // ======================== UPSTASH REDIS =========================
  {
    type: "upstash_redis",
    label: "Upstash Redis",
    icon: "🔴",
    color: "#00E9A3",
    category: "external_database",
    provider: "upstash",
    terraformType: "upstash_redis_database",
    description: "Upstash serverless Redis database",
    defaultProperties: {
      name: "my-cache",
      region: "us-east-1",
      tls: "true",
      eviction: "true",
    },
  },
]