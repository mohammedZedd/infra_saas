import { useState } from 'react';
import { useTerraformStore } from '../../stores/useTerraformStore';
import type { TerraformExecution } from '../../types/terraform';

const CMDS = [
  { id: 'init' as const, label: 'Init', desc: 'Initialize providers', emoji: '🔄', color: '#6B7280', bg: '#F3F4F6' },
  { id: 'plan' as const, label: 'Plan', desc: 'Preview changes', emoji: '📋', color: '#4F6EF7', bg: '#EEF2FF' },
  { id: 'apply' as const, label: 'Apply', desc: 'Deploy infra', emoji: '🚀', color: '#10B981', bg: '#ECFDF5' },
  { id: 'destroy' as const, label: 'Destroy', desc: 'Tear down', emoji: '💥', color: '#EF4444', bg: '#FEF2F2' },
];

const STATUS_MAP: Record<string, { emoji: string; color: string; bg: string }> = {
  pending: { emoji: '⏳', color: '#9CA3AF', bg: '#F3F4F6' },
  running: { emoji: '⚡', color: '#4F6EF7', bg: '#EEF2FF' },
  success: { emoji: '✅', color: '#10B981', bg: '#ECFDF5' },
  failed: { emoji: '❌', color: '#EF4444', bg: '#FEF2F2' },
  cancelled: { emoji: '⛔', color: '#9CA3AF', bg: '#F3F4F6' },
};

