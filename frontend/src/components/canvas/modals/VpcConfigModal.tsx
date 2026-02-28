import { useState } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export interface VpcConfig {
  name: string
  cidr: string
  tenancy: 'default' | 'dedicated'
  dnsHostnames: boolean
  dnsResolution: boolean
  tags: Record<string,string>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (cfg: VpcConfig) => void
  initialConfig?: Partial<VpcConfig>
}

const SECTIONS = [
  { id: 'vpc', label: 'VPC Settings' },
  { id: 'dns', label: 'DNS Settings' },
  { id: 'tags', label: 'Tags' },
]

const cidrValid = (c: string) => /^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(c)

export default function VpcConfigModal({ isOpen, onClose, onSave, initialConfig = {} }: Props) {
  const [config, setConfig] = useState<VpcConfig>({
    name: initialConfig.name || 'vpc-custom',
    cidr: initialConfig.cidr || '10.0.0.0/16',
    tenancy: initialConfig.tenancy || 'default',
    dnsHostnames: !!initialConfig.dnsHostnames,
    dnsResolution: !!initialConfig.dnsResolution,
    tags: initialConfig.tags || {},
  })

  const [activeSection] = useState('vpc')
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
    if (!config.name.trim()) e.name = 'VPC Name is required'
    if (!config.cidr.trim() || !cidrValid(config.cidr)) e.cidr = 'CIDR Block is required and must be valid (e.g. 10.0.0.0/16)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
    onClose()
  }

  return (
    <AwsResourceModal title="VPC Configuration" subtitle="Configure the settings for your Virtual Private Cloud" isOpen={isOpen} onClose={onClose} onSave={handleSave} sections={SECTIONS}>
      <AwsResourceSection sectionId="vpc" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="VPC Name" required>
            <Input value={config.name} onChange={(e) => setConfig((p) => ({ ...p, name: e.target.value }))} />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </FormField>

          <FormField label="CIDR Block" required>
            <Input value={config.cidr} onChange={(e) => setConfig((p) => ({ ...p, cidr: e.target.value }))} />
            {errors.cidr && <p className="text-xs text-red-600">{errors.cidr}</p>}
          </FormField>

          <FormField label="Tenancy">
            <div className="space-x-4">
              <label className="inline-flex items-center"><input type="radio" name="tenancy" checked={config.tenancy === 'default'} onChange={() => setConfig((p) => ({ ...p, tenancy: 'default' }))} /> <span className="ml-2">Default</span></label>
              <label className="inline-flex items-center"><input type="radio" name="tenancy" checked={config.tenancy === 'dedicated'} onChange={() => setConfig((p) => ({ ...p, tenancy: 'dedicated' }))} /> <span className="ml-2">Dedicated</span></label>
            </div>
          </FormField>
        </div>
      </AwsResourceSection>

      <AwsResourceSection sectionId="dns" activeSection={activeSection}>
        <div className="space-y-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.dnsHostnames} onChange={(e) => setConfig((p) => ({ ...p, dnsHostnames: e.target.checked }))} /> <span>Enable DNS hostnames for instances launched in this VPC</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={config.dnsResolution} onChange={(e) => setConfig((p) => ({ ...p, dnsResolution: e.target.checked }))} /> <span>Enable DNS resolution (Route 53 resolver)</span></label>
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
