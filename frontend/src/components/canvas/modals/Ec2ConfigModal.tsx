import { useState, useCallback } from 'react'
// Lucide icons not currently used in this modal
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

export interface EC2Config {
  // Instance Details
  instanceName: string
  ami: string
  instanceType: string

  // Networking
  vpcId: string
  subnetId: string
  assignPublicIp: boolean

  // Storage
  rootVolumeSize: number
  rootVolumeType: 'gp2' | 'gp3' | 'io1' | 'io2'
  rootVolumeIops?: number

  // Security
  securityGroupIds: string[]
  
  // Key Pair
  keyPairName: string

  // IAM Role
  iamRoleName?: string

  // Tags
  tags: Record<string, string>

  // Advanced
  userData?: string
  numberOfInstances?: number
  purchaseOption?: 'on-demand' | 'spot'
  spotBidPrice?: number
  monitoring?: boolean
  t2Unlimited?: boolean
}

interface Ec2ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: EC2Config) => void
  initialConfig?: Partial<EC2Config>
}

const INSTANCE_TYPES = [
  't2.nano', 't2.micro', 't2.small', 't2.medium', 't2.large',
  't3.nano', 't3.micro', 't3.small', 't3.medium', 't3.large',
  'm5.large', 'm5.xlarge', 'm5.2xlarge',
  'c5.large', 'c5.xlarge', 'c5.2xlarge',
]

const SECURITY_GROUPS = [
  { id: 'sg-001', name: 'default' },
  { id: 'sg-002', name: 'web-server' },
  { id: 'sg-003', name: 'database' },
]

const IAM_ROLES = [
  { id: 'iam-001', name: 'EC2-Default-Role' },
  { id: 'iam-002', name: 'EC2-S3-Access' },
  { id: 'iam-003', name: 'EC2-Lambda-Invoke' },
]

const SECTIONS = [
  { id: 'details', label: 'Instance Details', icon: '⚙️' },
  { id: 'networking', label: 'Networking', icon: '🌐' },
  { id: 'storage', label: 'Storage', icon: '💾' },
  { id: 'security', label: 'Security Groups', icon: '🔒' },
  { id: 'keypair', label: 'Key Pair', icon: '🔑' },
  { id: 'iamrole', label: 'IAM Role', icon: '👤' },
  { id: 'tags', label: 'Tags', icon: '🏷️' },
  { id: 'advanced', label: 'Advanced', icon: '⚡' },
]

