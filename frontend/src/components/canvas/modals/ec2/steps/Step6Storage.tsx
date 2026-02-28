// src/components/editor/modals/ec2/steps/Step6Storage.tsx

import React from 'react';
import type { EC2FullConfig, EbsBlockDevice, EphemeralBlockDevice } from '../types/ec2-config';

interface Step6Props {
  config: EC2FullConfig;
  onChange: (updates: Partial<EC2FullConfig>) => void;
}

const VOLUME_TYPES = [
  { value: 'gp3', label: 'General Purpose SSD (gp3)', description: 'Balance of price and performance' },
  { value: 'gp2', label: 'General Purpose SSD (gp2)', description: 'Legacy general purpose' },
  { value: 'io1', label: 'Provisioned IOPS SSD (io1)', description: 'High performance' },
  { value: 'io2', label: 'Provisioned IOPS SSD (io2)', description: 'Highest durability' },
  { value: 'st1', label: 'Throughput Optimized HDD (st1)', description: 'Big data, data warehouses' },
  { value: 'sc1', label: 'Cold HDD (sc1)', description: 'Infrequent access' },
  { value: 'standard', label: 'Magnetic (standard)', description: 'Previous generation' },
];

const DEVICE_NAMES = ['/dev/sdb', '/dev/sdc', '/dev/sdd', '/dev/sde', '/dev/sdf', '/dev/sdg', '/dev/sdh'];

