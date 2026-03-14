import type { ElementType } from 'react'

/** Template in the marketplace */
export interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: ElementType
  nodeCount: number
  downloads: number
  tags: string[]
}

/** Template category summary */
export interface TemplateCategory {
  name: string
  count: number
}
