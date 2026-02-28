import { useState, useCallback, useMemo } from 'react';
import { useSimulationStore } from '../../stores/useSimulationStore';
import useEditorStore from '../../stores/useEditorStore';
import type { SimulationScenario, SimulationHop, StatusCode } from '../../types/simulation';

// ─── Latences simulées par type ─────────────────────────

const LATENCY_MAP: Record<string, { min: number; max: number; protocol: string }> = {
  cloudfront: { min: 1, max: 15, protocol: 'HTTPS' },
  alb: { min: 1, max: 5, protocol: 'HTTP' },
  api_gateway: { min: 5, max: 25, protocol: 'HTTPS' },
  ec2: { min: 10, max: 80, protocol: 'HTTP' },
  lambda: { min: 50, max: 300, protocol: 'HTTPS' },
  rds: { min: 5, max: 50, protocol: 'TCP/SQL' },
  dynamodb: { min: 2, max: 15, protocol: 'HTTPS' },
  s3: { min: 10, max: 60, protocol: 'HTTPS' },
  elasticache: { min: 0.5, max: 3, protocol: 'TCP' },
  sqs: { min: 5, max: 20, protocol: 'HTTPS' },
  sns: { min: 5, max: 15, protocol: 'HTTPS' },
  ecs: { min: 10, max: 100, protocol: 'HTTP' },
  nat_gateway: { min: 1, max: 5, protocol: 'TCP' },
  internet_gateway: { min: 0.5, max: 2, protocol: 'TCP' },
  efs: { min: 2, max: 10, protocol: 'NFS' },
  ebs: { min: 0.5, max: 5, protocol: 'Block' },
  aurora: { min: 3, max: 30, protocol: 'TCP/SQL' },
  redshift: { min: 10, max: 100, protocol: 'TCP/SQL' },
  eks: { min: 10, max: 80, protocol: 'HTTP' },
  ecr: { min: 5, max: 30, protocol: 'HTTPS' },
  route53: { min: 1, max: 10, protocol: 'DNS' },
  transit_gateway: { min: 1, max: 5, protocol: 'TCP' },
  vpc_peering: { min: 1, max: 3, protocol: 'TCP' },
  kinesis: { min: 5, max: 30, protocol: 'HTTPS' },
  step_functions: { min: 50, max: 200, protocol: 'HTTPS' },
  eventbridge: { min: 5, max: 20, protocol: 'HTTPS' },
  waf: { min: 1, max: 5, protocol: 'HTTPS' },
  secrets_manager: { min: 5, max: 20, protocol: 'HTTPS' },
  sg: { min: 0, max: 1, protocol: 'TCP' },
  iam_role: { min: 0, max: 1, protocol: 'IAM' },
  vpc: { min: 0, max: 1, protocol: 'TCP' },
  subnet: { min: 0, max: 1, protocol: 'TCP' },
  elastic_ip: { min: 0, max: 1, protocol: 'TCP' },
  route_table: { min: 0, max: 1, protocol: 'TCP' },
  s3_glacier: { min: 100, max: 500, protocol: 'HTTPS' },
  fargate: { min: 10, max: 80, protocol: 'HTTP' },
  auto_scaling_group: { min: 0, max: 1, protocol: 'TCP' },
  launch_template: { min: 0, max: 1, protocol: 'TCP' },
  elastic_beanstalk: { min: 10, max: 80, protocol: 'HTTP' },
};

// ─── Component labels ───────────────────────────────────

