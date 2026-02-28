import { useState } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'

export interface RDSConfig {
  // Engine Options
  engine: 'mysql' | 'postgres' | 'mariadb' | 'oracle' | 'sqlserver'
  engineVersion: string

  // Instance Class
  instanceClass: string

  // Storage
  storageType: 'gp2' | 'gp3' | 'io1'
  allocatedStorage: number
  iops?: number

  // Networking
  vpcId: string
  subnetGroupName: string
  publiclyAccessible: boolean

  // Security
  securityGroupIds: string[]
  encryption: boolean
  kmsKeyId?: string

  // Backup
  backupRetentionPeriod: number
  backupWindow: string

  // Maintenance
  maintenanceWindow: string

  // Tags
  tags: Record<string, string>
}

interface RdsConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: RDSConfig) => void
  initialConfig?: Partial<RDSConfig>
}

const DB_ENGINES = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'oracle', label: 'Oracle Database' },
  { value: 'sqlserver', label: 'SQL Server' },
]

const INSTANCE_CLASSES = [
  'db.t3.nano', 'db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.t3.large',
  'db.m5.large', 'db.m5.xlarge', 'db.m5.2xlarge',
  'db.r5.large', 'db.r5.xlarge', 'db.r5.2xlarge',
]

const SECTIONS = [
  { id: 'engine', label: 'Engine Options', icon: '🛢️' },
  { id: 'instance', label: 'Instance Class', icon: '⚙️' },
  { id: 'storage', label: 'Storage', icon: '💾' },
  { id: 'networking', label: 'Networking', icon: '🌐' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'backup', label: 'Backup', icon: '💾' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'tags', label: 'Tags', icon: '🏷️' },
]

