import { useState } from 'react'
import AwsResourceModal, { AwsResourceSection, FormField } from './AwsResourceModal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export interface LambdaConfig {
  // Basic Settings
  functionName: string
  runtime: string
  handler: string

  // Memory & Timeout
  memory: number // 128 to 10240 MB
  timeout: number // seconds

  // Triggers (Mocked)
  triggers: Array<{
    id: string
    type: 'api-gateway' | 's3' | 'dynamodb' | 'sqs' | 'eventbridge'
    name: string
  }>

  // Environment Variables
  environmentVariables: Record<string, string>

  // IAM Role
  iamRoleName: string

  // Tags
  tags: Record<string, string>
}

interface LambdaConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: LambdaConfig) => void
  initialConfig?: Partial<LambdaConfig>
}

const RUNTIMES = [
  'nodejs20.x',
  'nodejs18.x',
  'python3.11',
  'python3.10',
  'java17',
  'java11',
  'go1.x',
  'dotnet8',
  'dotnet6',
  'ruby3.3',
]

const TRIGGER_TYPES = [
  { value: 'api-gateway', label: 'API Gateway' },
  { value: 's3', label: 'S3' },
  { value: 'dynamodb', label: 'DynamoDB Streams' },
  { value: 'sqs', label: 'SQS' },
  { value: 'eventbridge', label: 'EventBridge' },
]

const IAM_ROLES = [
  'lambda-basic-execution',
  'lambda-s3-read',
  'lambda-dynamodb-full',
  'lambda-custom-role',
]

const SECTIONS = [
  { id: 'basic', label: 'Basic Settings', icon: '⚙️' },
  { id: 'memory', label: 'Memory & Timeout', icon: '⏱️' },
  { id: 'triggers', label: 'Triggers', icon: '🔔' },
  { id: 'env', label: 'Environment Variables', icon: '📝' },
  { id: 'iam', label: 'IAM Role', icon: '👤' },
  { id: 'tags', label: 'Tags', icon: '🏷️' },
]