const Step6Storage: React.FC<Step6Props> = ({ config, onChange }) => {
  const updateRootDevice = (updates: Partial<typeof config.rootBlockDevice>) => {
    onChange({
      rootBlockDevice: { ...config.rootBlockDevice, ...updates },
    });
  };

  const addEbsVolume = () => {
    const usedDevices = config.ebsBlockDevices.map((v) => v.deviceName);
    const nextDevice = DEVICE_NAMES.find((d) => !usedDevices.includes(d)) || '/dev/sdz';
    const newVol: EbsBlockDevice = {
      id: `ebs-${Date.now()}`,
      deviceName: nextDevice,
      volumeType: 'gp3',
      volumeSize: 20,
      encrypted: false,
      deleteOnTermination: true,
      tags: {},
    };
    onChange({ ebsBlockDevices: [...config.ebsBlockDevices, newVol] });
  };

  const updateEbsVolume = (id: string, updates: Partial<EbsBlockDevice>) => {
    onChange({
      ebsBlockDevices: config.ebsBlockDevices.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  };

  const removeEbsVolume = (id: string) => {
    onChange({ ebsBlockDevices: config.ebsBlockDevices.filter((v) => v.id !== id) });
  };

  const addEphemeralDevice = () => {
    const count = config.ephemeralBlockDevices.length;
    const newDev: EphemeralBlockDevice = {
      id: `eph-${Date.now()}`,
      deviceName: `/dev/sd${String.fromCharCode(98 + count)}`,
      virtualName: `ephemeral${count}`,
    };
    onChange({ ephemeralBlockDevices: [...config.ephemeralBlockDevices, newDev] });
  };

  const removeEphemeralDevice = (id: string) => {
    onChange({ ephemeralBlockDevices: config.ephemeralBlockDevices.filter((d) => d.id !== id) });
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

  const showIops = ['io1', 'io2', 'gp3'].includes(config.rootBlockDevice.volumeType);
  const showThroughput = config.rootBlockDevice.volumeType === 'gp3';

  // Cost calculation
  const costPerGB: Record<string, number> = {
    gp2: 0.10, gp3: 0.08, io1: 0.125, io2: 0.125,
    standard: 0.05, sc1: 0.015, st1: 0.045,
  };

  const rootCost = config.rootBlockDevice.volumeSize * (costPerGB[config.rootBlockDevice.volumeType] || 0.08);
  const ebsTotalCost = config.ebsBlockDevices.reduce(
    (sum, v) => sum + v.volumeSize * (costPerGB[v.volumeType] || 0.08), 0
  );

  return (
    <div>
      {/* Root Block Device */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#16191f' }}>
            Configure storage
          </div>
          <div
            style={{
              padding: '4px 10px',
              background: '#f0f2f5',
              borderRadius: 4,
              fontSize: 12,
              color: '#687078',
            }}
          >
            Total: ${(rootCost + ebsTotalCost).toFixed(2)}/mo
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#687078', marginBottom: 20 }}>
          Configure the root volume and add additional EBS or instance store volumes.
        </div>

        {/* Root volume card */}
        <div
          style={{
            border: '1px solid #d5dbdb',
            borderRadius: 8,
            padding: 16,
            background: '#fafbfc',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>💾</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16191f' }}>
                Root volume
              </div>
              <div style={{ fontSize: 11, color: '#687078' }}>/dev/xvda</div>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                padding: '2px 8px',
                background: '#0d6efd',
                color: '#fff',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Root
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Volume type</label>
              <select
                value={config.rootBlockDevice.volumeType}
                onChange={(e) => updateRootDevice({ volumeType: e.target.value as typeof config.rootBlockDevice.volumeType })}
                style={selectStyle}
              >
                {VOLUME_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>{vt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Size (GiB)</label>
              <input
                type="number"
                min={1}
                max={16384}
                value={config.rootBlockDevice.volumeSize}
                onChange={(e) => updateRootDevice({ volumeSize: parseInt(e.target.value) || 8 })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {showIops && (
              <div>
                <label style={labelStyle}>IOPS</label>
                <input
                  type="number"
                  min={100}
                  max={64000}
                  value={config.rootBlockDevice.iops || 3000}
                  onChange={(e) => updateRootDevice({ iops: parseInt(e.target.value) || 3000 })}
                  style={inputStyle}
                />
                <div style={{ fontSize: 10, color: '#687078', marginTop: 2 }}>
                  gp3: 3000–16000 · io1/io2: 100–64000
                </div>
              </div>
            )}
            {showThroughput && (
              <div>
                <label style={labelStyle}>Throughput (MiB/s)</label>
                <input
                  type="number"
                  min={125}
                  max={1000}
                  value={config.rootBlockDevice.throughput || 125}
                  onChange={(e) => updateRootDevice({ throughput: parseInt(e.target.value) || 125 })}
                  style={inputStyle}
                />
                <div style={{ fontSize: 10, color: '#687078', marginTop: 2 }}>125–1000 MiB/s</div>
              </div>
            )}
          </div>

          {/* Encryption & Delete */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={config.rootBlockDevice.encrypted}
                onChange={(e) => updateRootDevice({ encrypted: e.target.checked })}
                style={{ accentColor: '#0d6efd' }}
              />
              Encrypted
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={config.rootBlockDevice.deleteOnTermination}
                onChange={(e) => updateRootDevice({ deleteOnTermination: e.target.checked })}
                style={{ accentColor: '#0d6efd' }}
              />
              Delete on termination
            </label>
          </div>

          {config.rootBlockDevice.encrypted && (
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>KMS Key ARN (optional)</label>
              <input
                type="text"
                value={config.rootBlockDevice.kmsKeyId || ''}
                onChange={(e) => updateRootDevice({ kmsKeyId: e.target.value })}
                placeholder="arn:aws:kms:region:account:key/key-id"
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
              />
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 12, color: '#0d6efd', fontWeight: 600 }}>
            ~${rootCost.toFixed(2)}/mo
          </div>
        </div>
      </div>

      {/* Additional EBS Volumes */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#16191f' }}>
              Additional EBS volumes
            </div>
            <div style={{ fontSize: 12, color: '#687078' }}>
              {config.ebsBlockDevices.length} additional volume{config.ebsBlockDevices.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={addEbsVolume}
            style={{
              padding: '6px 14px',
              background: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            + Add volume
          </button>
        </div>

        {config.ebsBlockDevices.map((vol) => {
          const volShowIops = ['io1', 'io2', 'gp3'].includes(vol.volumeType);
          const volCost = vol.volumeSize * (costPerGB[vol.volumeType] || 0.08);

          return (
            <div
              key={vol.id}
              style={{
                border: '1px solid #e8eaed',
                borderRadius: 8,
                padding: 14,
                marginBottom: 10,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📦</span>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: '#16191f' }}>
                    {vol.deviceName}
                  </span>
                  <span style={{ fontSize: 12, color: '#0d6efd', fontWeight: 600 }}>
                    ~${volCost.toFixed(2)}/mo
                  </span>
                </div>
                <button
                  onClick={() => removeEbsVolume(vol.id)}
                  style={{
                    padding: '4px 10px',
                    background: '#fff',
                    color: '#d32f2f',
                    border: '1px solid #ffcdd2',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}>Device</label>
                  <select
                    value={vol.deviceName}
                    onChange={(e) => updateEbsVolume(vol.id, { deviceName: e.target.value })}
                    style={{ ...selectStyle, fontSize: 12, padding: '6px 8px' }}
                  >
                    {DEVICE_NAMES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Volume type</label>
                  <select
                    value={vol.volumeType}
                    onChange={(e) => updateEbsVolume(vol.id, { volumeType: e.target.value as EbsBlockDevice['volumeType'] })}
                    style={{ ...selectStyle, fontSize: 12, padding: '6px 8px' }}
                  >
                    {VOLUME_TYPES.map((vt) => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Size (GiB)</label>
                  <input
                    type="number"
                    min={1}
                    max={16384}
                    value={vol.volumeSize}
                    onChange={(e) => updateEbsVolume(vol.id, { volumeSize: parseInt(e.target.value) || 20 })}
                    style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
                  />
                </div>
              </div>

              {volShowIops && (
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>IOPS</label>
                  <input
                    type="number"
                    min={100}
                    max={64000}
                    value={vol.iops || 3000}
                    onChange={(e) => updateEbsVolume(vol.id, { iops: parseInt(e.target.value) || 3000 })}
                    style={{ ...inputStyle, width: 150, fontSize: 12, padding: '6px 8px' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={vol.encrypted}
                    onChange={(e) => updateEbsVolume(vol.id, { encrypted: e.target.checked })}
                    style={{ accentColor: '#0d6efd' }}
                  />
                  Encrypted
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={vol.deleteOnTermination}
                    onChange={(e) => updateEbsVolume(vol.id, { deleteOnTermination: e.target.checked })}
                    style={{ accentColor: '#0d6efd' }}
                  />
                  Delete on termination
                </label>
              </div>

              {vol.encrypted && (
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>KMS Key ARN</label>
                  <input
                    type="text"
                    value={vol.kmsKeyId || ''}
                    onChange={(e) => updateEbsVolume(vol.id, { kmsKeyId: e.target.value })}
                    placeholder="arn:aws:kms:..."
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
                  />
                </div>
              )}

              <div style={{ marginTop: 8 }}>
                <label style={labelStyle}>Snapshot ID (optional)</label>
                <input
                  type="text"
                  value={vol.snapshotId || ''}
                  onChange={(e) => updateEbsVolume(vol.id, { snapshotId: e.target.value })}
                  placeholder="snap-0123456789abcdef0"
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, padding: '6px 8px' }}
                />
              </div>
            </div>
          );
        })}

        {config.ebsBlockDevices.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 30,
              color: '#687078',
              fontSize: 13,
              border: '1px dashed #e8eaed',
              borderRadius: 8,
            }}
          >
            No additional EBS volumes. Click "Add volume" to attach more storage.
          </div>
        )}
      </div>

      {/* Ephemeral / Instance Store */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#16191f' }}>
              Instance store volumes (ephemeral)
            </div>
            <div style={{ fontSize: 12, color: '#687078' }}>
              Temporary block-level storage physically attached to the host. Data is lost on stop/terminate.
            </div>
          </div>
          <button
            onClick={addEphemeralDevice}
            style={{
              padding: '6px 14px',
              background: '#232f3e',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            + Add instance store
          </button>
        </div>

        {config.ephemeralBlockDevices.map((dev) => (
          <div
            key={dev.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              border: '1px solid #e8eaed',
              borderRadius: 6,
              marginBottom: 6,
            }}
          >
            <span>⚡</span>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#16191f' }}>{dev.deviceName}</span>
            <span style={{ fontSize: 12, color: '#687078' }}>→</span>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#0d6efd' }}>{dev.virtualName}</span>
            <button
              onClick={() => removeEphemeralDevice(dev.id)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#d32f2f',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* EBS Optimized */}
      <div style={sectionStyle}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.ebsOptimized}
            onChange={(e) => onChange({ ebsOptimized: e.target.checked })}
            style={{ accentColor: '#0d6efd' }}
          />
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#16191f' }}>
              EBS-optimized instance
            </span>
            <div style={{ fontSize: 12, color: '#687078' }}>
              Provides dedicated throughput between Amazon EC2 and Amazon EBS.
              Enabled by default for most current-generation instance types.
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default Step6Storage;