import { create } from "zustand"
import { getMockProjects } from "../data/mockProjects"
import type { Project } from "../types/project.types"

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean

  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  setLoading: (loading: boolean) => void
  getProjectById: (id: string) => Project | undefined
}

const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: getMockProjects(),
  currentProject: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...data }
          : state.currentProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  getProjectById: (id) => get().projects.find((project) => project.id === id),
}))

export default useProjectStore
