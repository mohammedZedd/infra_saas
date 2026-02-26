import { create } from 'zustand';
import type {
  SimulationFlow,
  SimulationHop,
  SimulationStats,
  SimulationScenario,
} from '../types/simulation';

interface SimulationState {
  // State
  isRunning: boolean;
  isPaused: boolean;
  currentFlow: SimulationFlow | null;
  flows: SimulationFlow[];
  activeHops: SimulationHop[];
  stats: SimulationStats;
  speed: number;                     // 0.5x, 1x, 2x, 5x
  selectedScenario: SimulationScenario | null;

  // Actions
  setIsRunning: (val: boolean) => void;
  setIsPaused: (val: boolean) => void;
  setCurrentFlow: (flow: SimulationFlow | null) => void;
  addFlow: (flow: SimulationFlow) => void;
  addActiveHop: (hop: SimulationHop) => void;
  removeActiveHop: (id: string) => void;
  clearActiveHops: () => void;
  updateStats: (stats: Partial<SimulationStats>) => void;
  resetStats: () => void;
  setSpeed: (speed: number) => void;
  setSelectedScenario: (scenario: SimulationScenario | null) => void;
  reset: () => void;
}

const DEFAULT_STATS: SimulationStats = {
  totalRequests: 0,
  avgLatencyMs: 0,
  successRate: 100,
  errorRate: 0,
  totalBytesTransferred: 0,
  requestsPerSecond: 0,
  p50LatencyMs: 0,
  p95LatencyMs: 0,
  p99LatencyMs: 0,
  statusCodes: {},
};

export const useSimulationStore = create<SimulationState>((set) => ({
  isRunning: false,
  isPaused: false,
  currentFlow: null,
  flows: [],
  activeHops: [],
  stats: { ...DEFAULT_STATS },
  speed: 1,
  selectedScenario: null,

  setIsRunning: (val) => set({ isRunning: val }),
  setIsPaused: (val) => set({ isPaused: val }),
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  addFlow: (flow) => set((s) => ({ flows: [...s.flows, flow] })),
  addActiveHop: (hop) => set((s) => ({ activeHops: [...s.activeHops, hop] })),
  removeActiveHop: (id) => set((s) => ({
    activeHops: s.activeHops.filter((h) => h.id !== id),
  })),
  clearActiveHops: () => set({ activeHops: [] }),
  updateStats: (stats) => set((s) => ({ stats: { ...s.stats, ...stats } })),
  resetStats: () => set({ stats: { ...DEFAULT_STATS } }),
  setSpeed: (speed) => set({ speed }),
  setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
  reset: () => set({
    isRunning: false,
    isPaused: false,
    currentFlow: null,
    flows: [],
    activeHops: [],
    stats: { ...DEFAULT_STATS },
    selectedScenario: null,
  }),
}));