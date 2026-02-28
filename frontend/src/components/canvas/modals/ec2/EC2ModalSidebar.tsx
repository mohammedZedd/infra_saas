// src/components/editor/modals/ec2/EC2ModalSidebar.tsx

import React from 'react';
import { EC2_STEPS } from './types/ec2-config';
import type { EC2FullConfig } from './types/ec2-config';

interface EC2ModalSidebarProps {
  activeSection: string;
  onSectionClick: (id: string) => void;
  config: EC2FullConfig;
}

const EC2ModalSidebar: React.FC<EC2ModalSidebarProps> = ({
  activeSection,
  onSectionClick,
  config,
}) => {
  const getStatus = (step: typeof EC2_STEPS[0]): 'complete' | 'active' | 'default' => {
    if (step.id === activeSection) return 'active';
    switch (step.id) {
      case 'name-tags': return config.name ? 'complete' : 'default';
      case 'ami': return config.ami ? 'complete' : 'default';
      case 'instance-type': return config.instanceType ? 'complete' : 'default';
      case 'storage': return 'complete';
      default: return 'default';
    }
  };

  const statusBadge = (index: number, status: string) => {
    const size = 28;
    if (status === 'complete') {
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#1d8102',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    }
    if (status === 'active') {
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#0073bb',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
      );
    }
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#f2f3f3',
          border: '1.5px solid #aab7b8',
          color: '#545b64',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>
    );
  };

  // Cost calc
  const hourly = config.instanceTypeData?.pricePerHour || 0;
  const storageCost =
    config.rootBlockDevice.volumeSize * 0.08 +
    config.ebsBlockDevices.reduce((s, v) => s + v.volumeSize * 0.08, 0);
  const monthly = hourly * 730 + storageCost + (config.monitoring ? 3.5 : 0);
  const total = monthly * config.numberOfInstances;

  return (
    <div
      style={{
        width: 250,
        minWidth: 250,
        background: '#fff',
        borderRight: '1px solid #d5dbdb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo header */}
      <div
        style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid #eaeded',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 6,
            background: '#ff9900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          🖥️
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#16191f' }}>
            Launch instance
          </div>
          <div style={{ fontSize: 11, color: '#687078', fontFamily: 'monospace' }}>
            aws_instance
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {EC2_STEPS.filter((s) => s.id !== 'summary').map((step, index) => {
          const status = getStatus(step);
          const isActive = status === 'active';

          return (
            <button
              key={step.id}
              onClick={() => onSectionClick(step.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: isActive ? '#f2f8fd' : 'transparent',
                borderLeft: isActive ? '4px solid #0073bb' : '4px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#fafafa';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {statusBadge(index, status)}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#0073bb' : '#16191f',
                  lineHeight: '20px',
                }}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cost footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #eaeded',
          background: '#fafafa',
        }}
      >
        <div style={{ fontSize: 12, color: '#545b64', marginBottom: 2 }}>
          Estimated cost
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#16191f' }}>
            ${total.toFixed(2)}
          </span>
          <span style={{ fontSize: 13, color: '#687078' }}>/mo</span>
        </div>
        <div style={{ fontSize: 11, color: '#687078', marginTop: 2 }}>
          × {config.numberOfInstances} instance
          {config.numberOfInstances > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default EC2ModalSidebar;