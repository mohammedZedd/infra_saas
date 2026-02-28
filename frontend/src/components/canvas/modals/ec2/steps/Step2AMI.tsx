// src/components/editor/modals/ec2/steps/Step2AMI.tsx
// ══ Redesigned to match AWS Console: OS icon cards + search ══

import React, { useState, useMemo } from 'react';
import type { EC2FullConfig, AmiOption } from '../types/ec2-config';
import { EC2_AMIS } from '../data/ec2-amis';

interface Step2Props {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
}

// OS Quick Start tabs (AWS style)
const OS_TABS = [
  { id: 'amazon', label: 'Amazon\nLinux', icon: '🟠', logo: 'aws', filter: 'amazon' },
  { id: 'ubuntu', label: 'Ubuntu', icon: '🟤', logo: 'ubuntu', filter: 'Canonical' },
  { id: 'windows', label: 'Windows', icon: '🔵', logo: 'microsoft', filter: 'windows' },
  { id: 'rhel', label: 'Red Hat', icon: '🔴', logo: 'redhat', filter: 'Red Hat' },
  { id: 'suse', label: 'SUSE Linux', icon: '🟢', logo: 'suse', filter: 'SUSE' },
  { id: 'debian', label: 'Debian', icon: '🟣', logo: 'debian', filter: 'Debian' },
];

const Step2AMI: React.FC<Step2Props> = ({ config, onChange }) => {
  const [search, setSearch] = useState('');
  const [selectedOS, setSelectedOS] = useState('amazon');
  const [customAmiId, setCustomAmiId] = useState('');

  const selectAmi = (ami: AmiOption) => {
    onChange({ ami: ami.id, amiData: ami });
  };

  const filteredAmis = useMemo(() => {
    const osTab = OS_TABS.find((t) => t.id === selectedOS);
    return EC2_AMIS.filter((ami) => {
      if (osTab) {
        const f = osTab.filter.toLowerCase();
        const match =
          ami.ownerAlias.toLowerCase().includes(f) ||
          ami.platform.toLowerCase().includes(f) ||
          ami.name.toLowerCase().includes(f);
        if (!match) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          ami.name.toLowerCase().includes(q) ||
          ami.id.toLowerCase().includes(q) ||
          ami.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedOS, search]);

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
      <p style={{ fontSize: 14, color: '#545b64', margin: '0 0 14px' }}>
        An AMI contains the software configuration required to launch your instance.
        If you don't see a suitable AMI below, use the search field or choose
        <strong> Browse more AMIs</strong>.
      </p>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search our full catalog including 1000s of application and OS images"
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#aab7b8',
          }}
        >
          🔍
        </span>
      </div>

      {/* Quick Start tab label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: '#0073bb',
          borderBottom: '2px solid #0073bb',
          display: 'inline-block',
          padding: '0 0 8px',
          marginBottom: 16,
        }}
      >
        Quick Start
      </div>

      {/* OS Icon cards row */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {OS_TABS.map((os) => {
          const isActive = selectedOS === os.id;
          return (
            <div
              key={os.id}
              onClick={() => setSelectedOS(os.id)}
              style={{
                width: 100,
                padding: '14px 8px',
                border: isActive ? '2px solid #0073bb' : '1px solid #d5dbdb',
                borderRadius: 8,
                background: isActive ? '#f2f8fd' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#aab7b8';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#d5dbdb';
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{os.icon}</div>
              <div
                style={{
                  fontSize: 12,
                  color: '#16191f',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'pre-line',
                  lineHeight: 1.3,
                }}
              >
                {os.label}
              </div>
            </div>
          );
        })}

        {/* Browse more AMIs */}
        <div
          style={{
            width: 120,
            padding: '14px 8px',
            border: '1px solid #d5dbdb',
            borderRadius: 8,
            background: '#fff',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>🔍</div>
          <div style={{ fontSize: 12, color: '#0073bb', fontWeight: 600 }}>
            Browse more AMIs
          </div>
          <div style={{ fontSize: 10, color: '#687078', marginTop: 2 }}>
            Including AMIs from AWS, Marketplace and Community
          </div>
        </div>
      </div>

      {/* AMI select label */}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#16191f', marginBottom: 8 }}>
        Amazon Machine Image (AMI)
      </div>

      {/* AMI dropdown-style card */}
      {filteredAmis.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredAmis.slice(0, 5).map((ami) => {
            const isSelected = config.ami === ami.id;
            return (
              <div
                key={ami.id}
                onClick={() => selectAmi(ami)}
                style={{
                  padding: '12px 14px',
                  border: isSelected ? '2px solid #0073bb' : '1px solid #d5dbdb',
                  borderRadius: 6,
                  background: isSelected ? '#f2f8fd' : '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#aab7b8';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#d5dbdb';
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>
                    {ami.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#545b64', marginTop: 2 }}>
                    <span style={{ fontFamily: 'monospace' }}>{ami.id}</span>
                    <span style={{ margin: '0 8px', color: '#d5dbdb' }}>|</span>
                    Virtualization: {ami.virtualizationType}
                    <span style={{ margin: '0 8px', color: '#d5dbdb' }}>|</span>
                    Root device type: {ami.rootDeviceType}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      background: '#f2f3f3',
                      borderRadius: 3,
                      fontSize: 11,
                      color: '#545b64',
                    }}
                  >
                    {ami.architecture}
                  </span>
                  {isSelected && (
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#0073bb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: 30,
            color: '#687078',
            fontSize: 14,
            border: '1px solid #d5dbdb',
            borderRadius: 6,
          }}
        >
          No AMIs match your search
        </div>
      )}

      {/* Custom AMI */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, color: '#545b64', marginBottom: 6 }}>
          Or specify a custom AMI ID:
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={customAmiId}
            onChange={(e) => setCustomAmiId(e.target.value)}
            placeholder="ami-0123456789abcdef0"
            style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: 13 }}
          />
          <button
            onClick={() => {
              if (!customAmiId.trim()) return;
              onChange({
                ami: customAmiId.trim(),
                amiData: {
                  id: customAmiId.trim(),
                  name: 'Custom AMI',
                  description: 'User-provided',
                  platform: 'linux',
                  architecture: 'x86_64',
                  owner: 'custom',
                  ownerAlias: 'Custom',
                  rootDeviceType: 'ebs',
                  virtualizationType: 'hvm',
                  icon: '📦',
                },
              });
            }}
            disabled={!customAmiId.trim()}
            style={{
              padding: '8px 16px',
              background: '#fff',
              color: customAmiId.trim() ? '#16191f' : '#aab7b8',
              border: `1px solid ${customAmiId.trim() ? '#aab7b8' : '#d5dbdb'}`,
              borderRadius: 4,
              cursor: customAmiId.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13,
            }}
          >
            Select
          </button>
        </div>
      </div>

      {/* Selected AMI description */}
      {config.amiData && config.amiData.name !== 'Custom AMI' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#16191f', marginBottom: 4 }}>
            Description
          </div>
          <p style={{ fontSize: 13, color: '#545b64', lineHeight: 1.5, margin: 0 }}>
            {config.amiData.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default Step2AMI;