export default function ExecutionPanel() {
  const {
    executions,
    currentExecution,
    isExecuting,
    setCurrentExecution,
    addExecution,
    updateExecution,
    setIsExecuting,
  } = useTerraformStore();

  const [view, setView] = useState<'actions' | 'history'>('actions');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRun = (command: 'init' | 'plan' | 'apply' | 'destroy') => {
    if (isExecuting) return;

    const exec: TerraformExecution = {
      id: crypto.randomUUID(),
      projectId: 'current',
      command,
      status: 'pending',
      triggeredBy: 'user',
      terraformVersion: '1.5.0',
      outputLogs: '',
      startedAt: new Date().toISOString(),
    };

    addExecution(exec);
    setCurrentExecution(exec);
    setIsExecuting(true);

    // Simulation phase 1 - Pending → Running
    setTimeout(() => {
      updateExecution(exec.id, {
        status: 'running',
        outputLogs: `$ terraform ${command}\n\nInitializing provider plugins...\n`,
      });
    }, 500);

    // Simulation phase 2 - Progress
    setTimeout(() => {
      updateExecution(exec.id, {
        outputLogs: `$ terraform ${command}\n\nInitializing provider plugins...\nInstalling hashicorp/aws v5.31.0...\n\n✓ Terraform initialized!\n`,
      });
    }, 1500);

    // Simulation phase 3 - Result
    setTimeout(() => {
      const ok = Math.random() > 0.15;
      updateExecution(exec.id, {
        status: ok ? 'success' : 'failed',
        finishedAt: new Date().toISOString(),
        durationSeconds: 4,
        outputLogs: ok
          ? `$ terraform ${command}\n\nInitializing provider plugins...\nInstalling hashicorp/aws v5.31.0...\n\n✓ Terraform initialized!\n\nPlan: 3 to add, 0 to change, 0 to destroy.\n\n✓ ${command === 'apply' ? 'Apply complete! Resources: 3 added, 0 changed, 0 destroyed.' : 'Plan completed successfully.'}\n`
          : `$ terraform ${command}\n\nInitializing provider plugins...\n\n╷\n│ Error: Invalid AWS credentials\n│\n│ Please verify your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY\n╵\n`,
        errorLogs: ok ? undefined : 'Invalid AWS credentials',
        planSummary: ok ? { toAdd: 3, toChange: 0, toDestroy: 0 } : undefined,
      });
      setIsExecuting(false);
    }, 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>
          Terraform
        </h3>
        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
          Deploy your infrastructure
        </p>
      </div>

      {/* View toggle */}
      <div
        style={{
          margin: '0 14px 10px',
          display: 'flex',
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
          padding: '2px',
        }}
      >
        <button
          onClick={() => setView('actions')}
          style={{
            flex: 1,
            padding: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: view === 'actions' ? '#111827' : '#9CA3AF',
            backgroundColor: view === 'actions' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: view === 'actions' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          🚀 Actions
        </button>
        <button
          onClick={() => setView('history')}
          style={{
            flex: 1,
            padding: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: view === 'history' ? '#111827' : '#9CA3AF',
            backgroundColor: view === 'history' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: view === 'history' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          📜 History{executions.length > 0 ? ` (${executions.length})` : ''}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>

        {/* =================== ACTIONS VIEW =================== */}
        {view === 'actions' ? (
          <div>
            {/* Command grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CMDS.map((cmd) => (
                <CmdButton
                  key={cmd.id}
                  cmd={cmd}
                  disabled={isExecuting}
                  onClick={() => handleRun(cmd.id)}
                />
              ))}
            </div>

            {/* Console output */}
            {currentExecution && (
              <div style={{ marginTop: '14px' }}>
                {/* Console header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>
                    📟 Console
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: STATUS_MAP[currentExecution.status].color,
                    }}
                  >
                    {STATUS_MAP[currentExecution.status].emoji} {currentExecution.status}
                    {currentExecution.durationSeconds ? ` · ${currentExecution.durationSeconds}s` : ''}
                  </span>
                </div>

                {/* Terminal window */}
                <div
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #1E293B',
                  }}
                >
                  {/* macOS bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: '#1E293B',
                    }}
                  >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#28C840' }} />
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#64748B',
                        marginLeft: '6px',
                      }}
                    >
                      terraform {currentExecution.command}
                    </span>
                  </div>

                  {/* Logs */}
                  <div
                    style={{
                      backgroundColor: '#0F172A',
                      padding: '12px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        lineHeight: 1.7,
                        color: '#94A3B8',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {currentExecution.outputLogs || '⏳ Waiting...'}
                    </pre>
                  </div>
                </div>

                {/* Plan summary cards */}
                {currentExecution.planSummary && currentExecution.status === 'success' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '6px',
                      marginTop: '8px',
                    }}
                  >
                    <SummaryCard
                      number={currentExecution.planSummary.toAdd}
                      label="add"
                      prefix="+"
                      color="#10B981"
                      bg="#ECFDF5"
                    />
                    <SummaryCard
                      number={currentExecution.planSummary.toChange}
                      label="change"
                      prefix="~"
                      color="#F59E0B"
                      bg="#FFFBEB"
                    />
                    <SummaryCard
                      number={currentExecution.planSummary.toDestroy}
                      label="destroy"
                      prefix="-"
                      color="#EF4444"
                      bg="#FEF2F2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (

          /* =================== HISTORY VIEW =================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {executions.length === 0 ? (
              /* Empty state */
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: '20px',
                  }}
                >
                  📜
                </div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', margin: '0 0 4px' }}>
                  No executions yet
                </p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                  Run your first command to see history
                </p>
              </div>
            ) : (
              /* Execution list */
              executions.map((ex) => (
                <HistoryItem
                  key={ex.id}
                  execution={ex}
                  isExpanded={expandedId === ex.id}
                  onToggle={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   COMMAND BUTTON
   ================================================================ */

function CmdButton({
  cmd,
  disabled,
  onClick,
}: {
  cmd: (typeof CMDS)[number];
  disabled: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: 'left',
        padding: '14px',
        borderRadius: '10px',
        border: `1px solid ${hovered && !disabled ? '#D1D5DB' : '#E5E7EB'}`,
        backgroundColor: hovered && !disabled ? '#FAFBFC' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
        boxShadow: hovered && !disabled ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: cmd.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          marginBottom: '8px',
        }}
      >
        {cmd.emoji}
      </div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>
        {cmd.label}
      </p>
      <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '2px 0 0' }}>
        {cmd.desc}
      </p>
    </button>
  );
}

/* ================================================================
   PLAN SUMMARY CARD
   ================================================================ */

function SummaryCard({
  number,
  label,
  prefix,
  color,
  bg,
}: {
  number: number;
  label: string;
  prefix: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '8px 4px',
        backgroundColor: bg,
        borderRadius: '8px',
      }}
    >
      <span style={{ fontSize: '16px', fontWeight: 700, color }}>
        {prefix}{number}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 600,
          color,
          opacity: 0.7,
          marginTop: '2px',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ================================================================
   HISTORY ITEM
   ================================================================ */

function HistoryItem({
  execution,
  isExpanded,
  onToggle,
}: {
  execution: TerraformExecution;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const sc = STATUS_MAP[execution.status];
  const cmdInfo = CMDS.find((c) => c.id === execution.command);

  return (
    <div
      style={{
        borderRadius: '8px',
        border: `1px solid ${isExpanded || hovered ? '#D1D5DB' : '#E5E7EB'}`,
        backgroundColor: 'white',
        overflow: 'hidden',
        transition: 'all 0.15s',
      }}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          backgroundColor: hovered ? '#FAFBFC' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.1s',
        }}
      >
        {/* Left: status + command */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: sc.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}
          >
            {sc.emoji}
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: cmdInfo?.color || '#6B7280',
              backgroundColor: cmdInfo?.bg || '#F3F4F6',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {execution.command.toUpperCase()}
          </span>
        </div>

        {/* Right: time + duration + arrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
            {new Date(execution.startedAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {execution.durationSeconds && (
            <span style={{ fontSize: '10px', color: '#D1D5DB' }}>
              {execution.durationSeconds}s
            </span>
          )}
          <span style={{ fontSize: '10px', color: '#D1D5DB' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '0 12px 12px' }}>
          {/* Terminal logs */}
          <div
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #1E293B',
            }}
          >
            {/* macOS dots */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                backgroundColor: '#1E293B',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28C840' }} />
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: '#64748B',
                  marginLeft: '4px',
                }}
              >
                terraform {execution.command}
              </span>
            </div>

            {/* Log output */}
            <div
              style={{
                backgroundColor: '#0F172A',
                padding: '10px 12px',
                maxHeight: '140px',
                overflowY: 'auto',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {execution.outputLogs}
              </pre>
            </div>
          </div>

          {/* Error message */}
          {execution.errorLogs && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                padding: '8px 10px',
                backgroundColor: '#FEF2F2',
                borderRadius: '6px',
                border: '1px solid #FECACA',
              }}
            >
              <span style={{ fontSize: '12px' }}>❌</span>
              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>
                {execution.errorLogs}
              </span>
            </div>
          )}

          {/* Plan summary */}
          {execution.planSummary && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '8px',
                padding: '8px 10px',
                backgroundColor: '#F9FAFB',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>
                Summary:
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>
                +{execution.planSummary.toAdd} add
              </span>
              <span style={{ fontSize: '11px', color: '#D1D5DB' }}>·</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#F59E0B' }}>
                ~{execution.planSummary.toChange} change
              </span>
              <span style={{ fontSize: '11px', color: '#D1D5DB' }}>·</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444' }}>
                -{execution.planSummary.toDestroy} destroy
              </span>
            </div>
          )}

          {/* Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px',
              fontSize: '10px',
              color: '#9CA3AF',
            }}
          >
            <span>
              Started: {new Date(execution.startedAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            {execution.durationSeconds && (
              <span>Duration: {execution.durationSeconds}s</span>
            )}
            <span>TF v{execution.terraformVersion}</span>
          </div>
        </div>
      )}
    </div>
  );
}