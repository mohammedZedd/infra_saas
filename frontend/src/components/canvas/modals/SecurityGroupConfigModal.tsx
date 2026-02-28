import { useState } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export interface SGRule {
  id: string
  type: string
  protocol: string
  portRange: string
  cidrOrSource: string
}

export interface SecurityGroupConfig {
  name: string
  description: string
  vpcId: string
  vpcCidr?: string
  inboundRules: SGRule[]
  outboundRules: SGRule[]
  tags: Record<string, string>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (cfg: SecurityGroupConfig) => void
  initialConfig?: Partial<SecurityGroupConfig>
}

const SECTIONS = [
  { id: 'details', label: 'Details' },
  { id: 'inbound', label: 'Inbound Rules' },
  { id: 'outbound', label: 'Outbound Rules' },
  { id: 'tags', label: 'Tags' },
]

export default function SecurityGroupConfigModal({ isOpen, onClose, onSave, initialConfig = {} }: Props) {
  const [config, setConfig] = useState<SecurityGroupConfig>({
    name: initialConfig.name || 'sg-custom',
    description: initialConfig.description || '',
    vpcId: initialConfig.vpcId || 'vpc-default',
    vpcCidr: initialConfig.vpcCidr || '10.0.0.0/16',
    inboundRules: initialConfig.inboundRules || [],
    outboundRules: initialConfig.outboundRules || [{ id: 'eg-1', type: 'All Traffic', protocol: 'All', portRange: 'All', cidrOrSource: '0.0.0.0/0' }],
    tags: initialConfig.tags || {},
  })

  const [activeSection] = useState('details')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState({ key: '', value: '' })

  const addRule = (which: 'inbound' | 'outbound') => {
    const rule: SGRule = { id: `r-${Date.now()}`, type: 'Custom TCP', protocol: 'TCP', portRange: '80', cidrOrSource: '0.0.0.0/0' }
    setConfig((prev) => ({ ...prev, [which === 'inbound' ? 'inboundRules' : 'outboundRules']: [...(which === 'inbound' ? prev.inboundRules : prev.outboundRules), rule] }))
  }

  const removeRule = (which: 'inbound' | 'outbound', id: string) => {
    setConfig((prev) => ({ ...prev, [which === 'inbound' ? 'inboundRules' : 'outboundRules']: (which === 'inbound' ? prev.inboundRules : prev.outboundRules).filter(r => r.id !== id) }))
  }

  const handleAddTag = () => {
    if (tagInput.key.trim()) {
      setConfig((prev) => ({ ...prev, tags: { ...prev.tags, [tagInput.key]: tagInput.value } }))
      setTagInput({ key: '', value: '' })
    }
  }

  const handleRemoveTag = (k: string) => setConfig((prev) => ({ ...prev, tags: Object.fromEntries(Object.entries(prev.tags).filter(([key]) => key !== k)) }))

  const validate = () => {
    const e: Record<string,string> = {}
    if (!config.name || !config.name.trim()) e.name = 'Security Group name is required'
    if (!config.description || !config.description.trim()) e.description = 'Description is required'
    if ((config.inboundRules.length === 0) && (config.outboundRules.length === 0)) e.rules = 'At least one inbound or outbound rule is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
    onClose()
  }

  return (
    <AwsResourceModal title="Security Group Configuration" subtitle="Configure the rules for your Security Group" isOpen={isOpen} onClose={onClose} onSave={handleSave} sections={SECTIONS}>
      <AwsResourceSection sectionId="details" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Security Group Name" required>
            <Input value={config.name} onChange={(e) => setConfig((p) => ({ ...p, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </FormField>

          <FormField label="Description" required>
            <textarea value={config.description} onChange={(e) => setConfig((p) => ({ ...p, description: e.target.value }))} className="w-full rounded border p-2" />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
          </FormField>

          <FormField label="VPC">
            <select value={config.vpcId} onChange={(e) => setConfig((p) => ({ ...p, vpcId: e.target.value }))} className="w-full rounded border p-2">
              <option value="vpc-default">vpc-default ({config.vpcCidr})</option>
            </select>
          </FormField>
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="inbound" activeSection={activeSection}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => addRule('inbound')}>Add Rule</Button>
          </div>
          {config.inboundRules.map((r) => (
            <div key={r.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
              <div className="text-sm">{r.type} • {r.protocol} • {r.portRange} • {r.cidrOrSource}</div>
              <button className="text-xs text-red-600" onClick={() => removeRule('inbound', r.id)}>Remove</button>
            </div>
          ))}
          {errors.rules && <p className="text-xs text-red-600">{errors.rules}</p>}
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="outbound" activeSection={activeSection}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => addRule('outbound')}>Add Rule</Button>
          </div>
          {config.outboundRules.map((r) => (
            <div key={r.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
              <div className="text-sm">{r.type} • {r.protocol} • {r.portRange} • {r.cidrOrSource}</div>
              <button className="text-xs text-red-600" onClick={() => removeRule('outbound', r.id)}>Remove</button>
            </div>
          ))}
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
              <button className="text-xs text-red-600" onClick={() => handleRemoveTag(k)}>Remove</button>
            </div>
          ))}
        </div>
      </AwsResourceSection>
    </AwsResourceModal>
  )
}
