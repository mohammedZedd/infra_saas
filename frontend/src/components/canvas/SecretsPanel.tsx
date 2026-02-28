import { useState, type CSSProperties } from 'react';
import { useTerraformStore } from '../../stores/useTerraformStore';
import type { ProjectSecret } from '../../types/terraform';

const SECRET_TYPES = [
  { value: 'aws_credentials', label: 'AWS', emoji: '☁️' },
  { value: 'database', label: 'Database', emoji: '🗄️' },
  { value: 'api_key', label: 'API Key', emoji: '🔑' },
  { value: 'ssh_key', label: 'SSH', emoji: '🔐' },
  { value: 'generic', label: 'Other', emoji: '📦' },
];

export default function SecretsPanel() {
  const { secrets, addSecret, deleteSecret } = useTerraformStore();
  const [showModal, setShowModal] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [form, setForm] = useState({
    key: '', value: '', description: '', secretType: 'generic' as ProjectSecret['secretType'],
  });

  const resetAndClose = () => {
    setForm({ key: '', value: '', description: '', secretType: 'generic' });
    setShowModal(false);
    setShowValue(false);
  };

  const handleAdd = () => {
    if (!form.key.trim() || !form.value.trim()) return;
    addSecret({
      id: crypto.randomUUID(),
      key: form.key.trim(),
      description: form.description || undefined,
      secretType: form.secretType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    resetAndClose();
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>Secrets</h3>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
            {secrets.length} secret{secrets.length !== 1 ? 's' : ''} encrypted
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', fontSize: '12px', fontWeight: 500,
            color: 'white', backgroundColor: '#374151',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          + Add
        </button>
      </div>

      {/* Security notice */}
      <div style={{ margin: '0 14px 10px' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A', borderRadius: '8px',
          }}
        >
          <span style={{ fontSize: '14px' }}>🔒</span>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#92400E', margin: 0 }}>AES-256 Encryption</p>
            <p style={{ fontSize: '10px', color: '#B45309', margin: '1px 0 0' }}>Values cannot be read back</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
        {secrets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div
              style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: '#F3F4F6', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontSize: '20px',
              }}
            >
              🔒
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', margin: '0 0 4px' }}>No secrets</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 16px' }}>
              Store your credentials,<br />API keys and passwords
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 500,
                color: '#374151', backgroundColor: '#F3F4F6',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
              }}
            >
              + Add secret
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {secrets.map((secret) => (
              <SecretCard key={secret.id} secret={secret} onDelete={() => {
                if (confirm(`Delete "${secret.key}"?`)) deleteSecret(secret.id);
              }} />
            ))}
          </div>
        )}
      </div>

      {/* ======= MODAL ======= */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={resetAndClose}
          />

          {/* Modal content */}
          <div
            style={{
              position: 'relative', width: '100%', maxWidth: '400px',
              margin: '0 16px', backgroundColor: 'white',
              borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: '#374151', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                  }}
                >
                  🔒
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>New secret</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>Encrypted automatically</p>
                </div>
              </div>
              <button
                onClick={resetAndClose}
                style={{
                  width: '28px', height: '28px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'transparent', border: 'none',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '16px', color: '#9CA3AF',
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' }}>
                  TYPE
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {SECRET_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setForm({ ...form, secretType: type.value as any })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                        color: form.secretType === type.value ? 'white' : '#6B7280',
                        backgroundColor: form.secretType === type.value ? '#374151' : '#F3F4F6',
                        border: 'none', borderRadius: '6px', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>{type.emoji}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                  NAME
                </label>
                <input
                  type="text"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  placeholder="AWS_SECRET_ACCESS_KEY"
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                  onFocus={(e) => (e.target.style.borderColor = '#4F6EF7')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>

              {/* Value */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                  VALUE
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showValue ? 'text' : 'password'}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="••••••••••••"
                    style={{ ...inputStyle, fontFamily: 'monospace', paddingRight: '36px' }}
                    onFocus={(e) => (e.target.style.borderColor = '#4F6EF7')}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                  />
                  <button
                    onClick={() => setShowValue(!showValue)}
                    style={{
                      position: 'absolute', right: '6px', top: '50%',
                      transform: 'translateY(-50%)',
                      width: '26px', height: '26px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'transparent', border: 'none',
                      borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                    }}
                  >
                    {showValue ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                  DESCRIPTION <span style={{ fontWeight: 400, color: '#D1D5DB' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Production AWS credentials"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#4F6EF7')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex', justifyContent: 'flex-end', gap: '8px',
                padding: '14px 18px', backgroundColor: '#FAFBFC',
                borderTop: '1px solid #E5E7EB',
              }}
            >
              <button
                onClick={resetAndClose}
                style={{
                  padding: '7px 14px', fontSize: '12px', fontWeight: 500,
                  color: '#6B7280', backgroundColor: 'transparent',
                  border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.key.trim() || !form.value.trim()}
                style={{
                  padding: '7px 14px', fontSize: '12px', fontWeight: 600,
                  color: 'white', backgroundColor: !form.key.trim() || !form.value.trim() ? '#D1D5DB' : '#374151',
                  border: 'none', borderRadius: '6px',
                  cursor: !form.key.trim() || !form.value.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                Encrypt & save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======= Secret Card ======= */

function SecretCard({ secret, onDelete }: { secret: ProjectSecret; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  const t = SECRET_TYPES.find((x) => x.value === secret.secretType) || SECRET_TYPES[4];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'start', gap: '10px',
        padding: '10px 12px', borderRadius: '8px',
        border: `1px solid ${hovered ? '#D1D5DB' : '#E5E7EB'}`,
        backgroundColor: hovered ? '#FAFBFC' : 'white',
        transition: 'all 0.15s',
      }}
    >
      {/* Emoji */}
      <div
        style={{
          width: '36px', height: '36px', borderRadius: '8px',
          backgroundColor: '#F3F4F6', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}
      >
        {t.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {secret.key}
        </p>
        <span
          style={{
            display: 'inline-block', marginTop: '3px',
            fontSize: '10px', fontWeight: 600, color: '#6B7280',
            backgroundColor: '#F3F4F6', padding: '1px 6px', borderRadius: '4px',
          }}
        >
          {t.label}
        </span>

        {/* Masked dots */}
        <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '4px', height: '4px', borderRadius: '50%',
                backgroundColor: '#D1D5DB',
              }}
            />
          ))}
        </div>

        {secret.description && (
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0' }}>{secret.description}</p>
        )}

        <p style={{ fontSize: '10px', color: '#D1D5DB', margin: '4px 0 0' }}>
          {new Date(secret.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          width: '28px', height: '28px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'transparent', border: 'none',
          borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
          flexShrink: 0,
        }}
      >
        🗑️
      </button>
    </div>
  );
}