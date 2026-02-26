import { create } from "zustand"
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react"
import { type AwsComponentType, type AwsNodeData, AWS_COMPONENTS } from "../types/aws"
import { type CloudProvider } from "../types/cloud"
import { validateConnection } from "../types/connections"
import {
  type Workspace,
  type TerraformVariable,
  type TerraformOutput,
  type TerraformBackend,
  type TerraformProvider,
  type ProjectSettings,
  DEFAULT_PROJECT_SETTINGS,
} from "../types/workspace"

type AwsNode = Node<AwsNodeData>

interface EditorState {
  // Cloud
  cloudProvider: CloudProvider | null
  
  // Canvas
  nodes: AwsNode[]
  edges: Edge[]
  selectedNodeId: string | null
  connectionError: string | null

  // Project settings
  settings: ProjectSettings

  // Actions - Cloud
  setCloudProvider: (provider: CloudProvider) => void
  
  // Actions - Canvas
  onNodesChange: OnNodesChange<AwsNode>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  addNode: (type: AwsComponentType, position: { x: number; y: number }) => void
  selectNode: (nodeId: string | null) => void
  updateNodeProperty: (nodeId: string, key: string, value: string) => void
  deleteNode: (nodeId: string) => void
  clearConnectionError: () => void

  // Actions - Workspaces
  addWorkspace: (name: string, description?: string) => void
  deleteWorkspace: (workspaceId: string) => void
  switchWorkspace: (workspaceId: string) => void
  updateWorkspaceVariable: (workspaceId: string, varName: string, value: string) => void
  renameWorkspace: (workspaceId: string, newName: string) => void

  // Actions - Variables
  addVariable: (variable: TerraformVariable) => void
  updateVariable: (name: string, variable: Partial<TerraformVariable>) => void
  deleteVariable: (name: string) => void

  // Actions - Outputs
  addOutput: (output: TerraformOutput) => void
  updateOutput: (name: string, output: Partial<TerraformOutput>) => void
  deleteOutput: (name: string) => void

  // Actions - Settings
  updateBackend: (backend: TerraformBackend) => void
  addProvider: (provider: TerraformProvider) => void
  updateProvider: (index: number, provider: Partial<TerraformProvider>) => void
  deleteProvider: (index: number) => void
  setTerraformVersion: (version: string) => void
}