export function Ec2ConfigModal({
  isOpen,
  onClose,
  onSave,
  initialConfig = {},
}: Ec2ConfigModalProps) {
  const [config, setConfig] = useState<EC2Config>({
    instanceName: initialConfig.instanceName || 'my-instance',
    ami: initialConfig.ami || 'ami-0c55b159cbfafe1f0',
    instanceType: initialConfig.instanceType || 't2.micro',
    vpcId: initialConfig.vpcId || 'vpc-default',
    subnetId: initialConfig.subnetId || 'subnet-default',
    assignPublicIp: initialConfig.assignPublicIp ?? true,
    rootVolumeSize: initialConfig.rootVolumeSize || 20,
    rootVolumeType: initialConfig.rootVolumeType || 'gp3',
    securityGroupIds: initialConfig.securityGroupIds || ['sg-001'],
    keyPairName: initialConfig.keyPairName || '',
    iamRoleName: initialConfig.iamRoleName || '',
    tags: initialConfig.tags || { Name: 'my-instance' },
    userData: initialConfig.userData || '',
    numberOfInstances: initialConfig.numberOfInstances || 1,
    purchaseOption: initialConfig.purchaseOption || 'on-demand',
    spotBidPrice: initialConfig.spotBidPrice || 0,
    monitoring: initialConfig.monitoring || false,
    t2Unlimited: initialConfig.t2Unlimited || false,
  })
  const [activeSection] = useState('details')
  // activeSection is used by AwsResourceModal via prop, setActiveSection managed by parent
  const [tagInput, setTagInput] = useState({ key: '', value: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddTag = useCallback(() => {
    if (tagInput.key.trim()) {
      setConfig((prev) => ({
        ...prev,
        tags: { ...prev.tags, [tagInput.key]: tagInput.value },
      }))
      setTagInput({ key: '', value: '' })
    }
  }, [tagInput])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!config.instanceName || !config.instanceName.trim()) e.instanceName = 'Instance name is required'
    if (!config.instanceType) e.instanceType = 'Instance type is required'
    if (!config.subnetId) e.subnetId = 'Subnet is required'
    if (!config.securityGroupIds || config.securityGroupIds.length === 0) e.securityGroupIds = 'Attach at least one security group'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
  }

  const handleRemoveTag = useCallback((key: string) => {
    setConfig((prev) => ({
      ...prev,
      tags: Object.fromEntries(Object.entries(prev.tags).filter(([k]) => k !== key)),
    }))
  }, [])

  const handleToggleSG = useCallback((sgId: string) => {
    setConfig((prev) => ({
      ...prev,
      securityGroupIds: prev.securityGroupIds.includes(sgId)
        ? prev.securityGroupIds.filter((id) => id !== sgId)
        : [...prev.securityGroupIds, sgId],
    }))
  }, [])

  return (
    <AwsResourceModal
      title="EC2 Instance Configuration"
      subtitle="Configure the details of your EC2 instance"
      isOpen={isOpen}
      onClose={onClose}
      sections={SECTIONS}
      onSave={handleSave}
    >
      {/* Instance Details Section */}
      <AwsResourceSection sectionId="details" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Instance Name" required>
            <Input
              value={config.instanceName}
              onChange={(e) => setConfig((prev) => ({ ...prev, instanceName: e.target.value }))}
              placeholder="my-instance"
            />
            {errors.instanceName && <p className="text-xs text-red-600">{errors.instanceName}</p>}
          </FormField>

          <FormField label="Amazon Machine Image (AMI)" required hint="Search for AMIs...">
            <Input
              value={config.ami}
              onChange={(e) => setConfig((prev) => ({ ...prev, ami: e.target.value }))}
              placeholder="ami-0c55b159cbfafe1f0"
              readOnly
            />
          </FormField>

          <FormField label="Instance Type" required>
            <select
              value={config.instanceType}
              onChange={(e) => setConfig((prev) => ({ ...prev, instanceType: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {INSTANCE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.instanceType && <p className="text-xs text-red-600">{errors.instanceType}</p>}
          </FormField>

          <FormField label="Number of Instances">
            <Input
              type="number"
              value={String(config.numberOfInstances)}
              onChange={(e) => setConfig((prev) => ({ ...prev, numberOfInstances: Math.max(1, parseInt(e.target.value) || 1) }))}
              min="1"
            />
          </FormField>

          <FormField label="Purchase Option">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="purchase" checked={config.purchaseOption === 'on-demand'} onChange={() => setConfig((prev) => ({ ...prev, purchaseOption: 'on-demand' }))} />
                <span className="text-sm">On-Demand</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="purchase" checked={config.purchaseOption === 'spot'} onChange={() => setConfig((prev) => ({ ...prev, purchaseOption: 'spot' }))} />
                <span className="text-sm">Spot</span>
              </label>
              {config.purchaseOption === 'spot' && (
                <Input type="number" value={String(config.spotBidPrice || '')} onChange={(e) => setConfig((prev) => ({ ...prev, spotBidPrice: parseFloat(e.target.value) || 0 }))} placeholder="Max bid price (USD)" />
              )}
            </div>
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Networking Section */}
      <AwsResourceSection sectionId="networking" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="VPC">
            <select
              value={config.vpcId}
              onChange={(e) => setConfig((prev) => ({ ...prev, vpcId: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="vpc-default">vpc-default (Default VPC)</option>
              <option value="vpc-custom-1">vpc-custom-1 (Custom VPC)</option>
            </select>
          </FormField>

          <FormField label="Subnet">
            <select
              value={config.subnetId}
              onChange={(e) => setConfig((prev) => ({ ...prev, subnetId: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="subnet-default">subnet-default (Default Subnet)</option>
              <option value="subnet-custom-1">subnet-custom-1 (Custom Subnet)</option>
            </select>
          </FormField>

          <FormField label="Detailed Monitoring">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.assignPublicIp}
                onChange={(e) => setConfig((prev) => ({ ...prev, assignPublicIp: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Auto-assign Public IP</span>
            </label>
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Storage Section */}
      <AwsResourceSection sectionId="storage" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Root Volume Size (GB)" required>
            <Input
              type="number"
              value={String(config.rootVolumeSize)}
              onChange={(e) => setConfig((prev) => ({ ...prev, rootVolumeSize: parseInt(e.target.value) || 20 }))}
              min="10"
              max="1000"
            />
          </FormField>

          <FormField label="Volume Type" required>
            <select
              value={config.rootVolumeType}
              onChange={(e) => setConfig((prev) => ({ ...prev, rootVolumeType: e.target.value as any }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="gp2">gp2 (General Purpose SSD)</option>
              <option value="gp3">gp3 (General Purpose SSD)</option>
              <option value="io1">io1 (Provisioned IOPS)</option>
              <option value="io2">io2 (Provisioned IOPS)</option>
            </select>
          </FormField>

          {(config.rootVolumeType === 'io1' || config.rootVolumeType === 'io2') && (
            <FormField label="IOPS">
              <Input
                type="number"
                value={String(config.rootVolumeIops || 1000)}
                onChange={(e) => setConfig((prev) => ({ ...prev, rootVolumeIops: parseInt(e.target.value) || 1000 }))}
                min="100"
                max="16000"
              />
            </FormField>
          )}
        </div>
      </AwsResourceSection>

      {/* Security Groups Section */}
      <AwsResourceSection sectionId="security" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Security Groups" required hint="Select one or more security groups">
            {SECURITY_GROUPS.map((sg) => (
              <label key={sg.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={config.securityGroupIds.includes(sg.id)}
                  onChange={() => handleToggleSG(sg.id)}
                />
                <span className="text-sm text-gray-700">{sg.name}</span>
              </label>
            ))}
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Key Pair Section */}
      <AwsResourceSection sectionId="keypair" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Key Pair" required hint="Required for SSH access">
            <select
              value={config.keyPairName}
              onChange={(e) => setConfig((prev) => ({ ...prev, keyPairName: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">-- Select Key Pair --</option>
              <option value="my-key-pair">my-key-pair</option>
              <option value="production-key">production-key</option>
              <option value="dev-key">dev-key</option>
            </select>
          </FormField>
        </div>
      </AwsResourceSection>

      {/* IAM Role Section */}
      <AwsResourceSection sectionId="iamrole" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="IAM Instance Profile" hint="Optional - grants permissions to EC2 instance">
            <select
              value={config.iamRoleName || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, iamRoleName: e.target.value || undefined }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">-- No Role --</option>
              {IAM_ROLES.map((role) => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Tags Section */}
      <AwsResourceSection sectionId="tags" activeSection={activeSection}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Key"
              value={tagInput.key}
              onChange={(e) => setTagInput((prev) => ({ ...prev, key: e.target.value }))}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={tagInput.value}
              onChange={(e) => setTagInput((prev) => ({ ...prev, value: e.target.value }))}
              className="flex-1"
            />
            <Button size="sm" variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>

          {Object.entries(config.tags).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded bg-gray-50 p-2">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{key}</span>
                <span className="mx-2 text-gray-500">=</span>
                <span className="text-gray-700">{value}</span>
              </div>
              <button
                onClick={() => handleRemoveTag(key)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </AwsResourceSection>

      {/* Advanced Section */}
      <AwsResourceSection sectionId="advanced" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="User Data" hint="Shell script to run on instance launch">
            <textarea
              value={config.userData || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, userData: e.target.value }))}
              placeholder="#!/bin/bash&#10;echo 'Hello World'"
              className="w-full h-32 rounded border border-gray-300 p-3 font-mono text-xs"
            />
          </FormField>
        </div>
      </AwsResourceSection>
    </AwsResourceModal>
  )
}

export default Ec2ConfigModal
