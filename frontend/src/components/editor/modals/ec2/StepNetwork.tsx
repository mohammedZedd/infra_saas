import { Plus, Trash2, Shield } from 'lucide-react';
import type { EC2Config, SecurityGroupRule } from '../../../../types/ec2';

interface Props {
  config: EC2Config;
  updateNetwork: (updates: Partial<EC2Config['network']>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none',
  boxSizing: 'border-box', backgroundColor: '#fff',
};

const smallInputStyle: React.CSSProperties = {
  ...inputStyle, padding: '8px 10px', fontSize: 12,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6,
};

export default function StepNetwork({ config, updateNetwork }: Props) {
  const { network } = config;

  const addRule = () => {
    const r: SecurityGroupRule = {
      id: `rule-${Date.now()}`, type: 'Custom TCP', protocol: 'tcp',
      portRange: '', source: '0.0.0.0/0', description: '',
    };
    updateNetwork({ securityGroupRules: [...network.securityGroupRules, r] });
  };

  const updateRule = (idx: number, u: Partial<SecurityGroupRule>) => {
    const rules = [...network.securityGroupRules];
    rules[idx] = { ...rules[idx], ...u };
    updateNetwork({ securityGroupRules: rules });
  };

  const removeRule = (idx: number) => {
    updateNetwork({ securityGroupRules: network.securityGroupRules.filter((_, i) => i !== idx) });
  };

  const handleTypeChange = (idx: number, type: SecurityGroupRule['type']) => {
    const m: Record<string, { port: string; protocol: string }> = {
      SSH: { port: '22', protocol: 'tcp' },
      HTTP: { port: '80', protocol: 'tcp' },
      HTTPS: { port: '443', protocol: 'tcp' },
      'All traffic': { port: 'All', protocol: 'all' },
      'Custom TCP': { port: '', protocol: 'tcp' },
      'Custom UDP': { port: '', protocol: 'udp' },
    };
    const mapped = m[type] || { port: '', protocol: 'tcp' };
    updateRule(idx, { type, portRange: mapped.port, protocol: mapped.protocol as 'tcp' | 'udp' | 'all' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Network settings</h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
          Configure how your instance connects to the internet and other resources.
        </p>
      </div>

      {/* VPC */}
      <div>
        <label style={labelStyle}>VPC</label>
        <select
          value={network.vpcId}
          onChange={e => updateNetwork({ vpcId: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select VPC (auto-detect from canvas)</option>
          <option value="vpc-default">vpc-default (172.31.0.0/16) — Default</option>
          <option value="vpc-custom">vpc-custom (10.0.0.0/16)</option>
        </select>
      </div>

      {/* Subnet */}
      <div>
        <label style={labelStyle}>Subnet</label>
        <select
          value={network.subnetId}
          onChange={e => updateNetwork({ subnetId: e.target.value })}
          style={inputStyle}
        >
          <option value="">No preference (default subnet in any AZ)</option>
          <option value="subnet-a">subnet-a (us-east-1a) — 172.31.0.0/20</option>
          <option value="subnet-b">subnet-b (us-east-1b) — 172.31.16.0/20</option>
          <option value="subnet-c">subnet-c (us-east-1c) — 172.31.32.0/20</option>
        </select>
      </div>

      {/* Auto-assign public IP */}
      <div>
        <label style={labelStyle}>Auto-assign public IP</label>
        <select
          value={network.autoAssignPublicIp}
          onChange={e => updateNetwork({ autoAssignPublicIp: e.target.value as 'Enable' | 'Disable' | 'Use subnet setting' })}
          style={inputStyle}
        >
          <option value="Use subnet setting">Use subnet setting</option>
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
      </div>

      {/* Security Groups */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield style={{ width: 18, height: 18, color: '#ea580c' }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Firewall (security groups)</h3>
        </div>

        {/* Toggle: Create new / Select existing */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { val: true, label: 'Create security group' },
            { val: false, label: 'Select existing' },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => updateNetwork({ createNewSecurityGroup: opt.val })}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12,
                border: network.createNewSecurityGroup === opt.val ? '2px solid #ea580c' : '1px solid #d1d5db',
                backgroundColor: network.createNewSecurityGroup === opt.val ? '#fff7ed' : '#fff',
                color: network.createNewSecurityGroup === opt.val ? '#ea580c' : '#6b7280',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {network.createNewSecurityGroup ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* SG Name */}
            <div>
              <label style={labelStyle}>Security group name</label>
              <input
                type="text"
                value={network.newSecurityGroupName}
                onChange={e => updateNetwork({ newSecurityGroupName: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* SG Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                value={network.newSecurityGroupDescription}
                onChange={e => updateNetwork({ newSecurityGroupDescription: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Inbound Rules Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Inbound security group rules</label>
              <button
                onClick={addRule}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600, color: '#ea580c',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <Plus style={{ width: 14, height: 14 }} /> Add rule
              </button>
            </div>

            {/* Rules Table Header */}
            {network.securityGroupRules.length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.6fr 1fr 32px', gap: 8,
                fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const,
                padding: '0 4px',
              }}>
                <span>Type</span>
                <span>Protocol</span>
                <span>Port</span>
                <span>Source</span>
                <span />
              </div>
            )}

            {/* Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {network.securityGroupRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.6fr 1fr 32px',
                    gap: 8, alignItems: 'center',
                  }}
                >
                  <select
                    value={rule.type}
                    onChange={e => handleTypeChange(idx, e.target.value as SecurityGroupRule['type'])}
                    style={smallInputStyle}
                  >
                    {['SSH', 'HTTP', 'HTTPS', 'Custom TCP', 'Custom UDP', 'All traffic'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <input
                    value={rule.protocol}
                    disabled
                    style={{ ...smallInputStyle, backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                  />

                  <input
                    value={rule.portRange}
                    onChange={e => updateRule(idx, { portRange: e.target.value })}
                    placeholder="Port"
                    style={smallInputStyle}
                  />

                  <select
                    value={rule.source}
                    onChange={e => updateRule(idx, { source: e.target.value })}
                    style={smallInputStyle}
                  >
                    <option value="0.0.0.0/0">Anywhere (0.0.0.0/0)</option>
                    <option value="custom">Custom</option>
                    <option value="my-ip">My IP</option>
                  </select>

                  <button
                    onClick={() => removeRule(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db',
                    }}
                    onMouseEnter={e => { (e.currentTarget).style.color = '#ef4444'; }}
                    onMouseLeave={e => { (e.currentTarget).style.color = '#d1d5db'; }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ))}
            </div>

            {network.securityGroupRules.length === 0 && (
              <div style={{
                textAlign: 'center', padding: 16, backgroundColor: '#f9fafb',
                borderRadius: 10, border: '2px dashed #d1d5db', color: '#9ca3af', fontSize: 13,
              }}>
                No inbound rules. Click "Add rule" to add one.
              </div>
            )}
          </div>
        ) : (
          <div>
            <label style={labelStyle}>Select security groups</label>
            <select
              multiple
              style={{ ...inputStyle, height: 120 }}
            >
              <option value="sg-default">sg-default — default</option>
              <option value="sg-web">sg-web — Web Server SG</option>
              <option value="sg-db">sg-db — Database SG</option>
            </select>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
              Hold Ctrl/Cmd to select multiple groups.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}