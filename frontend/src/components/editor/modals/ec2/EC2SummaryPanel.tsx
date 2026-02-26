// src/components/editor/modals/ec2/EC2SummaryPanel.tsx

import React, { useState } from 'react';
import type { EC2FullConfig } from './types/ec2-config';

interface EC2SummaryPanelProps {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
  onSectionClick: (id: string) => void;
}

const EC2SummaryPanel: React.FC<EC2SummaryPanelProps> = ({
  config,
  onChange,
  onSectionClick,
}) => {
  const [showFreeTier, setShowFreeTier] = useState(true);

  const linkStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#0073bb',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    marginBottom: 2,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#16191f',
    marginBottom: 14,
  };

  return (
    <div
      style={{
        width: 340,
        minWidth: 340,
        background: '#fff',
        borderLeft: '1px solid #d5dbdb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 14px',
          borderBottom: '1px solid #eaeded',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, color: '#545b64' }}>▼</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#16191f' }}>
          Summary
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* Number of instances */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: '#16191f' }}>
              Number of instances
            </span>
            <span style={{ fontSize: 12, color: '#0073bb', cursor: 'pointer' }}>
              Info
            </span>
          </div>
          <input
            type="number"
            min={1}
            max={100}
            value={config.numberOfInstances}
            onChange={(e) =>
              onChange({
                numberOfInstances: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #aab7b8',
              borderRadius: 4,
              fontSize: 14,
              color: '#16191f',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ borderBottom: '1px solid #eaeded', marginBottom: 14 }} />

        {/* Software Image (AMI) */}
        <div style={{ marginBottom: 14 }}>
          <span style={linkStyle} onClick={() => onSectionClick('ami')}>
            Software Image (AMI)
          </span>
          <div style={valueStyle}>
            {config.amiData ? (
              <>
                {config.amiData.name}
                <span style={{ display: 'block', fontSize: 11, color: '#687078', fontFamily: 'monospace' }}>
                  {config.ami}
                </span>
              </>
            ) : config.ami ? (
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{config.ami}</span>
            ) : (
              <span style={{ color: '#aab7b8', fontStyle: 'italic' }}>Not selected</span>
            )}
          </div>
        </div>

        {/* Instance type */}
        <div style={{ marginBottom: 14 }}>
          <span style={linkStyle} onClick={() => onSectionClick('instance-type')}>
            Virtual server type (instance type)
          </span>
          <div style={valueStyle}>
            {config.instanceType ? (
              <>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {config.instanceType}
                </span>
                {config.instanceTypeData && (
                  <span style={{ color: '#687078', marginLeft: 6, fontSize: 12 }}>
                    ({config.instanceTypeData.vCPUs} vCPU, {config.instanceTypeData.memory} GiB)
                  </span>
                )}
              </>
            ) : (
              <span style={{ color: '#aab7b8', fontStyle: 'italic' }}>Not selected</span>
            )}
          </div>
        </div>

        {/* Key pair */}
        <div style={{ marginBottom: 14 }}>
          <span style={linkStyle} onClick={() => onSectionClick('key-pair')}>
            Key pair
          </span>
          <div style={valueStyle}>
            {config.keyName || (
              <span style={{ color: '#aab7b8', fontStyle: 'italic' }}>
                No key pair selected
              </span>
            )}
          </div>
        </div>

        {/* Firewall */}
        <div style={{ marginBottom: 14 }}>
          <span style={linkStyle} onClick={() => onSectionClick('network')}>
            Firewall (security group)
          </span>
          <div style={valueStyle}>
            {config.vpcSecurityGroupIds.length > 0
              ? `${config.vpcSecurityGroupIds.length} security group(s)`
              : 'New security group'}
          </div>
        </div>

        {/* Storage */}
        <div style={{ marginBottom: 14 }}>
          <span style={linkStyle} onClick={() => onSectionClick('storage')}>
            Storage (volumes)
          </span>
          <div style={valueStyle}>
            {1 + config.ebsBlockDevices.length} volume(s) -{' '}
            {config.rootBlockDevice.volumeSize +
              config.ebsBlockDevices.reduce((s, v) => s + v.volumeSize, 0)}{' '}
            GiB
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #eaeded', marginBottom: 14 }} />

        {/* Free tier info */}
        {showFreeTier && (
          <div
            style={{
              padding: '14px 16px',
              background: '#fff',
              border: '2px solid #ec7211',
              borderRadius: 8,
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowFreeTier(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 10,
                background: 'none',
                border: 'none',
                fontSize: 16,
                color: '#687078',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16, color: '#0073bb', flexShrink: 0 }}>
                ℹ️
              </span>
              <div style={{ fontSize: 12, color: '#16191f', lineHeight: 1.5 }}>
                <strong>Free tier:</strong> In your first year of opening an AWS
                account, you get 750 hours per month of t2.micro instance usage
                (or t3.micro where t2.micro isn't available) when used with free
                tier AMIs, 750 hours per month of public IPv4 address usage, 30
                GiB of EBS storage, 2 million I/Os, 1 GB of snapshots, and 100
                GB of bandwidth to the internet.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EC2SummaryPanel;