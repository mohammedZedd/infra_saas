import { useState } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export interface ScalingPolicy {
  id: string
  type: string
  value?: string
}

export interface AsgConfig {
  name: string
  vpcId: string
  subnets: string[]
  launchTemplate?: string
  instanceTypeOverride?: string
  amiOverride?: string
  desired: number
  min: number
  max: number
  scalingPolicies: ScalingPolicy[]
  healthCheckType: string
  healthCheckGracePeriod: number
  tags: Record<string,string>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (cfg: AsgConfig) => void
  initialConfig?: Partial<AsgConfig>
}

const SECTIONS = [
  { id: 'details', label: 'Group Details' },
  { id: 'launch', label: 'Launch Template' },
  { id: 'scaling', label: 'Scaling Policies' },
  { id: 'health', label: 'Health Checks' },
  { id: 'tags', label: 'Tags' },
]

export default function AsgConfigModal({ isOpen, onClose, onSave, initialConfig = {} }: Props) {
  const [config, setConfig] = useState<AsgConfig>({
    name: initialConfig.name || 'asg-1',
    vpcId: initialConfig.vpcId || 'vpc-default',
    subnets: initialConfig.subnets || ['subnet-1'],
    launchTemplate: initialConfig.launchTemplate || '',
    instanceTypeOverride: initialConfig.instanceTypeOverride || '',
    amiOverride: initialConfig.amiOverride || '',
    desired: initialConfig.desired ?? 1,
    min: initialConfig.min ?? 1,
    max: initialConfig.max ?? 3,
    scalingPolicies: initialConfig.scalingPolicies || [],
    healthCheckType: initialConfig.healthCheckType || 'EC2',
    healthCheckGracePeriod: initialConfig.healthCheckGracePeriod ?? 300,
    tags: initialConfig.tags || {},
  })

  const [activeSection] = useState('details')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [tagInput, setTagInput] = useState({ key: '', value: '' })

  const addPolicy = () => setConfig((p) => ({ ...p, scalingPolicies: [...p.scalingPolicies, { id: `pol-${Date.now()}`, type: 'Simple Scaling', value: '' }] }))
  const removePolicy = (id: string) => setConfig((p) => ({ ...p, scalingPolicies: p.scalingPolicies.filter(s => s.id !== id) }))

  const handleAddTag = () => {
    if (tagInput.key.trim()) {
      setConfig((p) => ({ ...p, tags: { ...p.tags, [tagInput.key]: tagInput.value } }))
      setTagInput({ key: '', value: '' })
    }
  }

  const validate = () => {
    const e: Record<string,string> = {}
    if (!config.name.trim()) e.name = 'Auto Scaling Group Name is required'
    if (!config.launchTemplate) e.launchTemplate = 'Launch Template is required'
    if (config.desired === undefined || config.min === undefined || config.max === undefined) e.capacity = 'Desired/Min/Max capacities must be set'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
    onClose()
  }

  return (
    <AwsResourceModal title="Auto Scaling Group Configuration" subtitle="Configure the scaling policies and settings for your Auto Scaling Group" isOpen={isOpen} onClose={onClose} onSave={handleSave} sections={SECTIONS}>
      <AwsResourceSection sectionId="details" activeSection={activeSection}>
        <div className="space-y-3">
          <FormField label="Auto Scaling Group Name" required>
            <Input value={config.name} onChange={(e) => setConfig((p) => ({ ...p, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </FormField>

          <FormField label="VPC">
            <select value={config.vpcId} onChange={(e) => setConfig((p) => ({ ...p, vpcId: e.target.value }))} className="w-full rounded border p-2">
              <option value="vpc-default">vpc-default</option>
            </select>
          </FormField>

          <FormField label="Subnets">
            <select multiple value={config.subnets} onChange={(e) => setConfig((p) => ({ ...p, subnets: Array.from(e.target.selectedOptions, o => o.value) }))} className="w-full rounded border p-2">
              <option value="subnet-1">subnet-1</option>
              <option value="subnet-2">subnet-2</option>
            </select>
          </FormField>
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="launch" activeSection={activeSection}>
        <div className="space-y-3">
          <FormField label="Launch Template" required>
            <select value={config.launchTemplate} onChange={(e) => setConfig((p) => ({ ...p, launchTemplate: e.target.value }))} className="w-full rounded border p-2">
              <option value="">-- Select --</option>
              <option value="lt-1">EC2 Launch Template</option>
            </select>
            {errors.launchTemplate && <p className="text-xs text-red-600">{errors.launchTemplate}</p>}
          </FormField>

          <FormField label="Instance Type Override">
            <Input value={config.instanceTypeOverride} onChange={(e) => setConfig((p) => ({ ...p, instanceTypeOverride: e.target.value }))} />
          </FormField>

          <FormField label="AMI ID Override">
            <Input value={config.amiOverride} onChange={(e) => setConfig((p) => ({ ...p, amiOverride: e.target.value }))} />
          </FormField>
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="scaling" activeSection={activeSection}>
        <div className="space-y-3">
          <FormField label="Desired Capacity">
            <Input type="number" value={String(config.desired)} onChange={(e) => setConfig((p) => ({ ...p, desired: Number(e.target.value) }))} />
          </FormField>

          <FormField label="Min Capacity">
            <Input type="number" value={String(config.min)} onChange={(e) => setConfig((p) => ({ ...p, min: Number(e.target.value) }))} />
          </FormField>

          <FormField label="Max Capacity">
            <Input type="number" value={String(config.max)} onChange={(e) => setConfig((p) => ({ ...p, max: Number(e.target.value) }))} />
          </FormField>

          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={addPolicy}>Add Scaling Policy</Button>
          </div>
          {config.scalingPolicies.map(s => (
            <div key={s.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
              <div className="text-sm">{s.type} {s.value ? `• ${s.value}` : ''}</div>
              <button className="text-xs text-red-600" onClick={() => removePolicy(s.id)}>Remove</button>
            </div>
          ))}
          {errors.capacity && <p className="text-xs text-red-600">{errors.capacity}</p>}
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="health" activeSection={activeSection}>
        <div className="space-y-3">
          <FormField label="Health Check Type">
            <select value={config.healthCheckType} onChange={(e) => setConfig((p) => ({ ...p, healthCheckType: e.target.value }))} className="w-full rounded border p-2">
              <option>EC2</option>
              <option>ELB</option>
            </select>
          </FormField>

          <FormField label="Health Check Grace Period">
            <Input type="number" value={String(config.healthCheckGracePeriod)} onChange={(e) => setConfig((p) => ({ ...p, healthCheckGracePeriod: Number(e.target.value) }))} />
          </FormField>
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="tags" activeSection={activeSection}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Key" value={tagInput.key} onChange={(e) => setTagInput((p) => ({ ...p, key: e.target.value }))} className="flex-1" />
            <Input placeholder="Value" value={tagInput.value} onChange={(e) => setTagInput((p) => ({ ...p, value: e.target.value }))} className="flex-1" />
            <Button size="sm" variant="secondary" onClick={handleAddTag}>Add</Button>
          </div>
          {Object.entries(config.tags).map(([k,v]) => (
            <div key={k} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="text-sm">{k} = {v}</div>
              <button className="text-xs text-red-600" onClick={() => setConfig((p) => ({ ...p, tags: Object.fromEntries(Object.entries(p.tags).filter(([key]) => key !== k)) }))}>Remove</button>
            </div>
          ))}
        </div>
      </AwsResourceSection>
    </AwsResourceModal>
  )
}
