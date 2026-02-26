// src/components/editor/modals/ec2/steps/Step7Advanced.tsx

import React, { useState } from 'react';
import type { EC2FullConfig } from '../types/ec2-config';

interface Step7Props {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
}

const MOCK_IAM_PROFILES = [
  { name: 'ec2-s3-readonly', arn: 'arn:aws:iam::123456789012:instance-profile/ec2-s3-readonly' },
  { name: 'ec2-ssm-role', arn: 'arn:aws:iam::123456789012:instance-profile/ec2-ssm-role' },
  { name: 'ec2-full-access', arn: 'arn:aws:iam::123456789012:instance-profile/ec2-full-access' },
];

const MOCK_PLACEMENT_GROUPS = [
  { name: 'web-cluster', strategy: 'cluster' },
  { name: 'spread-group', strategy: 'spread' },
  { name: 'partition-group', strategy: 'partition' },
];

type SectionKey =
  | 'iam' | 'monitoring' | 'userdata' | 'spot' | 'placement'
  | 'cpu' | 'credit' | 'metadata' | 'tenancy' | 'capacity'
  | 'protection' | 'enclave' | 'maintenance' | 'launch';

const Step7Advanced: React.FC<Step7Props> = ({ config, onChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
    new Set(['iam', 'monitoring'])
  );

  const toggleSection = (key: SectionKey) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e8eaed',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  };

  const sectionHeaderStyle = (expanded: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    cursor: 'pointer',
    background: expanded ? '#fafbfc' : '#fff',
    borderBottom: expanded ? '1px solid #e8eaed' : 'none',
    transition: 'background 0.15s ease',
    userSelect: 'none',
  });

  const sectionBodyStyle: React.CSSProperties = {
    padding: '16px 18px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#16191f',
    marginBottom: 4,
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d5dbdb',
    borderRadius: 4,
    fontSize: 13,
    color: '#16191f',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d5dbdb',
    borderRadius: 4,
    fontSize: 13,
    color: '#16191f',
    background: '#fff',
    outline: 'none',
  };

  const chevron = (expanded: boolean) => (
    <span
      style={{
        display: 'inline-block',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
        fontSize: 12,
        color: '#687078',
      }}
    >
      ▶
    </span>
  );

  const isBurstable = config.instanceType?.startsWith('t');

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#16191f', marginBottom: 4 }}>
        Advanced details
      </div>
      <div style={{ fontSize: 13, color: '#687078', marginBottom: 16 }}>
        Configure optional advanced settings including IAM role, monitoring, user data,
        spot instances, placement, CPU, metadata, and protection.
      </div>

      {/* ============ IAM ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('iam'))} onClick={() => toggleSection('iam')}>
          {chevron(expandedSections.has('iam'))}
          <span style={{ fontSize: 16 }}>🔐</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>IAM instance profile</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.iamInstanceProfile || 'None selected'}
            </div>
          </div>
        </div>
        {expandedSections.has('iam') && (
          <div style={sectionBodyStyle}>
            <label style={labelStyle}>IAM instance profile</label>
            <select
              value={config.iamInstanceProfile}
              onChange={(e) => onChange({ iamInstanceProfile: e.target.value })}
              style={selectStyle}
            >
              <option value="">None</option>
              {MOCK_IAM_PROFILES.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            <div style={{ fontSize: 11, color: '#687078', marginTop: 4 }}>
              An IAM instance profile grants the instance permissions to access AWS services.
              Requires <code>iam:PassRole</code> permission.
            </div>
          </div>
        )}
      </div>

      {/* ============ MONITORING ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('monitoring'))} onClick={() => toggleSection('monitoring')}>
          {chevron(expandedSections.has('monitoring'))}
          <span style={{ fontSize: 16 }}>📊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Monitoring</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.monitoring ? 'Detailed monitoring enabled (\$3.50/mo)' : 'Basic monitoring (default)'}
            </div>
          </div>
        </div>
        {expandedSections.has('monitoring') && (
          <div style={sectionBodyStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.monitoring}
                onChange={(e) => onChange({ monitoring: e.target.checked })}
                style={{ accentColor: '#0d6efd' }}
              />
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#16191f' }}>
                  Enable detailed monitoring
                </span>
                <div style={{ fontSize: 11, color: '#687078' }}>
                  CloudWatch metrics every 1 minute instead of 5 minutes. Additional cost: \$3.50/instance/month.
                </div>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* ============ USER DATA ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('userdata'))} onClick={() => toggleSection('userdata')}>
          {chevron(expandedSections.has('userdata'))}
          <span style={{ fontSize: 16 }}>📜</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>User data</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.userData ? `${config.userData.split('\n').length} lines` : 'No script'}
            </div>
          </div>
        </div>
        {expandedSections.has('userdata') && (
          <div style={sectionBodyStyle}>
            <label style={labelStyle}>User data script</label>
            <textarea
              value={config.userData}
              onChange={(e) => onChange({ userData: e.target.value })}
              placeholder={`#!/bin/bash\nyum update -y\nyum install -y httpd\nsystemctl start httpd\nsystemctl enable httpd`}
              rows={10}
              style={{
                ...inputStyle,
                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontSize: 12,
                lineHeight: '1.6',
                resize: 'vertical',
                minHeight: 150,
                background: '#1e1e2e',
                color: '#cdd6f4',
                border: '1px solid #45475a',
                borderRadius: 6,
              }}
            />
            <div style={{ fontSize: 11, color: '#687078', marginTop: 6 }}>
              Script runs as root on first boot. Maximum 16 KB. Do not include secrets in plain text.
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.userDataReplaceOnChange}
                  onChange={(e) => onChange({ userDataReplaceOnChange: e.target.checked })}
                  style={{ accentColor: '#0d6efd' }}
                />
                <div>
                  <span style={{ fontSize: 12, color: '#16191f' }}>Replace instance on user data change</span>
                  <div style={{ fontSize: 11, color: '#687078' }}>
                    If enabled, changing user_data will destroy and recreate the instance.
                  </div>
                </div>
              </label>
            </div>

            {/* Base64 option */}
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>User data (base64) — optional override</label>
              <input
                type="text"
                value={config.userDataBase64}
                onChange={(e) => onChange({ userDataBase64: e.target.value })}
                placeholder="Base64-encoded user data (for gzip-compressed data)"
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
              />
              <div style={{ fontSize: 11, color: '#687078', marginTop: 2 }}>
                Use instead of user_data for binary/gzip content.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ SPOT / MARKET OPTIONS ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('spot'))} onClick={() => toggleSection('spot')}>
          {chevron(expandedSections.has('spot'))}
          <span style={{ fontSize: 16 }}>💰</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Purchasing option</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.instanceMarketOptions ? `Spot instance (max: $${config.instanceMarketOptions.spotOptions?.maxPrice || 'auto'})` : 'On-Demand'}
            </div>
          </div>
        </div>
        {expandedSections.has('spot') && (
          <div style={sectionBodyStyle}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { value: false, label: 'On-Demand', desc: 'Pay per hour, no commitment' },
                { value: true, label: 'Spot Instance', desc: 'Up to 90% discount, can be interrupted' },
              ].map((opt) => {
                const isSpot = !!config.instanceMarketOptions;
                const selected = opt.value === isSpot;
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => {
                      if (opt.value) {
                        onChange({
                          instanceMarketOptions: {
                            marketType: 'spot',
                            spotOptions: {
                              instanceInterruptionBehavior: 'terminate',
                              spotInstanceType: 'one-time',
                            },
                          },
                        });
                      } else {
                        onChange({ instanceMarketOptions: undefined });
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: selected ? '2px solid #0d6efd' : '1px solid #e8eaed',
                      borderRadius: 8,
                      background: selected ? '#e8f0fe' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: selected ? '5px solid #0d6efd' : '2px solid #d5dbdb',
                          background: '#fff',
                        }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>
                        {opt.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#687078', marginTop: 4, marginLeft: 24 }}>
                      {opt.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {config.instanceMarketOptions && (
              <div
                style={{
                  border: '1px solid #e8eaed',
                  borderRadius: 6,
                  padding: 14,
                  background: '#fafbfc',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Spot instance type</label>
                    <select
                      value={config.instanceMarketOptions.spotOptions?.spotInstanceType || 'one-time'}
                      onChange={(e) =>
                        onChange({
                          instanceMarketOptions: {
                            ...config.instanceMarketOptions!,
                            spotOptions: {
                              ...config.instanceMarketOptions!.spotOptions!,
                              spotInstanceType: e.target.value as 'one-time' | 'persistent',
                            },
                          },
                        })
                      }
                      style={selectStyle}
                    >
                      <option value="one-time">One-time</option>
                      <option value="persistent">Persistent</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Interruption behavior</label>
                    <select
                      value={config.instanceMarketOptions.spotOptions?.instanceInterruptionBehavior || 'terminate'}
                      onChange={(e) =>
                        onChange({
                          instanceMarketOptions: {
                            ...config.instanceMarketOptions!,
                            spotOptions: {
                              ...config.instanceMarketOptions!.spotOptions!,
                              instanceInterruptionBehavior: e.target.value as 'terminate' | 'stop' | 'hibernate',
                            },
                          },
                        })
                      }
                      style={selectStyle}
                    >
                      <option value="terminate">Terminate</option>
                      <option value="stop">Stop</option>
                      <option value="hibernate">Hibernate</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Maximum price ($/hr)</label>
                  <input
                    type="text"
                    value={config.instanceMarketOptions.spotOptions?.maxPrice || ''}
                    onChange={(e) =>
                      onChange({
                        instanceMarketOptions: {
                          ...config.instanceMarketOptions!,
                          spotOptions: {
                            ...config.instanceMarketOptions!.spotOptions!,
                            maxPrice: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Leave empty for market price"
                    style={{ ...inputStyle, width: 250 }}
                  />
                </div>

                {config.instanceMarketOptions.spotOptions?.spotInstanceType === 'persistent' && (
                  <div>
                    <label style={labelStyle}>Valid until (UTC)</label>
                    <input
                      type="datetime-local"
                      value={config.instanceMarketOptions.spotOptions?.validUntil || ''}
                      onChange={(e) =>
                        onChange({
                          instanceMarketOptions: {
                            ...config.instanceMarketOptions!,
                            spotOptions: {
                              ...config.instanceMarketOptions!.spotOptions!,
                              validUntil: e.target.value,
                            },
                          },
                        })
                      }
                      style={{ ...inputStyle, width: 280 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ METADATA ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('metadata'))} onClick={() => toggleSection('metadata')}>
          {chevron(expandedSections.has('metadata'))}
          <span style={{ fontSize: 16 }}>🏷️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Metadata options (IMDS)</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              IMDSv{config.metadataOptions.httpTokens === 'required' ? '2 (required)' : '1 & v2'}
            </div>
          </div>
        </div>
        {expandedSections.has('metadata') && (
          <div style={sectionBodyStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>IMDSv2</label>
                <select
                  value={config.metadataOptions.httpTokens}
                  onChange={(e) =>
                    onChange({
                      metadataOptions: {
                        ...config.metadataOptions,
                        httpTokens: e.target.value as 'optional' | 'required',
                      },
                    })
                  }
                  style={selectStyle}
                >
                  <option value="required">Required (recommended)</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Metadata endpoint</label>
                <select
                  value={config.metadataOptions.httpEndpoint}
                  onChange={(e) =>
                    onChange({
                      metadataOptions: {
                        ...config.metadataOptions,
                        httpEndpoint: e.target.value as 'enabled' | 'disabled',
                      },
                    })
                  }
                  style={selectStyle}
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Hop limit</label>
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={config.metadataOptions.httpPutResponseHopLimit}
                  onChange={(e) =>
                    onChange({
                      metadataOptions: {
                        ...config.metadataOptions,
                        httpPutResponseHopLimit: parseInt(e.target.value) || 2,
                      },
                    })
                  }
                  style={{ ...inputStyle, width: 100 }}
                />
                <div style={{ fontSize: 10, color: '#687078', marginTop: 2 }}>1–64 (default: 2)</div>
              </div>
              <div>
                <label style={labelStyle}>Allow tags in metadata</label>
                <select
                  value={config.metadataOptions.instanceMetadataTags}
                  onChange={(e) =>
                    onChange({
                      metadataOptions: {
                        ...config.metadataOptions,
                        instanceMetadataTags: e.target.value as 'enabled' | 'disabled',
                      },
                    })
                  }
                  style={selectStyle}
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled</option>
                </select>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.metadataOptions.httpProtocolIpv6 === 'enabled'}
                onChange={(e) =>
                  onChange({
                    metadataOptions: {
                      ...config.metadataOptions,
                      httpProtocolIpv6: e.target.checked ? 'enabled' : 'disabled',
                    },
                  })
                }
                style={{ accentColor: '#0d6efd' }}
              />
              <span style={{ fontSize: 12, color: '#16191f' }}>Enable IPv6 metadata endpoint</span>
            </label>
          </div>
        )}
      </div>

      {/* ============ PLACEMENT ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('placement'))} onClick={() => toggleSection('placement')}>
          {chevron(expandedSections.has('placement'))}
          <span style={{ fontSize: 16 }}>📍</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Placement</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.placementGroup || 'No placement group'}
            </div>
          </div>
        </div>
        {expandedSections.has('placement') && (
          <div style={sectionBodyStyle}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Placement group</label>
              <select
                value={config.placementGroup}
                onChange={(e) => onChange({ placementGroup: e.target.value })}
                style={selectStyle}
              >
                <option value="">None</option>
                {MOCK_PLACEMENT_GROUPS.map((pg) => (
                  <option key={pg.name} value={pg.name}>
                    {pg.name} ({pg.strategy})
                  </option>
                ))}
              </select>
            </div>

            {config.placementGroup &&
              MOCK_PLACEMENT_GROUPS.find((p) => p.name === config.placementGroup)?.strategy === 'partition' && (
                <div>
                  <label style={labelStyle}>Partition number</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={config.placementPartitionNumber || 1}
                    onChange={(e) => onChange({ placementPartitionNumber: parseInt(e.target.value) || 1 })}
                    style={{ ...inputStyle, width: 100 }}
                  />
                </div>
              )}
          </div>
        )}
      </div>

      {/* ============ TENANCY ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('tenancy'))} onClick={() => toggleSection('tenancy')}>
          {chevron(expandedSections.has('tenancy'))}
          <span style={{ fontSize: 16 }}>🏢</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Tenancy</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.tenancy === 'default' ? 'Shared (default)' : config.tenancy}
            </div>
          </div>
        </div>
        {expandedSections.has('tenancy') && (
          <div style={sectionBodyStyle}>
            <label style={labelStyle}>Tenancy</label>
            <select
              value={config.tenancy}
              onChange={(e) => onChange({ tenancy: e.target.value as 'default' | 'dedicated' | 'host' })}
              style={{ ...selectStyle, marginBottom: 14 }}
            >
              <option value="default">Shared — Run on shared hardware (default)</option>
              <option value="dedicated">Dedicated — Run on dedicated instance</option>
              <option value="host">Dedicated Host — Run on a dedicated host</option>
            </select>

            {config.tenancy === 'host' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Host ID</label>
                  <input
                    type="text"
                    value={config.hostId}
                    onChange={(e) => onChange({ hostId: e.target.value })}
                    placeholder="h-0123456789abcdef0"
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Host resource group ARN</label>
                  <input
                    type="text"
                    value={config.hostResourceGroupArn}
                    onChange={(e) => onChange({ hostResourceGroupArn: e.target.value })}
                    placeholder="arn:aws:resource-groups:..."
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ CPU OPTIONS ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('cpu'))} onClick={() => toggleSection('cpu')}>
          {chevron(expandedSections.has('cpu'))}
          <span style={{ fontSize: 16 }}>🔧</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>CPU options</div>
            <div style={{ fontSize: 11, color: '#687078' }}>Custom core count and threads</div>
          </div>
        </div>
        {expandedSections.has('cpu') && (
          <div style={sectionBodyStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Core count</label>
                <input
                  type="number"
                  min={1}
                  value={config.cpuOptions?.coreCount || ''}
                  onChange={(e) =>
                    onChange({
                      cpuOptions: {
                        ...config.cpuOptions,
                        coreCount: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="Default"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Threads per core</label>
                <select
                  value={config.cpuOptions?.threadsPerCore || 2}
                  onChange={(e) =>
                    onChange({
                      cpuOptions: {
                        ...config.cpuOptions,
                        threadsPerCore: parseInt(e.target.value),
                      },
                    })
                  }
                  style={selectStyle}
                >
                  <option value={2}>2 — Hyperthreading enabled (default)</option>
                  <option value={1}>1 — Hyperthreading disabled</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>AMD SEV-SNP</label>
                <select
                  value={config.cpuOptions?.amdSevSnp || 'disabled'}
                  onChange={(e) =>
                    onChange({
                      cpuOptions: {
                        ...config.cpuOptions,
                        amdSevSnp: e.target.value as 'enabled' | 'disabled',
                      },
                    })
                  }
                  style={selectStyle}
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled (M6a, R6a, C6a only)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nested virtualization</label>
                <select
                  value={config.cpuOptions?.nestedVirtualization || 'disabled'}
                  onChange={(e) =>
                    onChange({
                      cpuOptions: {
                        ...config.cpuOptions,
                        nestedVirtualization: e.target.value as 'enabled' | 'disabled',
                      },
                    })
                  }
                  style={selectStyle}
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled (C8i, M8i, R8i only)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ CREDIT SPECIFICATION (T-series) ============ */}
      {isBurstable && (
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle(expandedSections.has('credit'))} onClick={() => toggleSection('credit')}>
            {chevron(expandedSections.has('credit'))}
            <span style={{ fontSize: 16 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Credit specification</div>
              <div style={{ fontSize: 11, color: '#687078' }}>
                {config.creditSpecification?.cpuCredits || 'unlimited'} mode
              </div>
            </div>
          </div>
          {expandedSections.has('credit') && (
            <div style={sectionBodyStyle}>
              <label style={labelStyle}>CPU credits</label>
              <select
                value={config.creditSpecification?.cpuCredits || 'unlimited'}
                onChange={(e) =>
                  onChange({
                    creditSpecification: {
                      cpuCredits: e.target.value as 'standard' | 'unlimited',
                    },
                  })
                }
                style={selectStyle}
              >
                <option value="unlimited">Unlimited — Burst beyond baseline, pay for surplus</option>
                <option value="standard">Standard — Can only burst using accrued credits</option>
              </select>
              <div style={{ fontSize: 11, color: '#687078', marginTop: 4 }}>
                T3 instances launch as unlimited by default. T2 instances launch as standard by default.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ CAPACITY RESERVATION ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('capacity'))} onClick={() => toggleSection('capacity')}>
          {chevron(expandedSections.has('capacity'))}
          <span style={{ fontSize: 16 }}>📦</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Capacity Reservation</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.capacityReservationSpecification?.capacityReservationPreference || 'open'}
            </div>
          </div>
        </div>
        {expandedSections.has('capacity') && (
          <div style={sectionBodyStyle}>
            <label style={labelStyle}>Preference</label>
            <select
              value={config.capacityReservationSpecification?.capacityReservationPreference || 'open'}
              onChange={(e) =>
                onChange({
                  capacityReservationSpecification: {
                    capacityReservationPreference: e.target.value as 'open' | 'none',
                  },
                })
              }
              style={{ ...selectStyle, marginBottom: 14 }}
            >
              <option value="open">Open — Launch into any available Capacity Reservation</option>
              <option value="none">None — Don't use Capacity Reservations</option>
            </select>

            <div>
              <label style={labelStyle}>Capacity Reservation ID (optional)</label>
              <input
                type="text"
                value={config.capacityReservationSpecification?.capacityReservationTarget?.capacityReservationId || ''}
                onChange={(e) =>
                  onChange({
                    capacityReservationSpecification: {
                      ...config.capacityReservationSpecification!,
                      capacityReservationTarget: {
                        ...config.capacityReservationSpecification?.capacityReservationTarget,
                        capacityReservationId: e.target.value,
                      },
                    },
                  })
                }
                placeholder="cr-0123456789abcdef0"
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ============ PROTECTION ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('protection'))} onClick={() => toggleSection('protection')}>
          {chevron(expandedSections.has('protection'))}
          <span style={{ fontSize: 16 }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Shutdown & Protection</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              Shutdown: {config.instanceInitiatedShutdownBehavior} ·
              Termination protection: {config.disableApiTermination ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
        {expandedSections.has('protection') && (
          <div style={sectionBodyStyle}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Shutdown behavior</label>
              <select
                value={config.instanceInitiatedShutdownBehavior}
                onChange={(e) =>
                  onChange({ instanceInitiatedShutdownBehavior: e.target.value as 'stop' | 'terminate' })
                }
                style={selectStyle}
              >
                <option value="stop">Stop — Instance is stopped (EBS-backed only)</option>
                <option value="terminate">Terminate — Instance is terminated</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.disableApiTermination}
                  onChange={(e) => onChange({ disableApiTermination: e.target.checked })}
                  style={{ accentColor: '#0d6efd' }}
                />
                <div>
                  <span style={{ fontSize: 13, color: '#16191f' }}>Enable termination protection</span>
                  <div style={{ fontSize: 11, color: '#687078' }}>
                    Prevents accidental termination via API or console.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.disableApiStop}
                  onChange={(e) => onChange({ disableApiStop: e.target.checked })}
                  style={{ accentColor: '#0d6efd' }}
                />
                <div>
                  <span style={{ fontSize: 13, color: '#16191f' }}>Enable stop protection</span>
                  <div style={{ fontSize: 11, color: '#687078' }}>
                    Prevents the instance from being stopped via API.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.hibernation}
                  onChange={(e) => onChange({ hibernation: e.target.checked })}
                  style={{ accentColor: '#0d6efd' }}
                />
                <div>
                  <span style={{ fontSize: 13, color: '#16191f' }}>Enable hibernation</span>
                  <div style={{ fontSize: 11, color: '#687078' }}>
                    Save memory state to EBS root volume. Root volume must be encrypted.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.forceDestroy}
                  onChange={(e) => onChange({ forceDestroy: e.target.checked })}
                  style={{ accentColor: '#d32f2f' }}
                />
                <div>
                  <span style={{ fontSize: 13, color: '#d32f2f', fontWeight: 600 }}>Force destroy</span>
                  <div style={{ fontSize: 11, color: '#687078' }}>
                    Destroy instance even if stop/termination protection is enabled.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ============ ENCLAVE ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('enclave'))} onClick={() => toggleSection('enclave')}>
          {chevron(expandedSections.has('enclave'))}
          <span style={{ fontSize: 16 }}>🔒</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Nitro Enclaves</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.enclaveOptions.enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
        {expandedSections.has('enclave') && (
          <div style={sectionBodyStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.enclaveOptions.enabled}
                onChange={(e) => onChange({ enclaveOptions: { enabled: e.target.checked } })}
                style={{ accentColor: '#0d6efd' }}
              />
              <div>
                <span style={{ fontSize: 13, color: '#16191f' }}>Enable Nitro Enclaves</span>
                <div style={{ fontSize: 11, color: '#687078' }}>
                  Isolated compute environment. Changing this will recreate the instance.
                </div>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* ============ MAINTENANCE ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('maintenance'))} onClick={() => toggleSection('maintenance')}>
          {chevron(expandedSections.has('maintenance'))}
          <span style={{ fontSize: 16 }}>🔧</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Maintenance</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              Auto recovery: {config.maintenanceOptions.autoRecovery}
            </div>
          </div>
        </div>
        {expandedSections.has('maintenance') && (
          <div style={sectionBodyStyle}>
            <label style={labelStyle}>Auto recovery</label>
            <select
              value={config.maintenanceOptions.autoRecovery}
              onChange={(e) =>
                onChange({ maintenanceOptions: { autoRecovery: e.target.value as 'default' | 'disabled' } })
              }
              style={selectStyle}
            >
              <option value="default">Default — Enable auto recovery</option>
              <option value="disabled">Disabled — Do not auto recover</option>
            </select>
          </div>
        )}
      </div>

      {/* ============ LAUNCH TEMPLATE (optional) ============ */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle(expandedSections.has('launch'))} onClick={() => toggleSection('launch')}>
          {chevron(expandedSections.has('launch'))}
          <span style={{ fontSize: 16 }}>🚀</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>Launch template (optional)</div>
            <div style={{ fontSize: 11, color: '#687078' }}>
              {config.launchTemplate?.id || config.launchTemplate?.name || 'Not using a launch template'}
            </div>
          </div>
        </div>
        {expandedSections.has('launch') && (
          <div style={sectionBodyStyle}>
            <div
              style={{
                padding: '10px 14px',
                background: '#cff4fc',
                border: '1px solid #9eeaf9',
                borderRadius: 6,
                fontSize: 12,
                color: '#055160',
                marginBottom: 14,
              }}
            >
              ℹ️ Launch template parameters are only used during creation. Instance-level parameters override the template.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Launch template ID</label>
                <input
                  type="text"
                  value={config.launchTemplate?.id || ''}
                  onChange={(e) =>
                    onChange({
                      launchTemplate: { ...config.launchTemplate, id: e.target.value, name: undefined },
                    })
                  }
                  placeholder="lt-0123456789abcdef0"
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={labelStyle}>Or template name</label>
                <input
                  type="text"
                  value={config.launchTemplate?.name || ''}
                  onChange={(e) =>
                    onChange({
                      launchTemplate: { ...config.launchTemplate, name: e.target.value, id: undefined },
                    })
                  }
                  placeholder="my-launch-template"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Version</label>
              <input
                type="text"
                value={config.launchTemplate?.version || ''}
                onChange={(e) =>
                  onChange({
                    launchTemplate: { ...config.launchTemplate, version: e.target.value },
                  })
                }
                placeholder="$Default, $Latest, or version number"
                style={{ ...inputStyle, width: 250 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step7Advanced;