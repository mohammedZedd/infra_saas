import { type Node } from "@xyflow/react"
import { type AwsNodeData } from "../types/aws"

type AwsNode = Node<AwsNodeData>

/**
 * Synchronizes the `selected` property of nodes with the currently selected node ID.
 * This ensures that React Flow correctly passes the `selected` prop to node components.
 */
export function synchronizeNodeSelection(
  nodes: AwsNode[],
  selectedNodeId: string | null
): AwsNode[] {
  return nodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
  }))
}

/**
 * Preserves selection state during node transformations.
 * Useful when updating nodes to ensure the selected node remains marked.
 */
export function preserveNodeSelection(
  newNodes: AwsNode[],
  selectedNodeId: string | null
): AwsNode[] {
  // If no selection, ensure all nodes have selected=false
  if (!selectedNodeId) {
    return newNodes.map((n) => ({ ...n, selected: false }))
  }

  // Synchronize selection: mark the selected node
  return newNodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
  }))
}