export function RdsConfigModal({
  isOpen,
  onClose,
  onSave,
  initialConfig = {},
}: RdsConfigModalProps) {
  const [config, setConfig] = useState<RDSConfig>({
    engine: initialConfig.engine || 'postgres',
    engineVersion: initialConfig.engineVersion || '14',
    instanceClass: initialConfig.instanceClass || 'db.t3.micro',
    storageType: initialConfig.storageType || 'gp3',
    allocatedStorage: initialConfig.allocatedStorage || 20,
    iops: initialConfig.iops || 3000,
    vpcId: initialConfig.vpcId || 'vpc-default',
    subnetGroupName: initialConfig.subnetGroupName || 'default',
    publiclyAccessible: initialConfig.publiclyAccessible ?? false,
    securityGroupIds: initialConfig.securityGroupIds || ['sg-default'],
    encryption: initialConfig.encryption ?? true,
    kmsKeyId: initialConfig.kmsKeyId || '',
    backupRetentionPeriod: initialConfig.backupRetentionPeriod || 7,
    backupWindow: initialConfig.backupWindow || '03:00-04:00',
    maintenanceWindow: initialConfig.maintenanceWindow || 'sun:04:00-sun:05:00',
    tags: initialConfig.tags || {},
  })

  const [activeSection] = useState('engine')
  // activeSection is used by AwsResourceModal via prop, setActiveSection managed by parent
  const [tagInput, setTagInput] = useState({ key: '', value: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddTag = () => {
    if (tagInput.key.trim()) {
      setConfig((prev) => ({
        ...prev,
        tags: { ...prev.tags, [tagInput.key]: tagInput.value },
      }))
      setTagInput({ key: '', value: '' })
    }
  }

  const handleRemoveTag = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      tags: Object.fromEntries(Object.entries(prev.tags).filter(([k]) => k !== key)),
    }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!config.instanceClass) e.instanceClass = 'DB instance class is required'
    if (!config.vpcId) e.vpcId = 'VPC is required'
    if (!config.subnetGroupName) e.subnetGroupName = 'Subnet group is required'
    if (!config.securityGroupIds || config.securityGroupIds.length === 0) e.securityGroupIds = 'Attach at least one security group'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
  }

  return (
    <AwsResourceModal
      title="RDS Database Configuration"
      subtitle="Configure the settings for your RDS database instance"
      isOpen={isOpen}
      onClose={onClose}
      sections={SECTIONS}
      onSave={handleSave}
    >
      {/* Engine Options */}
      <AwsResourceSection sectionId="engine" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Database Engine" required>
            <select
              value={config.engine}
              onChange={(e) => setConfig((prev) => ({ ...prev, engine: e.target.value as any }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {DB_ENGINES.map((engine) => (
                <option key={engine.value} value={engine.value}>{engine.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Engine Version" required>
            <Input
              value={config.engineVersion}
              onChange={(e) => setConfig((prev) => ({ ...prev, engineVersion: e.target.value }))}
              placeholder="14"
            />
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Instance Class */}
      <AwsResourceSection sectionId="instance" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="DB Instance Class" required hint="Think about performance and cost">
            <select
              value={config.instanceClass}
              onChange={(e) => setConfig((prev) => ({ ...prev, instanceClass: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {INSTANCE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            {errors.instanceClass && <p className="text-xs text-red-600">{errors.instanceClass}</p>}
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Storage */}
      <AwsResourceSection sectionId="storage" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Storage Type" required>
            <select
              value={config.storageType}
              onChange={(e) => setConfig((prev) => ({ ...prev, storageType: e.target.value as any }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="gp2">General Purpose SSD (gp2)</option>
              <option value="gp3">General Purpose SSD (gp3)</option>
              <option value="io1">Provisioned IOPS (io1)</option>
            </select>
          </FormField>

          <FormField label="Allocated Storage (GB)" required>
            <Input
              type="number"
              value={String(config.allocatedStorage)}
              onChange={(e) => setConfig((prev) => ({ ...prev, allocatedStorage: parseInt(e.target.value) || 20 }))}
              min="20"
              max="65536"
            />
          </FormField>

          {config.storageType === 'io1' && (
            <FormField label="IOPS" required>
              <Input
                type="number"
                value={String(config.iops || 1000)}
                onChange={(e) => setConfig((prev) => ({ ...prev, iops: parseInt(e.target.value) || 1000 }))}
                min="1000"
                max="80000"
              />
            </FormField>
          )}
        </div>
      </AwsResourceSection>

      {/* Networking */}
      <AwsResourceSection sectionId="networking" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="VPC">
            <select
              value={config.vpcId}
              onChange={(e) => setConfig((prev) => ({ ...prev, vpcId: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="vpc-default">vpc-default (Default VPC)</option>
              <option value="vpc-custom-1">vpc-custom-1</option>
            </select>
            {errors.vpcId && <p className="text-xs text-red-600">{errors.vpcId}</p>}
          </FormField>

          <FormField label="DB Subnet Group">
            <select
              value={config.subnetGroupName}
              onChange={(e) => setConfig((prev) => ({ ...prev, subnetGroupName: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="default">default</option>
              <option value="prod-subnet-group">prod-subnet-group</option>
            </select>
            {errors.subnetGroupName && <p className="text-xs text-red-600">{errors.subnetGroupName}</p>}
          </FormField>

          <FormField label="Public Accessibility" hint="Enable public accessibility for testing (not recommended for production)">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.publiclyAccessible}
                onChange={(e) => setConfig((prev) => ({ ...prev, publiclyAccessible: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Publicly Accessible</span>
            </label>
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Security */}
      <AwsResourceSection sectionId="security" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="VPC Security Groups">
            <div className="space-y-2">
              {['sg-default', 'sg-database', 'sg-app-server'].map((sg) => (
                <label key={sg} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.securityGroupIds.includes(sg)}
                    onChange={(e) => {
                      const newSGs = e.target.checked
                        ? [...config.securityGroupIds, sg]
                        : config.securityGroupIds.filter((s) => s !== sg)
                      setConfig((prev) => ({ ...prev, securityGroupIds: newSGs }))
                    }}
                  />
                  <span className="text-sm text-gray-700">{sg}</span>
                </label>
              ))}
            </div>
            {errors.securityGroupIds && <p className="text-xs text-red-600">{errors.securityGroupIds}</p>}
          </FormField>

          <FormField label="Enable Encryption">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.encryption}
                onChange={(e) => setConfig((prev) => ({ ...prev, encryption: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Enable encryption at rest</span>
            </label>
          </FormField>

          {config.encryption && (
            <FormField label="KMS Master Key ID" hint="Leave blank for AWS-managed encryption">
              <Input
                value={config.kmsKeyId || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, kmsKeyId: e.target.value }))}
                placeholder="arn:aws:kms:..."
              />
            </FormField>
          )}
        </div>
      </AwsResourceSection>

      {/* Backup */}
      <AwsResourceSection sectionId="backup" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Backup Retention Period (days)" required hint="Number of days to retain automated backups">
            <Input
              type="number"
              value={String(config.backupRetentionPeriod)}
              onChange={(e) => setConfig((prev) => ({ ...prev, backupRetentionPeriod: parseInt(e.target.value) || 7 }))}
              min="0"
              max="35"
            />
          </FormField>

          <FormField label="Backup Window" required hint="UTC time window for automated backups (HH:MM-HH:MM)">
            <Input
              value={config.backupWindow}
              onChange={(e) => setConfig((prev) => ({ ...prev, backupWindow: e.target.value }))}
              placeholder="03:00-04:00"
            />
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Maintenance */}
      <AwsResourceSection sectionId="maintenance" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Maintenance Window" hint="Preferred time for maintenance (ddd:HH:MM-ddd:HH:MM)">
            <Input
              value={config.maintenanceWindow}
              onChange={(e) => setConfig((prev) => ({ ...prev, maintenanceWindow: e.target.value }))}
              placeholder="sun:04:00-sun:05:00"
            />
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Tags */}
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
            <button
              onClick={handleAddTag}
              className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100"
            >
              Add
            </button>
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
    </AwsResourceModal>
  )
}

export default RdsConfigModal
