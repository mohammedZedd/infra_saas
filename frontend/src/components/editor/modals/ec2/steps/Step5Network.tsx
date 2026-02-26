// src/components/editor/modals/ec2/steps/Step5Network.tsx
// === FICHIER COMPLET (reprise depuis le début avec la fin manquante) ===

import React, { useState } from 'react';
import type { EC2FullConfig, SecurityGroupRuleConfig } from '../types/ec2-config';

interface Step5Props {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
}

const MOCK_VPCS = [
  { id: 'vpc-0a1b2c3d4e', name: 'production-vpc', cidr: '10.0.0.0/16' },
  { id: 'vpc-1a2b3c4d5e', name: 'staging-vpc', cidr: '172.16.0.0/16' },
  { id: 'vpc-default', name: 'default', cidr: '172.31.0.0/16' },
];

const MOCK_SUBNETS = [
  { id: 'subnet-pub-1a', name: 'public-1a', vpcId: 'vpc-0a1b2c3d4e', az: 'us-east-1a', cidr: '10.0.1.0/24', public: true },
  { id: 'subnet-priv-1a', name: 'private-1a', vpcId: 'vpc-0a1b2c3d4e', az: 'us-east-1a', cidr: '10.0.10.0/24', public: false },
  { id: 'subnet-pub-1b', name: 'public-1b', vpcId: 'vpc-0a1b2c3d4e', az: 'us-east-1b', cidr: '10.0.2.0/24', public: true },
  { id: 'subnet-priv-1b', name: 'private-1b', vpcId: 'vpc-0a1b2c3d4e', az: 'us-east-1b', cidr: '10.0.11.0/24', public: false },
  { id: 'subnet-default-1a', name: 'default-1a', vpcId: 'vpc-default', az: 'us-east-1a', cidr: '172.31.0.0/20', public: true },
];

const MOCK_SECURITY_GROUPS = [
  { id: 'sg-web', name: 'web-server-sg', vpcId: 'vpc-0a1b2c3d4e', description: 'Allow HTTP/HTTPS' },
  { id: 'sg-ssh', name: 'ssh-access-sg', vpcId: 'vpc-0a1b2c3d4e', description: 'Allow SSH' },
  { id: 'sg-default', name: 'default', vpcId: 'vpc-default', description: 'Default VPC security group' },
];

