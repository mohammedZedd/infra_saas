import { Plus, Trash2 } from 'lucide-react';
import type { EC2Config } from '../../../../types/ec2';

interface Props {
  config: EC2Config;
  updateConfig: (updates: Partial<EC2Config>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: '#111827',
  marginBottom: 8,
};

export default function StepNameTags({ config, updateConfig }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Name */}
      <div>
        <label style={labelStyle}>Name</label>
        <input
          type="text"
          value={config.name}
          onChange={e => updateConfig({ name: e.target.value })}
          placeholder="e.g., my-web-server"
          style={{ ...inputStyle }}
          onFocus={e => { e.target.style.borderColor = '#ea580c'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
        />
        <p style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
          A "Name" tag will be created with this value.
        </p>
      </div>

      {/* Number of Instances */}
      <div>
        <label style={labelStyle}>Number of instances</label>
        <input
          type="number"
          min={1}
          max={50}
          value={config.numberOfInstances}
          onChange={e => updateConfig({ numberOfInstances: parseInt(e.target.value) || 1 })}
          style={{ ...inputStyle, width: 120 }}
          onFocus={e => { e.target.style.borderColor = '#ea580c'; }}
          onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
        />
      </div>

      {/* Tags */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Additional Tags</label>
          <button
            onClick={() => updateConfig({ tags: [...config.tags, { key: '', value: '' }] })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#ea580c',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add tag
          </button>
        </div>

        {config.tags.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '20px 16px',
            backgroundColor: '#f9fafb', borderRadius: 10,
            border: '2px dashed #d1d5db', color: '#9ca3af', fontSize: 13,
          }}>
            No additional tags. Click "Add tag" to add resource tags.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const }}>Key</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const }}>Value</span>
              <span />
            </div>
            {config.tags.map((tag, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: 8 }}>
                <input
                  type="text"
                  value={tag.key}
                  onChange={e => {
                    const t = [...config.tags];
                    t[idx] = { ...tag, key: e.target.value };
                    updateConfig({ tags: t });
                  }}
                  placeholder="Key"
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
                />
                <input
                  type="text"
                  value={tag.value}
                  onChange={e => {
                    const t = [...config.tags];
                    t[idx] = { ...tag, value: e.target.value };
                    updateConfig({ tags: t });
                  }}
                  placeholder="Value"
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
                />
                <button
                  onClick={() => updateConfig({ tags: config.tags.filter((_, i) => i !== idx) })}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#ef4444'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = '#d1d5db'; }}
                >
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}