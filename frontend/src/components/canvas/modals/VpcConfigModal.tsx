import { useState } from 'react'
import { Lock, Minus, Plus } from 'lucide-react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import type { VpcConfig } from '../../../types/aws-resources'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (cfg: VpcConfig) => void
  initialConfig?: Partial<VpcConfig>
}

const SECTIONS = [
  { id: 'network', label: 'Network Configuration' },
  { id: 'ipv6',    label: 'IPv6' },
  { id: 'ipam',    label: 'IPAM' },
  { id: 'tags',    label: 'Tags' },
  { id: 'info',    label: 'Resource Info' },
]

const cidrValid = (c: string) => /^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(c)

// ── Inline toggle switch ──────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1"
      style={{ backgroundColor: checked ? '#FF9900' : '#D1D5DB' }}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}

// ── Toggle row (label + toggle side by side) ──────────────────────────────────
function ToggleRow({
  label, hint, checked, onChange,
}: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{label}</p>
        {hint && <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

// ── Read-only info row ────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: '#E5E7EB' }}>
      <Lock size={12} className="flex-shrink-0" style={{ color: '#9CA3AF' }} />
      <span className="text-sm w-48 flex-shrink-0" style={{ color: '#6B7280' }}>{label}</span>
      <span className="text-sm font-mono flex-1" style={{ color: value ? '#1F2937' : '#9CA3AF' }}>
        {value || '—'}
      </span>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function VpcConfigModal({ isOpen, onClose, onSave, initialConfig = {} }: Props) {
  const [config, setConfig] = useState<VpcConfig>({
    name:                                   initialConfig.name                                   ?? 'vpc-main',
    cidr_block:                             initialConfig.cidr_block                             ?? '10.0.0.0/16',
    instance_tenancy:                       initialConfig.instance_tenancy                       ?? 'default',
    enable_dns_support:                     initialConfig.enable_dns_support                     ?? true,
    enable_dns_hostnames:                   initialConfig.enable_dns_hostnames                   ?? false,
    enable_network_address_usage_metrics:   initialConfig.enable_network_address_usage_metrics   ?? false,
    assign_generated_ipv6_cidr_block:       initialConfig.assign_generated_ipv6_cidr_block       ?? false,
    ipv6_cidr_block:                        initialConfig.ipv6_cidr_block                        ?? '',
    ipv6_netmask_length:                    initialConfig.ipv6_netmask_length                    ?? '',
    ipv6_cidr_block_network_border_group:   initialConfig.ipv6_cidr_block_network_border_group   ?? '',
    ipv4_ipam_pool_id:                      initialConfig.ipv4_ipam_pool_id                      ?? '',
    ipv4_netmask_length:                    initialConfig.ipv4_netmask_length                    ?? '',
    ipv6_ipam_pool_id:                      initialConfig.ipv6_ipam_pool_id                      ?? '',
    tags:                                   initialConfig.tags                                   ?? {},
    arn:                                    initialConfig.arn,
    vpc_id:                                 initialConfig.vpc_id,
    owner_id:                               initialConfig.owner_id,
    default_security_group_id:              initialConfig.default_security_group_id,
    main_route_table_id:                    initialConfig.main_route_table_id,
  })

  const set = <K extends keyof VpcConfig>(k: K, v: VpcConfig[K]) =>
    setConfig((p) => ({ ...p, [k]: v }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState({ key: '', value: '' })

  const handleAddTag = () => {
    if (!tagInput.key.trim()) return
    set('tags', { ...config.tags, [tagInput.key.trim()]: tagInput.value.trim() })
    setTagInput({ key: '', value: '' })
  }

  const handleRemoveTag = (k: string) =>
    set('tags', Object.fromEntries(Object.entries(config.tags).filter(([key]) => key !== k)))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!config.name.trim())                              e.name       = 'VPC Name is required'
    if (!config.cidr_block.trim() || !cidrValid(config.cidr_block))
                                                          e.cidr_block = 'Valid CIDR required (e.g. 10.0.0.0/16)'
    if (config.ipv6_netmask_length) {
      const n = Number(config.ipv6_netmask_length)
      if (isNaN(n) || n < 44 || n > 60 || (n - 44) % 4 !== 0)
        e.ipv6_netmask_length = 'Must be 44–60, in increments of 4'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
    onClose()
  }

  return (
    <AwsResourceModal
      title="VPC Configuration"
      subtitle="Configure settings for your aws_vpc Terraform resource"
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      sections={SECTIONS}
    >
      {/* ── SECTION 1: Network ─────────────────────────────────────────── */}
      <AwsResourceSection sectionId="network">
        <div className="space-y-5">
          <FormField label="VPC Name" required>
            <Input
              value={config.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="vpc-main"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </FormField>

          <FormField label="IPv4 CIDR Block" required hint="The IPv4 CIDR block for the VPC.">
            <Input
              value={config.cidr_block}
              onChange={(e) => set('cidr_block', e.target.value)}
              placeholder="10.0.0.0/16"
            />
            {errors.cidr_block && <p className="text-xs text-red-600">{errors.cidr_block}</p>}
          </FormField>

          <FormField label="Instance Tenancy" hint="Tenancy option for instances launched into the VPC.">
            <select
              value={config.instance_tenancy}
              onChange={(e) => set('instance_tenancy', e.target.value as 'default' | 'dedicated')}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              style={{ borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', color: '#1F2937' }}
            >
              <option value="default">default</option>
              <option value="dedicated">dedicated</option>
            </select>
          </FormField>

          <div className="rounded-lg border p-4 space-y-1" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>DNS Settings</p>
            <ToggleRow
              label="Enable DNS Support"
              hint="enable_dns_support — Defaults to true."
              checked={config.enable_dns_support}
              onChange={(v) => set('enable_dns_support', v)}
            />
            <ToggleRow
              label="Enable DNS Hostnames"
              hint="enable_dns_hostnames — Defaults to false."
              checked={config.enable_dns_hostnames}
              onChange={(v) => set('enable_dns_hostnames', v)}
            />
            <ToggleRow
              label="Enable Network Address Usage Metrics"
              hint="enable_network_address_usage_metrics — Defaults to false."
              checked={config.enable_network_address_usage_metrics}
              onChange={(v) => set('enable_network_address_usage_metrics', v)}
            />
          </div>
        </div>
      </AwsResourceSection>

      {/* ── SECTION 2: IPv6 ────────────────────────────────────────────── */}
      <AwsResourceSection sectionId="ipv6">
        <div className="space-y-5">
          <div className="rounded-lg border p-4" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
            <ToggleRow
              label="Assign Generated IPv6 CIDR Block"
              hint="assign_generated_ipv6_cidr_block — Requests an Amazon-provided IPv6 CIDR block."
              checked={config.assign_generated_ipv6_cidr_block}
              onChange={(v) => set('assign_generated_ipv6_cidr_block', v)}
            />
          </div>

          <FormField label="IPv6 CIDR Block" hint="ipv6_cidr_block — IPv6 CIDR block from an IPAM pool. Conflicts with assign_generated_ipv6_cidr_block.">
            <Input
              value={config.ipv6_cidr_block}
              onChange={(e) => set('ipv6_cidr_block', e.target.value)}
              placeholder="Derived from IPAM if empty"
              disabled={config.assign_generated_ipv6_cidr_block}
            />
          </FormField>

          <FormField label="IPv6 Netmask Length" hint="ipv6_netmask_length — Netmask length of IPv6 CIDR. Must be 44–60 in increments of 4." error={errors.ipv6_netmask_length}>
            <Input
              type="number"
              value={config.ipv6_netmask_length}
              onChange={(e) => set('ipv6_netmask_length', e.target.value)}
              placeholder="44 to 60, step 4"
              min={44}
              max={60}
              step={4}
            />
          </FormField>

          <FormField label="IPv6 Network Border Group" hint="ipv6_cidr_block_network_border_group — Name of the location from which the IPv6 CIDR block is advertised.">
            <Input
              value={config.ipv6_cidr_block_network_border_group}
              onChange={(e) => set('ipv6_cidr_block_network_border_group', e.target.value)}
              placeholder="e.g. us-east-1"
            />
          </FormField>
        </div>
      </AwsResourceSection>

      {/* ── SECTION 3: IPAM ────────────────────────────────────────────── */}
      <AwsResourceSection sectionId="ipam">
        <div className="space-y-5">
          <div className="rounded-lg border p-3 text-xs" style={{ borderColor: '#FED7AA', backgroundColor: '#FFF7ED', color: '#92400E' }}>
            IPAM fields are optional. When using IPAM, leave <code>cidr_block</code> empty and set <code>ipv4_netmask_length</code> instead.
          </div>

          <FormField label="IPv4 IPAM Pool ID" hint="ipv4_ipam_pool_id — The ID of an IPv4 IPAM pool.">
            <Input
              value={config.ipv4_ipam_pool_id}
              onChange={(e) => set('ipv4_ipam_pool_id', e.target.value)}
              placeholder="ipam-pool-xxxxxxxxx"
            />
          </FormField>

          <FormField label="IPv4 Netmask Length" hint="ipv4_netmask_length — Netmask length to request from IPAM pool.">
            <Input
              type="number"
              value={config.ipv4_netmask_length}
              onChange={(e) => set('ipv4_netmask_length', e.target.value)}
              placeholder="e.g. 24"
              min={0}
              max={32}
            />
          </FormField>

          <FormField label="IPv6 IPAM Pool ID" hint="ipv6_ipam_pool_id — The ID of an IPv6 IPAM pool.">
            <Input
              value={config.ipv6_ipam_pool_id}
              onChange={(e) => set('ipv6_ipam_pool_id', e.target.value)}
              placeholder="ipam-pool-xxxxxxxxx"
            />
          </FormField>
        </div>
      </AwsResourceSection>

      {/* ── SECTION 4: Tags ────────────────────────────────────────────── */}
      <AwsResourceSection sectionId="tags">
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Key</p>
              <Input
                placeholder="e.g. Name"
                value={tagInput.key}
                onChange={(e) => setTagInput((p) => ({ ...p, key: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Value</p>
              <Input
                placeholder="e.g. main"
                value={tagInput.value}
                onChange={(e) => setTagInput((p) => ({ ...p, value: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
            </div>
            <Button size="sm" variant="secondary" onClick={handleAddTag}>
              <Plus size={14} className="mr-1" /> Add Tag
            </Button>
          </div>

          {Object.keys(config.tags).length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>No tags added yet.</p>
          ) : (
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
              <div className="grid grid-cols-[1fr_1fr_auto] px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: '#F9FAFB', color: '#6B7280' }}>
                <span>Key</span>
                <span>Value</span>
                <span />
              </div>
              {Object.entries(config.tags).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_1fr_auto] px-4 py-2.5 border-t items-center" style={{ borderColor: '#E5E7EB' }}>
                  <span className="text-sm font-mono" style={{ color: '#1F2937' }}>{k}</span>
                  <span className="text-sm font-mono" style={{ color: '#4B5563' }}>{v}</span>
                  <button onClick={() => handleRemoveTag(k)} className="p-1 rounded hover:bg-red-50 transition-colors">
                    <Minus size={14} style={{ color: '#DC2626' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AwsResourceSection>

      {/* ── SECTION 5: Resource Info (read-only) ───────────────────────── */}
      <AwsResourceSection sectionId="info">
        <div className="space-y-2">
          <div className="rounded-lg border p-3 text-xs mb-4" style={{ borderColor: '#BFDBFE', backgroundColor: '#EFF6FF', color: '#1E40AF' }}>
            These attributes are populated by AWS after the resource is created. They are read-only in Terraform.
          </div>
          <InfoRow label="ARN"                        value={config.arn} />
          <InfoRow label="VPC ID"                     value={config.vpc_id} />
          <InfoRow label="Owner ID"                   value={config.owner_id} />
          <InfoRow label="Default Security Group ID"  value={config.default_security_group_id} />
          <InfoRow label="Main Route Table ID"        value={config.main_route_table_id} />
        </div>
      </AwsResourceSection>
    </AwsResourceModal>
  )
}
