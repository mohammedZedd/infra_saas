import { useNavigate } from 'react-router-dom';
import { TABS, STATUS_CONFIG } from './projectData';
import type { Project, TabId } from './projectData';

interface Props {
  project: Project;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function ProjectHeader({ project, activeTab, onTabChange }: Props) {
  const navigate = useNavigate();
  const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.idle;

  return (
    <>
      {/* Top bar */}
      <header
        style={{
          height: 64,
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          gap: 16,
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8,
            border: '1px solid #E5E7EB', backgroundColor: 'white',
            fontSize: 13, color: '#374151', cursor: 'pointer',
          }}
        >
          ← Projects
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate(`/editor/${project.id}`)}
          style={{
            padding: '8px 18px', borderRadius: 8, border: 'none',
            backgroundColor: '#4F46E5', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}
        >
          🎨 Open Designer
        </button>
      </header>

      {/* Project info + tabs */}
      <div style={{ padding: '28px 40px 0', backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                border: '1px solid #C7D2FE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}
            >
              🏗️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{project.name}</h1>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, backgroundColor: st.bg, color: st.color }}>
                  {st.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, backgroundColor: '#FFF7ED', color: '#EA580C' }}>
                  ☁️ {project.cloud}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{project.description}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Components', value: project.components, emoji: '🧩' },
              { label: 'Variables', value: project.variables, emoji: '{ }' },
              { label: 'Secrets', value: project.secrets, emoji: '🔒' },
              { label: 'Runs', value: project.runs.length, emoji: '🚀' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 14px', backgroundColor: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6', minWidth: 65 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{stat.value}</p>
                <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>{stat.emoji} {stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  padding: '10px 18px', fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#4F46E5' : '#6B7280',
                  backgroundColor: 'transparent', border: 'none',
                  borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 14 }}>{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}