const useEditorStore = create<EditorState>((set, get) => ({
  cloudProvider: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  connectionError: null,
  settings: DEFAULT_PROJECT_SETTINGS,

  // ==================== CLOUD ====================
  setCloudProvider: (provider) => {
    set({ cloudProvider: provider })
  },

  // ==================== CANVAS ====================
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as AwsNode[] })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection) => {
    const { nodes } = get()
    const sourceNode = nodes.find((n) => n.id === connection.source)
    const targetNode = nodes.find((n) => n.id === connection.target)

    if (!sourceNode || !targetNode) return

    const sourceType = sourceNode.data.type
    const targetType = targetNode.data.type

    const validation = validateConnection(sourceType, targetType)

    if (!validation.valid) {
      set({ connectionError: validation.message })
      return
    }

    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: "#94A3B8", strokeWidth: 2 },
        },
        get().edges
      ),
      connectionError: null,
    })
  },

  addNode: (type, position) => {
    const config = AWS_COMPONENTS.find((c) => c.type === type)
    if (!config) return

    const id = `${type}_${Date.now()}`

    let nodeType = "awsNode"
    if (type === "vpc") nodeType = "vpcNode"
    if (type === "subnet") nodeType = "subnetNode"

    const isContainer = type === "vpc" || type === "subnet"

    const getDefaultStyle = () => {
      if (type === "vpc") return { width: 800, height: 500 }
      if (type === "subnet") return { width: 400, height: 300 }
      return { width: 110, height: 100 }
    }

    const newNode: AwsNode = {
      id,
      type: nodeType,
      position,
      zIndex: isContainer ? 0 : 10,
      data: {
        type: config.type,
        label: config.label,
        icon: config.icon,
        color: config.color,
        category: config.category,
        properties: { ...config.defaultProperties },
      },
      style: getDefaultStyle(),
    }

    set({ nodes: [...get().nodes, newNode] })
  },
  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId })
  },

  updateNodeProperty: (nodeId, key, value) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                properties: { ...node.data.properties, [key]: value },
              },
            }
          : node
      ),
    })
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    })
  },

  clearConnectionError: () => {
    set({ connectionError: null })
  },

  // ==================== WORKSPACES ====================
  addWorkspace: (name, description) => {
    const newWorkspace: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      description,
      isDefault: false,
      variables: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set({
      settings: {
        ...get().settings,
        workspaces: [...get().settings.workspaces, newWorkspace],
      },
    })
  },

  deleteWorkspace: (workspaceId) => {
    const { settings } = get()
    const workspace = settings.workspaces.find((w) => w.id === workspaceId)
    
    if (workspace?.isDefault) return // Can't delete default

    const newWorkspaces = settings.workspaces.filter((w) => w.id !== workspaceId)
    const newActiveId = settings.activeWorkspaceId === workspaceId 
      ? "default" 
      : settings.activeWorkspaceId

    set({
      settings: {
        ...settings,
        workspaces: newWorkspaces,
        activeWorkspaceId: newActiveId,
      },
    })
  },

  switchWorkspace: (workspaceId) => {
    set({
      settings: {
        ...get().settings,
        activeWorkspaceId: workspaceId,
      },
    })
  },

  updateWorkspaceVariable: (workspaceId, varName, value) => {
    set({
      settings: {
        ...get().settings,
        workspaces: get().settings.workspaces.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                variables: { ...w.variables, [varName]: value },
                updatedAt: new Date().toISOString(),
              }
            : w
        ),
      },
    })
  },

  renameWorkspace: (workspaceId, newName) => {
    set({
      settings: {
        ...get().settings,
        workspaces: get().settings.workspaces.map((w) =>
          w.id === workspaceId
            ? { ...w, name: newName, updatedAt: new Date().toISOString() }
            : w
        ),
      },
    })
  },

  // ==================== VARIABLES ====================
  addVariable: (variable) => {
    set({
      settings: {
        ...get().settings,
        variables: [...get().settings.variables, variable],
      },
    })
  },

  updateVariable: (name, updates) => {
    set({
      settings: {
        ...get().settings,
        variables: get().settings.variables.map((v) =>
          v.name === name ? { ...v, ...updates } : v
        ),
      },
    })
  },

  deleteVariable: (name) => {
    set({
      settings: {
        ...get().settings,
        variables: get().settings.variables.filter((v) => v.name !== name),
      },
    })
  },

  // ==================== OUTPUTS ====================
  addOutput: (output) => {
    set({
      settings: {
        ...get().settings,
        outputs: [...get().settings.outputs, output],
      },
    })
  },

  updateOutput: (name, updates) => {
    set({
      settings: {
        ...get().settings,
        outputs: get().settings.outputs.map((o) =>
          o.name === name ? { ...o, ...updates } : o
        ),
      },
    })
  },

  deleteOutput: (name) => {
    set({
      settings: {
        ...get().settings,
        outputs: get().settings.outputs.filter((o) => o.name !== name),
      },
    })
  },

  // ==================== SETTINGS ====================
  updateBackend: (backend) => {
    set({
      settings: {
        ...get().settings,
        backend,
      },
    })
  },

  addProvider: (provider) => {
    set({
      settings: {
        ...get().settings,
        providers: [...get().settings.providers, provider],
      },
    })
  },

  updateProvider: (index, updates) => {
    set({
      settings: {
        ...get().settings,
        providers: get().settings.providers.map((p, i) =>
          i === index ? { ...p, ...updates } : p
        ),
      },
    })
  },

  deleteProvider: (index) => {
    set({
      settings: {
        ...get().settings,
        providers: get().settings.providers.filter((_, i) => i !== index),
      },
    })
  },

  setTerraformVersion: (version) => {
    set({
      settings: {
        ...get().settings,
        terraformVersion: version,
      },
    })
  },
}))

export default useEditorStore