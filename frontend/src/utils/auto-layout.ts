import type { Node, Edge } from "@xyflow/react"
import type { AwsNodeData } from "../types/aws"

type CanvasNode = Node<AwsNodeData>
type CanvasEdge = Edge

const GAP = 40

/**
 * Returns a new array of nodes with updated positions, arranged logically:
 * - VPCs at the top, spanning wide
 * - Subnets inside their parent VPC, side by side
 * - EC2s inside their parent Subnet
 * - Security Groups to the right of their VPC
 * - S3 buckets at the bottom-right, separated from the network
 * - All other nodes arranged in a grid below VPCs
 *
 * Does NOT mutate the input arrays.
 */
export function autoLayout(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasNode[] {
  if (nodes.length === 0) return []

  // Build adjacency: nodeId -> set of connected nodeIds
  const connected = new Map<string, Set<string>>()
  for (const node of nodes) connected.set(node.id, new Set())
  for (const edge of edges) {
    connected.get(edge.source)?.add(edge.target)
    connected.get(edge.target)?.add(edge.source)
  }

  const getConnectedOfType = (nodeId: string, type: string): CanvasNode[] =>
    nodes.filter(
      (n) => n.data.type === type && connected.get(nodeId)?.has(n.id)
    )

  const updated = new Map<string, { x: number; y: number }>()

  // Separate by type
  const vpcs = nodes.filter((n) => n.data.type === "vpc")
  const subnets = nodes.filter((n) => n.data.type === "subnet")
  const ec2s = nodes.filter((n) => n.data.type === "ec2")
  const sgs = nodes.filter((n) => n.data.type === "sg")
  const s3s = nodes.filter((n) => n.data.type === "s3")
  const others = nodes.filter(
    (n) => !["vpc", "subnet", "ec2", "sg", "s3"].includes(n.data.type)
  )

  // VPC sizes
  const VPC_W = 900
  const VPC_H = 540
  const SUBNET_W = 400
  const SUBNET_H = 300
  const NODE_W = 120
  const NODE_H = 100

  // Place VPCs in a row at the top
  let vpcX = GAP
  for (const vpc of vpcs) {
    updated.set(vpc.id, { x: vpcX, y: GAP })

    // Place subnets inside the VPC
    const mySubnets = subnets.filter((s) =>
      getConnectedOfType(s.id, "vpc").some((v) => v.id === vpc.id)
    )
    let subX = GAP
    const subY = 80
    for (const subnet of mySubnets) {
      updated.set(subnet.id, { x: vpcX + subX, y: GAP + subY })

      // Place EC2s inside the subnet
      const myEc2s = ec2s.filter((e) =>
        getConnectedOfType(e.id, "subnet").some((s) => s.id === subnet.id)
      )
      let ec2X = GAP
      for (const ec2 of myEc2s) {
        updated.set(ec2.id, { x: vpcX + subX + ec2X, y: GAP + subY + 60 })
        ec2X += NODE_W + GAP
      }
      subX += SUBNET_W + GAP
    }

    // Place SGs to the right of the VPC
    const mySgs = sgs.filter((s) =>
      getConnectedOfType(s.id, "vpc").some((v) => v.id === vpc.id)
    )
    let sgY = GAP
    for (const sg of mySgs) {
      updated.set(sg.id, { x: vpcX + VPC_W + GAP, y: sgY })
      sgY += NODE_H + GAP
    }

    vpcX += VPC_W + GAP * 3
  }

  // Subnets not connected to any VPC — place below VPCs
  const orphanSubnets = subnets.filter((s) => !updated.has(s.id))
  let orphSubX = GAP
  const orphSubY = GAP + VPC_H + GAP * 2
  for (const s of orphanSubnets) {
    updated.set(s.id, { x: orphSubX, y: orphSubY })
    orphSubX += SUBNET_W + GAP
  }

  // EC2s not inside a subnet — place in a row
  const orphanEc2s = ec2s.filter((n) => !updated.has(n.id))
  let orphEc2X = GAP
  const orphEc2Y = GAP + VPC_H + SUBNET_H + GAP * 3
  for (const n of orphanEc2s) {
    updated.set(n.id, { x: orphEc2X, y: orphEc2Y })
    orphEc2X += NODE_W + GAP
  }

  // SGs not connected to a VPC
  const orphanSgs = sgs.filter((s) => !updated.has(s.id))
  let orphSgX = GAP + VPC_W + GAP * 2
  for (const sg of orphanSgs) {
    updated.set(sg.id, { x: orphSgX, y: GAP })
    orphSgX += NODE_W + GAP
  }

  // S3 buckets — bottom right
  const s3StartX = vpcX + GAP * 2
  const s3StartY = GAP
  let s3X = s3StartX
  for (const s of s3s) {
    updated.set(s.id, { x: s3X, y: s3StartY })
    s3X += NODE_W + GAP
  }

  // Remaining nodes — grid below everything
  const gridStartY = GAP + VPC_H + SUBNET_H + GAP * 4
  let gridX = GAP
  let gridY = gridStartY
  let col = 0
  const COLS = 4
  for (const n of others) {
    if (!updated.has(n.id)) {
      updated.set(n.id, { x: gridX, y: gridY })
      col++
      gridX += NODE_W + GAP
      if (col >= COLS) {
        col = 0
        gridX = GAP
        gridY += NODE_H + GAP
      }
    }
  }

  // Build result — shallow-clone each node with new position
  return nodes.map((n) => {
    const pos = updated.get(n.id)
    if (!pos) return n
    return { ...n, position: { x: pos.x, y: pos.y } }
  })
}

