import type { Project } from './projectData';

interface Props {
  project: Project;
}

const MOCK_VARS = [
  { name: 'aws_region', value: 'us-east-1', type: 'string', sensitive: false },
  { name: 'environment', value: 'production', type: 'string', sensitive: false },
  { name: 'instance_type', value: 't3.small', type: 'string', sensitive: false },
  { name: 'db_password', value: '••••••••••', type: 'string', sensitive: true },
];

const MOCK_SECRETS = [
  { name: 'AWS_ACCESS_KEY_ID', type: 'aws', createdAt: '2024-01-15' },
  { name: 'AWS_SECRET_ACCESS_KEY', type: 'aws', createdAt: '2024-01-15' },
];

export default function ProjectVariables({ project }: Props) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Variables & Secrets</h3>
        <button style={{ padding: '7px 14px', borderRadius: 8, border: 'none', backgroundColor: '#4F46E5', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Variable</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MOCK_VARS.slice(0, project.variables).map((v, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E7EB' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.backgroundColor = '#FAFBFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = 'white'; }}
          >
            <span style={{ fontSize: 14 }}>{v.sensitive ? '🔒' : '📝'}</span>
            <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, fontFamily: 'monospace' }}>{v.name}</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: '#EEF2FF', color: '#4F46E5' }}>{v.type}</span>
            <code style={{ fontSize: 12, color: v.sensitive ? '#9CA3AF' : '#374151', backgroundColor: '#F3F4F6', padding: '3px 10px', borderRadius: 6, fontFamily: 'monospace' }}>{v.value}</code>
            {v.sensitive && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, backgroundColor: '#FEF3C7', color: '#B45309' }}>SENSITIVE</span>}
          </div>
        ))}
      </div>

      {project.secrets > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>🔐</span>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Encrypted Secrets</h4>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: '#ECFDF5', color: '#10B981' }}>AES-256</span>
          </div>
          {MOCK_SECRETS.slice(0, project.secrets).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>☁️</span>
              <p style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, fontFamily: 'monospace' }}>{s.name}</p>
              <span style={{ fontSize: 12, color: '#9CA3AF', letterSpacing: 2 }}>●●●●●●●●●●</span>
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>{s.createdAt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}