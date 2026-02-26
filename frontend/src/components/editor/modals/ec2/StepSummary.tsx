import { Check } from 'lucide-react';
import type { EC2Config } from '../../../../types/ec2';
import { AMI_CATALOG } from '../../../../data/ec2-amis';
import { INSTANCE_TYPE_CATALOG } from '../../../../data/ec2-instances';

interface Props {
  config: EC2Config;
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: color || '#111827' }}>{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: '14px 18px', border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function StepSummary({ config }: Props) {
  const selectedAmi = AMI_CATALOG.find(a => a.id === config.ami);
  const selectedInstance = INSTANCE_TYPE_CATALOG.find(i => i.type === config.instanceType);

  const monthlyCost = selectedInstance
    ? (parseFloat(selectedInstance.price.replace('$', '').replace('/hr', '')) * 730 * config.numberOfInstances).toFixed(2)
    : '0.00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: '#dcfce7', border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check style={{ width: 20, height: 20, color: '#16a34a' }} />
        </div>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Launch Summary</h3>
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Review your configuration before saving.</p>
        </div>
      </div>

      {/* General */}
      <Card title="General">
        <Row label="Name" value={config.name || '(no name)'} />
        <Row label="Instances" value={String(config.numberOfInstances)} />
      </Card>

      {/* AMI */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: '14px 18px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>
          AMI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedAmi && <span style={{ fontSize: 28 }}>{selectedAmi.icon}</span>}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{config.amiName}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', marginTop: 2 }}>{config.ami}</div>
          </div>
        </div>
      </div>

      {/* Instance Type */}
      <Card title="Instance type">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}>{config.instanceType}</span>
          {selectedInstance && (
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {selectedInstance.vCPUs} vCPUs · {selectedInstance.memory} · {selectedInstance.price}
            </span>
          )}
        </div>
      </Card>

      {/* Key Pair */}
      <Card title="Key pair">
        <Row
          label="Key pair"
          value={config.keyPair || 'No key pair'}
          color={config.keyPair ? '#111827' : '#d97706'}
        />
      </Card>

      {/* Network */}
      <Card title="Network">
        <Row label="VPC" value={config.network.vpcId || 'Default'} />
        <Row label="Subnet" value={config.network.subnetId || 'Auto'} />
        <Row label="Public IP" value={config.network.autoAssignPublicIp} />
        <Row label="SG rules" value={`${config.network.securityGroupRules.length} rules`} />
      </Card>

      {/* Storage */}
      <Card title="Storage">
        <Row label="Root volume" value={`${config.rootVolume.size} GiB ${config.rootVolume.volumeType}`} />
        <Row label="Additional" value={`${config.additionalVolumes.length} volumes`} />
        <Row
          label="Encryption"
          value={config.rootVolume.encrypted ? 'Enabled' : 'Disabled'}
          color={config.rootVolume.encrypted ? '#16a34a' : '#9ca3af'}
        />
      </Card>

      {/* Advanced */}
      <Card title="Advanced">
        <Row label="IAM Profile" value={config.advanced.iamInstanceProfile || 'None'} />
        <Row label="Monitoring" value={config.advanced.monitoring ? 'Detailed' : 'Basic'} color={config.advanced.monitoring ? '#16a34a' : '#9ca3af'} />
        <Row label="User data" value={config.advanced.userData ? `${new Blob([config.advanced.userData]).size} bytes` : 'None'} />
        <Row label="Termination protection" value={config.advanced.terminationProtection ? 'Enabled' : 'Disabled'} color={config.advanced.terminationProtection ? '#16a34a' : '#9ca3af'} />
        <Row label="Tenancy" value={config.advanced.tenancy} />
        <Row label="Credit spec" value={config.advanced.creditSpecification} />
      </Card>

      {/* Tags */}
      {config.tags.length > 0 && (
        <Card title={`Tags (${config.tags.length})`}>
          {config.tags.map((tag, idx) => (
            <Row key={idx} label={tag.key} value={tag.value} />
          ))}
        </Card>
      )}

      {/* Cost */}
      {selectedInstance && (
        <div style={{
          backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 12, padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#166534' }}>Estimated monthly cost</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#15803d' }}>~${monthlyCost}/mo</span>
          </div>
          <p style={{ fontSize: 11, color: '#16a34a', margin: '8px 0 0' }}>
            {selectedInstance.price} × 730 hrs × {config.numberOfInstances} instance(s). Actual costs may vary.
          </p>
        </div>
      )}
    </div>
  );
}