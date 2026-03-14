// src/stores/useTerraformStore.ts

import { create } from 'zustand';
import type { ProjectVariable, ProjectSecret, TerraformExecution } from '../types/terraform';
import type { TerraformRun } from '../types/project.types';
import useProjectStore from './useProjectStore';
import useAuthStore from './useAuthStore';
import { useSimulationStore } from './useSimulationStore';

type TerraformAction = Extract<TerraformExecution['command'], 'plan' | 'apply' | 'destroy'>;

function createRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `tf-run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPlanSummary(command: TerraformAction): TerraformRun['planSummary'] {
  if (command === 'destroy') {
    return {
      add: 0,
      change: 0,
      destroy: 1 + Math.floor(Math.random() * 4),
    };
  }

  if (command === 'plan') {
    return {
      add: 1 + Math.floor(Math.random() * 4),
      change: Math.floor(Math.random() * 3),
      destroy: Math.floor(Math.random() * 2),
    };
  }

  return {
    add: 1 + Math.floor(Math.random() * 3),
    change: Math.floor(Math.random() * 2),
    destroy: Math.floor(Math.random() * 2),
  };
}

function buildRunningLogs(command: TerraformAction): string {
  return `[${new Date().toISOString()}] Terraform ${command} started\n[INFO] Initializing providers and backend...`;
}

function buildFinalLogs(command: TerraformAction, success: boolean, runId: string, summary: TerraformRun['planSummary']): string {
  const header = `[${new Date().toISOString()}] Run ${runId} - terraform ${command}`;
  const summaryLine = summary
    ? `Plan: +${summary.add} ~${summary.change} -${summary.destroy}`
    : 'Plan: no changes';

  if (success) {
    return `${header}\n[INFO] Running terraform ${command}...\n[INFO] ${summaryLine}\n[SUCCESS] Terraform ${command} completed successfully.`;
  }

  return `${header}\n[INFO] Running terraform ${command}...\n[ERROR] Provider validation failed during ${command}.\n[ERROR] Exit code 1`;
}

interface TerraformState {
  // Variables
  variables: ProjectVariable[];
  setVariables: (variables: ProjectVariable[]) => void;
  addVariable: (variable: ProjectVariable) => void;
  updateVariable: (id: string, updates: Partial<ProjectVariable>) => void;
  deleteVariable: (id: string) => void;

  // Secrets
  secrets: ProjectSecret[];
  setSecrets: (secrets: ProjectSecret[]) => void;
  addSecret: (secret: ProjectSecret) => void;
  deleteSecret: (id: string) => void;

  // Executions
  executions: TerraformExecution[];
  currentExecution: TerraformExecution | null;
  setExecutions: (executions: TerraformExecution[]) => void;
  setCurrentExecution: (execution: TerraformExecution | null) => void;
  addExecution: (execution: TerraformExecution) => void;
  updateExecution: (id: string, updates: Partial<TerraformExecution>) => void;

  // Generated code
  generatedCode: string;
  setGeneratedCode: (code: string) => void;

  // UI State
  isGenerating: boolean;
  isExecuting: boolean;
  setIsGenerating: (value: boolean) => void;
  setIsExecuting: (value: boolean) => void;
  runTerraformAction: (command: TerraformAction) => Promise<void>;
}

export const useTerraformStore = create<TerraformState>((set, get) => ({
  // Variables
  variables: [],
  setVariables: (variables) => set({ variables }),
  addVariable: (variable) =>
    set((state) => ({ variables: [...state.variables, variable] })),
  updateVariable: (id, updates) =>
    set((state) => ({
      variables: state.variables.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),
  deleteVariable: (id) =>
    set((state) => ({
      variables: state.variables.filter((v) => v.id !== id),
    })),

  // Secrets
  secrets: [],
  setSecrets: (secrets) => set({ secrets }),
  addSecret: (secret) =>
    set((state) => ({ secrets: [...state.secrets, secret] })),
  deleteSecret: (id) =>
    set((state) => ({
      secrets: state.secrets.filter((s) => s.id !== id),
    })),

  // Executions
  executions: [],
  currentExecution: null,
  setExecutions: (executions) => set({ executions }),
  setCurrentExecution: (execution) => set({ currentExecution: execution }),
  addExecution: (execution) =>
    set((state) => ({ executions: [execution, ...state.executions] })),
  updateExecution: (id, updates) =>
    set((state) => ({
      executions: state.executions.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
      currentExecution:
        state.currentExecution?.id === id
          ? { ...state.currentExecution, ...updates }
          : state.currentExecution,
    })),

  // Generated code
  generatedCode: '',
  setGeneratedCode: (code) => set({ generatedCode: code }),

  // UI State
  isGenerating: false,
  isExecuting: false,
  setIsGenerating: (value) => set({ isGenerating: value }),
  setIsExecuting: (value) => set({ isExecuting: value }),
  runTerraformAction: async (command) => {
    const { isExecuting } = get();
    if (isExecuting) return;

    const projectStore = useProjectStore.getState();
    const currentProject = projectStore.currentProject;
    if (!currentProject) {
      throw new Error('No project selected for Terraform execution');
    }

    const triggeredBy = useAuthStore.getState().user?.email ?? 'auto';
    const runId = createRunId();
    const startedAt = new Date().toISOString();
    const runningLogs = buildRunningLogs(command);
    const planSummary = createPlanSummary(command);

    const execution: TerraformExecution = {
      id: runId,
      projectId: currentProject.id,
      command,
      status: 'running',
      triggeredBy,
      terraformVersion: '1.6.6',
      outputLogs: runningLogs,
      startedAt,
    };

    const run: TerraformRun = {
      id: runId,
      projectId: currentProject.id,
      command,
      status: 'running',
      triggeredBy,
      triggeredAt: startedAt,
      logs: runningLogs,
    };

    get().addExecution(execution);
    get().setCurrentExecution(execution);
    get().setIsExecuting(true);
    useSimulationStore.getState().setIsRunning(true);
    projectStore.appendRunToCurrentProject(run);

    await new Promise<void>((resolve) => {
      const durationMs = 1500 + Math.floor(Math.random() * 2000);
      setTimeout(() => {
        const successThreshold = command === 'destroy' ? 0.75 : 0.85;
        const isSuccess = Math.random() < successThreshold;
        const completedAt = new Date().toISOString();
        const durationSeconds = Math.max(1, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000));
        const finalLogs = buildFinalLogs(command, isSuccess, runId, planSummary);

        get().updateExecution(runId, {
          status: isSuccess ? 'success' : 'failed',
          finishedAt: completedAt,
          durationSeconds,
          outputLogs: finalLogs,
          errorLogs: isSuccess ? undefined : `Terraform ${command} failed with exit code 1`,
          planSummary: {
            toAdd: planSummary?.add ?? 0,
            toChange: planSummary?.change ?? 0,
            toDestroy: planSummary?.destroy ?? 0,
          },
        });

        projectStore.updateRunInCurrentProject(runId, {
          status: isSuccess ? 'success' : 'failed',
          completedAt,
          planSummary,
          errorMessage: isSuccess ? undefined : `Terraform ${command} failed. Review logs for details.`,
          logs: finalLogs,
        });

        get().setCurrentExecution(null);
        get().setIsExecuting(false);
        useSimulationStore.getState().setIsRunning(false);
        resolve();
      }, durationMs);
    });
  },
}));