import { useState, useCallback } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export interface S3Config {
  // General Settings
  bucketName: string
  region: string

  // Versioning
  versioning: boolean

  // Public Access
  blockPublicAcl: boolean
  blockPublicPolicy: boolean
  ignorePublicAcl: boolean
  restrictPublicBuckets: boolean

  // Encryption
  encryption: 'none' | 'sse-s3' | 'sse-kms'
  kmsKeyId?: string

  // Tags
  tags: Record<string, string>

  // Lifecycle Rules
  lifecycleRules: Array<{
    id: string
    prefix: string
    expirationDays?: number
    transitionToGlacierDays?: number
  }>
}

interface S3ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: S3Config) => void
  initialConfig?: Partial<S3Config>
}

const AWS_REGIONS = [
  { value: 'us-east-1', label: 'N. Virginia (us-east-1)' },
  { value: 'us-east-2', label: 'Ohio (us-east-2)' },
  { value: 'us-west-1', label: 'N. California (us-west-1)' },
  { value: 'eu-west-1', label: 'Ireland (eu-west-1)' },
  { value: 'eu-central-1', label: 'Frankfurt (eu-central-1)' },
  { value: 'ap-southeast-1', label: 'Singapore (ap-southeast-1)' },
]

const SECTIONS = [
  { id: 'general', label: 'General Settings', icon: '⚙️' },
  { id: 'versioning', label: 'Versioning', icon: '📝' },
  { id: 'access', label: 'Block Public Access', icon: '🔐' },
  { id: 'encryption', label: 'Encryption', icon: '🔒' },
  { id: 'lifecycle', label: 'Lifecycle Rules', icon: '♻️' },
  { id: 'tags', label: 'Tags', icon: '🏷️' },
]

