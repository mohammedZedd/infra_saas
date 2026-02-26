import { Plus, AlertTriangle } from 'lucide-react';
import type { EC2Config } from '../../../../types/ec2';

interface Props {
  config: EC2Config;
  updateConfig: (updates: Partial<EC2Config>) => void;
}

export default function StepKeyPair({ config, updateConfig }: Props) {
  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none',
    backgroundColor: '#fff', boxSizing: 'border-box',
  };
  const inputStyle: React.CSSProperties = { ...selectStyle };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Key pair (login)</h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
          A key pair is used to prove your identity when connecting to an instance.
        </p>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Key pair name</label>
        <select value={config.keyPair} onChange={e => updateConfig({ keyPair: e.target.value })} style={selectStyle}>
          <option value="">Select a key pair or proceed without</option>
          <option value="my-key-pair">my-key-pair (RSA)</option>
          <option value="prod-key">prod-key (ED25519)</option>
          <option value="dev-key">dev-key (RSA)</option>
        </select>
      </div>

      {/* Create new */}
      <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus style={{ width: 16, height: 16, color: '#ea580c' }} />
          Create new key pair
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Key pair name</label>
            <input type="text" placeholder="Enter key pair name" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['RSA', 'ED25519'].map(t => (
                  <button key={t} style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Format</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['.pem', '.ppk'].map(f => (
                  <button key={f} style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>{f}</button>
                ))}
              </div>
            </div>
          </div>
          <button style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: '#ea580c', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Create key pair
          </button>
        </div>
      </div>

      {!config.keyPair && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 16 }}>
          <AlertTriangle style={{ width: 20, height: 20, color: '#d97706', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', margin: 0 }}>No key pair selected</p>
            <p style={{ fontSize: 12, color: '#a16207', margin: '4px 0 0' }}>You won't be able to SSH into this instance.</p>
          </div>
        </div>
      )}
    </div>
  );
}