const TYPE_LABELS: Record<string, { emoji: string; label: string }> = {
  vpc: { emoji: '🌐', label: 'VPC' },
  subnet: { emoji: '📦', label: 'Subnet' },
  ec2: { emoji: '🖥️', label: 'EC2' },
  s3: { emoji: '🪣', label: 'S3' },
  rds: { emoji: '🗄️', label: 'RDS' },
  lambda: { emoji: '⚡', label: 'Lambda' },
  api_gateway: { emoji: '🚪', label: 'API GW' },
  dynamodb: { emoji: '📊', label: 'DynamoDB' },
  cloudfront: { emoji: '🌍', label: 'CloudFront' },
  ecs: { emoji: '🐳', label: 'ECS' },
  sqs: { emoji: '📬', label: 'SQS' },
  sns: { emoji: '📢', label: 'SNS' },
  elasticache: { emoji: '⚡', label: 'ElastiCache' },
  ebs: { emoji: '💾', label: 'EBS' },
  efs: { emoji: '📁', label: 'EFS' },
  alb: { emoji: '⚖️', label: 'ALB' },
  nat_gateway: { emoji: '🔀', label: 'NAT GW' },
  internet_gateway: { emoji: '🌐', label: 'IGW' },
  route_table: { emoji: '🗺️', label: 'Route Table' },
  transit_gateway: { emoji: '🔄', label: 'Transit GW' },
  eks: { emoji: '☸️', label: 'EKS' },
  fargate: { emoji: '🚀', label: 'Fargate' },
  aurora: { emoji: '🗄️', label: 'Aurora' },
  redshift: { emoji: '📊', label: 'Redshift' },
  kinesis: { emoji: '🌊', label: 'Kinesis' },
  step_functions: { emoji: '🔗', label: 'Step Fn' },
  eventbridge: { emoji: '📡', label: 'EventBridge' },
  waf: { emoji: '🛡️', label: 'WAF' },
  sg: { emoji: '🔒', label: 'Security Group' },
  elastic_ip: { emoji: '📍', label: 'Elastic IP' },
  s3_glacier: { emoji: '🧊', label: 'Glacier' },
};

