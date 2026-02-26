import { useState } from "react"
import { type AwsComponentType } from "../../../types/aws"

interface AwsIconProps {
  type: AwsComponentType
  size?: number
}

// Map component type → SVG filename (without size suffix)
const ICON_FILES: Record<string, string> = {
  // Networking
  vpc:               "Arch_Amazon-Virtual-Private-Cloud",
  subnet:            "Arch_Amazon-Virtual-Private-Cloud",
  internet_gateway:  "Arch_Amazon-Virtual-Private-Cloud",
  nat_gateway:       "Arch_Amazon-Virtual-Private-Cloud",
  route_table:       "Arch_Amazon-Virtual-Private-Cloud",
  elastic_ip:        "Arch_Amazon-Virtual-Private-Cloud",
  vpc_peering:       "Arch_Amazon-Virtual-Private-Cloud",
  transit_gateway:   "Arch_AWS-Transit-Gateway",
  cloudfront:        "Arch_Amazon-CloudFront",
  route53:           "Arch_Amazon-Route-53",
  route53_record:    "Arch_Amazon-Route-53",

  // Compute
  ec2:               "Arch_Amazon-EC2",
  auto_scaling_group:"Arch_Amazon-EC2-Auto-Scaling",
  launch_template:   "Arch_Amazon-EC2",
  elastic_beanstalk: "Arch_AWS-Elastic-Beanstalk",
  lambda:            "Arch_AWS-Lambda",

  // Storage
  s3:                "Arch_Amazon-Simple-Storage-Service",
  efs:               "Arch_Amazon-Elastic-File-System",
  ebs:               "Arch_Amazon-Elastic-Block-Store",
  s3_glacier:        "Arch_Amazon-S3-Glacier",

  // Database
  rds:               "Arch_Amazon-RDS",
  dynamodb:          "Arch_Amazon-DynamoDB",
  elasticache:       "Arch_Amazon-ElastiCache",
  aurora:            "Arch_Amazon-Aurora",
  redshift:          "Arch_Amazon-Redshift",

  // Serverless
  api_gateway:       "Arch_Amazon-API-Gateway",
  step_functions:    "Arch_AWS-Step-Functions",
  eventbridge:       "Arch_Amazon-EventBridge",

  // Containers
  ecs:               "Arch_Amazon-Elastic-Container-Service",
  ecs_service:       "Arch_Amazon-Elastic-Container-Service",
  ecr:               "Arch_Amazon-Elastic-Container-Registry",
  eks:               "Arch_Amazon-Elastic-Kubernetes-Service",
  fargate:           "Arch_AWS-Fargate",

  // Security
  sg:                "Arch_AWS-Identity-and-Access-Management",
  iam_role:          "Arch_AWS-Identity-and-Access-Management",
  iam_policy:        "Arch_AWS-Identity-and-Access-Management",
  iam_user:          "Arch_AWS-Identity-and-Access-Management",
  kms:               "Arch_AWS-Key-Management-Service",
  waf:               "Arch_AWS-WAF",
  secrets_manager:   "Arch_AWS-Secrets-Manager",
  acm:               "Arch_AWS-Certificate-Manager",

  // Monitoring
  cloudwatch:        "Arch_Amazon-CloudWatch",
  cloudwatch_alarm:  "Arch_Amazon-CloudWatch",
  cloudtrail:        "Arch_AWS-CloudTrail",
  xray:              "Arch_AWS-X-Ray",
  sns_monitoring:    "Arch_Amazon-Simple-Notification-Service",

  // Messaging
  sqs:               "Arch_Amazon-Simple-Queue-Service",
  sns:               "Arch_Amazon-Simple-Notification-Service",
  kinesis:           "Arch_Amazon-Kinesis",
  ses:               "Arch_Amazon-Simple-Email-Service",

  // AI/ML
  sagemaker:         "Arch_Amazon-SageMaker",
  rekognition:       "Arch_Amazon-Rekognition",
  bedrock:           "Arch_Amazon-Bedrock",
}

