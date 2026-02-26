import { type AwsComponentType } from "./aws"

interface ConnectionRule {
  from: AwsComponentType
  to: AwsComponentType[]
  reason?: string
}

// Define ALLOWED connections
const ALLOWED_CONNECTIONS: ConnectionRule[] = [
  // Networking
  {
    from: "vpc",
    to: ["subnet", "internet_gateway", "nat_gateway", "transit_gateway", "vpc_peering", "sg", "route_table"],
  },
  {
    from: "subnet",
    to: ["ec2", "rds", "elasticache", "aurora", "ecs", "eks", "lambda", "nat_gateway", "route_table", "efs", "fargate", "ecs_service"],
  },
  {
    from: "internet_gateway",
    to: ["vpc", "route_table"],
  },
  {
    from: "nat_gateway",
    to: ["subnet", "elastic_ip", "route_table"],
  },
  {
    from: "route_table",
    to: ["subnet", "internet_gateway", "nat_gateway", "vpc_peering", "transit_gateway"],
  },
  {
    from: "elastic_ip",
    to: ["ec2", "nat_gateway"],
  },

  // Compute
  {
    from: "ec2",
    to: ["sg", "iam_role", "ebs", "efs", "s3", "rds", "dynamodb", "elasticache", "sqs", "sns", "cloudwatch", "subnet"],
  },
  {
    from: "auto_scaling_group",
    to: ["launch_template", "subnet", "sg", "ec2"],
  },
  {
    from: "launch_template",
    to: ["sg", "iam_role", "subnet"],
  },

  // Storage
  {
    from: "s3",
    to: ["cloudfront", "lambda", "sns", "sqs", "kms", "s3_glacier"],
  },
  {
    from: "efs",
    to: ["ec2", "ecs", "fargate", "lambda", "sg"],
  },
  {
    from: "ebs",
    to: ["ec2", "kms"],
  },

  // Database
  {
    from: "rds",
    to: ["subnet", "sg", "kms", "cloudwatch", "iam_role"],
  },
  {
    from: "dynamodb",
    to: ["lambda", "iam_role", "kms", "cloudwatch"],
  },
  {
    from: "elasticache",
    to: ["subnet", "sg"],
  },
  {
    from: "aurora",
    to: ["subnet", "sg", "kms", "cloudwatch", "iam_role"],
  },
  {
    from: "redshift",
    to: ["subnet", "sg", "kms", "iam_role", "s3"],
  },

  // Serverless
  {
    from: "lambda",
    to: ["iam_role", "sg", "subnet", "s3", "dynamodb", "rds", "sqs", "sns", "eventbridge", "kinesis", "efs", "kms", "secrets_manager", "api_gateway", "step_functions", "cloudwatch"],
  },
  {
    from: "api_gateway",
    to: ["lambda", "ec2", "ecs_service", "iam_role", "acm", "waf", "cloudwatch"],
  },
  {
    from: "step_functions",
    to: ["lambda", "ecs", "sns", "sqs", "dynamodb", "iam_role", "cloudwatch"],
  },
  {
    from: "eventbridge",
    to: ["lambda", "sqs", "sns", "step_functions", "ecs", "api_gateway", "kinesis", "cloudwatch"],
  },

  // Containers
  {
    from: "ecs",
    to: ["ecs_service", "fargate", "ecr", "iam_role", "cloudwatch"],
  },
  {
    from: "ecs_service",
    to: ["sg", "subnet", "ecr", "iam_role", "cloudwatch", "s3", "efs"],
  },
  {
    from: "ecr",
    to: ["ecs", "ecs_service", "eks", "lambda"],
  },
  {
    from: "eks",
    to: ["subnet", "sg", "iam_role", "ecr", "cloudwatch", "ebs", "efs"],
  },
  {
    from: "fargate",
    to: ["ecs_service", "sg", "subnet", "iam_role", "cloudwatch"],
  },

  // Security
  {
    from: "sg",
    to: ["ec2", "rds", "elasticache", "aurora", "ecs_service", "eks", "lambda", "efs", "redshift"],
  },
  {
    from: "iam_role",
    to: ["iam_policy", "ec2", "lambda", "ecs", "ecs_service", "eks", "rds", "s3"],
  },
  {
    from: "iam_policy",
    to: ["iam_role", "iam_user"],
  },
  {
    from: "kms",
    to: ["s3", "ebs", "rds", "aurora", "dynamodb", "sqs", "sns", "secrets_manager", "kinesis", "redshift"],
  },
  {
    from: "waf",
    to: ["cloudfront", "api_gateway"],
  },
  {
    from: "secrets_manager",
    to: ["lambda", "ecs_service", "ec2", "rds"],
  },
  {
    from: "acm",
    to: ["cloudfront", "api_gateway"],
  },

  // CDN & DNS
  {
    from: "cloudfront",
    to: ["s3", "ec2", "api_gateway", "acm", "waf", "route53_record"],
  },
  {
    from: "route53",
    to: ["route53_record"],
  },
  {
    from: "route53_record",
    to: ["cloudfront", "ec2", "elastic_ip", "s3"],
  },

  // Monitoring
  {
    from: "cloudwatch",
    to: ["cloudwatch_alarm", "sns_monitoring", "lambda"],
  },
  {
    from: "cloudwatch_alarm",
    to: ["sns", "sns_monitoring", "lambda"],
  },
  {
    from: "cloudtrail",
    to: ["s3", "cloudwatch", "sns"],
  },

  // Messaging
  {
    from: "sqs",
    to: ["lambda", "kms", "cloudwatch"],
  },
  {
    from: "sns",
    to: ["sqs", "lambda", "ses", "cloudwatch"],
  },
  {
    from: "kinesis",
    to: ["lambda", "s3", "redshift", "kms", "cloudwatch"],
  },
  {
    from: "ses",
    to: ["sns", "s3", "lambda"],
  },

  // AI/ML
  {
    from: "sagemaker",
    to: ["s3", "iam_role", "subnet", "sg", "kms", "ecr"],
  },
  {
    from: "bedrock",
    to: ["iam_role", "lambda", "s3", "kms"],
  },
  {
    from: "rekognition",
    to: ["s3", "iam_role", "lambda", "sns"],
  },
]

