import { useNavigate } from 'react-router-dom';
import type { Project } from './projectData';

interface Props {
  project: Project;
}

const MOCK_FINDINGS = [
  { severity: 'critical', emoji: '🔴', title: 'EC2 instance without Security Group', resource: 'aws_instance.web', compliance: 'CIS AWS 5.1' },
  { severity: 'high', emoji: '🟠', title: 'S3 bucket without encryption', resource: 'aws_s3_bucket.website', compliance: 'SOC2 CC6.7' },
  { severity: 'medium', emoji: '🟡', title: 'No CloudWatch monitoring', resource: 'Global', compliance: 'CIS AWS 3.1' },
  { severity: 'medium', emoji: '🟡', title: 'No CloudTrail audit logging', resource: 'Global', compliance: 'SOC2 CC7.2' },
];

const SEVERITY_COLORS: Record<string, { color: string; bg: string }> = {
  critical: { color: '#DC2626', bg: '#FEF2F2' },
  high: { color: '#EA580C', bg: '#FFF7ED' },
  medium: { color: '#CA8A04', bg: '#FFFBEB' },
  low: { color: '#2563EB', bg: '#EFF6FF' },
};

export default function ProjectSecurity({ project }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Score */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 14,
          border: '1px solid #E5E7EB',
          padding: '24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          C
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B', margin: '0 0 4px' }}>
            65/100
          </p>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
            {MOCK_FINDINGS.length} findings • {project.components} resources scanned
          </p>
        </div>
        <button
          onClick={() => navigate(`/editor/${project.id}`)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#4F46E5',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔍 Run Full Scan
        </button>
      </div>

      {/* Findings */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 14,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #F3F4F6',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
            Security Findings
          </h3>
        </div>

        {MOCK_FINDINGS.map((f, i) => {
          const sc = SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.medium;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderBottom: i < MOCK_FINDINGS.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFBFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <span style={{ fontSize: 18 }}>{f.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>
                  {f.title}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: '#9CA3AF',
                    margin: '2px 0 0',
                    fontFamily: 'monospace',
                  }}
                >
                  {f.resource}
                </p>
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                }}
              >
                {f.compliance}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 999,
                  backgroundColor: sc.bg,
                  color: sc.color,
                  textTransform: 'uppercase',
                }}
              >
                {f.severity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}