export default function SimulationPanel() {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const {
    isRunning, stats, speed,
    setIsRunning, addActiveHop, removeActiveHop,
    clearActiveHops, updateStats, resetStats, setSpeed,
    setSelectedScenario, selectedScenario, reset,
  } = useSimulationStore();

  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // ─── Build node/edge maps ─────────────────────────────

  const nodeMap = useMemo(() => {
    const map: Record<string, { id: string; type: string; label: string }> = {};
    nodes.forEach((n) => {
      const data = n.data as any;
      const type = data?.awsType || n.type || 'unknown';
      const label = data?.label || type;
      map[n.id] = { id: n.id, type, label };
    });
    return map;
  }, [nodes]);

  // Build adjacency list from edges
  const adjacency = useMemo(() => {
    const adj: Record<string, string[]> = {};
    edges.forEach((e) => {
      if (!adj[e.source]) adj[e.source] = [];
      if (!adj[e.target]) adj[e.target] = [];
      adj[e.source].push(e.target);
      adj[e.target].push(e.source); // bidirectional
    });
    return adj;
  }, [edges]);

  // ─── Auto-generate scenarios from canvas ──────────────

  const scenarios = useMemo((): SimulationScenario[] => {
    if (nodes.length === 0) return [];

    const result: SimulationScenario[] = [];

    // Find all possible paths using BFS
    const findPaths = (startId: string, maxDepth: number = 5): string[][] => {
      const paths: string[][] = [];
      const queue: { nodeId: string; path: string[] }[] = [
        { nodeId: startId, path: [startId] },
      ];

      while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = adjacency[current.nodeId] || [];

        if (current.path.length > 1) {
          paths.push([...current.path]);
        }

        if (current.path.length >= maxDepth) continue;

        for (const neighbor of neighbors) {
          if (!current.path.includes(neighbor)) {
            queue.push({
              nodeId: neighbor,
              path: [...current.path, neighbor],
            });
          }
        }
      }

      return paths;
    };

    // For each node, generate scenario following edges
    nodes.forEach((node) => {
      const data = node.data as any;
      const type = data?.awsType || node.type || 'unknown';
      const typeInfo = TYPE_LABELS[type] || { emoji: '📦', label: type };

      const paths = findPaths(node.id);

      // Get the longest interesting path from this node
      const bestPath = paths
        .filter((p) => p.length >= 2)
        .sort((a, b) => b.length - a.length)[0];

      if (bestPath && bestPath.length >= 2) {
        const flowLabels = bestPath.map((id) => {
          const n = nodeMap[id];
          const ti = TYPE_LABELS[n?.type] || { emoji: '📦', label: n?.type };
          return `${ti.emoji} ${n?.label || n?.type}`;
        });

        result.push({
          id: `flow-${node.id}`,
          name: `${typeInfo.label} → Flow`,
          description: flowLabels.join(' → '),
          emoji: typeInfo.emoji,
          entryPoint: type,
          requestCount: 1,
          method: type === 's3' ? 'PUT' : type === 'rds' || type === 'dynamodb' ? 'GET' : 'GET',
          path: `/${type}/request`,
          expectedFlow: bestPath.map((id) => id), // Use actual node IDs
        });
      }
    });

    // Add load test if we have paths
    if (result.length > 0) {
      const firstFlow = result[0];
      result.push({
        ...firstFlow,
        id: 'load-test-10',
        name: 'Load Test (10 req)',
        description: `10 concurrent requests through: ${firstFlow.description}`,
        emoji: '⚡',
        requestCount: 10,
        method: 'GET',
        path: '/api/load-test',
      });

      result.push({
        ...firstFlow,
        id: 'stress-test-50',
        name: 'Stress Test (50 req)',
        description: `50 requests with potential errors: ${firstFlow.description}`,
        emoji: '🔥',
        requestCount: 50,
        method: 'GET',
        path: '/api/stress-test',
      });
    }

    return result;
  }, [nodes, edges, adjacency, nodeMap]);

  // ─── Utils ────────────────────────────────────────────

  const randomLatency = (type: string): number => {
    const config = LATENCY_MAP[type] || { min: 5, max: 50 };
    return Math.round(config.min + Math.random() * (config.max - config.min));
  };

  const randomStatus = (errorRate: number = 0.05): StatusCode => {
    const rand = Math.random();
    if (rand < errorRate) {
      const errors: StatusCode[] = [400, 401, 403, 404, 500, 502, 503];
      return errors[Math.floor(Math.random() * errors.length)];
    }
    return Math.random() > 0.1 ? 200 : 201;
  };

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    setLogs((prev) => [...prev.slice(-100), `[${time}] ${msg}`]);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─── Run simulation using actual node IDs ─────────────

  const runSimulation = async () => {
    if (!selectedScenario) return;

    resetStats();
    clearActiveHops();
    setLogs([]);
    setIsRunning(true);

    addLog(`🚀 Starting: ${selectedScenario.name}`);
    addLog(`   ${selectedScenario.requestCount} request(s) • ${selectedScenario.method} ${selectedScenario.path}`);
    addLog('');

    const allLatencies: number[] = [];
    const allStatuses: Record<number, number> = {};
    let successCount = 0;
    let totalBytes = 0;

    // expectedFlow contains actual node IDs now
    const flowNodeIds = selectedScenario.expectedFlow;

    for (let i = 0; i < selectedScenario.requestCount; i++) {
      const reqId = crypto.randomUUID();
      let reqLatency = 0;
      let reqFailed = false;

      addLog(`── Request #${i + 1} ─────────────────`);

      for (let j = 0; j < flowNodeIds.length; j++) {
        const fromNodeId = j === 0 ? null : flowNodeIds[j - 1];
        const toNodeId = flowNodeIds[j];
        const toNodeInfo = nodeMap[toNodeId];

        if (!toNodeInfo) {
          addLog(`   ⚠️ Node ${toNodeId} not found, skipping`);
          continue;
        }

        const toType = toNodeInfo.type;
        const toLabel = toNodeInfo.label;
        const latency = randomLatency(toType);
        const errorRate = selectedScenario.requestCount > 20 ? 0.1 : 0.03;
        const status = j === flowNodeIds.length - 1 ? randomStatus(errorRate) : (200 as StatusCode);
        const bytes = Math.floor(Math.random() * 50000) + 500;
        const protocol = LATENCY_MAP[toType]?.protocol || 'HTTP';

        reqLatency += latency;
        totalBytes += bytes;
        allStatuses[status] = (allStatuses[status] || 0) + 1;

        const hop: SimulationHop = {
          id: crypto.randomUUID(),
          requestId: reqId,
          fromNodeId: fromNodeId || '',
          toNodeId,
          startTime: Date.now(),
          endTime: Date.now() + latency * 3,
          latencyMs: latency,
          statusCode: status,
          bytesTransferred: bytes,
          protocol,
          description: `→ ${toLabel}`,
        };

        addActiveHop(hop);

        const statusEmoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
        const fromLabel = fromNodeId ? (nodeMap[fromNodeId]?.label || '?') : '👤 User';
        addLog(`   ${statusEmoji} ${fromLabel} → ${toLabel} [${protocol}] ${latency}ms → ${status}`);

        // Wait for animation
        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(300, latency * 3) / speed)
        );

        // Remove hop after delay
        setTimeout(() => removeActiveHop(hop.id), 1500 / speed);

        if (status >= 500) {
          reqFailed = true;
          addLog(`   💥 Failed at ${toLabel} with ${status}`);
          break;
        }
      }

      if (!reqFailed) successCount++;
      allLatencies.push(reqLatency);
      addLog(`   ⏱️ Total: ${reqLatency}ms ${reqFailed ? '(FAILED)' : '(OK)'}`);
      addLog('');

      // Update stats
      const sorted = [...allLatencies].sort((a, b) => a - b);
      updateStats({
        totalRequests: i + 1,
        avgLatencyMs: Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length),
        successRate: Math.round((successCount / (i + 1)) * 100),
        errorRate: Math.round(((i + 1 - successCount) / (i + 1)) * 100),
        totalBytesTransferred: totalBytes,
        p50LatencyMs: sorted[Math.floor(sorted.length * 0.5)] || 0,
        p95LatencyMs: sorted[Math.floor(sorted.length * 0.95)] || 0,
        p99LatencyMs: sorted[Math.floor(sorted.length * 0.99)] || 0,
        statusCodes: { ...allStatuses },
      });

      // Delay between requests
      if (i < selectedScenario.requestCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 / speed));
      }
    }

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    addLog(`✅ Complete: ${successCount}/${selectedScenario.requestCount} OK`);
    setIsRunning(false);
    clearActiveHops();
  };

  const stopSimulation = () => {
    setIsRunning(false);
    clearActiveHops();
    addLog('⛔ Stopped');
  };

  // ─── Render ───────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>
              🧪 Simulation
            </h3>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
              Test your architecture with live traffic
            </p>
          </div>
          {isRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  animation: 'pulse 1s infinite',
                }}
              />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#EF4444' }}>LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Speed control */}
      <div style={{ padding: '0 14px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Speed:</span>
        {[0.5, 1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              padding: '3px 8px', fontSize: '10px', fontWeight: 600,
              color: speed === s ? 'white' : '#6B7280',
              backgroundColor: speed === s ? '#4F6EF7' : '#F3F4F6',
              border: 'none', borderRadius: '4px', cursor: 'pointer',
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
        {!isRunning && stats.totalRequests === 0 && (
          <div>
            {/* No nodes warning */}
            {nodes.length === 0 && (
              <div
                style={{
                  padding: '12px', backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A', borderRadius: '8px',
                  marginBottom: '10px',
                }}
              >
                <p style={{ fontSize: '11px', color: '#92400E', margin: 0 }}>
                  ⚠️ Add components to the canvas and connect them to run simulations
                </p>
              </div>
            )}

            {/* No edges warning */}
            {nodes.length > 0 && edges.length === 0 && (
              <div
                style={{
                  padding: '12px', backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A', borderRadius: '8px',
                  marginBottom: '10px',
                }}
              >
                <p style={{ fontSize: '11px', color: '#92400E', margin: 0 }}>
                  ⚠️ Connect your components with edges to create data flows
                </p>
              </div>
            )}

            {/* Scenarios */}
            {scenarios.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', margin: '0 0 8px' }}>
                  Available flows ({scenarios.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario)}
                      onMouseEnter={() => setHoveredScenario(scenario.id)}
                      onMouseLeave={() => setHoveredScenario(null)}
                      style={{
                        textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${
                          selectedScenario?.id === scenario.id ? '#4F6EF7'
                          : hoveredScenario === scenario.id ? '#D1D5DB'
                          : '#E5E7EB'
                        }`,
                        backgroundColor:
                          selectedScenario?.id === scenario.id ? '#EEF2FF'
                          : hoveredScenario === scenario.id ? '#FAFBFC'
                          : 'white',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{scenario.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0 }}>
                            {scenario.name}
                          </p>
                          <p style={{
                            fontSize: '10px', color: '#9CA3AF', margin: '2px 0 0',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {scenario.description}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '9px', fontWeight: 700,
                            color: '#6B7280', backgroundColor: '#F3F4F6',
                            padding: '2px 6px', borderRadius: '4px',
                          }}>
                            {scenario.method}
                          </span>
                          <p style={{ fontSize: '9px', color: '#D1D5DB', margin: '2px 0 0' }}>
                            {scenario.requestCount} req
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Run button */}
                <button
                  onClick={runSimulation}
                  disabled={!selectedScenario}
                  style={{
                    width: '100%', marginTop: '12px', padding: '12px',
                    fontSize: '13px', fontWeight: 600,
                    color: !selectedScenario ? '#D1D5DB' : 'white',
                    backgroundColor: !selectedScenario ? '#F3F4F6' : '#4F6EF7',
                    border: 'none', borderRadius: '10px',
                    cursor: !selectedScenario ? 'not-allowed' : 'pointer',
                  }}
                >
                  ▶ Run Simulation
                </button>
              </>
            )}

            {/* No scenarios possible */}
            {nodes.length > 0 && edges.length > 0 && scenarios.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <span style={{ fontSize: '32px' }}>🤔</span>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '8px 0 0' }}>
                  No valid flows detected. Make sure your nodes are connected.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Running / Completed stats */}
        {(isRunning || stats.totalRequests > 0) && (
          <div>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              <StatCard label="Requests" value={`${stats.totalRequests}`} emoji="📨" />
              <StatCard label="Avg Latency" value={`${stats.avgLatencyMs}ms`} emoji="⏱️" />
              <StatCard
                label="Success"
                value={`${stats.successRate}%`}
                emoji="✅"
                color={stats.successRate >= 95 ? '#10B981' : stats.successRate >= 80 ? '#F59E0B' : '#EF4444'}
              />
              <StatCard label="Data" value={formatBytes(stats.totalBytesTransferred)} emoji="📊" />
            </div>

            {/* Percentiles */}
            {stats.totalRequests > 1 && (
              <div style={{
                display: 'flex', gap: '8px', padding: '8px 10px',
                backgroundColor: '#F9FAFB', borderRadius: '8px', marginBottom: '10px',
              }}>
                <PercentileChip label="p50" value={stats.p50LatencyMs} />
                <PercentileChip label="p95" value={stats.p95LatencyMs} />
                <PercentileChip label="p99" value={stats.p99LatencyMs} />
              </div>
            )}

            {/* Status codes */}
            {Object.keys(stats.statusCodes).length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', margin: '0 0 6px' }}>
                  Status Codes
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {Object.entries(stats.statusCodes).map(([code, count]) => {
                    const n = parseInt(code);
                    const color = n >= 500 ? '#EF4444' : n >= 400 ? '#F59E0B' : '#10B981';
                    const bg = n >= 500 ? '#FEF2F2' : n >= 400 ? '#FFFBEB' : '#ECFDF5';
                    return (
                      <span key={code} style={{
                        fontSize: '10px', fontWeight: 700, color, backgroundColor: bg,
                        padding: '3px 8px', borderRadius: '6px',
                      }}>
                        {code}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stop / Reset buttons */}
            {isRunning ? (
              <button
                onClick={stopSimulation}
                style={{
                  width: '100%', padding: '10px', fontSize: '12px', fontWeight: 600,
                  color: '#EF4444', backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer',
                  marginBottom: '10px',
                }}
              >
                ⏹ Stop Simulation
              </button>
            ) : (
              <button
                onClick={() => { reset(); setLogs([]); }}
                style={{
                  width: '100%', padding: '10px', fontSize: '12px', fontWeight: 500,
                  color: '#6B7280', backgroundColor: '#F3F4F6',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  marginBottom: '10px',
                }}
              >
                🔄 New Simulation
              </button>
            )}

            {/* Logs */}
            {logs.length > 0 && (
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', margin: '0 0 6px' }}>
                  📟 Live Logs
                </p>
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #1E293B' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 10px', backgroundColor: '#1E293B',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28C840' }} />
                    <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748B', marginLeft: '4px' }}>
                      simulation.log
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: '#0F172A', padding: '10px 12px',
                    maxHeight: '200px', overflowY: 'auto',
                  }}>
                    {logs.map((log, i) => (
                      <div key={i} style={{
                        fontSize: '10px', fontFamily: 'monospace', lineHeight: 1.6,
                        color: log.includes('❌') || log.includes('💥') ? '#F87171'
                          : log.includes('✅') || log.includes('✓') ? '#6EE7B7'
                          : log.includes('⚠️') ? '#FCD34D'
                          : log.includes('──') || log.includes('━') ? '#475569'
                          : '#94A3B8',
                      }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────

function StatCard({ label, value, emoji, color }: {
  label: string; value: string; emoji: string; color?: string;
}) {
  return (
    <div style={{
      padding: '10px', borderRadius: '8px',
      border: '1px solid #E5E7EB', backgroundColor: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px' }}>{emoji}</span>
        <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{label}</span>
      </div>
      <span style={{ fontSize: '16px', fontWeight: 700, color: color || '#111827' }}>
        {value}
      </span>
    </div>
  );
}

function PercentileChip({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <span style={{ fontSize: '9px', fontWeight: 600, color: '#9CA3AF', display: 'block' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{value}ms</span>
    </div>
  );
}