export function S3ConfigModal({
  isOpen,
  onClose,
  onSave,
  initialConfig = {},
}: S3ConfigModalProps) {
  const [config, setConfig] = useState<S3Config>({
    bucketName: initialConfig.bucketName || 'my-bucket',
    region: initialConfig.region || 'us-east-1',
    versioning: initialConfig.versioning ?? false,
    blockPublicAcl: initialConfig.blockPublicAcl ?? true,
    blockPublicPolicy: initialConfig.blockPublicPolicy ?? true,
    ignorePublicAcl: initialConfig.ignorePublicAcl ?? true,
    restrictPublicBuckets: initialConfig.restrictPublicBuckets ?? true,
    encryption: initialConfig.encryption || 'none',
    kmsKeyId: initialConfig.kmsKeyId,
    tags: initialConfig.tags || {},
    lifecycleRules: initialConfig.lifecycleRules || [],
  })

  const [activeSection] = useState('general')
  // activeSection is used by AwsResourceModal via prop, setActiveSection managed by parent
  const [tagInput, setTagInput] = useState({ key: '', value: '' })
  const [lifecycleInput, setLifecycleInput] = useState({ prefix: '', expirationDays: '', transitionDays: '' })
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

  const handleRemoveTag = useCallback((key: string) => {
    setConfig((prev) => ({
      ...prev,
      tags: Object.fromEntries(Object.entries(prev.tags).filter(([k]) => k !== key)),
    }))
  }, [])

  const handleAddLifecycleRule = useCallback(() => {
    if (lifecycleInput.prefix.trim()) {
      setConfig((prev) => ({
        ...prev,
        lifecycleRules: [
          ...prev.lifecycleRules,
          {
            id: `rule-${Date.now()}`,
            prefix: lifecycleInput.prefix,
            expirationDays: lifecycleInput.expirationDays ? parseInt(lifecycleInput.expirationDays) : undefined,
            transitionToGlacierDays: lifecycleInput.transitionDays ? parseInt(lifecycleInput.transitionDays) : undefined,
          },
        ],
      }))
      setLifecycleInput({ prefix: '', expirationDays: '', transitionDays: '' })
    }
  }, [lifecycleInput])

  const validate = () => {
    const e: Record<string, string> = {}
    const name = config.bucketName || ''
    const nameRegex = /^[a-z0-9.-]{3,63}$/
    if (!nameRegex.test(name)) e.bucketName = 'Bucket name must be 3-63 lowercase letters, numbers, dots or hyphens'
    if (!config.region) e.region = 'Region is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
  }

  return (
    <AwsResourceModal
      title="S3 Bucket Configuration"
      subtitle="Configure the settings for your S3 bucket"
      isOpen={isOpen}
      onClose={onClose}
      sections={SECTIONS}
      onSave={handleSave}
    >
      {/* General Settings */}
      <AwsResourceSection sectionId="general" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Bucket Name" required hint="Must be globally unique across all AWS accounts">
            <Input
              value={config.bucketName}
              onChange={(e) => setConfig((prev) => ({ ...prev, bucketName: e.target.value }))}
              placeholder="my-bucket"
            />
            {errors.bucketName && <p className="text-xs text-red-600">{errors.bucketName}</p>}
          </FormField>

          <FormField label="Region" required>
            <select
              value={config.region}
              onChange={(e) => setConfig((prev) => ({ ...prev, region: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {AWS_REGIONS.map((region) => (
                <option key={region.value} value={region.value}>{region.label}</option>
              ))}
            </select>
            {errors.region && <p className="text-xs text-red-600">{errors.region}</p>}
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Versioning */}
      <AwsResourceSection sectionId="versioning" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Versioning" hint="Enable versioning to keep multiple versions of objects in this bucket">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.versioning}
                onChange={(e) => setConfig((prev) => ({ ...prev, versioning: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Enable Versioning</span>
            </label>
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Block Public Access */}
      <AwsResourceSection sectionId="access" activeSection={activeSection}>
        <div className="space-y-4 bg-yellow-50 p-4 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800">AWS recommends blocking all public access for most buckets</p>
        </div>

        <FormField label="Block Public ACLs" hint="Block public ACLs for this bucket and any objects within it">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.blockPublicAcl}
              onChange={(e) => setConfig((prev) => ({ ...prev, blockPublicAcl: e.target.checked }))}
            />
            <span className="text-sm text-gray-700">Block public ACLs</span>
          </label>
        </FormField>

        <FormField label="Block Public Policies" hint="Block public bucket policies">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.blockPublicPolicy}
              onChange={(e) => setConfig((prev) => ({ ...prev, blockPublicPolicy: e.target.checked }))}
            />
            <span className="text-sm text-gray-700">Block public bucket policies</span>
          </label>
        </FormField>

        <FormField label="Ignore Public ACLs" hint="Ignore existing public ACLs on this bucket and any objects within it">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.ignorePublicAcl}
              onChange={(e) => setConfig((prev) => ({ ...prev, ignorePublicAcl: e.target.checked }))}
            />
            <span className="text-sm text-gray-700">Ignore existing public ACLs</span>
          </label>
        </FormField>

        <FormField label="Restrict Public Buckets" hint="Restrict access to this bucket to only AWS principals">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.restrictPublicBuckets}
              onChange={(e) => setConfig((prev) => ({ ...prev, restrictPublicBuckets: e.target.checked }))}
            />
            <span className="text-sm text-gray-700">Restrict public bucket access</span>
          </label>
        </FormField>
      </AwsResourceSection>

      {/* Encryption */}
      <AwsResourceSection sectionId="encryption" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Default Encryption">
            <select
              value={config.encryption}
              onChange={(e) => setConfig((prev) => ({ ...prev, encryption: e.target.value as any }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="none">No encryption</option>
              <option value="sse-s3">SSE-S3 (AWS managed keys)</option>
              <option value="sse-kms">SSE-KMS (Customer managed keys)</option>
            </select>
          </FormField>

          {config.encryption === 'sse-kms' && (
            <FormField label="KMS Master Key ID" hint="ARN of the KMS key to use">
              <Input
                value={config.kmsKeyId || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, kmsKeyId: e.target.value }))}
                placeholder="arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
              />
            </FormField>
          )}
        </div>
      </AwsResourceSection>

      {/* Lifecycle Rules */}
      <AwsResourceSection sectionId="lifecycle" activeSection={activeSection}>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Prefix (e.g., logs/)"
                value={lifecycleInput.prefix}
                onChange={(e) => setLifecycleInput((prev) => ({ ...prev, prefix: e.target.value }))}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Expire after (days)"
                value={lifecycleInput.expirationDays}
                onChange={(e) => setLifecycleInput((prev) => ({ ...prev, expirationDays: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Transition to Glacier (days)"
                value={lifecycleInput.transitionDays}
                onChange={(e) => setLifecycleInput((prev) => ({ ...prev, transitionDays: e.target.value }))}
              />
            </div>
            <Button size="sm" variant="secondary" onClick={handleAddLifecycleRule} className="w-full">
              Add Rule
            </Button>
          </div>

          {config.lifecycleRules.map((rule) => (
            <div key={rule.id} className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
              <p className="font-medium text-gray-900">Prefix: {rule.prefix}</p>
              <p className="text-gray-700">
                {rule.expirationDays && `Expire after ${rule.expirationDays} days`}
                {rule.transitionToGlacierDays && ` • Glacier after ${rule.transitionToGlacierDays} days`}
              </p>
            </div>
          ))}
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
    </AwsResourceModal>
  )
}

export default S3ConfigModal
