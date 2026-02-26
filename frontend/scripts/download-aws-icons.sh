#!/bin/bash

# Source (le zip dézippé)
SRC="$HOME/Downloads/Icon-package_01302026.31b40d126ed27079b708594940ad577a86150582/Architecture-Service-Icons_01302026"

# Target
SCRIPT_DIR="$(cd "$(dirname "\$0")" && pwd)"
TARGET="$SCRIPT_DIR/../public/aws-icons"
mkdir -p "$TARGET"

echo "📦 Source: $SRC"
echo "📁 Target: $TARGET"
echo ""

# On utilise les 48x48
SIZE="48"

# Networking
echo "🌐 Networking..."
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Virtual-Private-Cloud_$SIZE.png" "$TARGET/vpc.png" 2>/dev/null && echo "  ✅ vpc" || echo "  ❌ vpc"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Virtual-Private-Cloud_$SIZE.png" "$TARGET/subnet.png" 2>/dev/null && echo "  ✅ subnet" || echo "  ❌ subnet"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Virtual-Private-Cloud_$SIZE.png" "$TARGET/internet_gateway.png" 2>/dev/null && echo "  ✅ internet_gateway" || echo "  ❌ internet_gateway"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Virtual-Private-Cloud_$SIZE.png" "$TARGET/nat_gateway.png" 2>/dev/null && echo "  ✅ nat_gateway" || echo "  ❌ nat_gateway"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Virtual-Private-Cloud_$SIZE.png" "$TARGET/route_table.png" 2>/dev/null && echo "  ✅ route_table" || echo "  ❌ route_table"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Virtual-Private-Cloud_$SIZE.png" "$TARGET/elastic_ip.png" 2>/dev/null && echo "  ✅ elastic_ip" || echo "  ❌ elastic_ip"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Virtual-Private-Cloud_$SIZE.png" "$TARGET/vpc_peering.png" 2>/dev/null && echo "  ✅ vpc_peering" || echo "  ❌ vpc_peering"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_AWS-Transit-Gateway_$SIZE.png" "$TARGET/transit_gateway.png" 2>/dev/null && echo "  ✅ transit_gateway" || echo "  ❌ transit_gateway"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-CloudFront_$SIZE.png" "$TARGET/cloudfront.png" 2>/dev/null && echo "  ✅ cloudfront" || echo "  ❌ cloudfront"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Route-53_$SIZE.png" "$TARGET/route53.png" 2>/dev/null && echo "  ✅ route53" || echo "  ❌ route53"
cp "$SRC/Arch_Networking-Content-Delivery/$SIZE/Arch_Amazon-Route-53_$SIZE.png" "$TARGET/route53_record.png" 2>/dev/null && echo "  ✅ route53_record" || echo "  ❌ route53_record"

# Compute
echo "🖥️  Compute..."
cp "$SRC/Arch_Compute/$SIZE/Arch_Amazon-EC2_$SIZE.png" "$TARGET/ec2.png" 2>/dev/null && echo "  ✅ ec2" || echo "  ❌ ec2"
cp "$SRC/Arch_Compute/$SIZE/Arch_Amazon-EC2_$SIZE.png" "$TARGET/launch_template.png" 2>/dev/null && echo "  ✅ launch_template" || echo "  ❌ launch_template"
cp "$SRC/Arch_Compute/$SIZE/Arch_Amazon-EC2-Auto-Scaling_$SIZE.png" "$TARGET/auto_scaling_group.png" 2>/dev/null && echo "  ✅ auto_scaling_group" || echo "  ❌ auto_scaling_group"
cp "$SRC/Arch_Compute/$SIZE/Arch_AWS-Elastic-Beanstalk_$SIZE.png" "$TARGET/elastic_beanstalk.png" 2>/dev/null && echo "  ✅ elastic_beanstalk" || echo "  ❌ elastic_beanstalk"
cp "$SRC/Arch_Compute/$SIZE/Arch_AWS-Lambda_$SIZE.png" "$TARGET/lambda.png" 2>/dev/null && echo "  ✅ lambda" || echo "  ❌ lambda"