export function LambdaConfigModal({
  isOpen,
  onClose,
  onSave,
  initialConfig = {},
}: LambdaConfigModalProps) {
  const [config, setConfig] = useState<LambdaConfig>({
    functionName: initialConfig.functionName || 'my-function',
    runtime: initialConfig.runtime || 'nodejs20.x',
    handler: initialConfig.handler || 'index.handler',
    memory: initialConfig.memory || 256,
    timeout: initialConfig.timeout || 30,
    triggers: initialConfig.triggers || [],
    environmentVariables: initialConfig.environmentVariables || {},
    iamRoleName: initialConfig.iamRoleName || 'lambda-basic-execution',
    tags: initialConfig.tags || {},
  })

  const [activeSection] = useState('basic')
  // activeSection is used by AwsResourceModal via prop, setActiveSection managed by parent
  const [triggerInput, setTriggerInput] = useState({ type: 'api-gateway', name: '' })
  const [envInput, setEnvInput] = useState({ key: '', value: '' })
  const [tagInput, setTagInput] = useState({ key: '', value: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddTrigger = () => {
    if (triggerInput.name.trim()) {
      setConfig((prev) => ({
        ...prev,
        triggers: [
          ...prev.triggers,
          {
            id: `trigger-${Date.now()}`,
            type: triggerInput.type as any,
            name: triggerInput.name,
          },
        ],
      }))
      setTriggerInput({ type: 'api-gateway', name: '' })
    }
  }

  const handleRemoveTrigger = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      triggers: prev.triggers.filter((t) => t.id !== id),
    }))
  }

  const handleAddEnvVar = () => {
    if (envInput.key.trim()) {
      setConfig((prev) => ({
        ...prev,
        environmentVariables: { ...prev.environmentVariables, [envInput.key]: envInput.value },
      }))
      setEnvInput({ key: '', value: '' })
    }
  }

  const handleRemoveEnvVar = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      environmentVariables: Object.fromEntries(
        Object.entries(prev.environmentVariables).filter(([k]) => k !== key)
      ),
    }))
  }

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
    if (!config.functionName || !config.functionName.trim()) e.functionName = 'Function name is required'
    if (!config.runtime) e.runtime = 'Runtime is required'
    if (!config.handler) e.handler = 'Handler is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
  }

  return (
    <AwsResourceModal
      title="Lambda Function Configuration"
      subtitle="Configure the settings for your Lambda function"
      isOpen={isOpen}
      onClose={onClose}
      sections={SECTIONS}
      onSave={handleSave}
    >
      {/* Basic Settings */}
      <AwsResourceSection sectionId="basic" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Function Name" required>
            <Input
              value={config.functionName}
              onChange={(e) => setConfig((prev) => ({ ...prev, functionName: e.target.value }))}
              placeholder="my-function"
            />
            {errors.functionName && <p className="text-xs text-red-600">{errors.functionName}</p>}
          </FormField>

          <FormField label="Runtime" required>
            <select
              value={config.runtime}
              onChange={(e) => setConfig((prev) => ({ ...prev, runtime: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {RUNTIMES.map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
            {errors.runtime && <p className="text-xs text-red-600">{errors.runtime}</p>}
          </FormField>

          <FormField label="Handler" required hint="Format: filename.function-name (e.g., index.handler)">
            <Input
              value={config.handler}
              onChange={(e) => setConfig((prev) => ({ ...prev, handler: e.target.value }))}
              placeholder="index.handler"
            />
            {errors.handler && <p className="text-xs text-red-600">{errors.handler}</p>}
          </FormField>
        </div>
      </AwsResourceSection>

      {/* Memory & Timeout */}
      <AwsResourceSection sectionId="memory" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Memory (MB)" required hint="128 MB to 10,240 MB">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="128"
                max="10240"
                step="128"
                value={config.memory}
                onChange={(e) => setConfig((prev) => ({ ...prev, memory: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 w-16">{config.memory} MB</span>
            </div>
          </FormField>

          <FormField label="Timeout (seconds)" required hint="1 to 900 seconds">
            <Input
              type="number"
              value={String(config.timeout)}
              onChange={(e) => setConfig((prev) => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
              min="1"
              max="900"
            />
          </FormField>

          <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs text-blue-800">
            <p className="font-medium">💡 Estimated Monthly Cost</p>
            <p>Based on 1M invocations: ~${((config.memory / 128) * 0.0000002 * 1000000).toFixed(2)}/month</p>
          </div>
        </div>
      </AwsResourceSection>

      {/* Triggers */}
      <AwsResourceSection sectionId="triggers" activeSection={activeSection}>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2">
            <div className="flex gap-2">
              <select
                value={triggerInput.type}
                onChange={(e) => setTriggerInput((prev) => ({ ...prev, type: e.target.value }))}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {TRIGGER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Input
                placeholder="Trigger name/ARN"
                value={triggerInput.name}
                onChange={(e) => setTriggerInput((prev) => ({ ...prev, name: e.target.value }))}
                className="flex-1"
              />
            </div>
            <Button size="sm" variant="secondary" onClick={handleAddTrigger} className="w-full">
              Add Trigger
            </Button>
          </div>

          {config.triggers.map((trigger) => (
            <div key={trigger.id} className="flex items-center justify-between rounded bg-green-50 p-3 border border-green-200">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{TRIGGER_TYPES.find((t) => t.value === trigger.type)?.label}</p>
                <p className="text-gray-600">{trigger.name}</p>
              </div>
              <button
                onClick={() => handleRemoveTrigger(trigger.id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </AwsResourceSection>

      {/* Environment Variables */}
      <AwsResourceSection sectionId="env" activeSection={activeSection}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Key"
              value={envInput.key}
              onChange={(e) => setEnvInput((prev) => ({ ...prev, key: e.target.value }))}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={envInput.value}
              onChange={(e) => setEnvInput((prev) => ({ ...prev, value: e.target.value }))}
              className="flex-1"
            />
            <Button size="sm" variant="secondary" onClick={handleAddEnvVar}>
              Add
            </Button>
          </div>

          {Object.entries(config.environmentVariables).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded bg-gray-50 p-2">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{key}</span>
                <span className="mx-2 text-gray-500">=</span>
                <span className="text-gray-700 font-mono">{value}</span>
              </div>
              <button
                onClick={() => handleRemoveEnvVar(key)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </AwsResourceSection>

      {/* IAM Role */}
      <AwsResourceSection sectionId="iam" activeSection={activeSection}>
        <div className="space-y-4">
          <FormField label="Execution Role" required hint="IAM role that Lambda assumes when executing your function">
            <select
              value={config.iamRoleName}
              onChange={(e) => setConfig((prev) => ({ ...prev, iamRoleName: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {IAM_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
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

export default LambdaConfigModal
