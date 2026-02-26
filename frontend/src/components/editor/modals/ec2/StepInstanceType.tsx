import { useState } from 'react';
import { Search, Zap } from 'lucide-react';
import type { EC2Config } from '../../../../types/ec2';
import { INSTANCE_TYPE_CATALOG } from '../../../../data/ec2-instances';

interface Props {
  config: EC2Config;
  updateConfig: (updates: Partial<EC2Config>) => void;
}

export default function StepInstanceType({ config, updateConfig }: Props) {
  const [search, setSearch] = useState('');
  const [family, setFamily] = useState('All');

  const families = ['All', ...new Set(INSTANCE_TYPE_CATALOG.map(i => i.family))];
  const filtered = INSTANCE_TYPE_CATALOG.filter(i => {
    const mf = family === 'All' || i.family === family;
    const ms = !search || i.type.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const cols = '1fr 0.8fr 0.5fr 0.6fr 0.8fr 0.6fr';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Instance Type</h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Select the hardware configuration for your instance.</p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search instance types..."
            style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={family} onChange={e => setFamily(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, color: '#374151', outline: 'none', backgroundColor: '#fff' }}
        >
          {families.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: cols, padding: '12px 16px',
          backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
          fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const,
        }}>
          <span>Type</span><span>Family</span><span>vCPUs</span><span>Memory</span><span>Network</span><span>Price</span>
        </div>
        <div style={{ maxHeight: 350, overflowY: 'auto' }}>
          {filtered.map(inst => {
            const sel = config.instanceType === inst.type;
            return (
              <div
                key={inst.type}
                onClick={() => updateConfig({ instanceType: inst.type })}
                style={{
                  display: 'grid', gridTemplateColumns: cols, padding: '12px 16px',
                  cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                  backgroundColor: sel ? '#fff7ed' : '#fff',
                  borderLeft: sel ? '3px solid #ea580c' : '3px solid transparent',
                  transition: 'all 0.1s', fontSize: 13,
                }}
              >
                <span style={{ color: '#111827', fontFamily: 'monospace', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {inst.type}
                  {inst.isFree && (
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>Free</span>
                  )}
                </span>
                <span style={{ color: '#6b7280', fontSize: 11 }}>{inst.family}</span>
                <span style={{ color: '#374151' }}>{inst.vCPUs}</span>
                <span style={{ color: '#374151' }}>{inst.memory}</span>
                <span style={{ color: '#6b7280', fontSize: 11 }}>{inst.network}</span>
                <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 600 }}>{inst.price}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected */}
      {config.instanceType && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 10,
          backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
        }}>
          <Zap style={{ width: 16, height: 16, color: '#ea580c' }} />
          <span style={{ fontSize: 14, color: '#111827' }}>
            Selected: <strong style={{ fontFamily: 'monospace', color: '#ea580c' }}>{config.instanceType}</strong>
          </span>
        </div>
      )}
    </div>
  );
}