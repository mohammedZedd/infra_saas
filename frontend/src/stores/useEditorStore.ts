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
import toast from "react-hot-toast"
import { type AwsComponentType, type AwsNodeData, AWS_COMPONENTS } from "../types/aws"
import { type CloudProvider } from "../types/cloud"
import { validateConnection } from "../types/connections"
import { synchronizeNodeSelection } from "../utils/node-synchronization"
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

interface HistorySnapshot {
  nodes: AwsNode[]
  edges: Edge[]
}

interface EditorState {
  // Cloud
  cloudProvider: CloudProvider | null

  // Canvas
  nodes: AwsNode[]
  edges: Edge[]
  selectedNodeId: string | null
  selectedEdgeId: string | null
  connectionError: string | null

  // Hierarchy tracking
  hierarchyMode: "container-first" | "normal" // default: "container-first"

  // History (undo/redo)
  history: HistorySnapshot[]
  historyIndex: number

  // Dirty flag
  isDirty: boolean

  // Project settings
  settings: ProjectSettings

  // Actions - Cloud
  setCloudProvider: (provider: CloudProvider) => void

  // Actions - Canvas
  onNodesChange: OnNodesChange<AwsNode>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  addNode: (type: AwsComponentType, position: { x: number; y: number }, parentId?: string) => void
  selectNode: (nodeId: string | null) => void
  selectNodeWithHierarchy: (nodeId: string, respectHierarchy?: boolean) => void
  selectEdge: (edgeId: string | null) => void
  updateNodeProperty: (nodeId: string, key: string, value: string) => void
  updateNodeProperties: (nodeId: string, newProps: Record<string, unknown>) => void
  updateNodeData: (nodeId: string, dataUpdate: Partial<AwsNodeData>) => void
  deleteNode: (nodeId: string) => void
  deleteEdge: (edgeId: string) => void
  clearConnectionError: () => void
  
  // Hierarchy operations
  setNodeParent: (nodeId: string, parentId: string | null) => void
  getParentNode: (nodeId: string) => AwsNode | undefined
  getChildNodes: (parentId: string) => AwsNode[]
  toggleNodeLock: (nodeId: string) => void

