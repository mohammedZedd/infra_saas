export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type StatusCode = 200 | 201 | 301 | 400 | 401 | 403 | 404 | 500 | 502 | 503;

export interface SimulationRequest {
  id: string;
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  body?: string;
  sourceNodeId: string | null;     // null = external user
  targetNodeId: string;
  timestamp: number;
}

export interface SimulationHop {
  id: string;
  requestId: string;
  fromNodeId: string | null;
  toNodeId: string;
  startTime: number;
  endTime: number;
  latencyMs: number;
  statusCode: StatusCode;
  bytesTransferred: number;
  protocol: string;                // HTTPS, HTTP, TCP, SQL, etc.
  description: string;             // "GET /api/users → 200 OK"
}

export interface SimulationFlow {
  id: string;
  name: string;
  description: string;
  requests: SimulationRequest[];
  hops: SimulationHop[];
  totalLatencyMs: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  startedAt: number | null;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  emoji: string;
  entryPoint: string;              // node type (cloudfront, api_gateway, alb, ec2)
  requestCount: number;
  method: HttpMethod;
  path: string;
  expectedFlow: string[];          // ordered node types the request passes through
}

export interface SimulationStats {
  totalRequests: number;
  avgLatencyMs: number;
  successRate: number;
  errorRate: number;
  totalBytesTransferred: number;
  requestsPerSecond: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  statusCodes: Record<number, number>;
}