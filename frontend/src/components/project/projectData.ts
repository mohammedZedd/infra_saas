// Mock data + types + helpers

export interface ProjectRun {
  id: string;
  command: string;
  status: string;
  duration: string;
  at: string;
  user: string;
  output: string;
  errorOutput: string | null;
  planSummary: { add: number; change: number; destroy: number } | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  cloud: string;
  components: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastRun: { status: string; command: string; duration: string; at: string } | null;
  variables: number;
  secrets: number;
  runs: ProjectRun[];
  terraformCode: string;
}

export type TabId = 'overview' | 'runs' | 'code' | 'variables' | 'state' | 'security' | 'git' | 'settings';

export const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'overview', label: 'Overview', emoji: '📋' },
  { id: 'runs', label: 'Runs', emoji: '🚀' },
  { id: 'code', label: 'Code', emoji: '💻' },
  { id: 'variables', label: 'Variables', emoji: '{ }' },
  { id: 'state', label: 'State', emoji: '🗂️' },
  { id: 'security', label: 'Security', emoji: '🛡️' },
  { id: 'git', label: 'Git', emoji: '🐙' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
];

export const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: '#10B981', bg: '#ECFDF5', label: '● Active' },
  idle: { color: '#6B7280', bg: '#F3F4F6', label: '○ Idle' },
  failed: { color: '#EF4444', bg: '#FEF2F2', label: '● Failed' },
  running: { color: '#3B82F6', bg: '#EFF6FF', label: '● Running' },
};

export const RUN_STATUS_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  success: { emoji: '✅', color: '#10B981', bg: '#ECFDF5' },
  failed: { emoji: '❌', color: '#EF4444', bg: '#FEF2F2' },
  running: { emoji: '🔄', color: '#3B82F6', bg: '#EFF6FF' },
  pending: { emoji: '⏳', color: '#F59E0B', bg: '#FFFBEB' },
};

// ── Syntax highlighting ──
export function highlightHCL(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(#.*)/g, '<span style="color:#6A9955">\$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#CE9178">\$1</span>')
    .replace(
      /\b(resource|variable|output|provider|terraform|data|module|locals)\b/g,
      '<span style="color:#C586C0">\$1</span>'
    )
    .replace(
      /\b(string|number|bool|list|map|object|set|any|true|false|null)\b/g,
      '<span style="color:#4EC9B0">\$1</span>'
    )
    .replace(
      /\b(required_providers|required_version|backend|ingress|egress|tags|root_block_device|default_cache_behavior|forwarded_values|cookies|restrictions|geo_restriction|viewer_certificate|index_document|error_document|attribute)\b/g,
      '<span style="color:#DCDCAA">\$1</span>'
    )
    .replace(/^(\s*)(\w+)(\s*=)/gm, '\$1<span style="color:#9CDCFE">\$2</span>\$3')
    .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8">\$1</span>');
}

export function colorizeOutput(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(.*Creation complete.*)/g, '<span style="color:#4EC9B0">\$1</span>')
    .replace(/(.*successfully initialized.*)/g, '<span style="color:#4EC9B0">\$1</span>')
    .replace(/(Apply complete!.*)/g, '<span style="color:#4EC9B0;font-weight:600">\$1</span>')
    .replace(/(No changes\..*)/g, '<span style="color:#4EC9B0">\$1</span>')
    .replace(/(.*Still creating.*)/g, '<span style="color:#CCA700">\$1</span>')
    .replace(/(.*Refreshing state.*)/g, '<span style="color:#6A9955">\$1</span>')
    .replace(/(.*will be updated in-place.*)/g, '<span style="color:#CCA700">\$1</span>')
    .replace(/(~ .*)/g, '<span style="color:#CCA700">\$1</span>')
    .replace(/(\+ .*)/g, '<span style="color:#4EC9B0">\$1</span>')
    .replace(/(- .*)/g, '<span style="color:#F44747">\$1</span>')
    .replace(/($$id=.*?$$)/g, '<span style="color:#569CD6">\$1</span>')
    .replace(/(Outputs:)/g, '<span style="color:#C586C0;font-weight:600">\$1</span>')
    .replace(/^(\w+)\s*=\s*(".*")/gm, '<span style="color:#9CDCFE">\$1</span> = <span style="color:#CE9178">\$2</span>')
    .replace(/(Terraform v[\d.]+)/g, '<span style="color:#569CD6">\$1</span>')
    .replace(/(Plan: .*)/g, '<span style="color:#C586C0;font-weight:600">\$1</span>');
}

