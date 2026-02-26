// src/components/editor/modals/ec2/steps/Step4KeyPair.tsx

import React, { useState } from 'react';
import type { EC2FullConfig } from '../types/ec2-config';

interface Step4Props {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
}

interface KeyPairItem {
  name: string;
  type: 'rsa' | 'ed25519';
  fingerprint: string;
}

const MOCK_KEY_PAIRS: KeyPairItem[] = [
  { name: 'my-production-key', type: 'rsa', fingerprint: '12:34:56:78:90:ab:cd:ef' },
  { name: 'dev-key-pair', type: 'ed25519', fingerprint: 'ab:cd:ef:12:34:56:78:90' },
  { name: 'staging-key', type: 'rsa', fingerprint: 'fe:dc:ba:09:87:65:43:21' },
];

const Step4KeyPair: React.FC<Step4Props> = ({ config, onChange }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'rsa' | 'ed25519'>('rsa');
  const [keyPairs, setKeyPairs] = useState<KeyPairItem[]>(MOCK_KEY_PAIRS);

  const createKeyPair = () => {
    if (!newKeyName.trim()) return;
    const newKey: KeyPairItem = {
      name: newKeyName.trim(),
      type: newKeyType,
      fingerprint: 'xx:xx:xx:xx:xx:xx:xx:xx',
    };
    setKeyPairs([...keyPairs, newKey]);
    onChange({ keyName: newKey.name });
    setShowCreate(false);
    setNewKeyName('');
  };

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e8eaed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d5dbdb',
    borderRadius: 4,
    fontSize: 14,
    color: '#16191f',
    background: '#fff',
    outline: 'none',
  };

  const radioCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    border: selected ? '2px solid #0d6efd' : '1px solid #e8eaed',
    borderRadius: 8,
    background: selected ? '#e8f0fe' : '#fff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  });

  return (
    <div>
      <div style={sectionStyle}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#16191f', marginBottom: 4 }}>
          Key pair (login)
        </div>
        <div style={{ fontSize: 13, color: '#687078', marginBottom: 16 }}>
          A key pair, consisting of a public key and a private key, is a set of security
          credentials that you use to prove your identity when connecting to an EC2 instance.
        </div>

        {/* Info banner */}
        <div
          style={{
            padding: '10px 14px',
            background: '#cff4fc',
            border: '1px solid #9eeaf9',
            borderRadius: 6,
            fontSize: 12,
            color: '#055160',
            marginBottom: 16,
            display: 'flex',
            gap: 8,
          }}
        >
          <span>ℹ️</span>
          <span>
            You can use a key pair to securely connect to your instance. Ensure that you have
            access to the selected key pair before you launch the instance.
          </span>
        </div>

        {/* Key pair selection */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 700,
              color: '#16191f',
              marginBottom: 8,
            }}
          >
            Key pair name
          </label>

          {/* No key pair option */}
          <div
            style={{ ...radioCardStyle(config.keyName === ''), marginBottom: 8 }}
            onClick={() => onChange({ keyName: '' })}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: config.keyName === '' ? '5px solid #0d6efd' : '2px solid #d5dbdb',
                background: '#fff',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#16191f' }}>
                Proceed without a key pair
              </div>
              <div style={{ fontSize: 12, color: '#687078' }}>
                Not recommended — you won't be able to SSH into the instance
              </div>
            </div>
          </div>

          {/* Existing key pairs */}
          {keyPairs.map((kp) => (
            <div
              key={kp.name}
              style={{ ...radioCardStyle(config.keyName === kp.name), marginBottom: 8 }}
              onClick={() => onChange({ keyName: kp.name })}
              onMouseEnter={(e) => {
                if (config.keyName !== kp.name) e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                if (config.keyName !== kp.name) e.currentTarget.style.background = '#fff';
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: config.keyName === kp.name ? '5px solid #0d6efd' : '2px solid #d5dbdb',
                  background: '#fff',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#16191f' }}>
                  🔑 {kp.name}
                </div>
                <div style={{ fontSize: 12, color: '#687078' }}>
                  Type: {kp.type.toUpperCase()} · Fingerprint: {kp.fingerprint}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create new key pair */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#0d6efd',
              border: '1px dashed #0d6efd',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              width: '100%',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e8f0fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            + Create new key pair
          </button>
        ) : (
          <div
            style={{
              border: '1px solid #0d6efd',
              borderRadius: 8,
              padding: 16,
              background: '#f8f9ff',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#16191f', marginBottom: 12 }}>
              Create key pair
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#16191f', marginBottom: 4, display: 'block' }}>
                Key pair name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="my-key-pair"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#16191f', marginBottom: 8, display: 'block' }}>
                Key pair type
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['rsa', 'ed25519'] as const).map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      padding: '6px 12px',
                      border: newKeyType === type ? '2px solid #0d6efd' : '1px solid #d5dbdb',
                      borderRadius: 6,
                      background: newKeyType === type ? '#e8f0fe' : '#fff',
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="radio"
                      checked={newKeyType === type}
                      onChange={() => setNewKeyType(type)}
                      style={{ accentColor: '#0d6efd' }}
                    />
                    {type.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowCreate(false); setNewKeyName(''); }}
                style={{
                  padding: '6px 16px',
                  background: '#fff',
                  color: '#687078',
                  border: '1px solid #d5dbdb',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={createKeyPair}
                disabled={!newKeyName.trim()}
                style={{
                  padding: '6px 16px',
                  background: newKeyName.trim() ? '#0d6efd' : '#e8eaed',
                  color: newKeyName.trim() ? '#fff' : '#adb5bd',
                  border: 'none',
                  borderRadius: 4,
                  cursor: newKeyName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Create key pair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4KeyPair;