// src/components/editor/modals/ec2/types/ec2-config.ts

// ============================================================
// ROOT BLOCK DEVICE
// ============================================================
export interface RootBlockDevice {
  volumeType: 'gp2' | 'gp3' | 'io1' | 'io2' | 'standard' | 'sc1' | 'st1';
  volumeSize: number; // GiB
  iops?: number; // io1, io2, gp3
  throughput?: number; // gp3 only, MiB/s
  encrypted: boolean;
  kmsKeyId?: string;
  deleteOnTermination: boolean;
  tags: Record<string, string>;
}

// ============================================================
// EBS BLOCK DEVICE
// ============================================================
export interface EbsBlockDevice {
  id: string; // internal UI id
  deviceName: string; // e.g. /dev/sdb, /dev/xvdb
  volumeType: 'gp2' | 'gp3' | 'io1' | 'io2' | 'standard' | 'sc1' | 'st1';
  volumeSize: number;
  iops?: number;
  throughput?: number;
  encrypted: boolean;
  kmsKeyId?: string;
  snapshotId?: string;
  deleteOnTermination: boolean;
  tags: Record<string, string>;
}

// ============================================================
// EPHEMERAL BLOCK DEVICE
// ============================================================
export interface EphemeralBlockDevice {
  id: string;
  deviceName: string;
  virtualName?: string; // e.g. ephemeral0
  noDevice?: boolean;
}

// ============================================================
// NETWORK INTERFACE (legacy)
// ============================================================
export interface NetworkInterfaceAttachment {
  networkInterfaceId: string;
  deviceIndex: number;
  networkCardIndex?: number;
  deleteOnTermination: boolean;
}

// ============================================================
// PRIMARY NETWORK INTERFACE
// ============================================================
export interface PrimaryNetworkInterface {
  networkInterfaceId: string;
}

// ============================================================
// SECONDARY NETWORK INTERFACE
// ============================================================
export interface SecondaryNetworkInterface {
  id: string;
  secondarySubnetId: string;
  networkCardIndex: number;
  deviceIndex?: number;
  interfaceType?: 'secondary';
  deleteOnTermination: boolean;
  privateIpAddressCount?: number;
  privateIpAddresses?: string[];
}

// ============================================================
// SECURITY GROUP RULE (for inline display)
// ============================================================
export interface SecurityGroupRuleConfig {
  id: string;
  type: 'ingress' | 'egress';
  protocol: 'tcp' | 'udp' | 'icmp' | '-1' | string;
  fromPort: number;
  toPort: number;
  cidrBlocks: string[];
  ipv6CidrBlocks?: string[];
  securityGroupId?: string;
  description?: string;
}

// ============================================================
// CPU OPTIONS
// ============================================================
export interface CpuOptions {
  coreCount?: number;
  threadsPerCore?: number; // 1 = disable hyperthreading, 2 = default
  amdSevSnp?: 'enabled' | 'disabled';
  nestedVirtualization?: 'enabled' | 'disabled';
}

// ============================================================
// CREDIT SPECIFICATION
// ============================================================
export interface CreditSpecification {
  cpuCredits: 'standard' | 'unlimited';
}

// ============================================================
// CAPACITY RESERVATION
// ============================================================
export interface CapacityReservationTarget {
  capacityReservationId?: string;
  capacityReservationResourceGroupArn?: string;
}

export interface CapacityReservationSpecification {
  capacityReservationPreference: 'open' | 'none';
  capacityReservationTarget?: CapacityReservationTarget;
}

// ============================================================
// METADATA OPTIONS
// ============================================================
export interface MetadataOptions {
  httpEndpoint: 'enabled' | 'disabled';
  httpTokens: 'optional' | 'required'; // IMDSv2
  httpPutResponseHopLimit: number; // 1–64
  httpProtocolIpv6: 'enabled' | 'disabled';
  instanceMetadataTags: 'enabled' | 'disabled';
}

// ============================================================
// MARKET / SPOT OPTIONS
// ============================================================
export interface SpotOptions {
  instanceInterruptionBehavior: 'hibernate' | 'stop' | 'terminate';
  maxPrice?: string;
  spotInstanceType: 'one-time' | 'persistent';
  validUntil?: string; // UTC YYYY-MM-DDTHH:MM:SSZ
}

