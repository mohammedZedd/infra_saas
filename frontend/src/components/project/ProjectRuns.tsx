import { useState } from 'react';
import {RUN_STATUS_CONFIG } from './projectData';
import RunTerminal from './RunTerminal';
import type { Project } from './projectData';

interface Props {
  project: Project;
}

export default function ProjectRuns({ project }: Props) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  return (
    <div>
      {/* Command buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Init', emoji: '🔄', color: '#6B7280' },
          { label: 'Plan', emoji: '📋', color: '#3B82F6' },
          { label: 'Apply', emoji: '🚀', color: '#10B981' },
          { label: 'Destroy', emoji: '💥', color: '#EF4444' },
        ].map((cmd, i) => (
          <button
            key={i}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: `1px solid ${cmd.color}30`, backgroundColor: `${cmd.color}10`,
              color: cmd.color, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${cmd.color}20`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${cmd.color}10`; }}
          >
            {cmd.emoji} {cmd.label}
          </button>
        ))}
      </div>

      {/* Runs list */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Run History</h3>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{project.runs.length} runs</span>
        </div>

        {project.runs.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 36 }}>🚀</span>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', marginTop: 12 }}>No runs yet. Start with terraform init.</p>
          </div>
        ) : (
          project.runs.map((run, i) => {
            const rs = RUN_STATUS_CONFIG[run.status] || RUN_STATUS_CONFIG.pending;
            const isExpanded = expandedRunId === run.id;

            return (
              <div key={run.id}>
                {/* Row */}
                <div
                  onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: !isExpanded && i < project.runs.length - 1 ? '1px solid #F3F4F6' : 'none',
                    cursor: 'pointer', backgroundColor: isExpanded ? '#F9FAFB' : 'white',
                  }}
                  onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.backgroundColor = '#FAFBFC'; }}
                  onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  <span style={{ fontSize: 10, color: '#9CA3AF', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                  <span style={{ fontSize: 18 }}>{rs.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>terraform {run.command}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>by {run.user} • {run.at}</p>
                  </div>

                  {run.planSummary && (
                    <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
                      {run.planSummary.add > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: '#ECFDF5', color: '#10B981' }}>+{run.planSummary.add}</span>}
                      {run.planSummary.change > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: '#FFFBEB', color: '#F59E0B' }}>~{run.planSummary.change}</span>}
                      {run.planSummary.destroy > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: '#FEF2F2', color: '#EF4444' }}>-{run.planSummary.destroy}</span>}
                    </div>
                  )}

                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, backgroundColor: rs.bg, color: rs.color }}>{run.status}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', minWidth: 60, textAlign: 'right' }}>{run.duration}</span>
                </div>

                {/* Expanded terminal */}
                {isExpanded && (
                  <div style={{ borderBottom: i < project.runs.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <RunTerminal
                      command={run.command}
                      status={run.status}
                      duration={run.duration}
                      output={run.output}
                      errorOutput={run.errorOutput}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}