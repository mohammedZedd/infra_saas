import type { Project } from './projectData';

interface Props {
  project: Project;
}

const MOCK_RESOURCES = [
  { type: 'aws_vpc', name: 'main', id: 'vpc-0a1b2c3d4e5f6g7h8', status: 'synced' },
  { type: 'aws_subnet', name: 'public', id: 'subnet-0a1b2c3d', status: 'synced' },
  { type: 'aws_subnet', name: 'private', id: 'subnet-0e5f6g7h', status: 'synced' },
  { type: 'aws_security_group', name: 'web', id: 'sg-0a1b2c3d', status: 'synced' },
  { type: 'aws_instance', name: 'web', id: 'i-0a1b2c3d4e5f6g7h8', status: 'drifted' },
  { type: 'aws_db_instance', name: 'postgres', id: 'prod-db', status: 'synced' },
  { type: 'aws_internet_gateway', name: 'main', id: 'igw-0a1b2c3d', status: 'synced' },
  { type: 'aws_db_subnet_group', name: 'main', id: 'production-db-subnet', status: 'synced' },
];

const STATE_COLORS: Record<string, { color: string; bg: string }> = {
  synced: { color: '#10B981', bg: '#ECFDF5' },
  drifted: { color: '#F59E0B', bg: '#FFFBEB' },
  tainted: { color: '#EF4444', bg: '#FEF2F2' },
};

function getResourceEmoji(type: string): string {
  if (type.includes('vpc')) return '🌐';
  if (type.includes('subnet')) return '🔗';
  if (type.includes('security')) return '🛡️';
  if (type.includes('instance')) return '🖥️';
  if (type.includes('db')) return '🗄️';
  if (type.includes('gateway')) return '🚪';
  return '📦';
}

export default function ProjectState({ project }: Props) {
  const resources = MOCK_RESOURCES.slice(0, project.components);

  return (
    <div>
      {/* Info banner */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🗂️</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Terraform State</p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>Last updated: {project.updatedAt}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: 'white', fontSize: 12, color: '#374151', cursor: 'pointer' }}>🔄 Refresh</button>
          <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: 'white', fontSize: 12, color: '#374151', cursor: 'pointer' }}>⬇️ Download</button>
        </div>
      </div>

      {/* Resources */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Managed Resources</h3>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{resources.length} resources</span>
        </div>

        {resources.map((r, i) => {
          const sc = STATE_COLORS[r.status] || STATE_COLORS.synced;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                borderBottom: i < resources.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFBFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <span style={{ fontSize: 16 }}>{getResourceEmoji(r.type)}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, fontFamily: 'monospace' }}>{r.type}.{r.name}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0', fontFamily: 'monospace' }}>{r.id}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, backgroundColor: sc.bg, color: sc.color }}>{r.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}