export interface InstanceMarketOptions {
  marketType: 'spot' | 'capacity-block';
  spotOptions?: SpotOptions;
}

// ============================================================
// PRIVATE DNS NAME OPTIONS
// ============================================================
export interface PrivateDnsNameOptions {
  enableResourceNameDnsARecord: boolean;
  enableResourceNameDnsAaaaRecord: boolean;
  hostnameType: 'ip-name' | 'resource-name';
}

// ============================================================
// MAINTENANCE OPTIONS
// ============================================================
export interface MaintenanceOptions {
  autoRecovery: 'default' | 'disabled';
}

// ============================================================
// ENCLAVE OPTIONS
// ============================================================
export interface EnclaveOptions {
  enabled: boolean;
}

// ============================================================
// LAUNCH TEMPLATE
// ============================================================
export interface LaunchTemplateSpec {
  id?: string;
  name?: string;
  version?: string; // $Latest, $Default, or specific version
}

// ============================================================
// AMI DATA
// ============================================================
export interface AmiOption {
  id: string;
  name: string;
  description: string;
  platform: 'linux' | 'windows' | 'macos';
  architecture: 'x86_64' | 'arm64';
  owner: string;
  ownerAlias: string;
  rootDeviceType: 'ebs' | 'instance-store';
  virtualizationType: 'hvm' | 'paravirtual';
  icon?: string;
}

// ============================================================
// INSTANCE TYPE DATA
// ============================================================
export interface InstanceTypeOption {
  name: string;
  family: string;
  vCPUs: number;
  memory: number; // GiB
  storage: string; // e.g. "EBS only", "1 x 475 NVMe SSD"
  network: string; // e.g. "Up to 25 Gbps"
  pricePerHour: number; // USD
  currentGen: boolean;
  architecture: ('x86_64' | 'arm64')[];
  burstable: boolean;
}

// ============================================================
// FULL EC2 CONFIG — maps to aws_instance resource
// ============================================================
export interface EC2FullConfig {
  // === STEP 1: Name & Tags ===
  name: string;
  numberOfInstances: number;
  tags: Record<string, string>;
  volumeTags: Record<string, string>;

  // === STEP 2: AMI ===
  ami: string;
  amiData?: AmiOption; // UI display only

  // === STEP 3: Instance Type ===
  instanceType: string;
  instanceTypeData?: InstanceTypeOption; // UI display only

  // === STEP 4: Key Pair ===
  keyName: string;

  // === STEP 5: Network ===
  // VPC / Subnet
  subnetId: string;
  availabilityZone: string;
  vpcId: string; // UI reference only (not a direct tf arg)
  
  // Public IP
  associatePublicIpAddress: boolean | null; // null = use subnet default
  
  // Security Groups
  vpcSecurityGroupIds: string[];
  securityGroups: string[]; // EC2-Classic only
  
  // Private IP
  privateIp: string;
  secondaryPrivateIps: string[];
  
  // IPv6
  ipv6AddressCount: number;
  ipv6Addresses: string[];
  enablePrimaryIpv6: boolean;
  
  // DNS
  privateDnsNameOptions: PrivateDnsNameOptions;
  
  // ENI
  primaryNetworkInterface?: PrimaryNetworkInterface;
  secondaryNetworkInterfaces: SecondaryNetworkInterface[];
  
  // Source/Dest Check
  sourceDestCheck: boolean;

  // === STEP 6: Storage ===
  rootBlockDevice: RootBlockDevice;
  ebsBlockDevices: EbsBlockDevice[];
  ephemeralBlockDevices: EphemeralBlockDevice[];
  ebsOptimized: boolean;

  // === STEP 7: Advanced ===
  // IAM
  iamInstanceProfile: string;
  
  // Monitoring
  monitoring: boolean; // detailed monitoring
  
  // User Data
  userData: string;
  userDataBase64: string;
  userDataReplaceOnChange: boolean;
  
  // CPU Options
  cpuOptions?: CpuOptions;
  
  // Credit Specification (T-series)
  creditSpecification?: CreditSpecification;
  
  // Market / Spot
  instanceMarketOptions?: InstanceMarketOptions;
  
  // Capacity Reservation
  capacityReservationSpecification?: CapacityReservationSpecification;
  
  // Metadata
  metadataOptions: MetadataOptions;
  
  // Placement
  placementGroup: string;
  placementPartitionNumber?: number;
  
