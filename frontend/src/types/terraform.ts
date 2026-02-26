// src/types/terraform.ts

export interface ProjectVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'bool' | 'list' | 'map';
  isTerraformVar: boolean; // true = var.xxx dans TF, false = env var
  isSecret: boolean;
  defaultValue?: string;
}

export interface ProjectSecret {
  id: string;
  key: string;
  description?: string;
  secretType: 'generic' | 'aws_credentials' | 'database' | 'api_key' | 'ssh_key';
  createdAt: string;
  updatedAt: string;
  // ⚠️ Pas de "value" - jamais renvoyé par l'API
}

export interface TerraformExecution {
  id: string;
  projectId: string;
  command: 'init' | 'plan' | 'apply' | 'destroy';
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  triggeredBy: string; // user id ou "auto"
  terraformVersion: string;
  
  // Résultats
  planSummary?: {
    toAdd: number;
    toChange: number;
    toDestroy: number;
  };
  outputLogs: string;
  errorLogs?: string;
  
  // Timing
  startedAt: string;
  finishedAt?: string;
  durationSeconds?: number;
}

export interface TerraformOutput {
  name: string;
  value: string;
  sensitive: boolean;
  type: string;
}