// Specific error messages for common mistakes
const CONNECTION_ERRORS: Record<string, string> = {
  "s3->ec2": "S3 cannot directly connect to EC2. Use IAM Role to grant EC2 access to S3.",
  "ec2->ec2": "Use a Load Balancer or Security Group to connect EC2 instances.",
  "rds->rds": "Use Aurora with read replicas for multi-database setups.",
  "lambda->ec2": "Lambda can connect to EC2 via VPC configuration. Place Lambda in a Subnet first.",
  "cloudfront->rds": "CloudFront cannot connect to RDS directly. Use API Gateway + Lambda as backend.",
  "s3->rds": "S3 cannot connect to RDS directly. Use Lambda to process S3 data into RDS.",
  "dynamodb->rds": "DynamoDB and RDS cannot connect directly. Use Lambda as middleware.",
  "sqs->rds": "SQS cannot connect to RDS directly. Use Lambda to consume SQS messages and write to RDS.",
  "cloudfront->lambda": "Use API Gateway between CloudFront and Lambda.",
  "ec2->lambda": "EC2 typically invokes Lambda via SDK. Use EventBridge or SNS for event-driven patterns.",
  "rds->s3": "RDS cannot write to S3 directly. Use Lambda or Data Pipeline for ETL.",
  "sg->sg": "Security Groups reference each other via ingress/egress rules, not direct connections.",
  "iam_role->iam_role": "IAM Roles don't connect to each other. Attach policies instead.",
  "vpc->ec2": "EC2 instances must be placed in a Subnet, not directly in a VPC.",
  "vpc->rds": "RDS instances must be placed in a Subnet Group (multiple Subnets).",
  "vpc->lambda": "Lambda connects to VPC via Subnet and Security Group configuration.",
}

export interface ConnectionValidation {
  valid: boolean
  message: string
}

export function validateConnection(
  sourceType: AwsComponentType,
  targetType: AwsComponentType
): ConnectionValidation {
  // Same type check
  if (sourceType === targetType) {
    const errorKey = `${sourceType}->${targetType}`
    return {
      valid: false,
      message:
        CONNECTION_ERRORS[errorKey] ||
        `Cannot connect ${sourceType} to itself. Consider using a different architecture pattern.`,
    }
  }

  // Check allowed connections
  const rule = ALLOWED_CONNECTIONS.find((r) => r.from === sourceType)

  if (rule && rule.to.includes(targetType)) {
    return { valid: true, message: "" }
  }

  // Check reverse direction
  const reverseRule = ALLOWED_CONNECTIONS.find((r) => r.from === targetType)
  if (reverseRule && reverseRule.to.includes(sourceType)) {
    return { valid: true, message: "" }
  }

  // Not allowed — get specific error or generic
  const errorKey = `${sourceType}->${targetType}`
  const reverseErrorKey = `${targetType}->${sourceType}`

  const specificError =
    CONNECTION_ERRORS[errorKey] || CONNECTION_ERRORS[reverseErrorKey]

  return {
    valid: false,
    message:
      specificError ||
      `${formatType(sourceType)} cannot connect directly to ${formatType(targetType)}. Check AWS documentation for supported integrations.`,
  }
}

function formatType(type: AwsComponentType): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}