# Storage
echo "💾 Storage..."
cp "$SRC/Arch_Storage/$SIZE/Arch_Amazon-Simple-Storage-Service_$SIZE.png" "$TARGET/s3.png" 2>/dev/null && echo "  ✅ s3" || echo "  ❌ s3"
cp "$SRC/Arch_Storage/$SIZE/Arch_Amazon-Elastic-File-System_$SIZE.png" "$TARGET/efs.png" 2>/dev/null && echo "  ✅ efs" || echo "  ❌ efs"
cp "$SRC/Arch_Storage/$SIZE/Arch_Amazon-Elastic-Block-Store_$SIZE.png" "$TARGET/ebs.png" 2>/dev/null && echo "  ✅ ebs" || echo "  ❌ ebs"
cp "$SRC/Arch_Storage/$SIZE/Arch_Amazon-S3-Glacier_$SIZE.png" "$TARGET/s3_glacier.png" 2>/dev/null && echo "  ✅ s3_glacier" || echo "  ❌ s3_glacier"

# Database
echo "🗄️  Database..."
cp "$SRC/Arch_Databases/$SIZE/Arch_Amazon-RDS_$SIZE.png" "$TARGET/rds.png" 2>/dev/null && echo "  ✅ rds" || echo "  ❌ rds"
cp "$SRC/Arch_Databases/$SIZE/Arch_Amazon-DynamoDB_$SIZE.png" "$TARGET/dynamodb.png" 2>/dev/null && echo "  ✅ dynamodb" || echo "  ❌ dynamodb"
cp "$SRC/Arch_Databases/$SIZE/Arch_Amazon-ElastiCache_$SIZE.png" "$TARGET/elasticache.png" 2>/dev/null && echo "  ✅ elasticache" || echo "  ❌ elasticache"
cp "$SRC/Arch_Databases/$SIZE/Arch_Amazon-Aurora_$SIZE.png" "$TARGET/aurora.png" 2>/dev/null && echo "  ✅ aurora" || echo "  ❌ aurora"
cp "$SRC/Arch_Databases/$SIZE/Arch_Amazon-Redshift_$SIZE.png" "$TARGET/redshift.png" 2>/dev/null && echo "  ✅ redshift" || echo "  ❌ redshift"

# Serverless / Integration
echo "⚡ Serverless..."
cp "$SRC/Arch_Application-Integration/$SIZE/Arch_Amazon-API-Gateway_$SIZE.png" "$TARGET/api_gateway.png" 2>/dev/null && echo "  ✅ api_gateway" || echo "  ❌ api_gateway"
cp "$SRC/Arch_Application-Integration/$SIZE/Arch_AWS-Step-Functions_$SIZE.png" "$TARGET/step_functions.png" 2>/dev/null && echo "  ✅ step_functions" || echo "  ❌ step_functions"
cp "$SRC/Arch_Application-Integration/$SIZE/Arch_Amazon-EventBridge_$SIZE.png" "$TARGET/eventbridge.png" 2>/dev/null && echo "  ✅ eventbridge" || echo "  ❌ eventbridge"

# Containers
echo "📦 Containers..."
cp "$SRC/Arch_Containers/$SIZE/Arch_Amazon-Elastic-Container-Service_$SIZE.png" "$TARGET/ecs.png" 2>/dev/null && echo "  ✅ ecs" || echo "  ❌ ecs"
cp "$SRC/Arch_Containers/$SIZE/Arch_Amazon-Elastic-Container-Service_$SIZE.png" "$TARGET/ecs_service.png" 2>/dev/null && echo "  ✅ ecs_service" || echo "  ❌ ecs_service"
cp "$SRC/Arch_Containers/$SIZE/Arch_Amazon-Elastic-Container-Registry_$SIZE.png" "$TARGET/ecr.png" 2>/dev/null && echo "  ✅ ecr" || echo "  ❌ ecr"
cp "$SRC/Arch_Containers/$SIZE/Arch_Amazon-Elastic-Kubernetes-Service_$SIZE.png" "$TARGET/eks.png" 2>/dev/null && echo "  ✅ eks" || echo "  ❌ eks"
cp "$SRC/Arch_Containers/$SIZE/Arch_AWS-Fargate_$SIZE.png" "$TARGET/fargate.png" 2>/dev/null && echo "  ✅ fargate" || echo "  ❌ fargate"

