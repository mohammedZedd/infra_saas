import type { Project } from './projectData';

interface Props {
  project: Project;
}

export default function ProjectSettings({ project }: Props) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 14,
        border: '1px solid #E5E7EB',
        padding: '24px',
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>
        ⚙️ Project Settings
      </h3>

      {/* Name */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            display: 'block',
            marginBottom: 6,
          }}
        >
          Project Name
        </label>
        <input
          type="text"
          defaultValue={project.name}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '9px 12px',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            fontSize: 13,
            color: '#111827',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            display: 'block',
            marginBottom: 6,
          }}
        >
          Description
        </label>
        <textarea
          defaultValue={project.description}
          rows={3}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '9px 12px',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            fontSize: 13,
            color: '#111827',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Cloud provider */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            display: 'block',
            marginBottom: 6,
          }}
        >
          Cloud Provider
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['AWS', 'GCP', 'Azure'].map((cloud) => (
            <button
              key={cloud}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${cloud === project.cloud ? '#4F46E5' : '#E5E7EB'}`,
                backgroundColor: cloud === project.cloud ? '#EEF2FF' : 'white',
                color: cloud === project.cloud ? '#4F46E5' : '#6B7280',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cloud === 'AWS' ? '☁️' : cloud === 'GCP' ? '🌐' : '🔷'} {cloud}
            </button>
          ))}
        </div>
      </div>

      {/* Terraform version */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            display: 'block',
            marginBottom: 6,
          }}
        >
          Terraform Version
        </label>
        <select
          defaultValue="1.6.4"
          style={{
            padding: '9px 12px',
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            fontSize: 13,
            color: '#111827',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="1.6.4">v1.6.4 (latest)</option>
          <option value="1.5.7">v1.5.7</option>
          <option value="1.4.6">v1.4.6</option>
        </select>
      </div>

      {/* Save */}
      <button
        style={{
          padding: '8px 20px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#4F46E5',
          color: 'white',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 32,
        }}
      >
        Save Changes
      </button>

      {/* Danger zone */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px solid #FECACA',
          backgroundColor: '#FEF2F2',
        }}
      >
        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', margin: '0 0 8px' }}>
          🗑️ Danger Zone
        </h4>
        <p style={{ fontSize: 12, color: '#991B1B', margin: '0 0 12px' }}>
          Once you delete a project, there is no going back.
        </p>
        <button
          style={{
            padding: '7px 16px',
            borderRadius: 8,
            border: '1px solid #EF4444',
            backgroundColor: 'white',
            color: '#EF4444',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Delete Project
        </button>
      </div>
    </div>
  );
}