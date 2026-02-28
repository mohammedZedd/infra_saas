/**
 * Container Detection and Hierarchy Utilities
 * Defines which AWS services are containers and manages parent-child relationships
 */


// Container service types that can hold other services
export const CONTAINER_TYPES: Set<string> = new Set([
  "vpc",
  "subnet",
  "auto_scaling_group",
  "elastic_beanstalk",
])

/**
 * Check if a service type is a container
 */
export const isContainer = (type: string): boolean => {
  return CONTAINER_TYPES.has(type)
}

/**
 * Define valid parent-child relationships
 * This ensures that services can only be placed in logical containers
 */
export const VALID_PARENT_TYPES: Record<string, string[]> = {
  // VPC can contain
  vpc: [],
  subnet: ["vpc"],
  internet_gateway: ["vpc"],
  nat_gateway: ["subnet"], // NAT Gateway is in a subnet
  route_table: ["vpc"],
  elastic_ip: ["vpc", "subnet"],
  vpc_peering: ["vpc"],
  transit_gateway: [],
  security_group: ["vpc"],
  network_acl: ["vpc"],

  // Compute
  ec2: ["subnet"],
  auto_scaling_group: ["vpc", "subnet"],
  launch_template: [],
  elastic_beanstalk: [],
  ecs_service: ["auto_scaling_group"],
  ecs_task: ["auto_scaling_group"],

  // Storage
  s3: [],
  efs: ["vpc", "subnet"],
  ebs: ["ec2"],
  s3_glacier: [],
  storage_gateway: ["vpc"],

  // Database
  rds: ["subnet", "vpc"],
  dynamodb: [],
  elasticache: ["subnet", "vpc"],
  redshift: ["subnet", "vpc"],
  neptune: ["subnet", "vpc"],
  documentdb: ["subnet", "vpc"],

  // Serverless
  lambda: ["vpc", "subnet"],
  api_gateway: [],
  eventbridge: [],
  appsync: [],
  step_functions: [],

  // Networking
  alb: ["vpc", "subnet"],
  nlb: ["vpc", "subnet"],
  elb: ["vpc"],
  cloudfront: [],
  route53: [],
  waf: [],

  // Security
  kms: [],
  secrets_manager: [],
  certificate_manager: [],
  identity_center: [],
  cognito: [],

  // Monitoring
  cloudwatch: [],
  cloudtrail: [],
  config: [],

  // Messaging
  sqs: [],
  sns: [],
  kinesis: [],
  msk: ["vpc", "subnet"],

  // Other
  other: [],
}

/**
 * Get the default parent type for a service type
 * This is used when auto-placing services into containers
 */
export const getDefaultParentType = (type: string): string | null => {
  const validParents = VALID_PARENT_TYPES[type] || []
  // Return the most specific parent type (prefer subnet over vpc)
  if (validParents.includes("subnet")) return "subnet"
  if (validParents.includes("vpc")) return "vpc"
  if (validParents.length > 0) return validParents[0]
  return null
}

/**
 * Check if a service can be placed inside a specific container
 */
export const canPlaceInContainer = (
  childType: string,
  parentType: string
): boolean => {
  const validParents = VALID_PARENT_TYPES[childType] || []
  return validParents.includes(parentType)
}

/**
 * Get all services that can be placed inside a container type
 */
export const getValidChildTypes = (parentType: string): string[] => {
  return Object.entries(VALID_PARENT_TYPES)
    .filter(([, parents]) => parents.includes(parentType))
    .map(([type]) => type)
}
