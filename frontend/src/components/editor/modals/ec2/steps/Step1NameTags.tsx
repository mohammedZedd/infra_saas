// src/components/editor/modals/ec2/steps/Step1NameTags.tsx
// ══ Remplacer les div sectionStyle par du contenu direct ══

import React, { useState } from 'react';
import type { EC2FullConfig } from '../types/ec2-config';

interface Step1Props {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
}

const Step1NameTags: React.FC<Step1Props> = ({ config, onChange }) => {
  const [newTagKey, setNewTagKey] = useState('');
  const [newTagValue, setNewTagValue] = useState('');

  const addTag = () => {
    if (!newTagKey.trim()) return;
    onChange({ tags: { ...config.tags, [newTagKey.trim()]: newTagValue.trim() } });
    setNewTagKey('');
    setNewTagValue('');
  };

  const removeTag = (key: string) => {
    const { [key]: _, ...rest } = config.tags;
    onChange({ tags: rest });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #aab7b8',
    borderRadius: 4,
    fontSize: 14,
    color: '#16191f',
    background: '#fff',
    outline: 'none',
  };

  return (
    <div>
      {/* Name */}
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 14, fontWeight: 400, color: '#16191f', marginBottom: 4, display: 'block' }}>
          Name
        </label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <input
            type="text"
            value={config.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. My Web Server"
            style={{ ...inputStyle, maxWidth: 500 }}
            onFocus={(e) => { e.target.style.borderColor = '#0073bb'; }}
            onBlur={(e) => { e.target.style.borderColor = '#aab7b8'; }}
          />
          <span
            style={{ fontSize: 14, color: '#0073bb', cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => {
              // toggle tags panel
            }}
          >
            Add additional tags
          </span>
        </div>
      </div>

      {/* Tags (initially collapsed like AWS) */}
      {Object.keys(config.tags).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 36px',
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#545b64' }}>Key</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#545b64' }}>Value</span>
            <span />
          </div>
          {Object.entries(config.tags).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 36px',
                gap: 6,
                marginBottom: 4,
                alignItems: 'center',
              }}
            >
              <input readOnly value={key} style={{ ...inputStyle, background: '#f2f3f3', fontSize: 13 }} />
              <input readOnly value={value} style={{ ...inputStyle, background: '#f2f3f3', fontSize: 13 }} />
              <button
                onClick={() => removeTag(key)}
                style={{
                  width: 32, height: 32, border: '1px solid #aab7b8', borderRadius: 4,
                  background: '#fff', cursor: 'pointer', color: '#d13212', fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add tag row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: 6,
          marginTop: 8,
          alignItems: 'end',
        }}
      >
        <input
          type="text"
          value={newTagKey}
          onChange={(e) => setNewTagKey(e.target.value)}
          placeholder="Key"
          style={{ ...inputStyle, fontSize: 13 }}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <input
          type="text"
          value={newTagValue}
          onChange={(e) => setNewTagValue(e.target.value)}
          placeholder="Value — optional"
          style={{ ...inputStyle, fontSize: 13 }}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <button
          onClick={addTag}
          disabled={!newTagKey.trim()}
          style={{
            padding: '8px 14px',
            background: newTagKey.trim() ? '#fff' : '#f2f3f3',
            color: newTagKey.trim() ? '#16191f' : '#aab7b8',
            border: `1px solid ${newTagKey.trim() ? '#aab7b8' : '#d5dbdb'}`,
            borderRadius: 4,
            cursor: newTagKey.trim() ? 'pointer' : 'not-allowed',
            fontSize: 13,
          }}
        >
          Add tag
        </button>
      </div>
    </div>
  );
};

export default Step1NameTags;