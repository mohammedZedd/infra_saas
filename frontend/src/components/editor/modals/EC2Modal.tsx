import { useState, useEffect } from 'react';
import { X, Server, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { DEFAULT_EC2_CONFIG } from '../../../types/ec2';
import type { EC2Config, EBSVolume } from '../../../types/ec2';
import EC2ModalSidebar from './ec2/EC2ModalSidebar';
import StepNameTags from './ec2/StepNameTags';
import StepAMI from './ec2/StepAMI';
import StepInstanceType from './ec2/StepInstanceType';
import StepKeyPair from './ec2/StepKeyPair';
import StepNetwork from './ec2/StepNetwork';
import StepStorage from './ec2/StepStorage';
import StepAdvanced from './ec2/StepAdvanced';
import StepSummary from './ec2/StepSummary';

interface EC2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EC2Config) => void;
  initialConfig?: Partial<EC2Config>;
  nodeId?: string;
}

const TOTAL_STEPS = 7;
const STEP_NAMES = ['', 'Name & Tags', 'AMI', 'Instance Type', 'Key Pair', 'Network', 'Storage', 'Advanced'];

export default function EC2Modal({ isOpen, onClose, onSave, initialConfig }: EC2ModalProps) {
  const [step, setStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [config, setConfig] = useState<EC2Config>({ ...DEFAULT_EC2_CONFIG });

  useEffect(() => {
    if (isOpen) {
      setConfig({ ...DEFAULT_EC2_CONFIG, ...initialConfig });
      setStep(1);
      setShowSummary(false);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const updateConfig = (u: Partial<EC2Config>) => setConfig(p => ({ ...p, ...u }));
  const updateNetwork = (u: Partial<EC2Config['network']>) => setConfig(p => ({ ...p, network: { ...p.network, ...u } }));
  const updateAdvanced = (u: Partial<EC2Config['advanced']>) => setConfig(p => ({ ...p, advanced: { ...p.advanced, ...u } }));
  const updateRootVolume = (u: Partial<EBSVolume>) => setConfig(p => ({ ...p, rootVolume: { ...p.rootVolume, ...u } }));
  const goToStep = (s: number) => { setShowSummary(false); setStep(s); };

  const renderStep = () => {
    if (showSummary) return <StepSummary config={config} />;
    switch (step) {
      case 1: return <StepNameTags config={config} updateConfig={updateConfig} />;
      case 2: return <StepAMI config={config} updateConfig={updateConfig} />;
      case 3: return <StepInstanceType config={config} updateConfig={updateConfig} />;
      case 4: return <StepKeyPair config={config} updateConfig={updateConfig} />;
      case 5: return <StepNetwork config={config} updateNetwork={updateNetwork} />;
      case 6: return <StepStorage config={config} updateConfig={updateConfig} updateRootVolume={updateRootVolume} />;
      case 7: return <StepAdvanced config={config} updateAdvanced={updateAdvanced} />;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative',
        width: '95vw',
        maxWidth: 1200,
        height: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Server style={{ width: 20, height: 20, color: '#ea580c' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {showSummary ? 'Review & Save' : 'Configure EC2 Instance'}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                {showSummary ? 'Verify your configuration' : `Step ${step} of ${TOTAL_STEPS} — ${STEP_NAMES[step]}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid #e5e7eb', backgroundColor: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#9ca3af',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <EC2ModalSidebar
            currentStep={step}
            showSummary={showSummary}
            config={config}
            onStepClick={goToStep}
            onSummaryClick={() => setShowSummary(true)}
          />
          <div style={{ flex: 1, overflowY: 'auto', padding: 32, backgroundColor: '#ffffff' }}>
            {renderStep()}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}>
          <div>
            {!showSummary && step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 8,
                border: '1px solid #d1d5db', backgroundColor: '#fff',
                color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>
                <ChevronLeft style={{ width: 16, height: 16 }} /> Previous
              </button>
            )}
            {showSummary && (
              <button onClick={() => { setShowSummary(false); setStep(TOTAL_STEPS); }} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 8,
                border: '1px solid #d1d5db', backgroundColor: '#fff',
                color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>
                <ChevronLeft style={{ width: 16, height: 16 }} /> Back to editing
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onClose} style={{
              padding: '10px 16px', borderRadius: 8,
              border: '1px solid #d1d5db', backgroundColor: '#fff',
              color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              Cancel
            </button>

            {showSummary ? (
              <button onClick={() => { onSave(config); onClose(); }} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8, border: 'none',
                backgroundColor: '#ea580c', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                <Check style={{ width: 16, height: 16 }} /> Save Configuration
              </button>
            ) : step < TOTAL_STEPS ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8, border: 'none',
                backgroundColor: '#ea580c', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Next <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <button onClick={() => setShowSummary(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8, border: 'none',
                backgroundColor: '#16a34a', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Review & Save <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}