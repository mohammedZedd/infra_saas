import { useState, useMemo } from 'react';
import useEditorStore from '../../stores/useEditorStore';
import type {
  SecurityFinding,
  SecuritySeverity,
  SecurityCategory,
  SecurityScanResult,
  SecurityContext,
} from '../../types/security';
import { SECURITY_RULES } from '../../security/rules';

// ─── Severity config ────────────────────────────────────

const SEVERITY_CONFIG: Record<SecuritySeverity, {
  emoji: string; label: string; color: string; bg: string; border: string;
}> = {
  critical: { emoji: '🔴', label: 'Critical', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  high:     { emoji: '🟠', label: 'High',     color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
  medium:   { emoji: '🟡', label: 'Medium',   color: '#CA8A04', bg: '#FFFBEB', border: '#FDE68A' },
  low:      { emoji: '🔵', label: 'Low',      color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  info:     { emoji: '⚪', label: 'Info',      color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

const CATEGORY_CONFIG: Record<SecurityCategory, { emoji: string; label: string }> = {
  network:    { emoji: '🌐', label: 'Network' },
  encryption: { emoji: '🔐', label: 'Encryption' },
  access:     { emoji: '🔑', label: 'Access Control' },
  storage:    { emoji: '📦', label: 'Storage' },
  compute:    { emoji: '🖥️', label: 'Compute' },
  database:   { emoji: '🗄️', label: 'Database' },
  monitoring: { emoji: '📊', label: 'Monitoring' },
  compliance: { emoji: '📋', label: 'Compliance' },
};

// ─── Security Rules Engine ──────────────────────────────

function runSecurityScan(context: SecurityContext): SecurityScanResult {
  // 1) Exécuter toutes les règles
  const findings = SECURITY_RULES.flatMap((rule) => rule.check(context));

  // 2) Calcul score / grade / stats (identique à ton code initial)
  const severityWeights: Record<SecuritySeverity, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 0,
  };

  let penalty = 0;
  findings.forEach((f) => {
    penalty += severityWeights[f.severity];
  });

  const score = Math.max(0, Math.min(100, 100 - penalty));
  const grade: SecurityScanResult['grade'] =
    score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  const bySeverity: Record<SecuritySeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  const byCategory: Record<SecurityCategory, number> = {
    network: 0,
    encryption: 0,
    access: 0,
    storage: 0,
    compute: 0,
    database: 0,
    monitoring: 0,
    compliance: 0,
  };

  findings.forEach((f) => {
    bySeverity[f.severity]++;
    byCategory[f.category]++;
  });

  // Ordonner : critical -> info
  findings.sort((a, b) => {
    const order: SecuritySeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
    return order.indexOf(a.severity) - order.indexOf(b.severity);
  });

  return {
    score,
    grade,
    findings,
    scannedAt: new Date().toISOString(),
    totalResources: context.nodes.length,
    bySerenity: bySeverity, // ou bySeverity si tu renommes la propriété dans le type
    byCategory,
  };
}

// ─── Component ──────────────────────────────────────────

export default function SecurityPanel() {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);

  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SecuritySeverity | 'all'>('all');
  const [scanning, setScanning] = useState(false);
  const [hoveredFinding, setHoveredFinding] = useState<string | null>(null);

  // Build context
  const context = useMemo((): SecurityContext => {
    const nodeMap: SecurityContext['nodeMap'] = {};
    nodes.forEach((n) => {
      const data = n.data as any;
      nodeMap[n.id] = {
        id: n.id,
        type: data?.awsType || n.type || 'unknown',
        label: data?.label || 'Unknown',
        data: data || {},
      };
    });

    const adjacency: Record<string, string[]> = {};
    edges.forEach((e) => {
      if (!adjacency[e.source]) adjacency[e.source] = [];
      if (!adjacency[e.target]) adjacency[e.target] = [];
      adjacency[e.source].push(e.target);
      adjacency[e.target].push(e.source);
    });

    return {
      nodes,
      edges,
      nodeMap,
      adjacency,
      hasNodeOfType: (type) => nodes.some((n) => {
        const d = n.data as any;
        return (d?.awsType || n.type) === type;
      }),
      getNodesOfType: (type) => nodes.filter((n) => {
        const d = n.data as any;
        return (d?.awsType || n.type) === type;
      }),
      isConnectedTo: (nodeId, targetType) => {
        const neighbors = adjacency[nodeId] || [];
        return neighbors.some((nId) => nodeMap[nId]?.type === targetType);
      },
      getConnectedNodes: (nodeId) => adjacency[nodeId] || [],
    };
  }, [nodes, edges]);

  // Run scan
  const handleScan = () => {
    setScanning(true);
    setScanResult(null);

    // Simulate scan time
    setTimeout(() => {
      const result = runSecurityScan(context);
      setScanResult(result);
      setScanning(false);
    }, 1500);
  };

  // Filter findings
  const filteredFindings = scanResult?.findings.filter(
    (f) => filter === 'all' || f.severity === filter
  ) || [];

  // Highlight nodes on hover
  const highlightNodes = (nodeIds: string[]) => {
    // Remove previous highlights
    document.querySelectorAll('.react-flow__node').forEach((el) => {
      el.classList.remove('simulation-node-error');
    });
    // Add highlights
    nodeIds.forEach((id) => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) el.classList.add('simulation-node-error');
    });
  };

  const clearHighlights = () => {
    document.querySelectorAll('.react-flow__node').forEach((el) => {
      el.classList.remove('simulation-node-error');
    });
  };

  // Grade colors
  const gradeColor: Record<string, { color: string; bg: string }> = {
    A: { color: '#10B981', bg: '#ECFDF5' },
    B: { color: '#3B82F6', bg: '#EFF6FF' },
    C: { color: '#F59E0B', bg: '#FFFBEB' },
    D: { color: '#EA580C', bg: '#FFF7ED' },
    F: { color: '#DC2626', bg: '#FEF2F2' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>
              🛡️ Security Scanner
            </h3>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
              Detect vulnerabilities in your architecture
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
        {/* Scan button */}
        {!scanResult && !scanning && (
          <div>
            <div
              style={{
                textAlign: 'center',
                padding: '30px 20px',
                borderRadius: '12px',
                border: '2px dashed #E5E7EB',
                marginBottom: '14px',
              }}
            >
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🛡️</span>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
                Security Analysis
              </p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 16px', lineHeight: 1.5 }}>
                Scan your architecture for security<br />
                misconfigurations and best practices
              </p>

              <button
                onClick={handleScan}
                disabled={nodes.length === 0}
                style={{
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: nodes.length === 0 ? '#D1D5DB' : 'white',
                  backgroundColor: nodes.length === 0 ? '#F3F4F6' : '#4F6EF7',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: nodes.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                🔍 Run Security Scan
              </button>

              {nodes.length === 0 && (
                <p style={{ fontSize: '10px', color: '#D1D5DB', margin: '8px 0 0' }}>
                  Add components to the canvas first
                </p>
              )}
            </div>

            {/* What we check */}
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px' }}>
              What we check
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { emoji: '🔒', text: 'Security Groups & Network ACLs' },
                { emoji: '🔐', text: 'Encryption at rest & in transit' },
                { emoji: '🔑', text: 'IAM Roles & least privilege' },
                { emoji: '🌐', text: 'Public exposure & ingress rules' },
                { emoji: '📊', text: 'Logging & monitoring (CloudTrail, CloudWatch)' },
                { emoji: '🛡️', text: 'WAF & DDoS protection' },
                { emoji: '📋', text: 'Compliance (CIS, SOC2, PCI-DSS, HIPAA)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px' }}>
                  <span style={{ fontSize: '14px' }}>{item.emoji}</span>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanning animation */}
        {scanning && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid #E5E7EB',
                borderTopColor: '#4F6EF7',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
              Scanning architecture...
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
              Checking {nodes.length} resources against 15+ rules
            </p>
          </div>
        )}

        {/* Results */}
        {scanResult && !scanning && (
          <div>
            {/* Score card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${gradeColor[scanResult.grade].bg}, white)`,
                border: `1px solid ${gradeColor[scanResult.grade].color}30`,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Grade circle */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: gradeColor[scanResult.grade].color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {scanResult.grade}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '20px', fontWeight: 700, margin: '0 0 2px',
                  color: gradeColor[scanResult.grade].color,
                }}>
                  {scanResult.score}/100
                </p>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
                  {scanResult.findings.length} finding{scanResult.findings.length !== 1 ? 's' : ''} •
                  {scanResult.totalResources} resource{scanResult.totalResources !== 1 ? 's' : ''} scanned
                </p>
              </div>

              {/* Rescan */}
              <button
                onClick={handleScan}
                style={{
                  padding: '6px 12px', fontSize: '11px', fontWeight: 500,
                  color: '#6B7280', backgroundColor: 'white',
                  border: '1px solid #E5E7EB', borderRadius: '6px',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                🔄 Rescan
              </button>
            </div>

            {/* Severity breakdown */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {(['critical', 'high', 'medium', 'low'] as SecuritySeverity[]).map((sev) => {
                const count = scanResult.bySerenity[sev];
                const config = SEVERITY_CONFIG[sev];
                if (count === 0) return null;
                return (
                  <button
                    key={sev}
                    onClick={() => setFilter(filter === sev ? 'all' : sev)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                      color: filter === sev ? 'white' : config.color,
                      backgroundColor: filter === sev ? config.color : config.bg,
                      border: `1px solid ${config.border}`,
                      borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {config.emoji} {count}
                  </button>
                );
              })}
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    padding: '4px 8px', fontSize: '10px', fontWeight: 500,
                    color: '#9CA3AF', backgroundColor: '#F3F4F6',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Findings */}
            {scanResult.findings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <span style={{ fontSize: '40px' }}>🎉</span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#10B981', margin: '12px 0 4px' }}>
                  No issues found!
                </p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                  Your architecture follows security best practices
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredFindings.map((finding) => {
                  const sev = SEVERITY_CONFIG[finding.severity];
                  const cat = CATEGORY_CONFIG[finding.category];
                  const isExpanded = expandedId === finding.id;
                  const isHovered = hoveredFinding === finding.id;

                  return (
                    <div
                      key={finding.id}
                      onMouseEnter={() => {
                        setHoveredFinding(finding.id);
                        highlightNodes(finding.affectedNodeIds);
                      }}
                      onMouseLeave={() => {
                        setHoveredFinding(null);
                        clearHighlights();
                      }}
                      style={{
                        borderRadius: '8px',
                        border: `1px solid ${isExpanded ? sev.border : isHovered ? '#D1D5DB' : '#E5E7EB'}`,
                        backgroundColor: isExpanded ? sev.bg : 'white',
                        overflow: 'hidden',
                        transition: 'all 0.15s',
                      }}
                    >
                      {/* Finding header */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'start',
                          gap: '10px', padding: '10px 12px',
                          backgroundColor: 'transparent', border: 'none',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: '16px', marginTop: '1px' }}>{sev.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: '0 0 3px' }}>
                            {finding.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '9px', fontWeight: 700,
                              color: sev.color, backgroundColor: sev.bg,
                              padding: '1px 6px', borderRadius: '4px',
                              border: `1px solid ${sev.border}`,
                            }}>
                              {sev.label.toUpperCase()}
                            </span>
                            <span style={{
                              fontSize: '9px', fontWeight: 600,
                              color: '#6B7280', backgroundColor: '#F3F4F6',
                              padding: '1px 6px', borderRadius: '4px',
                            }}>
                              {cat.emoji} {cat.label}
                            </span>
                            {finding.affectedNodeLabels.length > 0 && (
                              <span style={{ fontSize: '9px', color: '#9CA3AF' }}>
                                → {finding.affectedNodeLabels.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', color: '#D1D5DB', marginTop: '2px' }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ padding: '0 12px 12px', marginLeft: '26px' }}>
                          {/* Description */}
                          <p style={{
                            fontSize: '11px', color: '#374151', margin: '0 0 10px',
                            lineHeight: 1.5, backgroundColor: 'white',
                            padding: '8px 10px', borderRadius: '6px',
                            border: '1px solid #E5E7EB',
                          }}>
                            {finding.description}
                          </p>

                          {/* Recommendation */}
                          <div style={{
                            display: 'flex', gap: '8px', padding: '8px 10px',
                            backgroundColor: '#ECFDF5', borderRadius: '6px',
                            border: '1px solid #A7F3D0', marginBottom: '10px',
                          }}>
                            <span style={{ fontSize: '12px', flexShrink: 0 }}>💡</span>
                            <p style={{ fontSize: '11px', color: '#065F46', margin: 0, lineHeight: 1.5 }}>
                              {finding.recommendation}
                            </p>
                          </div>

                          {/* Compliance tags */}
                          {finding.compliance.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <p style={{ fontSize: '9px', fontWeight: 600, color: '#9CA3AF', margin: '0 0 4px' }}>
                                COMPLIANCE
                              </p>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {finding.compliance.map((c, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: '9px', fontWeight: 600,
                                      color: '#6B7280', backgroundColor: '#F3F4F6',
                                      padding: '2px 6px', borderRadius: '4px',
                                    }}
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Auto-fix badge */}
                          {finding.autoFixAvailable && (
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '4px 10px', backgroundColor: '#EEF2FF',
                              borderRadius: '6px', border: '1px solid #C7D2FE',
                            }}>
                              <span style={{ fontSize: '11px' }}>🔧</span>
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#4F46E5' }}>
                                Auto-fix available
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}