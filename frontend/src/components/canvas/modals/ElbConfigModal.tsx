import { useState } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export interface Listener {
  id: string
  protocol: string
  port: number
  targetGroup?: string
  sslCert?: string
}

export interface ElbConfig {
  name: string
  type: 'ALB' | 'NLB' | 'CLB'
  vpcId: string
  subnets: string[]
  listeners: Listener[]
  healthCheck: {
    protocol: string
    port: number
    path?: string
    healthyThreshold: number
    unhealthyThreshold: number
    timeout: number
    interval: number
  }
  securityGroups: string[]
  internal: boolean
  tags: Record<string,string>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (cfg: ElbConfig) => void
  initialConfig?: Partial<ElbConfig>
}

const SECTIONS = [
  { id: 'details', label: 'Load Balancer Details' },
  { id: 'listeners', label: 'Listeners' },
  { id: 'health', label: 'Health Checks' },
  { id: 'security', label: 'Security' },
  { id: 'tags', label: 'Tags' },
]

export default function ElbConfigModal({ isOpen, onClose, onSave, initialConfig = {} }: Props) {
  const [config, setConfig] = useState<ElbConfig>({
    name: initialConfig.name || 'lb-1',
    type: initialConfig.type || 'ALB',
    vpcId: initialConfig.vpcId || 'vpc-default',
    subnets: initialConfig.subnets || ['subnet-1'],
    listeners: initialConfig.listeners || [],
    healthCheck: initialConfig.healthCheck || { protocol: 'HTTP', port: 80, path: '/healthcheck', healthyThreshold: 2, unhealthyThreshold: 2, timeout: 5, interval: 30 },
    securityGroups: initialConfig.securityGroups || [],
    internal: !!initialConfig.internal,
    tags: initialConfig.tags || {},
  })

  const [activeSection] = useState('details')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [tagInput, setTagInput] = useState({ key: '', value: '' })

  const addListener = () => setConfig((p) => ({ ...p, listeners: [...p.listeners, { id: `l-${Date.now()}`, protocol: 'HTTP', port: 80 }] }))
  const removeListener = (id: string) => setConfig((p) => ({ ...p, listeners: p.listeners.filter(l => l.id !== id) }))

  const handleAddTag = () => {
    if (tagInput.key.trim()) {
      setConfig((p) => ({ ...p, tags: { ...p.tags, [tagInput.key]: tagInput.value } }))
      setTagInput({ key: '', value: '' })
    }
  }

  const validate = () => {
    const e: Record<string,string> = {}
    if (!config.name.trim()) e.name = 'Load Balancer Name is required'
    if (config.listeners.length === 0) e.listeners = 'At least one listener is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
    onClose()
  }

  return (
    <AwsResourceModal title="Load Balancer Configuration" subtitle="Configure the settings for your Elastic Load Balancer" isOpen={isOpen} onClose={onClose} onSave={handleSave} sections={SECTIONS}>
      <AwsResourceSection sectionId="details" activeSection={activeSection}>
        <div className="space-y-3">
          <FormField label="Load Balancer Name" required>
            <Input value={config.name} onChange={(e) => setConfig((p) => ({ ...p, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </FormField>

          <FormField label="Type">
            <div className="space-x-3">
              <label className="inline-flex items-center"><input type="radio" checked={config.type === 'ALB'} onChange={() => setConfig((p) => ({ ...p, type: 'ALB' }))} /> <span className="ml-2">Application Load Balancer (ALB)</span></label>
              <label className="inline-flex items-center"><input type="radio" checked={config.type === 'NLB'} onChange={() => setConfig((p) => ({ ...p, type: 'NLB' }))} /> <span className="ml-2">Network Load Balancer (NLB)</span></label>
            </div>
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

      <AwsResourceSection sectionId="listeners" activeSection={activeSection}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={addListener}>Add Listener</Button>
          </div>
          {config.listeners.map(l => (
            <div key={l.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
              <div className="text-sm">{l.protocol} • {l.port} • {l.targetGroup || 'no target'}</div>
              <button className="text-xs text-red-600" onClick={() => removeListener(l.id)}>Remove</button>
            </div>
          ))}
          {errors.listeners && <p className="text-xs text-red-600">{errors.listeners}</p>}
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="health" activeSection={activeSection}>
        <div className="space-y-2">
          <FormField label="Health Check Protocol">
            <select value={config.healthCheck.protocol} onChange={(e) => setConfig((p) => ({ ...p, healthCheck: { ...p.healthCheck, protocol: e.target.value } }))} className="w-full rounded border p-2">
              <option>HTTP</option>
              <option>TCP</option>
            </select>
          </FormField>

          <FormField label="Health Check Port">
            <Input type="number" value={String(config.healthCheck.port)} onChange={(e) => setConfig((p) => ({ ...p, healthCheck: { ...p.healthCheck, port: Number(e.target.value) } }))} />
          </FormField>

          <FormField label="Ping Path">
            <Input value={config.healthCheck.path || ''} onChange={(e) => setConfig((p) => ({ ...p, healthCheck: { ...p.healthCheck, path: e.target.value } }))} />
          </FormField>
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="security" activeSection={activeSection}>
        <div className="space-y-3">
          <FormField label="Security Groups">
            <select multiple value={config.securityGroups} onChange={(e) => setConfig((p) => ({ ...p, securityGroups: Array.from(e.target.selectedOptions, o => o.value) }))} className="w-full rounded border p-2">
              <option>sg-default</option>
            </select>
          </FormField>

          <label className="flex items-center gap-2"><input type="checkbox" checked={config.internal} onChange={(e) => setConfig((p) => ({ ...p, internal: e.target.checked }))} /> <span>Make this Load Balancer internal only</span></label>
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
