import { Plus, Trash2, HardDrive, Info } from 'lucide-react';
import type { EC2Config, EBSVolume } from '../../../../types/ec2';

interface Props {
  config: EC2Config;
  updateConfig: (updates: Partial<EC2Config>) => void;
  updateRootVolume: (updates: Partial<EBSVolume>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none',
  boxSizing: 'border-box', backgroundColor: '#fff',
};

const smallInputStyle: React.CSSProperties = {
  ...inputStyle, padding: '8px 12px', fontSize: 13,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6,
};

const VOLUME_TYPES = [
  { value: 'gp3', label: 'gp3 (General Purpose SSD)' },
  { value: 'gp2', label: 'gp2 (General Purpose SSD)' },
  { value: 'io1', label: 'io1 (Provisioned IOPS SSD)' },
  { value: 'io2', label: 'io2 (Provisioned IOPS SSD)' },
  { value: 'st1', label: 'st1 (Throughput Optimized HDD)' },
  { value: 'sc1', label: 'sc1 (Cold HDD)' },
  { value: 'standard', label: 'standard (Magnetic)' },
];

export default function StepStorage({ config, updateConfig, updateRootVolume }: Props) {
  const { rootVolume } = config;
  const showIOPS = ['gp3', 'io1', 'io2'].includes(rootVolume.volumeType);

  const addVolume = () => {
    const vol: EBSVolume = {
      id: `vol-${Date.now()}`,
      deviceName: `/dev/sd${String.fromCharCode(98 + config.additionalVolumes.length)}`,
      size: 20, volumeType: 'gp3', iops: 3000, throughput: 125,
      encrypted: false, kmsKeyId: '', deleteOnTermination: true,
    };
    updateConfig({ additionalVolumes: [...config.additionalVolumes, vol] });
  };

  const updateVol = (idx: number, updates: Partial<EBSVolume>) => {
    const vols = [...config.additionalVolumes];
    vols[idx] = { ...vols[idx], ...updates };
    updateConfig({ additionalVolumes: vols });
  };

  const removeVol = (idx: number) => {
    updateConfig({ additionalVolumes: config.additionalVolumes.filter((_, i) => i !== idx) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Configure storage</h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
          Specify the storage volumes to attach to your instance.
        </p>
      </div>

      {/* Root Volume */}
      <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HardDrive style={{ width: 16, height: 16, color: '#ea580c' }} />
            Root volume
          </h4>
          <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{rootVolume.deviceName}</span>
        </div>

        {/* Size + Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Size (GiB)</label>
            <input
              type="number" min={1} max={16384}
              value={rootVolume.size}
              onChange={e => updateRootVolume({ size: parseInt(e.target.value) || 8 })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Volume type</label>
            <select
              value={rootVolume.volumeType}
              onChange={e => updateRootVolume({ volumeType: e.target.value as EBSVolume['volumeType'] })}
              style={inputStyle}
            >
              {VOLUME_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* IOPS + Throughput */}
        {showIOPS && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <label style={labelStyle}>IOPS</label>
              <input
                type="number"
                value={rootVolume.iops}
                onChange={e => updateRootVolume({ iops: parseInt(e.target.value) || 3000 })}
                style={inputStyle}
              />
            </div>
            {rootVolume.volumeType === 'gp3' && (
              <div>
                <label style={labelStyle}>Throughput (MB/s)</label>
                <input
                  type="number"
                  value={rootVolume.throughput}
                  onChange={e => updateRootVolume({ throughput: parseInt(e.target.value) || 125 })}
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        )}

        {/* Checkboxes */}
        <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
            <input
              type="checkbox"
              checked={rootVolume.encrypted}
              onChange={e => updateRootVolume({ encrypted: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: '#ea580c' }}
            />
            Encrypted
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
            <input
              type="checkbox"
              checked={rootVolume.deleteOnTermination}
              onChange={e => updateRootVolume({ deleteOnTermination: e.target.checked })}
              style={{ width: 16, height: 16, accentColor: '#ea580c' }}
            />
            Delete on termination
          </label>
        </div>

        {/* KMS Key */}
        {rootVolume.encrypted && (
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>KMS key</label>
            <select
              value={rootVolume.kmsKeyId}
              onChange={e => updateRootVolume({ kmsKeyId: e.target.value })}
              style={inputStyle}
            >
              <option value="">(default) aws/ebs</option>
              <option value="custom-key">Custom KMS Key</option>
            </select>
          </div>
        )}
      </div>

      {/* Additional Volumes */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Additional volumes</label>
          <button
            onClick={addVolume}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: '#ea580c',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Add volume
          </button>
        </div>

        {config.additionalVolumes.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 20,
            backgroundColor: '#f9fafb', borderRadius: 10,
            border: '2px dashed #d1d5db', color: '#9ca3af', fontSize: 13,
          }}>
            No additional volumes. Click "Add volume" to add EBS volumes.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {config.additionalVolumes.map((vol, idx) => (
              <div key={vol.id} style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af' }}>{vol.deviceName}</span>
                  <button
                    onClick={() => removeVol(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Size (GiB)</label>
                    <input
                      type="number" value={vol.size}
                      onChange={e => updateVol(idx, { size: parseInt(e.target.value) || 20 })}
                      style={smallInputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Type</label>
                    <select
                      value={vol.volumeType}
                      onChange={e => updateVol(idx, { volumeType: e.target.value as EBSVolume['volumeType'] })}
                      style={smallInputStyle}
                    >
                      {['gp3', 'gp2', 'io1', 'io2', 'st1', 'sc1'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>IOPS</label>
                    <input
                      type="number" value={vol.iops}
                      onChange={e => updateVol(idx, { iops: parseInt(e.target.value) || 3000 })}
                      style={smallInputStyle}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Free tier info */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 10, padding: 16,
      }}>
        <Info style={{ width: 18, height: 18, color: '#3b82f6', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0 }}>
          Free tier eligible customers can get up to 30 GB of EBS General Purpose (SSD) or Magnetic storage.
        </p>
      </div>
    </div>
  );
}