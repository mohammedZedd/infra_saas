// src/components/editor/modals/ec2/steps/Step3InstanceType.tsx

import React, { useState, useMemo } from 'react';
import type { EC2FullConfig } from '../types/ec2-config';
import { EC2_INSTANCE_TYPES, INSTANCE_FAMILY_FILTERS } from '../data/ec2-instance-types';

interface Step3Props {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
}

const Step3InstanceType: React.FC<Step3Props> = ({ config, onChange }) => {
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [showCurrentGenOnly, setShowCurrentGenOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'vcpu' | 'memory'>('name');

  const filteredTypes = useMemo(() => {
    let list = EC2_INSTANCE_TYPES.filter((t) => {
      if (familyFilter !== 'all' && t.family !== familyFilter) return false;
      if (showCurrentGenOnly && !t.currentGen) return false;
      if (config.amiData?.architecture) {
        if (!t.architecture.includes(config.amiData.architecture)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.family.toLowerCase().includes(q);
      }
      return true;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.pricePerHour - b.pricePerHour;
        case 'vcpu': return a.vCPUs - b.vCPUs;
        case 'memory': return a.memory - b.memory;
        default: return a.name.localeCompare(b.name);
      }
    });

    return list;
  }, [search, familyFilter, showCurrentGenOnly, sortBy, config.amiData]);

  const selectType = (t: typeof EC2_INSTANCE_TYPES[0]) => {
    onChange({ instanceType: t.name, instanceTypeData: t });
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

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #d5dbdb',
    borderRadius: 4,
    fontSize: 13,
    color: '#16191f',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
  };

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: '#687078',
    textAlign: 'left',
    borderBottom: '2px solid #e8eaed',
    background: '#fafbfc',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13,
    color: '#16191f',
    borderBottom: '1px solid #f0f2f5',
  };

  return (
    <div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8eaed',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: '#16191f', marginBottom: 4 }}>
          Instance type
        </div>
        <div style={{ fontSize: 13, color: '#687078', marginBottom: 16 }}>
          Instance type determines the hardware of the host computer. Each instance type offers
          different compute, memory, and storage capabilities.
        </div>

        {/* Selected instance banner */}
        {config.instanceTypeData && (
          <div
            style={{
              padding: '12px 16px',
              background: '#d1e7dd',
              border: '1px solid #a3cfbb',
              borderRadius: 6,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#0f5132', fontSize: 15 }}>
                {config.instanceTypeData.name}
              </span>
              <span style={{ color: '#198754', fontSize: 13, marginLeft: 12 }}>
                {config.instanceTypeData.family}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#0f5132' }}>
              <span>{config.instanceTypeData.vCPUs} vCPU</span>
              <span>{config.instanceTypeData.memory} GiB RAM</span>
              <span style={{ fontWeight: 600 }}>
                ${config.instanceTypeData.pricePerHour}/hr
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search instance types..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#adb5bd',
                fontSize: 14,
              }}
            >
              🔍
            </span>
          </div>
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            style={selectStyle}
          >
            {INSTANCE_FAMILY_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            style={selectStyle}
          >
            <option value="name">Sort by name</option>
            <option value="price">Sort by price</option>
            <option value="vcpu">Sort by vCPUs</option>
            <option value="memory">Sort by memory</option>
          </select>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#687078',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={showCurrentGenOnly}
              onChange={(e) => setShowCurrentGenOnly(e.target.checked)}
              style={{ accentColor: '#0d6efd' }}
            />
            Current generation only
          </label>
        </div>

        {/* Count */}
        <div style={{ fontSize: 12, color: '#687078', marginBottom: 8 }}>
          {filteredTypes.length} instance types
          {config.amiData?.architecture && (
            <span> (filtered for {config.amiData.architecture})</span>
          )}
        </div>

        {/* Table */}
        <div
          style={{
            border: '1px solid #e8eaed',
            borderRadius: 6,
            overflow: 'hidden',
            maxHeight: 440,
            overflowY: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 30 }} />
                <th style={thStyle} onClick={() => setSortBy('name')}>
                  Name {sortBy === 'name' && '↕'}
                </th>
                <th style={thStyle}>Family</th>
                <th style={thStyle} onClick={() => setSortBy('vcpu')}>
                  vCPUs {sortBy === 'vcpu' && '↕'}
                </th>
                <th style={thStyle} onClick={() => setSortBy('memory')}>
                  Memory {sortBy === 'memory' && '↕'}
                </th>
                <th style={thStyle}>Storage</th>
                <th style={thStyle}>Network</th>
                <th style={thStyle} onClick={() => setSortBy('price')}>
                  Price/hr {sortBy === 'price' && '↕'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((t) => {
                const isSelected = config.instanceType === t.name;
                return (
                  <tr
                    key={t.name}
                    onClick={() => selectType(t)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#e8f0fe' : 'transparent',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: isSelected
                            ? '5px solid #0d6efd'
                            : '2px solid #d5dbdb',
                          background: '#fff',
                        }}
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'monospace' }}>
                      {t.name}
                      {t.burstable && (
                        <span
                          style={{
                            marginLeft: 6,
                            padding: '1px 4px',
                            background: '#fff3cd',
                            color: '#856404',
                            fontSize: 9,
                            borderRadius: 2,
                            fontFamily: 'sans-serif',
                            fontWeight: 500,
                          }}
                        >
                          Burstable
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, color: '#687078' }}>
                      {t.family}
                    </td>
                    <td style={tdStyle}>{t.vCPUs}</td>
                    <td style={tdStyle}>{t.memory} GiB</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{t.storage}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{t.network}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#0d6efd' }}>
                      ${t.pricePerHour.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTypes.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#687078' }}>
              No instance types match your filters
            </div>
          )}
        </div>

        {/* Monthly estimate */}
        {config.instanceTypeData && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: '#f8f9fa',
              borderRadius: 6,
              fontSize: 13,
              color: '#687078',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Estimated monthly cost (730 hrs)</span>
            <span style={{ fontWeight: 700, color: '#16191f' }}>
              ${(config.instanceTypeData.pricePerHour * 730).toFixed(2)}/mo
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3InstanceType;