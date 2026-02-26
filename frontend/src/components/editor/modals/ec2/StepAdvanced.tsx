import { useState } from 'react';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';
import type { EC2Config } from '../../../../types/ec2';

interface Props {
  config: EC2Config;
  updateAdvanced: (updates: Partial<EC2Config['advanced']>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none',
  boxSizing: 'border-box', backgroundColor: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6,
};

function Toggle({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '4px 0' }}
    >
      <div style={{
        width: 40, height: 22, borderRadius: 11, position: 'relative',
        backgroundColor: checked ? '#ea580c' : '#d1d5db',
        transition: 'background-color 0.2s',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff',
          position: 'absolute', top: 2, left: checked ? 20 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{desc}</div>}
      </div>
    </div>
  );
}

export default function StepAdvanced({ config, updateAdvanced }: Props) {
  const [showUserData, setShowUserData] = useState(false);
  const { advanced } = config;

  const TEMPLATE = `#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello from $(hostname)</h1>" > /var/www/html/index.html`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Advanced details</h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Optional: IAM, monitoring, user data, and more.</p>
      </div>

      {/* IAM */}
      <div>
        <label style={labelStyle}>IAM instance profile</label>
        <select
          value={advanced.iamInstanceProfile}
          onChange={e => updateAdvanced({ iamInstanceProfile: e.target.value })}
          style={inputStyle}
        >
          <option value="">None</option>
          <option value="EC2-S3-ReadOnly">EC2-S3-ReadOnly</option>
          <option value="EC2-Admin">EC2-Admin</option>
          <option value="EC2-SSM-Role">EC2-SSM-Role</option>
        </select>
      </div>

      {/* Toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Toggle checked={advanced.monitoring} onChange={v => updateAdvanced({ monitoring: v })} label="Detailed monitoring" desc="CloudWatch 1-min intervals" />
          <Toggle checked={advanced.ebsOptimized} onChange={v => updateAdvanced({ ebsOptimized: v })} label="EBS-optimized" desc="Dedicated EBS throughput" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Toggle checked={advanced.terminationProtection} onChange={v => updateAdvanced({ terminationProtection: v })} label="Termination protection" desc="Prevent accidental termination" />
          <Toggle checked={advanced.stopProtection} onChange={v => updateAdvanced({ stopProtection: v })} label="Stop protection" desc="Prevent accidental stop" />
        </div>
      </div>

      {/* Tenancy */}
      <div>
        <label style={labelStyle}>Tenancy</label>
        <select
          value={advanced.tenancy}
          onChange={e => updateAdvanced({ tenancy: e.target.value as 'default' | 'dedicated' | 'host' })}
          style={inputStyle}
        >
          <option value="default">Shared — Run on shared hardware</option>
          <option value="dedicated">Dedicated instance</option>
          <option value="host">Dedicated Host</option>
        </select>
      </div>

      {/* Credit Spec */}
      <div>
        <label style={labelStyle}>Credit specification</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['standard', 'unlimited'] as const).map(c => (
            <button
              key={c}
              onClick={() => updateAdvanced({ creditSpecification: c })}
              style={{
                flex: 1, padding: '14px 16px', borderRadius: 12, textAlign: 'left',
                border: advanced.creditSpecification === c ? '2px solid #ea580c' : '1px solid #d1d5db',
                backgroundColor: advanced.creditSpecification === c ? '#fff7ed' : '#fff',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: advanced.creditSpecification === c ? '#ea580c' : '#374151', textTransform: 'capitalize' as const }}>
                {c}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                {c === 'standard' ? 'General workloads' : 'Sustained high CPU (extra cost)'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shutdown */}
      <div>
        <label style={labelStyle}>Shutdown behavior</label>
        <select
          value={advanced.shutdownBehavior}
          onChange={e => updateAdvanced({ shutdownBehavior: e.target.value as 'stop' | 'terminate' })}
          style={inputStyle}
        >
          <option value="stop">Stop</option>
          <option value="terminate">Terminate</option>
        </select>
      </div>

      {/* Hibernation */}
      <Toggle checked={advanced.hibernation} onChange={v => updateAdvanced({ hibernation: v })} label="Enable hibernation" desc="Save RAM to EBS root volume" />

      {/* Metadata */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Metadata settings</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Metadata version</label>
            <select
              value={advanced.metadataVersion}
              onChange={e => updateAdvanced({ metadataVersion: e.target.value as 'V2 only' | 'V1 and V2' })}
              style={inputStyle}
            >
              <option value="V2 only">V2 only (token required)</option>
              <option value="V1 and V2">V1 and V2 (optional token)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Response hop limit</label>
            <input
              type="number" min={1} max={64}
              value={advanced.metadataResponseHopLimit}
              onChange={e => updateAdvanced({ metadataResponseHopLimit: parseInt(e.target.value) || 2 })}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* User Data */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
        <div
          onClick={() => setShowUserData(!showUserData)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings style={{ width: 16, height: 16, color: '#ea580c' }} />
            User data
          </h4>
          {showUserData
            ? <ChevronUp style={{ width: 16, height: 16, color: '#9ca3af' }} />
            : <ChevronDown style={{ width: 16, height: 16, color: '#9ca3af' }} />
          }
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
          Bash script or cloud-init to run at instance launch.
        </p>

        {showUserData && (
          <div style={{ marginTop: 12 }}>
            <textarea
              value={advanced.userData}
              onChange={e => updateAdvanced({ userData: e.target.value })}
              rows={10}
              placeholder={TEMPLATE}
              spellCheck={false}
              style={{
                width: '100%', padding: '14px 16px',
                backgroundColor: '#1e1e2e', border: '1px solid #d1d5db',
                borderRadius: 8, color: '#4ade80', fontFamily: 'monospace',
                fontSize: 12, outline: 'none', resize: 'none',
                lineHeight: 1.6, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                {new Blob([advanced.userData]).size} bytes / 16 KB max
              </span>
              <button
                onClick={() => updateAdvanced({ userData: TEMPLATE })}
                style={{
                  fontSize: 11, fontWeight: 600, color: '#ea580c',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                Insert template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}