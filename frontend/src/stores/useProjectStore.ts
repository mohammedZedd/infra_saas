import { create } from "zustand"
import type { Project, TerraformRun } from "../types/project.types"
import type { CreateProjectRequest, UpdateProjectRequest } from "../types/project.types"
import {
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
  getProjects,
  updateProject as updateProjectRequest,
} from "../services/projects"

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null

  fetchProjects: () => Promise<void>
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: CreateProjectRequest & Partial<Project>) => Promise<Project>
  updateProject: (id: string, data: Partial<Project> & UpdateProjectRequest) => Promise<Project | undefined>
  archiveProject: (id: string) => void
  deleteProject: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
  getProjectById: (id: string) => Project | undefined
  appendRunToCurrentProject: (run: TerraformRun) => void
  updateRunInCurrentProject: (runId: string, updates: Partial<TerraformRun>) => void
}

const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await getProjects({ page: 1, page_size: 50, sort_by: "updated_at", sort_order: "desc" })
      set({ projects: response.items, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load projects"
      set({ isLoading: false, error: message, projects: [] })
    }
  },

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  addProject: async (project) => {
    const created = await createProjectRequest({
      name: project.name,
      description: project.description ?? "",
      region: project.region,
      template_id: project.template_id,
    })
    set((state) => ({ projects: [created, ...state.projects] }))
    return created
  },

  updateProject: async (id, data) => {
    const payload: UpdateProjectRequest = {
      name: data.name,
      description: data.description,
      region: data.region,
      environment: data.environment,
      status: data.status,
      architecture_data: data.architecture_data,
    }

    const updated = await updateProjectRequest(id, payload)
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updated }
          : state.currentProject,
    }))
    return updated
  },

  archiveProject: (id) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: "draft" } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, status: "draft" }
          : state.currentProject,
    })),

  deleteProject: async (id) => {
    await deleteProjectRequest(id)
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }))
  },

  setLoading: (loading) => set({ isLoading: loading }),

  getProjectById: (id) => get().projects.find((project) => project.id === id),

  appendRunToCurrentProject: (run) =>
    set((state) => {
      if (!state.currentProject) return state

      const nextRuns = [run, ...(state.currentProject.runs ?? [])]

      return {
        projects: state.projects.map((project) =>
          project.id === state.currentProject?.id
            ? { ...project, runs: nextRuns }
            : project
        ),
        currentProject: {
          ...state.currentProject,
          runs: nextRuns,
        },
      }
    }),

  updateRunInCurrentProject: (runId, updates) =>
    set((state) => {
      if (!state.currentProject?.runs) return state

      const nextRuns = state.currentProject.runs.map((run) =>
        run.id === runId ? { ...run, ...updates } : run
      )

      return {
        projects: state.projects.map((project) =>
          project.id === state.currentProject?.id
            ? { ...project, runs: nextRuns }
            : project
        ),
        currentProject: {
          ...state.currentProject,
          runs: nextRuns,
        },
      }
    }),
}))

export default useProjectStore
