import { colorizeOutput, colorizeError, renderLineNumbers } from './projectData';

interface RunTerminalProps {
  command: string;
  status: string;
  duration: string;
  output: string;
  errorOutput: string | null;
}

export default function RunTerminal({ command, status, duration, output, errorOutput }: RunTerminalProps) {
  return (
    <div style={{ margin: '0 20px 16px' }}>
      {/* Header macOS */}
      <div
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '10px 10px 0 0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981' }} />
        </div>
        <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
          terraform {command} — {status}
        </span>
        <span style={{ fontSize: 10, color: '#475569' }}>{duration}</span>
      </div>

      {/* Body */}
      <div
        style={{
          backgroundColor: '#0F172A',
          borderRadius: '0 0 10px 10px',
          padding: '16px 0',
          maxHeight: 400,
          overflowY: 'auto',
          display: 'flex',
        }}
      >
        {/* Line numbers */}
        <pre
          style={{
            margin: 0,
            padding: '0 12px 0 16px',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 12,
            lineHeight: 1.6,
            color: '#475569',
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid #1E293B',
            minWidth: 35,
          }}
        >
          {renderLineNumbers(output)}
        </pre>

        {/* Output */}
        <pre
          style={{
            margin: 0,
            padding: '0 16px',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 12,
            lineHeight: 1.6,
            color: '#E2E8F0',
            flex: 1,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: colorizeOutput(output) }}
        />
      </div>

      {/* Error output */}
      {errorOutput && (
        <div
          style={{
            marginTop: 8,
            backgroundColor: '#1A0F0F',
            borderRadius: 10,
            border: '1px solid #7F1D1D',
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>❌</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FCA5A5' }}>Error Output</span>
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: 12,
              lineHeight: 1.6,
              color: '#FCA5A5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: colorizeError(errorOutput) }}
          />
        </div>
      )}
    </div>
  );
}