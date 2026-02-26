// src/components/editor/EditorTabs.tsx
import { useState } from 'react';
import PropertiesPanel from './PropertiesPanel';
import SimulationPanel from './SimulationPanel';
import SettingsPanel from './SettingsPanel';

type TabId = 'properties' | 'simulate' | 'settings';

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'properties', label: 'Properties', emoji: '⚙️' },
  { id: 'simulate',   label: 'Simulate',   emoji: '🧪' },
  { id: 'settings',   label: 'Settings',   emoji: '⚡' },
];

export default function EditorTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('properties');

  const renderPanel = () => {
    switch (activeTab) {
      case 'properties':
        return <PropertiesPanel />;
      case 'simulate':
        return <SimulationPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#FAFBFC',
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#4F46E5' : '#6B7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid #4F46E5'
                  : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderPanel()}
      </div>
    </div>
  );
}