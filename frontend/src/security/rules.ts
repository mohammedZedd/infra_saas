import type {
  SecurityRule,
  SecurityFinding,
  SecurityContext,
} from '../types/security';

export const SECURITY_RULES: SecurityRule[] = [
  // ─────────────────────────────────────────────────────────────
  // EC2 sans Security Group
  // ─────────────────────────────────────────────────────────────
  {
    id: 'EC2_NO_SG',
    severity: 'critical',
    category: 'network',
    title: 'EC2 instance without Security Group',
    description:
      'EC2 instance has no Security Group attached. All traffic may be allowed.',
    recommendation:
      'Add a Security Group and define inbound/outbound rules to restrict traffic.',
    compliance: ['CIS AWS 5.1', 'SOC2 CC6.1', 'PCI-DSS 1.3'],
    autoFixAvailable: true,
    check: (context: SecurityContext): SecurityFinding[] => {
      const findings: SecurityFinding[] = [];
      const ec2Nodes = context.getNodesOfType('ec2');

      ec2Nodes.forEach((node) => {
        const data = node.data as any;
        if (!context.isConnectedTo(node.id, 'sg')) {
          findings.push({
            id: crypto.randomUUID(),
            ruleId: 'EC2_NO_SG',
            severity: 'critical',
            category: 'network',
            title: 'EC2 instance without Security Group',
            description: `"${data?.label || 'EC2 Instance'}" has no Security Group attached. This means all traffic is potentially allowed.`,
            recommendation:
              'Add a Security Group and define inbound/outbound rules to restrict traffic to only necessary ports and sources.',
            affectedNodeIds: [node.id],
            affectedNodeLabels: [data?.label || 'EC2 Instance'],
            compliance: ['CIS AWS 5.1', 'SOC2 CC6.1', 'PCI-DSS 1.3'],
            autoFixAvailable: true,
          });
        }
      });

      return findings;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // S3 sans encryption
  // ─────────────────────────────────────────────────────────────
  {
    id: 'S3_NO_ENCRYPTION',
    severity: 'high',
    category: 'encryption',
    title: 'S3 bucket without encryption',
    description: 'S3 bucket without server-side encryption enabled.',
    recommendation:
      'Enable SSE-S3 or SSE-KMS encryption on the bucket to protect data at rest.',
    compliance: [
      'CIS AWS 2.1.1',
      'SOC2 CC6.7',
      'PCI-DSS 3.4',
      'HIPAA 164.312(a)(2)(iv)',
    ],
    autoFixAvailable: true,
    check: (context: SecurityContext): SecurityFinding[] => {
      const findings: SecurityFinding[] = [];
      const s3Nodes = context.getNodesOfType('s3');

      s3Nodes.forEach((node) => {
        const data = node.data as any;
        if (!data?.encryption || data?.encryption === 'none') {
          findings.push({
            id: crypto.randomUUID(),
            ruleId: 'S3_NO_ENCRYPTION',
            severity: 'high',
            category: 'encryption',
            title: 'S3 bucket without encryption',
            description: `"${data?.label || 'S3 Bucket'}" does not have server-side encryption enabled. Data at rest is unprotected.`,
            recommendation:
              'Enable SSE-S3 or SSE-KMS encryption on the bucket to protect data at rest.',
            affectedNodeIds: [node.id],
            affectedNodeLabels: [data?.label || 'S3 Bucket'],
            compliance: [
              'CIS AWS 2.1.1',
              'SOC2 CC6.7',
              'PCI-DSS 3.4',
              'HIPAA 164.312(a)(2)(iv)',
            ],
            autoFixAvailable: true,
          });
        }
      });

      return findings;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // ➜ Ajoute ici tes autres règles (S3_PUBLIC_ACCESS, RDS_NO_ENCRYPTION,
  //    RDS_PUBLIC, LAMBDA_NO_ROLE, CF_NO_WAF, etc.) en copiant le pattern.
  // ─────────────────────────────────────────────────────────────
];