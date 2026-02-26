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
}

// ── Component config for the sidebar catalog ──
export interface AwsComponentConfig {
  type: AwsComponentType
  label: string
  icon: string
  color: string
  category: AwsCategory
  provider?: string
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
    defaultProperties: { name: "my-igw" },
  },
  {
    type: "nat_gateway",
    label: "NAT Gateway",
    icon: "🔄",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    defaultProperties: { name: "my-nat", connectivity_type: "public" },
  },
  {
    type: "route_table",
    label: "Route Table",
    icon: "🗺️",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    defaultProperties: { name: "my-rt" },
  },
  {
    type: "elastic_ip",
    label: "Elastic IP",
    icon: "📌",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    defaultProperties: { domain: "vpc" },
  },
  {
    type: "vpc_peering",
    label: "VPC Peering",
    icon: "🔗",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    defaultProperties: { name: "my-peering" },
  },
  {
    type: "transit_gateway",
    label: "Transit Gateway",
    icon: "🔀",
    color: "#3B82F6",
    category: "networking",
    provider: "aws",
    defaultProperties: { name: "my-tgw", amazon_side_asn: "64512" },
  },

  // ======================== COMPUTE ========================
  {
    type: "ec2",
    label: "EC2 Instance",
    icon: "🖥️",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    defaultProperties: {
      instance_type: "t3.micro",
      ami: "ami-0c55b159cbfafe1f0",
      key_name: "",
      monitoring: "false",
    },
  },
  {
    type: "auto_scaling_group",
    label: "Auto Scaling Group",
    icon: "📈",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    defaultProperties: { min_size: "1", max_size: "3", desired_capacity: "2" },
  },
  {
    type: "launch_template",
    label: "Launch Template",
    icon: "📋",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    defaultProperties: { instance_type: "t3.micro", ami: "ami-0c55b159cbfafe1f0" },
  },
  {
    type: "elastic_beanstalk",
    label: "Elastic Beanstalk",
    icon: "🌱",
    color: "#F59E0B",
    category: "compute",
    provider: "aws",
    defaultProperties: { platform: "Python 3.11", tier: "WebServer" },
  },

  // ======================== STORAGE ========================
  {
    type: "s3",
    label: "S3 Bucket",
    icon: "🪣",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    defaultProperties: { bucket_name: "my-bucket", versioning: "false", acl: "private", encryption: "AES256" },
  },
  {
    type: "efs",
    label: "EFS",
    icon: "📂",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    defaultProperties: { performance_mode: "generalPurpose", throughput_mode: "bursting", encrypted: "true" },
  },
  {
    type: "ebs",
    label: "EBS Volume",
    icon: "💽",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    defaultProperties: { volume_type: "gp3", size: "20", encrypted: "true" },
  },
  {
    type: "s3_glacier",
    label: "S3 Glacier",
    icon: "🧊",
    color: "#22C55E",
    category: "storage",
    provider: "aws",
    defaultProperties: { vault_name: "my-vault" },
  },

  // ======================== DATABASE ========================
  {
    type: "rds",
    label: "RDS",
    icon: "🗄️",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    defaultProperties: { engine: "postgresql", engine_version: "15.4", instance_class: "db.t3.micro", allocated_storage: "20", multi_az: "false" },
  },
  {
    type: "dynamodb",
    label: "DynamoDB",
    icon: "⚡",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    defaultProperties: { table_name: "my-table", billing_mode: "PAY_PER_REQUEST", hash_key: "id" },
  },
  {
    type: "elasticache",
    label: "ElastiCache",
    icon: "🔴",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    defaultProperties: { engine: "redis", node_type: "cache.t3.micro", num_cache_nodes: "1" },
  },
  {
    type: "aurora",
    label: "Aurora",
    icon: "🌟",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    defaultProperties: { engine: "aurora-postgresql", engine_version: "15.4", instance_class: "db.r6g.large" },
  },
  {
    type: "redshift",
    label: "Redshift",
    icon: "📊",
    color: "#8B5CF6",
    category: "database",
    provider: "aws",
    defaultProperties: { cluster_type: "single-node", node_type: "dc2.large" },
  },

  // ======================== SERVERLESS ========================
  {
    type: "lambda",
    label: "Lambda",
    icon: "⚡",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    defaultProperties: { runtime: "python3.11", memory: "128", timeout: "30", handler: "index.handler" },
  },
  {
    type: "api_gateway",
    label: "API Gateway",
    icon: "🚪",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    defaultProperties: { name: "my-api", protocol_type: "HTTP", stage: "prod" },
  },
  {
    type: "step_functions",
    label: "Step Functions",
    icon: "🔄",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    defaultProperties: { name: "my-state-machine", type: "STANDARD" },
  },
  {
    type: "eventbridge",
    label: "EventBridge",
    icon: "🎯",
    color: "#F97316",
    category: "serverless",
    provider: "aws",
    defaultProperties: { name: "my-event-bus" },
  },

  // ======================== CONTAINERS ========================
  {
    type: "ecs",
    label: "ECS Cluster",
    icon: "📦",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    defaultProperties: { name: "my-cluster", capacity_provider: "FARGATE" },
  },
  {
    type: "ecs_service",
    label: "ECS Service",
    icon: "🔧",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    defaultProperties: { name: "my-service", desired_count: "2", launch_type: "FARGATE" },
  },
  {
    type: "ecr",
    label: "ECR Registry",
    icon: "🐳",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    defaultProperties: { name: "my-repo", image_tag_mutability: "MUTABLE", scan_on_push: "true" },
  },
  {
    type: "eks",
    label: "EKS Cluster",
    icon: "☸️",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    defaultProperties: { name: "my-eks", version: "1.28" },
  },
  {
    type: "fargate",
    label: "Fargate",
    icon: "🚀",
    color: "#06B6D4",
    category: "containers",
    provider: "aws",
    defaultProperties: { cpu: "256", memory: "512" },
  },

  // ======================== SECURITY ========================
  {
    type: "sg",
    label: "Security Group",
    icon: "🛡️",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { name: "my-sg", description: "Security group", ingress_port: "443", protocol: "tcp", cidr: "0.0.0.0/0" },
  },
  {
    type: "iam_role",
    label: "IAM Role",
    icon: "🔑",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { name: "my-role", service: "ec2.amazonaws.com" },
  },
  {
    type: "iam_policy",
    label: "IAM Policy",
    icon: "📜",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { name: "my-policy", effect: "Allow", action: "s3:GetObject" },
  },
  {
    type: "iam_user",
    label: "IAM User",
    icon: "👤",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { name: "my-user", path: "/" },
  },
  {
    type: "kms",
    label: "KMS Key",
    icon: "🔐",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { description: "Encryption key", key_usage: "ENCRYPT_DECRYPT", deletion_window: "30" },
  },
  {
    type: "waf",
    label: "WAF",
    icon: "🧱",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { name: "my-waf", scope: "REGIONAL" },
  },
  {
    type: "secrets_manager",
    label: "Secrets Manager",
    icon: "🤫",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { name: "my-secret", recovery_window: "30" },
  },
  {
    type: "acm",
    label: "ACM Certificate",
    icon: "📃",
    color: "#EF4444",
    category: "security",
    provider: "aws",
    defaultProperties: { domain_name: "example.com", validation_method: "DNS" },
  },

  // ======================== CDN & DNS ========================
  {
    type: "cloudfront",
    label: "CloudFront",
    icon: "🌍",
    color: "#6366F1",
    category: "cdn_dns",
    provider: "aws",
    defaultProperties: { price_class: "PriceClass_100", default_ttl: "86400", http_version: "http2" },
  },
  {
    type: "route53",
    label: "Route 53 Zone",
    icon: "🗂️",
    color: "#6366F1",
    category: "cdn_dns",
    provider: "aws",
    defaultProperties: { domain_name: "example.com", private_zone: "false" },
  },
  {
    type: "route53_record",
    label: "DNS Record",
    icon: "📍",
    color: "#6366F1",
    category: "cdn_dns",
    provider: "aws",
    defaultProperties: { name: "www", type: "A", ttl: "300" },
  },

  // ======================== MONITORING ========================
  {
    type: "cloudwatch",
    label: "CloudWatch",
    icon: "📊",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    defaultProperties: { namespace: "AWS/EC2", period: "300" },
  },
  {
    type: "cloudwatch_alarm",
    label: "CW Alarm",
    icon: "🚨",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    defaultProperties: { metric_name: "CPUUtilization", threshold: "80", comparison: "GreaterThanThreshold", period: "300" },
  },
  {
    type: "cloudtrail",
    label: "CloudTrail",
    icon: "🔍",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    defaultProperties: { name: "my-trail", is_multi_region: "true" },
  },
  {
    type: "sns_monitoring",
    label: "SNS Alert",
    icon: "🔔",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    defaultProperties: { name: "alerts-topic", protocol: "email" },
  },
  {
    type: "xray",
    label: "X-Ray",
    icon: "🔬",
    color: "#EC4899",
    category: "monitoring",
    provider: "aws",
    defaultProperties: { sampling_rate: "0.05" },
  },

  // ======================== MESSAGING ========================
  {
    type: "sqs",
    label: "SQS Queue",
    icon: "📨",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    defaultProperties: { name: "my-queue", delay_seconds: "0", max_message_size: "262144", message_retention: "345600", fifo: "false" },
  },
  {
    type: "sns",
    label: "SNS Topic",
    icon: "📢",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    defaultProperties: { name: "my-topic", fifo: "false" },
  },
  {
    type: "kinesis",
    label: "Kinesis Stream",
    icon: "🌊",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    defaultProperties: { name: "my-stream", shard_count: "1", retention_period: "24" },
  },
  {
    type: "ses",
    label: "SES Email",
    icon: "✉️",
    color: "#14B8A6",
    category: "messaging",
    provider: "aws",
    defaultProperties: { domain: "example.com" },
  },

  // ======================== AI / ML ========================
  {
    type: "sagemaker",
    label: "SageMaker",
    icon: "🧠",
    color: "#A855F7",
    category: "ai_ml",
    provider: "aws",
    defaultProperties: { instance_type: "ml.t3.medium", name: "my-notebook" },
  },
  {
    type: "rekognition",
    label: "Rekognition",
    icon: "👁️",
    color: "#A855F7",
    category: "ai_ml",
    provider: "aws",
    defaultProperties: { collection_id: "my-collection" },
  },
  {
    type: "bedrock",
    label: "Bedrock",
    icon: "🤖",
    color: "#A855F7",
    category: "ai_ml",
    provider: "aws",
    defaultProperties: { model_id: "anthropic.claude-v2" },
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
    defaultProperties: {
      name: "google-oauth2",
      strategy: "google-oauth2",
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
    defaultProperties: {
      zone: "example.com",
      plan: "free",
    },
  },
  {
    type: "cloudflare_dns_record",
    label: "Cloudflare DNS",
    icon: "📍",
    color: "#F38020",
    category: "external_dns",
    provider: "cloudflare",
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
    defaultProperties: {
      title: "Infrastructure Overview",
      layout_type: "ordered",
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
    defaultProperties: {
      name: "my-cache",
      region: "us-east-1",
      tls: "true",
      eviction: "true",
    },
  },
]