  // Tenancy
  tenancy: 'default' | 'dedicated' | 'host';
  hostId: string;
  hostResourceGroupArn: string;
  
  // Enclave
  enclaveOptions: EnclaveOptions;
  
  // Maintenance
  maintenanceOptions: MaintenanceOptions;
  
  // Shutdown / Protection
  instanceInitiatedShutdownBehavior: 'stop' | 'terminate';
  disableApiTermination: boolean;
  disableApiStop: boolean;
  
  // Hibernation
  hibernation: boolean;
  
  // Launch Template (optional override)
  launchTemplate?: LaunchTemplateSpec;

  // Force destroy
  forceDestroy: boolean;
  
  // Password data (Windows)
  getPasswordData: boolean;

  // Region override
  region?: string;
}

// ============================================================
// DEFAULT CONFIG
// ============================================================
export const defaultEC2Config: EC2FullConfig = {
  name: '',
  numberOfInstances: 1,
  tags: {},
  volumeTags: {},

  ami: '',
  instanceType: 't3.micro',

  keyName: '',

  subnetId: '',
  availabilityZone: '',
  vpcId: '',
  associatePublicIpAddress: null,
  vpcSecurityGroupIds: [],
  securityGroups: [],
  privateIp: '',
  secondaryPrivateIps: [],
  ipv6AddressCount: 0,
  ipv6Addresses: [],
  enablePrimaryIpv6: false,
  privateDnsNameOptions: {
    enableResourceNameDnsARecord: false,
    enableResourceNameDnsAaaaRecord: false,
    hostnameType: 'ip-name',
  },
  secondaryNetworkInterfaces: [],
  sourceDestCheck: true,

  rootBlockDevice: {
    volumeType: 'gp3',
    volumeSize: 8,
    encrypted: false,
    deleteOnTermination: true,
    tags: {},
  },
  ebsBlockDevices: [],
  ephemeralBlockDevices: [],
  ebsOptimized: false,

  iamInstanceProfile: '',
  monitoring: false,
  userData: '',
  userDataBase64: '',
  userDataReplaceOnChange: false,
  metadataOptions: {
    httpEndpoint: 'enabled',
    httpTokens: 'required',
    httpPutResponseHopLimit: 2,
    httpProtocolIpv6: 'disabled',
    instanceMetadataTags: 'disabled',
  },
  placementGroup: '',
  tenancy: 'default',
  hostId: '',
  hostResourceGroupArn: '',
  enclaveOptions: { enabled: false },
  maintenanceOptions: { autoRecovery: 'default' },
  instanceInitiatedShutdownBehavior: 'stop',
  disableApiTermination: false,
  disableApiStop: false,
  hibernation: false,
  forceDestroy: false,
  getPasswordData: false,
};

// ============================================================
// STEP DEFINITION
// ============================================================
export interface EC2Step {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const EC2_STEPS: EC2Step[] = [
  {
    id: 'name-tags',
    label: 'Name and tags',
    shortLabel: 'Name',
    icon: '🏷️',
    description: 'Give your instance a name and add tags',
  },
  {
    id: 'ami',
    label: 'Application and OS Images (AMI)',
    shortLabel: 'AMI',
    icon: '💿',
    description: 'Select an Amazon Machine Image',
  },
  {
    id: 'instance-type',
    label: 'Instance type',
    shortLabel: 'Type',
    icon: '⚡',
    description: 'Choose the hardware configuration',
  },
  {
    id: 'key-pair',
    label: 'Key pair (login)',
    shortLabel: 'Key pair',
    icon: '🔑',
    description: 'Select or create a key pair for SSH access',
  },
  {
    id: 'network',
    label: 'Network settings',
    shortLabel: 'Network',
    icon: '🌐',
    description: 'Configure VPC, subnet, security groups, and IP settings',
  },
  {
    id: 'storage',
    label: 'Configure storage',
    shortLabel: 'Storage',
    icon: '💾',
    description: 'Configure root and additional EBS volumes',
  },
  {
    id: 'advanced',
    label: 'Advanced details',
    shortLabel: 'Advanced',
    icon: '⚙️',
    description: 'IAM, monitoring, user data, spot, placement, and more',
  },
  {
    id: 'summary',
    label: 'Summary',
    shortLabel: 'Summary',
    icon: '📋',
    description: 'Review your configuration before saving',
  },
];