  // Actions - History
  undo: () => void
  redo: () => void
  markSaved: () => void
  setNodes: (nodes: AwsNode[]) => void

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

/** Push a snapshot to the history stack (drops any redo future). */
function pushHistory(
  history: HistorySnapshot[],
  historyIndex: number,
  nodes: AwsNode[],
  edges: Edge[]
): { history: HistorySnapshot[]; historyIndex: number } {
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push({ nodes, edges })
  const MAX = 50
  const trimmed = newHistory.length > MAX ? newHistory.slice(newHistory.length - MAX) : newHistory
  return { history: trimmed, historyIndex: trimmed.length - 1 }
}

const useEditorStore = create<EditorState>((set, get) => ({
  cloudProvider: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  connectionError: null,
  hierarchyMode: "container-first",
  history: [{ nodes: [], edges: [] }],
  historyIndex: 0,
  isDirty: false,
  settings: DEFAULT_PROJECT_SETTINGS,

  // ==================== CLOUD ====================
  setCloudProvider: (provider) => {
    console.log("[useEditorStore] setCloudProvider ->", provider)
    // sanity check against known providers
    const valid = ["aws", "gcp", "azure"].includes(provider)
    if (!valid) {
      console.error("Attempted to set invalid cloud provider:", provider)
      return
    }

    // when switching providers we need to clear any existing canvas state
    set({
      cloudProvider: provider,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      connectionError: null,
      history: [{ nodes: [], edges: [] }],
      historyIndex: 0,
      isDirty: false,
    })
  },

  // ==================== CANVAS ====================
  onNodesChange: (changes) => {
    const { selectedNodeId } = get()
    const updatedNodes = applyNodeChanges(changes, get().nodes) as AwsNode[]
    // Preserve selection state during node changes
    const syncedNodes = synchronizeNodeSelection(updatedNodes, selectedNodeId)
    set({ nodes: syncedNodes })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection) => {
    const { nodes, edges, history, historyIndex } = get()
    const sourceNode = nodes.find((n) => n.id === connection.source)
    const targetNode = nodes.find((n) => n.id === connection.target)

    if (!sourceNode || !targetNode) return

    const validation = validateConnection(sourceNode.data.type, targetNode.data.type)
    if (!validation.valid) {
      set({ connectionError: validation.message })
      toast.error(validation.message || "Invalid connection between these two services", {
        icon: "❌",
        duration: 3000,
      })
      return
    }

    const newEdges = addEdge(
      { ...connection, animated: true, style: { stroke: "#94A3B8", strokeWidth: 2 } },
      edges
    )
    const snap = pushHistory(history, historyIndex, nodes, edges)
    set({ edges: newEdges, connectionError: null, isDirty: true, ...snap })
  },

  addNode: (type, position, parentId) => {
    try {
      const config = AWS_COMPONENTS.find((c) => c.type === type)
      if (!config) {
        console.error(`Configuration not found for node type: ${type}`)
        return
      }

      const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      let nodeType = "awsNode"
      if (type === "vpc") nodeType = "vpcNode"
      if (type === "subnet") nodeType = "subnetNode"
      const isContainer = type === "vpc" || type === "subnet"
      
      // Determine base dimensions
      const baseDimensions = 
        type === "vpc"
          ? { width: 800, height: 500 }
          : type === "subnet"
            ? { width: 400, height: 300 }
            : { width: 110, height: 100 }

      // Build complete style including constraints
      const style = {
        ...baseDimensions,
        // These will be used by NodeResizer to enforce min/max constraints
        minWidth: type === "vpc" ? 350 : type === "subnet" ? 200 : 100,
        minHeight: type === "vpc" ? 250 : type === "subnet" ? 150 : 80,
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
          parentId: parentId || null,
          isLocked: false,
          properties: { ...config.defaultProperties },
          justAdded: true, // for bounce animation
        },
        style,
        className: "just-added-node",
      }

      console.log(`Creating node: ${id} of nodeType: ${nodeType}`, newNode)

      const { nodes, edges, history, historyIndex, selectedNodeId } = get()
      const snap = pushHistory(history, historyIndex, nodes, edges)
      const syncedNodes = synchronizeNodeSelection([...nodes, newNode], selectedNodeId)
      set({ nodes: syncedNodes, isDirty: true, ...snap })

      // remove justAdded flag after a short interval so CSS animation can play
      setTimeout(() => {
        const { nodes: currentNodes, selectedNodeId: currentSelectedId } = get()
        const updated = currentNodes.map((n) =>
          n.id === id
            ? {
                ...n,
                data: { ...n.data, justAdded: false },
                className: undefined,
              }
            : n
        )
        const syncedUpdated = synchronizeNodeSelection(updated, currentSelectedId)
        set({ nodes: syncedUpdated })
      }, 400)
    } catch (error) {
      console.error("Error adding node:", error)
    }
  },

  selectNode: (nodeId) => {
    const { nodes } = get()
    const syncedNodes = synchronizeNodeSelection(nodes, nodeId)
    set({ nodes: syncedNodes, selectedNodeId: nodeId, selectedEdgeId: null })
  },

  selectNodeWithHierarchy: (nodeId, respectHierarchy = true) => {
    const { nodes, hierarchyMode } = get()
    
    let finalNodeId = nodeId
    if (respectHierarchy && hierarchyMode === "container-first") {
      // In container-first mode, select the parent container if this node has one
      const node = nodes.find((n) => n.id === nodeId)
      if (node?.data?.parentId) {
        finalNodeId = node.data.parentId
      }
    }
    
    const syncedNodes = synchronizeNodeSelection(nodes, finalNodeId)
    set({ nodes: syncedNodes, selectedNodeId: finalNodeId, selectedEdgeId: null })
  },

  selectEdge: (edgeId) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: null })
  },

  setNodeParent: (nodeId, parentId) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, parentId } } : node
      ),
      isDirty: true,
    })
  },

  getParentNode: (nodeId) => {
    const { nodes } = get()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node?.data?.parentId) return undefined
    return nodes.find((n) => n.id === node.data.parentId)
  },

  getChildNodes: (parentId) => {
    const { nodes } = get()
    return nodes.filter((n) => n.data?.parentId === parentId)
  },

  toggleNodeLock: (nodeId) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, isLocked: !node.data?.isLocked } }
          : node
      ),
      isDirty: true,
    })
  },

  updateNodeProperty: (nodeId, key, value) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, properties: { ...node.data.properties, [key]: value } } }
          : node
      ),
      isDirty: true,
    })
  },

  updateNodeProperties: (nodeId, newProps) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, properties: { ...n.data.properties, ...newProps } } }
          : n
      ),
      isDirty: true,
    })
  },

  updateNodeData: (nodeId, dataUpdate) => {
    const { nodes, selectedNodeId } = get()
    const updated = nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...dataUpdate } }
        : node
    )
    const syncedNodes = synchronizeNodeSelection(updated, selectedNodeId)
    set({ nodes: syncedNodes, isDirty: true })
  },

  deleteNode: (nodeId) => {
    const { nodes, edges, history, historyIndex } = get()
    const snap = pushHistory(history, historyIndex, nodes, edges)

    // If multiple nodes are selected, delete all of them at once
    const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id)
    const idsToDelete = selectedIds.length > 1 ? selectedIds : [nodeId]

    const remainingNodes = nodes.filter((n) => !idsToDelete.includes(n.id))
    const syncedNodes = synchronizeNodeSelection(remainingNodes, null)

    set({
      nodes: syncedNodes,
      edges: edges.filter((e) => !idsToDelete.includes(e.source) && !idsToDelete.includes(e.target)),
      selectedNodeId: null,
      isDirty: true,
      ...snap,
    })
  },

  deleteEdge: (edgeId) => {
    const { nodes, edges, history, historyIndex } = get()
    const snap = pushHistory(history, historyIndex, nodes, edges)
    set({ edges: edges.filter((e) => e.id !== edgeId), selectedEdgeId: null, isDirty: true, ...snap })
  },

  clearConnectionError: () => {
    set({ connectionError: null })
  },

  // ==================== HISTORY ====================
  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    const snap = history[newIndex]
    set({ nodes: snap.nodes, edges: snap.edges, historyIndex: newIndex, isDirty: true })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    const snap = history[newIndex]
    set({ nodes: snap.nodes, edges: snap.edges, historyIndex: newIndex, isDirty: true })
  },

  markSaved: () => {
    set({ isDirty: false })
  },

  setNodes: (nodes) => {
    const { selectedNodeId } = get()
    const syncedNodes = synchronizeNodeSelection(nodes, selectedNodeId)
    set({ nodes: syncedNodes })
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