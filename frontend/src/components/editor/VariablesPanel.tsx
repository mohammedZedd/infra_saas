import { useState, type CSSProperties } from 'react';
import { useTerraformStore } from '../../stores/useTerraformStore';
import type { ProjectVariable } from '../../types/terraform';

const TYPES = [
  { value: 'string', label: 'String', color: '#4F6EF7', bg: '#EEF2FF' },
  { value: 'number', label: 'Number', color: '#10B981', bg: '#ECFDF5' },
  { value: 'bool', label: 'Bool', color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'list', label: 'List', color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 'map', label: 'Map', color: '#F43F5E', bg: '#FFF1F2' },
];

export default function VariablesPanel() {
  const { variables, addVariable, updateVariable, deleteVariable } = useTerraformStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    key: '', value: '', description: '', type: 'string', isTerraformVar: true,
  });

  const handleAdd = () => {
    if (!form.key.trim()) return;
    addVariable({
      id: crypto.randomUUID(),
      key: form.key.trim(),
      value: form.value,
      description: form.description || undefined,
      type: form.type as any,
      isTerraformVar: form.isTerraformVar,
      isSecret: false,
    });
    setForm({ key: '', value: '', description: '', type: 'string', isTerraformVar: true });
    setIsAdding(false);
  };

  const getType = (t: string) => TYPES.find((x) => x.value === t) || TYPES[0];

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>
            Variables
          </h3>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
            {variables.length} variable{variables.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'white',
            backgroundColor: '#4F6EF7',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D5BD9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4F6EF7')}
        >
          + Add
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
        {/* Add form */}
        {isAdding && (
          <div
            style={{
              border: '1px solid #4F6EF7',
              borderRadius: '10px',
              backgroundColor: '#FAFBFF',
              marginBottom: '10px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px' }}>{ }</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#4F6EF7' }}>New variable</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="instance_type"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                  autoFocus
                  onFocus={(e) => (e.target.style.borderColor = '#4F6EF7')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                  Default value
                </label>
                <input
                  type="text"
                  placeholder="t3.micro"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                  onFocus={(e) => (e.target.style.borderColor = '#4F6EF7')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>

              {/* Type selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' }}>
                  Type
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, type: t.value })}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: form.type === t.value ? t.color : '#9CA3AF',
                        backgroundColor: form.type === t.value ? t.bg : '#F3F4F6',
                        border: form.type === t.value ? `1px solid ${t.color}30` : '1px solid transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TF Var toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Terraform variable</span>
                <button
                  onClick={() => setForm({ ...form, isTerraformVar: !form.isTerraformVar })}
                  style={{
                    position: 'relative',
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: form.isTerraformVar ? '#4F6EF7' : '#D1D5DB',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: form.isTerraformVar ? '18px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      transition: 'left 0.2s',
                    }}
                  />
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                  Description <span style={{ fontWeight: 400, color: '#D1D5DB' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#4F6EF7')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            </div>

            {/* Actions bar */}
            <div style={{ display: 'flex', borderTop: '1px solid #E5E7EB' }}>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setForm({ key: '', value: '', description: '', type: 'string', isTerraformVar: true });
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6B7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>
              <div style={{ width: '1px', backgroundColor: '#E5E7EB' }} />
              <button
                onClick={handleAdd}
                disabled={!form.key.trim()}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: !form.key.trim() ? '#D1D5DB' : '#4F6EF7',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: !form.key.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (form.key.trim()) e.currentTarget.style.backgroundColor = '#EEF2FF';
                }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {variables.length === 0 && !isAdding && (
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
              { }
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', margin: '0 0 4px' }}>
              No variables
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 16px' }}>
              Add variables to configure<br />your infrastructure
            </p>
            <button
              onClick={() => setIsAdding(true)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#4F6EF7',
                backgroundColor: '#EEF2FF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              + Add variable
            </button>
          </div>
        )}

        {/* Variable cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {variables.map((v) => (
            <VariableCard
              key={v.id}
              variable={v}
              isEditing={editingId === v.id}
              onEdit={() => setEditingId(v.id)}
              onSave={(updates) => { updateVariable(v.id, updates); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
              onDelete={() => deleteVariable(v.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer info */}
      {variables.length > 0 && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #F3F4F6' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 10px',
              backgroundColor: '#EEF2FF',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '12px' }}>💡</span>
            <span style={{ fontSize: '11px', color: '#4F6EF7' }}>
              Use <code style={{ fontFamily: 'monospace', backgroundColor: 'white', padding: '1px 4px', borderRadius: '3px', fontSize: '10px' }}>var.name</code> in Terraform
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Variable Card ============ */

function VariableCard({
  variable, isEditing, onEdit, onSave, onCancel, onDelete,
}: {
  variable: ProjectVariable;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (u: Partial<ProjectVariable>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [val, setVal] = useState(variable.value);
  const [hovered, setHovered] = useState(false);
  const typeInfo = TYPES.find((t) => t.value === variable.type) || TYPES[0];

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (isEditing) {
    return (
      <div
        style={{
          border: '2px solid #4F6EF7',
          borderRadius: '10px',
          padding: '12px',
          backgroundColor: 'white',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
          {variable.key}
        </p>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={inputStyle}
          autoFocus
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: 500,
              color: '#6B7280', backgroundColor: '#F3F4F6', border: 'none',
              borderRadius: '6px', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ value: val })}
            style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: 500,
              color: 'white', backgroundColor: '#4F6EF7', border: 'none',
              borderRadius: '6px', cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${hovered ? '#D1D5DB' : '#E5E7EB'}`,
        backgroundColor: hovered ? '#FAFBFC' : 'white',
        transition: 'all 0.15s',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Key + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              {variable.key}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: typeInfo.color,
                backgroundColor: typeInfo.bg,
                padding: '1px 6px',
                borderRadius: '4px',
              }}
            >
              {variable.type}
            </span>
            {variable.isTerraformVar && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#8B5CF6',
                  backgroundColor: '#F5F3FF',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                TF
              </span>
            )}
          </div>

          {/* Value */}
          <div style={{ marginTop: '6px' }}>
            <code
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {variable.value || '—'}
            </code>
          </div>

          {variable.description && (
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0' }}>
              {variable.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s',
            marginLeft: '8px',
          }}
        >
          <ActionButton label="✏️" onClick={onEdit} />
          <ActionButton label="🗑️" onClick={onDelete} danger />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        backgroundColor: hovered ? (danger ? '#FEF2F2' : '#F3F4F6') : 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
    >
      {label}
    </button>
  );
}