# Security
echo "🛡️  Security..."
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-Identity-and-Access-Management_$SIZE.png" "$TARGET/iam_role.png" 2>/dev/null && echo "  ✅ iam_role" || echo "  ❌ iam_role"
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-Identity-and-Access-Management_$SIZE.png" "$TARGET/iam_policy.png" 2>/dev/null && echo "  ✅ iam_policy" || echo "  ❌ iam_policy"
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-Identity-and-Access-Management_$SIZE.png" "$TARGET/iam_user.png" 2>/dev/null && echo "  ✅ iam_user" || echo "  ❌ iam_user"
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-Identity-and-Access-Management_$SIZE.png" "$TARGET/sg.png" 2>/dev/null && echo "  ✅ sg" || echo "  ❌ sg"
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-Key-Management-Service_$SIZE.png" "$TARGET/kms.png" 2>/dev/null && echo "  ✅ kms" || echo "  ❌ kms"
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-WAF_$SIZE.png" "$TARGET/waf.png" 2>/dev/null && echo "  ✅ waf" || echo "  ❌ waf"
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-Secrets-Manager_$SIZE.png" "$TARGET/secrets_manager.png" 2>/dev/null && echo "  ✅ secrets_manager" || echo "  ❌ secrets_manager"
cp "$SRC/Arch_Security-Identity-Compliance/$SIZE/Arch_AWS-Certificate-Manager_$SIZE.png" "$TARGET/acm.png" 2>/dev/null && echo "  ✅ acm" || echo "  ❌ acm"

# Monitoring
echo "📊 Monitoring..."
cp "$SRC/Arch_Management-Tools/$SIZE/Arch_Amazon-CloudWatch_$SIZE.png" "$TARGET/cloudwatch.png" 2>/dev/null && echo "  ✅ cloudwatch" || echo "  ❌ cloudwatch"
cp "$SRC/Arch_Management-Tools/$SIZE/Arch_Amazon-CloudWatch_$SIZE.png" "$TARGET/cloudwatch_alarm.png" 2>/dev/null && echo "  ✅ cloudwatch_alarm" || echo "  ❌ cloudwatch_alarm"
cp "$SRC/Arch_Management-Tools/$SIZE/Arch_AWS-CloudTrail_$SIZE.png" "$TARGET/cloudtrail.png" 2>/dev/null && echo "  ✅ cloudtrail" || echo "  ❌ cloudtrail"
cp "$SRC/Arch_Management-Tools/$SIZE/Arch_AWS-X-Ray_$SIZE.png" "$TARGET/xray.png" 2>/dev/null && echo "  ✅ xray" || echo "  ❌ xray"

# Messaging
echo "📨 Messaging..."
cp "$SRC/Arch_Application-Integration/$SIZE/Arch_Amazon-Simple-Queue-Service_$SIZE.png" "$TARGET/sqs.png" 2>/dev/null && echo "  ✅ sqs" || echo "  ❌ sqs"
cp "$SRC/Arch_Application-Integration/$SIZE/Arch_Amazon-Simple-Notification-Service_$SIZE.png" "$TARGET/sns.png" 2>/dev/null && echo "  ✅ sns" || echo "  ❌ sns"
cp "$SRC/Arch_Application-Integration/$SIZE/Arch_Amazon-Simple-Notification-Service_$SIZE.png" "$TARGET/sns_monitoring.png" 2>/dev/null && echo "  ✅ sns_monitoring" || echo "  ❌ sns_monitoring"
cp "$SRC/Arch_Analytics/$SIZE/Arch_Amazon-Kinesis_$SIZE.png" "$TARGET/kinesis.png" 2>/dev/null && echo "  ✅ kinesis" || echo "  ❌ kinesis"
cp "$SRC/Arch_Business-Applications/$SIZE/Arch_Amazon-Simple-Email-Service_$SIZE.png" "$TARGET/ses.png" 2>/dev/null && echo "  ✅ ses" || echo "  ❌ ses"

# AI/ML
echo "🧠 AI/ML..."
cp "$SRC/Arch_Artificial-Intelligence/$SIZE/Arch_Amazon-SageMaker_$SIZE.png" "$TARGET/sagemaker.png" 2>/dev/null && echo "  ✅ sagemaker" || echo "  ❌ sagemaker"
cp "$SRC/Arch_Artificial-Intelligence/$SIZE/Arch_Amazon-Rekognition_$SIZE.png" "$TARGET/rekognition.png" 2>/dev/null && echo "  ✅ rekognition" || echo "  ❌ rekognition"
cp "$SRC/Arch_Artificial-Intelligence/$SIZE/Arch_Amazon-Bedrock_$SIZE.png" "$TARGET/bedrock.png" 2>/dev/null && echo "  ✅ bedrock" || echo "  ❌ bedrock"

echo ""
TOTAL=$(ls "$TARGET"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "✅ Done! $TOTAL icons in $TARGET"