export function colorizeError(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(Error:.*)/g, '<span style="color:#F44747;font-weight:600">\$1</span>')
    .replace(/(on .*\.tf line \d+.*)/g, '<span style="color:#569CD6">\$1</span>');
}

export function renderLineNumbers(text: string): string {
  const lines = text.split('\n');
  return lines.map((_, i) => i + 1).join('\n');
}

// ── Mock projects ──
export const MOCK_PROJECTS: Record<string, Project> = {
  '1': {
    id: '1',
    name: 'Production VPC',
    description: 'Main production infrastructure with EC2 and RDS',
    cloud: 'AWS',
    components: 8,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2 hours ago',
    lastRun: { status: 'success', command: 'apply', duration: '2m 34s', at: '2 hours ago' },
    variables: 4,
    secrets: 2,
    runs: [
      {
        id: 'run-1', command: 'apply', status: 'success', duration: '2m 34s', at: '2 hours ago', user: 'John Doe',
        output: `Terraform v1.6.4\nInitializing plugins and modules...\n\naws_vpc.main: Creating...\naws_vpc.main: Creation complete after 3s [id=vpc-0a1b2c3d4e5f6g7h8]\naws_subnet.public: Creating...\naws_subnet.public: Creation complete after 1s [id=subnet-0a1b2c3d]\naws_instance.web: Creating...\naws_instance.web: Still creating... [10s elapsed]\naws_instance.web: Creation complete after 32s [id=i-0a1b2c3d4e5f6g7h8]\naws_db_instance.postgres: Creating...\naws_db_instance.postgres: Still creating... [60s elapsed]\naws_db_instance.postgres: Creation complete after 2m1s [id=prod-db]\n\nApply complete! Resources: 5 added, 0 changed, 0 destroyed.\n\nOutputs:\n\nvpc_id = "vpc-0a1b2c3d4e5f6g7h8"\ninstance_public_ip = "54.123.45.67"\ndb_endpoint = "prod-db.abc123.us-east-1.rds.amazonaws.com:5432"`,
        errorOutput: null, planSummary: { add: 5, change: 0, destroy: 0 },
      },
      {
        id: 'run-2', command: 'plan', status: 'success', duration: '0m 45s', at: '5 hours ago', user: 'John Doe',
        output: `Terraform v1.6.4\nRefreshing state...\n\naws_vpc.main: Refreshing state... [id=vpc-0a1b2c3d4e5f6g7h8]\naws_instance.web: Refreshing state... [id=i-0a1b2c3d4e5f6g7h8]\n\nTerraform will perform the following actions:\n\n  # aws_instance.web will be updated in-place\n  ~ resource "aws_instance" "web" {\n      ~ instance_type = "t3.micro" -> "t3.small"\n    }\n\nPlan: 0 to add, 1 to change, 0 to destroy.`,
        errorOutput: null, planSummary: { add: 0, change: 1, destroy: 0 },
      },
      {
        id: 'run-3', command: 'apply', status: 'failed', duration: '1m 12s', at: '1 day ago', user: 'John Doe',
        output: `Terraform v1.6.4\nInitializing plugins and modules...\n\naws_vpc.main: Creating...\naws_vpc.main: Creation complete after 3s [id=vpc-temp123]\naws_instance.web: Creating...`,
        errorOutput: `Error: creating EC2 Instance: UnauthorizedOperation: You are not authorized to perform this operation.\n\n  on main.tf line 45, in resource "aws_instance" "web":\n  45: resource "aws_instance" "web" {`,
        planSummary: { add: 5, change: 0, destroy: 0 },
      },
      {
        id: 'run-4', command: 'init', status: 'success', duration: '0m 15s', at: '1 day ago', user: 'John Doe',
        output: `Initializing the backend...\n\nInitializing provider plugins...\n- Finding hashicorp/aws versions matching "~> 5.0"...\n- Installing hashicorp/aws v5.31.0...\n- Installed hashicorp/aws v5.31.0 (signed by HashiCorp)\n\nTerraform has been successfully initialized!`,
        errorOutput: null, planSummary: null,
      },
    ],
    terraformCode: `# --- Provider ---\nterraform {\n  required_version = ">= 1.6.0"\n  required_providers {\n    aws = {\n      source  = "hashicorp/aws"\n      version = "~> 5.0"\n    }\n  }\n}\n\nprovider "aws" {\n  region = var.aws_region\n}\n\n# --- Variables ---\nvariable "aws_region" {\n  type    = string\n  default = "us-east-1"\n}\n\nvariable "environment" {\n  type    = string\n  default = "production"\n}\n\nvariable "instance_type" {\n  type    = string\n  default = "t3.small"\n}\n\n# --- VPC ---\nresource "aws_vpc" "main" {\n  cidr_block           = "10.0.0.0/16"\n  enable_dns_hostnames = true\n  tags = {\n    Name = "\${var.environment}-vpc"\n  }\n}\n\nresource "aws_subnet" "public" {\n  vpc_id     = aws_vpc.main.id\n  cidr_block = "10.0.1.0/24"\n  tags = {\n    Name = "\${var.environment}-public"\n  }\n}\n\n# --- Security Group ---\nresource "aws_security_group" "web" {\n  name_prefix = "\${var.environment}-web-"\n  vpc_id      = aws_vpc.main.id\n  ingress {\n    from_port   = 80\n    to_port     = 80\n    protocol    = "tcp"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n  egress {\n    from_port   = 0\n    to_port     = 0\n    protocol    = "-1"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n}\n\n# --- EC2 ---\nresource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = var.instance_type\n  subnet_id     = aws_subnet.public.id\n  vpc_security_group_ids = [aws_security_group.web.id]\n  tags = {\n    Name = "\${var.environment}-web"\n  }\n}\n\n# --- RDS ---\nresource "aws_db_instance" "postgres" {\n  identifier     = "\${var.environment}-db"\n  engine         = "postgres"\n  instance_class = "db.t3.micro"\n  allocated_storage = 20\n  storage_encrypted = true\n  skip_final_snapshot = true\n}\n\n# --- Outputs ---\noutput "vpc_id" {\n  value = aws_vpc.main.id\n}\n\noutput "instance_ip" {\n  value = aws_instance.web.public_ip\n}`,
  },
  '2': {
    id: '2',
    name: 'Serverless API',
    description: 'Lambda + API Gateway + DynamoDB setup',
    cloud: 'AWS',
    components: 5,
    status: 'active',
    createdAt: '2024-02-10',
    updatedAt: '1 day ago',
    lastRun: { status: 'success', command: 'plan', duration: '0m 32s', at: '1 day ago' },
    variables: 2,
    secrets: 1,
    runs: [
      {
        id: 'run-5', command: 'plan', status: 'success', duration: '0m 32s', at: '1 day ago', user: 'John Doe',
        output: `Terraform v1.6.4\nRefreshing state...\n\nNo changes. Your infrastructure matches the configuration.`,
        errorOutput: null, planSummary: { add: 0, change: 0, destroy: 0 },
      },
    ],
    terraformCode: `# --- Serverless API ---\nresource "aws_dynamodb_table" "api_data" {\n  name         = "api-data"\n  billing_mode = "PAY_PER_REQUEST"\n  hash_key     = "id"\n  attribute {\n    name = "id"\n    type = "S"\n  }\n}\n\nresource "aws_lambda_function" "handler" {\n  filename      = "lambda.zip"\n  function_name = "api-handler"\n  handler       = "index.handler"\n  runtime       = "nodejs18.x"\n}\n\nresource "aws_apigatewayv2_api" "api" {\n  name          = "serverless-api"\n  protocol_type = "HTTP"\n}`,
  },
  '3': {
    id: '3',
    name: 'Static Website',
    description: 'S3 + CloudFront distribution',
    cloud: 'AWS',
    components: 3,
    status: 'idle',
    createdAt: '2024-03-01',
    updatedAt: '3 days ago',
    lastRun: null,
    variables: 1,
    secrets: 0,
    runs: [],
    terraformCode: `# --- Static Website ---\nresource "aws_s3_bucket" "website" {\n  bucket = "my-static-website"\n}\n\nresource "aws_cloudfront_distribution" "cdn" {\n  origin {\n    domain_name = aws_s3_bucket.website.bucket_regional_domain_name\n    origin_id   = "S3Origin"\n  }\n  enabled             = true\n  default_root_object = "index.html"\n}`,
  },
};