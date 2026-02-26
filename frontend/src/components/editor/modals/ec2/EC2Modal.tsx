// src/components/editor/modals/ec2/EC2Modal.tsx

import React, { useState, useCallback, useRef } from 'react';
import type { EC2FullConfig } from './types/ec2-config';
import { defaultEC2Config, EC2_STEPS } from './types/ec2-config';
import EC2ModalSidebar from './EC2ModalSidebar';
import EC2SummaryPanel from './EC2SummaryPanel';
import Step1NameTags from './steps/Step1NameTags';
import Step2AMI from './steps/Step2AMI';
import Step3InstanceType from './steps/Step3InstanceType';
import Step4KeyPair from './steps/Step4KeyPair';
import Step5Network from './steps/Step5Network';
import Step6Storage from './steps/Step6Storage';
import Step7Advanced from './steps/Step7Advanced';
import StepSummary from './steps/StepSummary';

interface EC2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EC2FullConfig) => void;
  initialConfig?: Partial<EC2FullConfig>;
  nodeName?: string;
}

const SECTION_IDS = [
  'name-tags',
  'ami',
  'instance-type',
  'key-pair',
  'network',
  'storage',
  'advanced',
  'summary',
];

const EC2Modal: React.FC<EC2ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  nodeName,
}) => {
  const [config, setConfig] = useState<EC2FullConfig>(() => ({
    ...defaultEC2Config,
    name: nodeName || '',
    ...initialConfig,
  }));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(SECTION_IDS)
  );
  const [activeSection, setActiveSection] = useState('name-tags');
  const [isClosing, setIsClosing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleChange = useCallback((updates: Partial<EC2FullConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (!expandedSections.has(id)) {
      setExpandedSections((prev) => new Set(prev).add(id));
    }
    setTimeout(() => {
      sectionRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  // Track active section on scroll
  const handleContentScroll = () => {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop + 120;
    for (const id of SECTION_IDS) {
      const el = sectionRefs.current[id];
      if (el && el.offsetTop <= scrollTop) {
        setActiveSection(id);
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleSave = () => {
    onSave(config);
    handleClose();
  };

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (!config.name.trim()) errors.push('Name is required');
    if (!config.ami) errors.push('AMI is required');
    if (!config.instanceType) errors.push('Instance type is required');
    return errors;
  };

  const canSave = getValidationErrors().length === 0;

  if (!isOpen) return null;

  const sectionCard = (
    id: string,
    title: string,
    infoLink: boolean,
    children: React.ReactNode
  ) => {
    const isExpanded = expandedSections.has(id);
    return (
      <div
        ref={(el) => { sectionRefs.current[id] = el; }}
        key={id}
        style={{
          background: '#fff',
          border: '1px solid #d5dbdb',
          borderRadius: 8,
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        {/* Section header — clickable to collapse */}
        <div
          onClick={() => toggleSection(id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 20px',
            cursor: 'pointer',
            userSelect: 'none',
            borderBottom: isExpanded ? '1px solid #eaeded' : 'none',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: '#545b64',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.15s ease',
              display: 'inline-block',
            }}
          >
            ▼
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#16191f' }}>
            {title}
          </span>
          {infoLink && (
            <span
              style={{
                fontSize: 13,
                color: '#0073bb',
                fontWeight: 400,
                cursor: 'pointer',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Info
            </span>
          )}
        </div>

        {/* Section body */}
        {isExpanded && (
          <div style={{ padding: '0 20px 20px' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          width: '96vw',
          maxWidth: 1400,
          height: '94vh',
          background: '#f2f3f3',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          transform: isClosing ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════ TOP HEADER BAR (AWS dark) ═══════════ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            background: '#232f3e',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#ff9900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              🖥️
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
                Launch an instance
              </div>
              <div style={{ fontSize: 12, color: '#aab7b8' }}>
                aws_instance · EC2 Instance
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Step dots */}
            <div style={{ display: 'flex', gap: 5 }}>
              {SECTION_IDS.map((id) => (
                <div
                  key={id}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background:
                      id === activeSection
                        ? '#ff9900'
                        : id === 'summary'
                          ? 'rgba(255,255,255,0.25)'
                          : getSectionComplete(id, config)
                            ? '#1d8102'
                            : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => scrollToSection(id)}
                />
              ))}
            </div>

            <button
              onClick={handleClose}
              style={{
                width: 32,
                height: 32,
                border: 'none',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ═══════════ BODY: Sidebar | Content | Summary ═══════════ */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ─── Left Sidebar Navigation ─── */}
          <EC2ModalSidebar
            activeSection={activeSection}
            onSectionClick={scrollToSection}
            config={config}
          />

          {/* ─── Center: Scrollable Sections ─── */}
          <div
            ref={contentRef}
            onScroll={handleContentScroll}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '24px 28px',
            }}
          >
            {/* Page title */}
            <div style={{ marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#16191f', margin: 0 }}>
                Launch an instance{' '}
                <span
                  style={{ fontSize: 13, color: '#0073bb', fontWeight: 400, cursor: 'pointer' }}
                >
                  Info
                </span>
              </h1>
              <p style={{ fontSize: 14, color: '#545b64', margin: '4px 0 20px' }}>
                Amazon EC2 allows you to create virtual machines, or instances, that run on the
                AWS Cloud. Quickly get started by following the simple steps below.
              </p>
            </div>

            {/* ── Section 1: Name and Tags ── */}
            {sectionCard('name-tags', 'Name and tags', true, (
              <Step1NameTags config={config} onChange={handleChange} />
            ))}

            {/* ── Section 2: AMI ── */}
            {sectionCard('ami', 'Application and OS Images (Amazon Machine Image)', true, (
              <Step2AMI config={config} onChange={handleChange} />
            ))}

            {/* ── Section 3: Instance Type ── */}
            {sectionCard('instance-type', 'Instance type', true, (
              <Step3InstanceType config={config} onChange={handleChange} />
            ))}

            {/* ── Section 4: Key Pair ── */}
            {sectionCard('key-pair', 'Key pair (login)', true, (
              <Step4KeyPair config={config} onChange={handleChange} />
            ))}

            {/* ── Section 5: Network ── */}
            {sectionCard('network', 'Network settings', true, (
              <Step5Network config={config} onChange={handleChange} />
            ))}

            {/* ── Section 6: Storage ── */}
            {sectionCard('storage', 'Configure storage', true, (
              <Step6Storage config={config} onChange={handleChange} />
            ))}

            {/* ── Section 7: Advanced ── */}
            {sectionCard('advanced', 'Advanced details', true, (
              <Step7Advanced config={config} onChange={handleChange} />
            ))}

            {/* ── Section 8: Summary / Review ── */}
            {showPreview && sectionCard('summary', 'Summary & Terraform Preview', false, (
              <StepSummary config={config} />
            ))}

            {/* Bottom spacer */}
            <div style={{ height: 40 }} />
          </div>

          {/* ─── Right: Summary Panel ─── */}
          <EC2SummaryPanel
            config={config}
            onChange={handleChange}
            onSectionClick={scrollToSection}
          />
        </div>

        {/* ═══════════ BOTTOM FOOTER ═══════════ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderTop: '1px solid #d5dbdb',
            background: '#fff',
            flexShrink: 0,
          }}
        >
          {/* Left: Validation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {getValidationErrors().length > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: '#d13212',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>⚠</span>
                {getValidationErrors().join(' · ')}
              </div>
            )}
          </div>

          {/* Right: Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 20px',
                background: '#fff',
                color: '#545b64',
                border: '1px solid #aab7b8',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 400,
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                padding: '8px 24px',
                background: canSave ? '#ec7211' : '#d5dbdb',
                color: canSave ? '#fff' : '#aab7b8',
                border: canSave ? '1px solid #eb5f07' : '1px solid #d5dbdb',
                borderRadius: 4,
                cursor: canSave ? 'pointer' : 'not-allowed',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Launch instance
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '8px 16px',
                background: '#fff',
                color: '#0073bb',
                border: '1px dashed #0073bb',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              📋 Preview code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helper: Check section completion ──
function getSectionComplete(id: string, config: EC2FullConfig): boolean {
  switch (id) {
    case 'name-tags': return !!config.name;
    case 'ami': return !!config.ami;
    case 'instance-type': return !!config.instanceType;
    case 'key-pair': return true; // optional
    case 'network': return true;  // has defaults
    case 'storage': return true;  // has defaults
    case 'advanced': return true; // optional
    default: return false;
  }
}

export default EC2Modal;