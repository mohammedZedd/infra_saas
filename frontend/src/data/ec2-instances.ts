import type { InstanceTypeOption } from '../types/ec2';

export const INSTANCE_TYPE_CATALOG: InstanceTypeOption[] = [
  // General Purpose
  { type: 't2.nano', family: 'General Purpose', vCPUs: 1, memory: '0.5 GiB', storage: 'EBS Only', network: 'Low', price: '\$0.0058/hr', isFree: false },
  { type: 't2.micro', family: 'General Purpose', vCPUs: 1, memory: '1 GiB', storage: 'EBS Only', network: 'Low to Moderate', price: '\$0.0116/hr', isFree: true },
  { type: 't2.small', family: 'General Purpose', vCPUs: 1, memory: '2 GiB', storage: 'EBS Only', network: 'Low to Moderate', price: '\$0.023/hr', isFree: false },
  { type: 't2.medium', family: 'General Purpose', vCPUs: 2, memory: '4 GiB', storage: 'EBS Only', network: 'Low to Moderate', price: '\$0.0464/hr', isFree: false },
  { type: 't2.large', family: 'General Purpose', vCPUs: 2, memory: '8 GiB', storage: 'EBS Only', network: 'Low to Moderate', price: '\$0.0928/hr', isFree: false },
  { type: 't3.micro', family: 'General Purpose', vCPUs: 2, memory: '1 GiB', storage: 'EBS Only', network: 'Up to 5 Gbps', price: '\$0.0104/hr', isFree: true },
  { type: 't3.small', family: 'General Purpose', vCPUs: 2, memory: '2 GiB', storage: 'EBS Only', network: 'Up to 5 Gbps', price: '\$0.0208/hr', isFree: false },
  { type: 't3.medium', family: 'General Purpose', vCPUs: 2, memory: '4 GiB', storage: 'EBS Only', network: 'Up to 5 Gbps', price: '\$0.0416/hr', isFree: false },
  { type: 't3.large', family: 'General Purpose', vCPUs: 2, memory: '8 GiB', storage: 'EBS Only', network: 'Up to 5 Gbps', price: '\$0.0832/hr', isFree: false },
  // Compute Optimized
  { type: 'c5.large', family: 'Compute Optimized', vCPUs: 2, memory: '4 GiB', storage: 'EBS Only', network: 'Up to 10 Gbps', price: '\$0.085/hr', isFree: false },
  { type: 'c5.xlarge', family: 'Compute Optimized', vCPUs: 4, memory: '8 GiB', storage: 'EBS Only', network: 'Up to 10 Gbps', price: '\$0.17/hr', isFree: false },
  { type: 'c5.2xlarge', family: 'Compute Optimized', vCPUs: 8, memory: '16 GiB', storage: 'EBS Only', network: 'Up to 10 Gbps', price: '\$0.34/hr', isFree: false },
  // Memory Optimized
  { type: 'r5.large', family: 'Memory Optimized', vCPUs: 2, memory: '16 GiB', storage: 'EBS Only', network: 'Up to 10 Gbps', price: '\$0.126/hr', isFree: false },
  { type: 'r5.xlarge', family: 'Memory Optimized', vCPUs: 4, memory: '32 GiB', storage: 'EBS Only', network: 'Up to 10 Gbps', price: '\$0.252/hr', isFree: false },
  // Storage Optimized
  { type: 'i3.large', family: 'Storage Optimized', vCPUs: 2, memory: '15.25 GiB', storage: '1x475 NVMe SSD', network: 'Up to 10 Gbps', price: '\$0.156/hr', isFree: false },
  // Accelerated
  { type: 'g4dn.xlarge', family: 'Accelerated Computing', vCPUs: 4, memory: '16 GiB', storage: '1x125 NVMe SSD', network: 'Up to 25 Gbps', price: '\$0.526/hr', isFree: false },
  { type: 'p3.2xlarge', family: 'Accelerated Computing', vCPUs: 8, memory: '61 GiB', storage: 'EBS Only', network: 'Up to 10 Gbps', price: '\$3.06/hr', isFree: false },
];