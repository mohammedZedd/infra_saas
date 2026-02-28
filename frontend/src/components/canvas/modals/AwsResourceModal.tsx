import React, { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../../utils/cn'
import './awsFormStyles.css'

export interface AwsResourceSection {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
}

export interface AwsResourceModalProps {
  title: string
  subtitle?: string
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  sections: AwsResourceSection[]
  children: React.ReactNode
  isSaving?: boolean
}

export interface AwsResourceSectionProps {
  section: AwsResourceSection
  isActive: boolean
  onClick: () => void
}

/**
 * Réutilisable base modal inspired by AWS Console.
 * Provides a 2-column layout with sidebar navigation and main content area.
 *
 * Usage:
 * <AwsResourceModal
 *   title="EC2 Configuration"
 *   sections={[
 *     { id: 'details', label: 'Instance Details' },
 *     { id: 'storage', label: 'Storage' },
 *   ]}
 *   onSave={handleSave}
 * >
 *   <TabContent section={activeSection} />
 * </AwsResourceModal>
 */
export function AwsResourceModal({
  title,
  subtitle,
  isOpen,
  onClose,
  onSave,
  sections,
  children,
  isSaving = false,
}: AwsResourceModalProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '')

  const renderedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child
    const type = (child.type as any)
    const name = type?.displayName || type?.name
    if (name === 'AwsResourceSection' || type === AwsResourceSection) {
      return React.cloneElement(child as React.ReactElement<any>, { activeSection })
    }
    return child
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="h-[90vh] w-full max-w-4xl rounded-lg shadow-xl flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0" style={{ borderColor: '#D1D5DB', backgroundColor: '#F2F3F3' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>{title}</h2>
            {subtitle && <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-56 border-r overflow-y-auto flex-shrink-0" style={{ borderColor: '#D1D5DB', backgroundColor: '#E5E7EB' }}>
            <nav className="p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors mb-1 border-l-4"
                  style={
                    activeSection === section.id
                      ? { backgroundColor: '#E0E7FF', color: '#1F2937', borderColor: '#FF9900' }
                      : { backgroundColor: 'transparent', color: '#1F2937', borderColor: 'transparent' }
                  }
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = '#D1D5DB'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span style={{ fontWeight: activeSection === section.id ? '600' : '500' }}>{section.label}</span>
                  </div>
                  {section.description && (
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{section.description}</p>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#F2F3F3' }}>
            <div className="space-y-6">
              {renderedChildren}
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="flex items-center justify-between border-t px-6 py-4 flex-shrink-0" style={{ borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: '#E5E7EB', color: '#1F2937' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave()}
            disabled={isSaving}
            className="px-6 py-2 rounded text-sm font-semibold text-white transition-colors"
            style={{ 
              backgroundColor: isSaving ? '#E68A00' : '#FF9900',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#E68A00'
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#FF9900'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Section content renderer - wrap each tab's content in this
 */
export function AwsResourceSection({
  sectionId,
  activeSection,
  children,
}: {
  sectionId: string
  activeSection?: string
  children: React.ReactNode
}) {
  const active = activeSection || sectionId
  return (
    <div className={cn('space-y-4', sectionId === active ? '' : 'hidden')}>
      {children}
    </div>
  )
}

/**
 * Form group wrapper with label and helper text
 */
export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: '#1F2937' }}>
        {label}
        {required && <span className="ml-1" style={{ color: '#DC2626' }}>*</span>}
      </label>
      <div className="space-y-1">
        {children}
      </div>
      {error && <p className="text-xs" style={{ color: '#DC2626' }}>⚠ {error}</p>}
      {hint && <p className="text-xs" style={{ color: '#6B7280' }}>{hint}</p>}
    </div>
  )
}

export default AwsResourceModal
