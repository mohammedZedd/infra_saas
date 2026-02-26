// frontend/src/pages/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/layout/DashboardSidebar';

const MOCK_PROJECTS = [
  {
    id: '1',
    name: 'Production VPC',
    description: 'Main production infrastructure with EC2 and RDS',
    components: 8,
    updatedAt: '2 hours ago',
    colors: ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B'],
  },
  {
    id: '2',
    name: 'Serverless API',
    description: 'Lambda + API Gateway + DynamoDB setup',
    components: 5,
    updatedAt: '1 day ago',
    colors: ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B'],
  },
  {
    id: '3',
    name: 'Static Website',
    description: 'S3 + CloudFront distribution',
    components: 3,
    updatedAt: '3 days ago',
    colors: ['#4F46E5', '#7C3AED', '#10B981'],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F3F4F6',
        display: 'flex',
      }}
    >
      {/* Sidebar fixe pleine hauteur */}
      <DashboardSidebar />

      {/* Contenu principal — décalé de 240px */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh' }}>
        {/* Top bar */}
        <header
          style={{
            height: 64,
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Search bar */}
          <div style={{ flex: 1, maxWidth: 400, marginRight: 'auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
              }}
            >
              <span style={{ fontSize: 14, color: '#9CA3AF' }}>🔍</span>
              <input
                type="text"
                placeholder="Search projects..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 13,
                  color: '#374151',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notifications */}
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                position: 'relative',
              }}
            >
              🔔
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  border: '2px solid white',
                }}
              />
            </button>

            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F6EF7, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>J</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: '32px 40px 40px' }}>
          {/* Page header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}
          >
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>
                Projects
              </h1>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {MOCK_PROJECTS.length} projects
              </p>
            </div>

            <button
              type="button"
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 16 }}>+</span>
              New Project
            </button>
          </div>

          {/* Project grid */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {MOCK_PROJECTS.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(79,70,229,0.12)';
                  e.currentTarget.style.borderColor = '#C7D2FE';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Preview zone */}
                <div
                  style={{
                    height: 130,
                    background:
                      'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                  }}
                >
                  {/* Badge composants */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 12,
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#6B7280',
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {project.components} components
                  </span>

                  {/* Color dots */}
                  {project.colors.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: color,
                        opacity: 0.85,
                      }}
                    />
                  ))}
                </div>

                {/* Info zone */}
                <div style={{ padding: '16px 18px 18px' }}>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#111827',
                      margin: '0 0 4px',
                    }}
                  >
                    {project.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#6B7280',
                      margin: '0 0 12px',
                      lineHeight: 1.4,
                    }}
                  >
                    {project.description}
                  </p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
                    🕐 {project.updatedAt}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}