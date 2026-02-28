import { useState } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export interface SubnetConfig {
  name: string
  vpcId: string
  cidr: string
  availabilityZone: string
  autoAssignPublicIp: boolean
  tags: Record<string,string>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (cfg: SubnetConfig) => void
  initialConfig?: Partial<SubnetConfig>
}

const SECTIONS = [
  { id: 'settings', label: 'Subnet Settings' },
  { id: 'publicip', label: 'Public IP Assignment' },
  { id: 'tags', label: 'Tags' },
]

const cidrValid = (c: string) => /^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(c)

export default function SubnetConfigModal({ isOpen, onClose, onSave, initialConfig = {} }: Props) {
  const [config, setConfig] = useState<SubnetConfig>({
    name: initialConfig.name || 'subnet-1',
    vpcId: initialConfig.vpcId || 'vpc-default',
    cidr: initialConfig.cidr || '10.0.1.0/24',
    availabilityZone: initialConfig.availabilityZone || 'us-east-1a',
    autoAssignPublicIp: !!initialConfig.autoAssignPublicIp,
    tags: initialConfig.tags || {},
  })

  const [activeSection] = useState('settings')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [tagInput, setTagInput] = useState({ key: '', value: '' })

  const handleAddTag = () => {
    if (tagInput.key.trim()) {
      setConfig((p) => ({ ...p, tags: { ...p.tags, [tagInput.key]: tagInput.value } }))
      setTagInput({ key: '', value: '' })
    }
  }

  const handleRemoveTag = (k: string) => setConfig((p) => ({ ...p, tags: Object.fromEntries(Object.entries(p.tags).filter(([key]) => key !== k)) }))

  const validate = () => {
    const e: Record<string,string> = {}
    if (!config.name.trim()) e.name = 'Subnet Name is required'
    if (!config.vpcId.trim()) e.vpc = 'VPC must be selected'
    if (!config.cidr.trim() || !cidrValid(config.cidr)) e.cidr = 'CIDR Block is required and must be valid (e.g. 10.0.1.0/24)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
    onClose()
  }

  return (
    <AwsResourceModal title="Subnet Configuration" subtitle="Configure the settings for your Subnet" isOpen={isOpen} onClose={onClose} onSave={handleSave} sections={SECTIONS}>
      <AwsResourceSection sectionId="settings" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Subnet Name" required>
            <Input value={config.name} onChange={(e) => setConfig((p) => ({ ...p, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </FormField>

          <FormField label="VPC" required>
            <select value={config.vpcId} onChange={(e) => setConfig((p) => ({ ...p, vpcId: e.target.value }))} className="w-full rounded border p-2">
              <option value="vpc-default">vpc-default</option>
            </select>
            {errors.vpc && <p className="text-xs text-red-600">{errors.vpc}</p>}
          </FormField>

          <FormField label="CIDR Block" required>
            <Input value={config.cidr} onChange={(e) => setConfig((p) => ({ ...p, cidr: e.target.value }))} />
            {errors.cidr && <p className="text-xs text-red-600">{errors.cidr}</p>}
          </FormField>

          <FormField label="Availability Zone">
            <select value={config.availabilityZone} onChange={(e) => setConfig((p) => ({ ...p, availabilityZone: e.target.value }))} className="w-full rounded border p-2">
              <option>us-east-1a</option>
              <option>us-east-1b</option>
            </select>
          </FormField>
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="publicip" activeSection={activeSection}>
        <label className="flex items-center gap-2"><input type="checkbox" checked={config.autoAssignPublicIp} onChange={(e) => setConfig((p) => ({ ...p, autoAssignPublicIp: e.target.checked }))} /> <span>Enable auto-assignment of public IPv4 addresses</span></label>
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
              <button className="text-xs text-red-600" onClick={() => handleRemoveTag(k)}>Remove</button>
            </div>
          ))}
        </div>
      </AwsResourceSection>
    </AwsResourceModal>
  )
}
