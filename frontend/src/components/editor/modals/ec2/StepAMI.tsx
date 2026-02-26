import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import type { EC2Config } from '../../../../types/ec2';
import { AMI_CATALOG } from '../../../../data/ec2-amis';

interface Props {
  config: EC2Config;
  updateConfig: (updates: Partial<EC2Config>) => void;
}

const OS_FILTERS = ['All', 'Amazon Linux', 'Ubuntu', 'Windows', 'Red Hat', 'Debian', 'SUSE'];

export default function StepAMI({ config, updateConfig }: Props) {
  const [search, setSearch] = useState('');

  const filtered = AMI_CATALOG.filter(
    ami => ami.name.toLowerCase().includes(search.toLowerCase()) ||
           ami.os.toLowerCase().includes(search.toLowerCase()) ||
           ami.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          Application and OS Images (Amazon Machine Image)
        </h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
          An AMI is a template that contains the software configuration required to launch your instance.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search AMIs..."
          style={{
            width: '100%', padding: '10px 14px 10px 40px',
            border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box',
            backgroundColor: '#fff',
          }}
        />
      </div>

      {/* OS Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {OS_FILTERS.map(os => {
          const active = (os === 'All' && search === '') || search === os;
          return (
            <button
              key={os}
              onClick={() => setSearch(os === 'All' ? '' : os)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: active ? '1px solid #fed7aa' : '1px solid #e5e7eb',
                backgroundColor: active ? '#fff7ed' : '#f9fafb',
                color: active ? '#ea580c' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {os}
            </button>
          );
        })}
      </div>

      {/* AMI List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
        {filtered.map(ami => {
          const selected = config.ami === ami.id;
          return (
            <div
              key={ami.id}
              onClick={() => updateConfig({ ami: ami.id, amiName: ami.name })}
              style={{
                padding: 16, borderRadius: 12, cursor: 'pointer',
                border: selected ? '2px solid #ea580c' : '1px solid #e5e7eb',
                backgroundColor: selected ? '#fff7ed' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{ami.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{ami.name}</span>
                      {ami.isFree && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 12,
                          backgroundColor: '#dcfce7', color: '#15803d',
                          fontSize: 10, fontWeight: 700,
                        }}>
                          Free tier
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{ami.description}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <span style={{
                        fontSize: 10, color: '#9ca3af',
                        backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                      }}>
                        {ami.architecture}
                      </span>
                      <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>{ami.id}</span>
                    </div>
                  </div>
                </div>
                {selected && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    backgroundColor: '#ea580c', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check style={{ width: 12, height: 12, color: '#fff' }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom AMI */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
          Or enter a custom AMI ID
        </label>
        <input
          type="text"
          value={config.ami}
          onChange={e => updateConfig({ ami: e.target.value, amiName: 'Custom AMI' })}
          placeholder="ami-xxxxxxxxxxxxxxxxx"
          style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid #d1d5db', borderRadius: 8,
            fontSize: 13, fontFamily: 'monospace', color: '#111827',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}