// Fallback colors
const FALLBACK_COLORS: Record<string, { bg: string; label: string }> = {
  vpc:               { bg: "#8C4FFF", label: "VPC" },
  subnet:            { bg: "#8C4FFF", label: "SUB" },
  internet_gateway:  { bg: "#8C4FFF", label: "IGW" },
  nat_gateway:       { bg: "#8C4FFF", label: "NAT" },
  route_table:       { bg: "#8C4FFF", label: "RT" },
  elastic_ip:        { bg: "#8C4FFF", label: "EIP" },
  vpc_peering:       { bg: "#8C4FFF", label: "PCX" },
  transit_gateway:   { bg: "#8C4FFF", label: "TGW" },
  ec2:               { bg: "#ED7100", label: "EC2" },
  auto_scaling_group:{ bg: "#ED7100", label: "ASG" },
  launch_template:   { bg: "#ED7100", label: "LT" },
  elastic_beanstalk: { bg: "#ED7100", label: "EB" },
  s3:                { bg: "#3F8624", label: "S3" },
  efs:               { bg: "#3F8624", label: "EFS" },
  ebs:               { bg: "#3F8624", label: "EBS" },
  s3_glacier:        { bg: "#3F8624", label: "GLC" },
  rds:               { bg: "#2E73B8", label: "RDS" },
  dynamodb:          { bg: "#2E73B8", label: "DDB" },
  elasticache:       { bg: "#2E73B8", label: "EC" },
  aurora:            { bg: "#2E73B8", label: "AUR" },
  redshift:          { bg: "#2E73B8", label: "RS" },
  lambda:            { bg: "#ED7100", label: "λ" },
  api_gateway:       { bg: "#E7157B", label: "API" },
  step_functions:    { bg: "#E7157B", label: "SF" },
  eventbridge:       { bg: "#E7157B", label: "EB" },
  ecs:               { bg: "#ED7100", label: "ECS" },
  ecs_service:       { bg: "#ED7100", label: "SVC" },
  ecr:               { bg: "#ED7100", label: "ECR" },
  eks:               { bg: "#ED7100", label: "EKS" },
  fargate:           { bg: "#ED7100", label: "FG" },
  sg:                { bg: "#DD344C", label: "SG" },
  iam_role:          { bg: "#DD344C", label: "IAM" },
  iam_policy:        { bg: "#DD344C", label: "POL" },
  iam_user:          { bg: "#DD344C", label: "USR" },
  kms:               { bg: "#DD344C", label: "KMS" },
  waf:               { bg: "#DD344C", label: "WAF" },
  secrets_manager:   { bg: "#DD344C", label: "SM" },
  acm:               { bg: "#DD344C", label: "ACM" },
  cloudfront:        { bg: "#8C4FFF", label: "CF" },
  route53:           { bg: "#8C4FFF", label: "R53" },
  route53_record:    { bg: "#8C4FFF", label: "DNS" },
  cloudwatch:        { bg: "#E7157B", label: "CW" },
  cloudwatch_alarm:  { bg: "#E7157B", label: "ALM" },
  cloudtrail:        { bg: "#E7157B", label: "CT" },
  sns_monitoring:    { bg: "#E7157B", label: "SNS" },
  xray:              { bg: "#E7157B", label: "XR" },
  sqs:               { bg: "#E7157B", label: "SQS" },
  sns:               { bg: "#E7157B", label: "SNS" },
  kinesis:           { bg: "#8C4FFF", label: "KIN" },
  ses:               { bg: "#E7157B", label: "SES" },
  sagemaker:         { bg: "#A855F7", label: "SM" },
  rekognition:       { bg: "#A855F7", label: "REK" },
  bedrock:           { bg: "#A855F7", label: "BR" },
}

export default function AwsIcon({ type, size = 36 }: AwsIconProps) {
  const [imgError, setImgError] = useState(false)
  const fileName = ICON_FILES[type]
  const fallback = FALLBACK_COLORS[type]

  // Try SVG first
  if (fileName && !imgError) {
    return (
      <img
        src={`/aws-icons/svg/${fileName}_48.svg`}
        alt={type}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        style={{
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
    )
  }

  // Fallback colored box
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.12,
        backgroundColor: fallback?.bg || "#94A3B8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: (fallback?.label?.length || 0) <= 2 ? size * 0.4 : size * 0.26,
        fontWeight: 700,
        fontFamily: "'Inter', sans-serif",
        flexShrink: 0,
      }}
    >
      {fallback?.label || "?"}
    </div>
  )
}