const Step5Network: React.FC<Step5Props> = ({ config, onChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inboundRules, setInboundRules] = useState<SecurityGroupRuleConfig[]>([
    {
      id: 'rule-1',
      type: 'ingress',
      protocol: 'tcp',
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ['0.0.0.0/0'],
      description: 'SSH access',
    },
  ]);

  const filteredSubnets = MOCK_SUBNETS.filter((s) =>
    !config.vpcId || s.vpcId === config.vpcId
  );

  const filteredSGs = MOCK_SECURITY_GROUPS.filter((sg) =>
    !config.vpcId || sg.vpcId === config.vpcId
  );

  const addInboundRule = () => {
    setInboundRules([
      ...inboundRules,
      {
        id: `rule-${Date.now()}`,
        type: 'ingress',
        protocol: 'tcp',
        fromPort: 443,
        toPort: 443,
        cidrBlocks: ['0.0.0.0/0'],
        description: '',
      },
    ]);
  };

  const removeInboundRule = (id: string) => {
    setInboundRules(inboundRules.filter((r) => r.id !== id));
  };

  const updateInboundRule = (id: string, updates: Partial<SecurityGroupRuleConfig>) => {
    setInboundRules(inboundRules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e8eaed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
    color: '#16191f',
    marginBottom: 6,
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d5dbdb',
    borderRadius: 4,
    fontSize: 14,
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
    fontSize: 14,
    color: '#16191f',
    background: '#fff',
    outline: 'none',
  };

  return (
    <div>
      {/* VPC & Subnet */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#16191f', marginBottom: 4 }}>
          Network settings
        </div>
        <div style={{ fontSize: 13, color: '#687078', marginBottom: 16 }}>
          Configure the network settings for your instance including VPC, subnet,
          public IP, and security groups.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>VPC</label>
            <select
              value={config.vpcId}
              onChange={(e) => onChange({ vpcId: e.target.value, subnetId: '', vpcSecurityGroupIds: [] })}
              style={selectStyle}
            >
              <option value="">Select a VPC</option>
              {MOCK_VPCS.map((vpc) => (
                <option key={vpc.id} value={vpc.id}>
                  {vpc.name} ({vpc.id}) — {vpc.cidr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Subnet</label>
            <select
              value={config.subnetId}
              onChange={(e) => {
                const subnet = MOCK_SUBNETS.find((s) => s.id === e.target.value);
                onChange({
                  subnetId: e.target.value,
                  availabilityZone: subnet?.az || '',
                });
              }}
              style={selectStyle}
            >
              <option value="">No preference</option>
              {filteredSubnets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) — {s.az} — {s.cidr} {s.public ? '🌐' : '🔒'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-assign public IP */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Auto-assign public IP</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { value: null, label: 'Use subnet setting' },
              { value: true, label: 'Enable' },
              { value: false, label: 'Disable' },
            ].map((opt) => (
              <label
                key={String(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  border:
                    config.associatePublicIpAddress === opt.value
                      ? '2px solid #0d6efd'
                      : '1px solid #d5dbdb',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  background:
                    config.associatePublicIpAddress === opt.value ? '#e8f0fe' : '#fff',
                }}
              >
                <input
                  type="radio"
                  checked={config.associatePublicIpAddress === opt.value}
                  onChange={() => onChange({ associatePublicIpAddress: opt.value })}
                  style={{ accentColor: '#0d6efd' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Security Groups */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#16191f', marginBottom: 4 }}>
          Firewall (security groups)
        </div>
        <div style={{ fontSize: 13, color: '#687078', marginBottom: 16 }}>
          A security group is a set of firewall rules that control the traffic for your instance.
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Select existing security groups</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredSGs.map((sg) => {
              const selected = config.vpcSecurityGroupIds.includes(sg.id);
              return (
                <label
                  key={sg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    border: selected ? '2px solid #0d6efd' : '1px solid #e8eaed',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: selected ? '#e8f0fe' : '#fff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const ids = selected
                        ? config.vpcSecurityGroupIds.filter((id) => id !== sg.id)
                        : [...config.vpcSecurityGroupIds, sg.id];
                      onChange({ vpcSecurityGroupIds: ids });
                    }}
                    style={{ accentColor: '#0d6efd' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#16191f' }}>
                      🛡️ {sg.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#687078' }}>
                      {sg.id} — {sg.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Inbound rules */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Inbound security group rules</label>
            <button
              onClick={addInboundRule}
              style={{
                padding: '4px 12px',
                background: '#0d6efd',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              + Add rule
            </button>
          </div>

          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 80px 80px 1fr 32px',
              gap: 8,
              marginBottom: 6,
              padding: '0 2px',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#687078' }}>Protocol</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#687078' }}>From port</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#687078' }}>To port</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#687078' }}>Source CIDR</span>
            <span />
          </div>

          {inboundRules.map((rule) => (
            <div
              key={rule.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 80px 80px 1fr 32px',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center',
              }}
            >
              <select
                value={rule.protocol}
                onChange={(e) => updateInboundRule(rule.id, { protocol: e.target.value })}
                style={{ ...selectStyle, fontSize: 12, padding: '6px 8px' }}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
                <option value="-1">All traffic</option>
              </select>
              <input
                type="number"
                value={rule.fromPort}
                onChange={(e) => updateInboundRule(rule.id, { fromPort: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
              />
              <input
                type="number"
                value={rule.toPort}
                onChange={(e) => updateInboundRule(rule.id, { toPort: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
              />
              <input
                type="text"
                value={rule.cidrBlocks.join(', ')}
                onChange={(e) =>
                  updateInboundRule(rule.id, {
                    cidrBlocks: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                placeholder="0.0.0.0/0"
                style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', fontFamily: 'monospace' }}
              />
              <button
                onClick={() => removeInboundRule(rule.id)}
                style={{
                  width: 28,
                  height: 28,
                  border: '1px solid #e8eaed',
                  borderRadius: 4,
                  background: '#fff',
                  cursor: 'pointer',
                  color: '#d32f2f',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}

          {/* Quick add presets */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[
              { label: '+ SSH (22)', port: 22 },
              { label: '+ HTTP (80)', port: 80 },
              { label: '+ HTTPS (443)', port: 443 },
              { label: '+ MySQL (3306)', port: 3306 },
              { label: '+ PostgreSQL (5432)', port: 5432 },
              { label: '+ Redis (6379)', port: 6379 },
              { label: '+ Custom', port: 0 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setInboundRules([
                    ...inboundRules,
                    {
                      id: `rule-${Date.now()}-${preset.port}`,
                      type: 'ingress',
                      protocol: 'tcp',
                      fromPort: preset.port,
                      toPort: preset.port,
                      cidrBlocks: ['0.0.0.0/0'],
                      description: '',
                    },
                  ]);
                }}
                style={{
                  padding: '4px 10px',
                  background: '#f0f2f5',
                  border: '1px solid #e8eaed',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  color: '#0d6efd',
                  fontWeight: 500,
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Network */}
      <div style={sectionStyle}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            color: '#0d6efd',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
          }}
        >
          <span
            style={{
              transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              display: 'inline-block',
            }}
          >
            ▶
          </span>
          Advanced network configuration
        </button>

        {showAdvanced && (
          <div style={{ marginTop: 16 }}>
            {/* Private IP */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Private IPv4 address</label>
              <input
                type="text"
                value={config.privateIp}
                onChange={(e) => onChange({ privateIp: e.target.value })}
                placeholder="Auto-assign (leave empty)"
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
              <div style={{ fontSize: 11, color: '#687078', marginTop: 4 }}>
                Primary private IPv4 address. If empty, one is auto-assigned from the subnet CIDR.
              </div>
            </div>

            {/* Source/Dest check */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.sourceDestCheck}
                  onChange={(e) => onChange({ sourceDestCheck: e.target.checked })}
                  style={{ accentColor: '#0d6efd' }}
                />
                <span style={{ fontSize: 13, color: '#16191f' }}>
                  Enable source/destination check
                </span>
              </label>
              <div style={{ fontSize: 11, color: '#687078', marginLeft: 26, marginTop: 2 }}>
                Disable if the instance performs NAT or VPN routing.
              </div>
            </div>

            {/* DNS hostname type */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>DNS hostname type</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['ip-name', 'resource-name'] as const).map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      border:
                        config.privateDnsNameOptions.hostnameType === type
                          ? '2px solid #0d6efd'
                          : '1px solid #d5dbdb',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      background:
                        config.privateDnsNameOptions.hostnameType === type
                          ? '#e8f0fe'
                          : '#fff',
                    }}
                  >
                    <input
                      type="radio"
                      checked={config.privateDnsNameOptions.hostnameType === type}
                      onChange={() =>
                        onChange({
                          privateDnsNameOptions: {
                            ...config.privateDnsNameOptions,
                            hostnameType: type,
                          },
                        })
                      }
                      style={{ accentColor: '#0d6efd' }}
                    />
                    {type === 'ip-name' ? 'IP name (IPv4)' : 'Resource name'}
                  </label>
                ))}
              </div>
            </div>

            {/* DNS A record */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.privateDnsNameOptions.enableResourceNameDnsARecord}
                  onChange={(e) =>
                    onChange({
                      privateDnsNameOptions: {
                        ...config.privateDnsNameOptions,
                        enableResourceNameDnsARecord: e.target.checked,
                      },
                    })
                  }
                  style={{ accentColor: '#0d6efd' }}
                />
                <span style={{ fontSize: 13, color: '#16191f' }}>
                  Enable DNS A record for resource name
                </span>
              </label>
            </div>

            {/* DNS AAAA record */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.privateDnsNameOptions.enableResourceNameDnsAaaaRecord}
                  onChange={(e) =>
                    onChange({
                      privateDnsNameOptions: {
                        ...config.privateDnsNameOptions,
                        enableResourceNameDnsAaaaRecord: e.target.checked,
                      },
                    })
                  }
                  style={{ accentColor: '#0d6efd' }}
                />
                <span style={{ fontSize: 13, color: '#16191f' }}>
                  Enable DNS AAAA record for resource name
                </span>
              </label>
            </div>

            {/* IPv6 */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>IPv6 address count</label>
              <input
                type="number"
                min={0}
                max={50}
                value={config.ipv6AddressCount}
                onChange={(e) => onChange({ ipv6AddressCount: parseInt(e.target.value) || 0 })}
                style={{ ...inputStyle, width: 120 }}
              />
            </div>

            {/* Primary IPv6 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.enablePrimaryIpv6}
                  onChange={(e) => onChange({ enablePrimaryIpv6: e.target.checked })}
                  style={{ accentColor: '#0d6efd' }}
                />
                <span style={{ fontSize: 13, color: '#16191f' }}>
                  Assign primary IPv6 GUA address
                </span>
              </label>
              <div style={{ fontSize: 11, color: '#687078', marginLeft: 26, marginTop: 2 }}>
                Only for dual-stack or IPv6-only subnets. Cannot be disabled once enabled.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step5Network;