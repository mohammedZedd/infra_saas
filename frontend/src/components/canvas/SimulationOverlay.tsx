import { useEffect, useState, useRef } from 'react';
import { useViewport } from '@xyflow/react';
import { useSimulationStore } from '../../stores/useSimulationStore';
import useEditorStore from '../../stores/useEditorStore';

interface Packet {
  id: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  progress: number;
  statusCode: number;
  latencyMs: number;
  status: 'traveling' | 'success' | 'error';
}

interface NodeBadge {
  nodeId: string;
  statusCode: number;
  status: 'success' | 'error';
  position: { x: number; y: number };
  timestamp: number;
}

export default function SimulationOverlay() {
  const { isRunning, activeHops } = useSimulationStore();
  const nodes = useEditorStore((s) => s.nodes);
  const { x: vpX, y: vpY, zoom } = useViewport();

  const [packets, setPackets] = useState<Packet[]>([]);
  const [badges, setBadges] = useState<NodeBadge[]>([]);
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set());
  const animFrameRef = useRef<number | null>(null);

  // Convert flow position to screen position using viewport
  const flowToScreen = (flowX: number, flowY: number) => ({
    x: flowX * zoom + vpX,
    y: flowY * zoom + vpY,
  });

  // Get node center in FLOW coordinates
  const getNodeCenter = (nodeId: string): { x: number; y: number } | null => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.position) return null;

    const width = (node.measured?.width || node.width || 120) as number;
    const height = (node.measured?.height || node.height || 80) as number;

    return {
      x: node.position.x + width / 2,
      y: node.position.y + height / 2,
    };
  };

  // Process hops → packets
  useEffect(() => {
    if (!isRunning && activeHops.length === 0) {
      setPackets([]);
      setBadges((prev) => prev.filter((b) => Date.now() - b.timestamp < 3000));
      setActiveNodeIds(new Set());
      return;
    }

    const newActiveNodes = new Set<string>();
    const newPackets: Packet[] = [];

    activeHops.forEach((hop) => {
      const fromCenter = hop.fromNodeId ? getNodeCenter(hop.fromNodeId) : null;
      const toCenter = getNodeCenter(hop.toNodeId);

      if (!toCenter) return;

      // If no from node, start from above the target
      const startPos = fromCenter || {
        x: toCenter.x,
        y: toCenter.y - 150,
      };

      // Track active nodes
      if (hop.fromNodeId) newActiveNodes.add(hop.fromNodeId);
      newActiveNodes.add(hop.toNodeId);

      // Calculate progress
      const elapsed = Date.now() - hop.startTime;
      const duration = hop.endTime - hop.startTime;
      const progress = Math.min(elapsed / Math.max(duration, 100), 1);
      const isError = hop.statusCode >= 400;

      // Convert to screen coords
      const fromScreen = flowToScreen(startPos.x, startPos.y);
      const toScreen = flowToScreen(toCenter.x, toCenter.y);

      newPackets.push({
        id: hop.id,
        fromPos: fromScreen,
        toPos: toScreen,
        progress,
        statusCode: hop.statusCode,
        latencyMs: hop.latencyMs,
        status: progress >= 1 ? (isError ? 'error' : 'success') : 'traveling',
      });

      // Add badge when arriving
      if (progress >= 0.85) {
        const badgeScreen = flowToScreen(toCenter.x, toCenter.y);
        setBadges((prev) => {
          const exists = prev.find(
            (b) => b.nodeId === hop.toNodeId && b.timestamp === hop.startTime
          );
          if (exists) return prev;
          return [
            ...prev.slice(-15),
            {
              nodeId: hop.toNodeId,
              statusCode: hop.statusCode,
              status: isError ? 'error' : 'success',
              position: badgeScreen,
              timestamp: hop.startTime,
            },
          ];
        });
      }
    });

    setPackets(newPackets);
    setActiveNodeIds(newActiveNodes);
  }, [activeHops, isRunning, nodes, vpX, vpY, zoom]);

  // Animate
  useEffect(() => {
    if (packets.length === 0) return;

    const animate = () => {
      setPackets((prev) =>
        prev.map((p) => {
          const hop = activeHops.find((h) => h.id === p.id);
          if (!hop) return p;

          const elapsed = Date.now() - hop.startTime;
          const duration = hop.endTime - hop.startTime;
          const progress = Math.min(elapsed / Math.max(duration, 100), 1);

          // Recalculate screen positions (viewport may have changed)
          const fromCenter = hop.fromNodeId ? getNodeCenter(hop.fromNodeId) : null;
          const toCenter = getNodeCenter(hop.toNodeId);
          if (!toCenter) return p;

          const startPos = fromCenter || { x: toCenter.x, y: toCenter.y - 150 };

          return {
            ...p,
            fromPos: flowToScreen(startPos.x, startPos.y),
            toPos: flowToScreen(toCenter.x, toCenter.y),
            progress,
            status: progress >= 1 ? (hop.statusCode >= 400 ? 'error' : 'success') : 'traveling',
          };
        })
      );

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [packets.length, activeHops, vpX, vpY, zoom]);

  // Apply glow CSS to active nodes
  useEffect(() => {
    document.querySelectorAll('.react-flow__node').forEach((el) => {
      el.classList.remove('simulation-node-active', 'simulation-node-success', 'simulation-node-error');
    });

    if (!isRunning && activeNodeIds.size === 0) return;

    activeNodeIds.forEach((nodeId) => {
      const el = document.querySelector(`[data-id="${nodeId}"]`);
      if (el) el.classList.add('simulation-node-active');
    });
  }, [activeNodeIds, isRunning]);

  // Clean old badges
  useEffect(() => {
    const interval = setInterval(() => {
      setBadges((prev) => prev.filter((b) => Date.now() - b.timestamp < 3000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isRunning && packets.length === 0 && badges.length === 0) return null;

  return (
    <>
      {/* SVG overlay for packets - positioned absolute over the ReactFlow viewport */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {packets.map((packet) => {
          // Interpolate position
          const x = packet.fromPos.x + (packet.toPos.x - packet.fromPos.x) * packet.progress;
          const y = packet.fromPos.y + (packet.toPos.y - packet.fromPos.y) * packet.progress;

          const color =
            packet.status === 'error' ? '#EF4444' :
            packet.status === 'success' ? '#10B981' :
            '#4F6EF7';

          return (
            <g key={packet.id}>
              {/* Trail */}
              <line
                x1={packet.fromPos.x}
                y1={packet.fromPos.y}
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth={2}
                strokeOpacity={0.2}
                strokeDasharray="6,4"
              />

              {/* Glow */}
              <circle cx={x} cy={y} r={14 * zoom} fill={color} opacity={0.12}>
                <animate attributeName="r" values={`${10*zoom};${16*zoom};${10*zoom}`} dur="0.8s" repeatCount="indefinite" />
              </circle>

              {/* Dot */}
              <circle
                cx={x}
                cy={y}
                r={5 * zoom}
                fill={color}
                stroke="white"
                strokeWidth={2 * zoom}
              />

              {/* Latency label */}
              {packet.progress > 0.2 && packet.progress < 0.85 && (
                <g>
                  <rect
                    x={x - 22 * zoom}
                    y={y - 26 * zoom}
                    width={44 * zoom}
                    height={18 * zoom}
                    rx={4 * zoom}
                    fill="white"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.95}
                  />
                  <text
                    x={x}
                    y={y - 14 * zoom}
                    textAnchor="middle"
                    fontSize={10 * zoom}
                    fontWeight={700}
                    fontFamily="Inter, sans-serif"
                    fill={color}
                  >
                    {packet.latencyMs}ms
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Status badges */}
      {badges.map((badge, i) => {
        const isError = badge.status === 'error';

        // Recalculate badge position with current viewport
        const nodeCenter = getNodeCenter(badge.nodeId);
        if (!nodeCenter) return null;
        const screenPos = flowToScreen(nodeCenter.x, nodeCenter.y);

        return (
          <div
            key={`${badge.nodeId}-${badge.timestamp}-${i}`}
            style={{
              position: 'absolute',
              left: screenPos.x + 25 * zoom,
              top: screenPos.y - 30 * zoom,
              backgroundColor: isError ? '#FEF2F2' : '#ECFDF5',
              color: isError ? '#EF4444' : '#10B981',
              border: `1.5px solid ${isError ? '#FECACA' : '#A7F3D0'}`,
              borderRadius: `${6 * zoom}px`,
              padding: `${2 * zoom}px ${6 * zoom}px`,
              fontSize: `${10 * zoom}px`,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              animation: 'badgePop 0.3s ease-out',
              boxShadow: `0 2px 8px ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              whiteSpace: 'nowrap',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {isError ? '✕' : '✓'} {badge.statusCode}
          </div>
        );
      })}

      {/* LIVE indicator */}
      {isRunning && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              animation: 'pulse 1s infinite',
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>
            SIMULATION LIVE
          </span>
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
            {packets.length} active
          </span>
        </div>
      )}
    </>
  );
}