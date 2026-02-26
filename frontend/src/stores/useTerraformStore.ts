// src/stores/useTerraformStore.ts

import { create } from 'zustand';
import type { ProjectVariable, ProjectSecret, TerraformExecution } from '../types/terraform';

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
}

export const useTerraformStore = create<TerraformState>((set) => ({
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
}));