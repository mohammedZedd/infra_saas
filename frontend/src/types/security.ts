export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type SecurityCategory =
  | 'network'
  | 'encryption'
  | 'access'
  | 'storage'
  | 'compute'
  | 'database'
  | 'monitoring'
  | 'compliance';

export interface SecurityFinding {
  id: string;
  ruleId: string;
  severity: SecuritySeverity;
  category: SecurityCategory;
  title: string;
  description: string;
  recommendation: string;
  affectedNodeIds: string[];
  affectedNodeLabels: string[];
  compliance: string[];          // CIS, SOC2, PCI-DSS, HIPAA
  autoFixAvailable: boolean;
}

export interface SecurityRule {
  id: string;
  severity: SecuritySeverity;
  category: SecurityCategory;
  title: string;
  description: string;
  recommendation: string;
  compliance: string[];
  autoFixAvailable: boolean;
  check: (context: SecurityContext) => SecurityFinding[];
}

export interface SecurityContext {
  nodes: any[];
  edges: any[];
  nodeMap: Record<string, { id: string; type: string; label: string; data: any }>;
  adjacency: Record<string, string[]>;
  hasNodeOfType: (type: string) => boolean;
  getNodesOfType: (type: string) => any[];
  isConnectedTo: (nodeId: string, targetType: string) => boolean;
  getConnectedNodes: (nodeId: string) => string[];
}

export interface SecurityScanResult {
  score: number;                 // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  findings: SecurityFinding[];
  scannedAt: string;
  totalResources: number;
  bySerenity: Record<SecuritySeverity, number>;
  byCategory: Record<SecurityCategory, number>;
}