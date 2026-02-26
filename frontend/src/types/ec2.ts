export interface EC2Tag {
  key: string;
  value: string;
}

export interface AMIOption {
  id: string;
  name: string;
  description: string;
  architecture: 'x86_64' | 'arm64';
  os: string;
  icon: string;
  isFree: boolean;
}

export interface InstanceTypeOption {
  type: string;
  family: string;
  vCPUs: number;
  memory: string;
  storage: string;
  network: string;
  price: string;
  isFree: boolean;
}

export interface SecurityGroupRule {
  id: string;
  type: 'SSH' | 'HTTP' | 'HTTPS' | 'Custom TCP' | 'Custom UDP' | 'All traffic';
  protocol: 'tcp' | 'udp' | 'all';
  portRange: string;
  source: string;
  description: string;
}

export interface EBSVolume {
  id: string;
  deviceName: string;
  size: number;
  volumeType: 'gp3' | 'gp2' | 'io1' | 'io2' | 'st1' | 'sc1' | 'standard';
  iops: number;
  throughput: number;
  encrypted: boolean;
  kmsKeyId: string;
  deleteOnTermination: boolean;
}

export interface EC2NetworkConfig {
  vpcId: string;
  subnetId: string;
  autoAssignPublicIp: 'Enable' | 'Disable' | 'Use subnet setting';
  securityGroups: string[];
  securityGroupRules: SecurityGroupRule[];
  createNewSecurityGroup: boolean;
  newSecurityGroupName: string;
  newSecurityGroupDescription: string;
}

export interface EC2AdvancedConfig {
  iamInstanceProfile: string;
  hostname: string;
  userData: string;
  monitoring: boolean;
  tenancy: 'default' | 'dedicated' | 'host';
  placementGroup: string;
  ebsOptimized: boolean;
  creditSpecification: 'standard' | 'unlimited';
  shutdownBehavior: 'stop' | 'terminate';
  terminationProtection: boolean;
  stopProtection: boolean;
  hibernation: boolean;
  metadataVersion: 'V1 and V2' | 'V2 only';
  metadataResponseHopLimit: number;
}

export interface EC2Config {
  name: string;
  tags: EC2Tag[];
  ami: string;
  amiName: string;
  instanceType: string;
  keyPair: string;
  numberOfInstances: number;
  network: EC2NetworkConfig;
  rootVolume: EBSVolume;
  additionalVolumes: EBSVolume[];
  advanced: EC2AdvancedConfig;
}

export const DEFAULT_EC2_CONFIG: EC2Config = {
  name: '',
  tags: [],
  ami: 'ami-0c02fb55956c7d316',
  amiName: 'Amazon Linux 2023 AMI',
  instanceType: 't2.micro',
  keyPair: '',
  numberOfInstances: 1,
  network: {
    vpcId: '',
    subnetId: '',
    autoAssignPublicIp: 'Use subnet setting',
    securityGroups: [],
    securityGroupRules: [
      {
        id: 'rule-1',
        type: 'SSH',
        protocol: 'tcp',
        portRange: '22',
        source: '0.0.0.0/0',
        description: 'Allow SSH',
      },
    ],
    createNewSecurityGroup: true,
    newSecurityGroupName: 'launch-wizard-1',
    newSecurityGroupDescription: 'Created by infrastructure designer',
  },
  rootVolume: {
    id: 'vol-root',
    deviceName: '/dev/xvda',
    size: 8,
    volumeType: 'gp3',
    iops: 3000,
    throughput: 125,
    encrypted: false,
    kmsKeyId: '',
    deleteOnTermination: true,
  },
  additionalVolumes: [],
  advanced: {
    iamInstanceProfile: '',
    hostname: '',
    userData: '',
    monitoring: false,
    tenancy: 'default',
    placementGroup: '',
    ebsOptimized: false,
    creditSpecification: 'standard',
    shutdownBehavior: 'stop',
    terminationProtection: false,
    stopProtection: false,
    hibernation: false,
    metadataVersion: 'V2 only',
    metadataResponseHopLimit: 2,
  },
};