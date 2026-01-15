import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Stage, Substep, LoadingProgress, SearchResult, DeviceType } from '../types'

interface SearchState {
  // Loading state
  stage: Stage
  substep: Substep
  progress: LoadingProgress[]
  error: string | null
  device: DeviceType | null

  // Data state
  indexLoaded: boolean
  modelsLoaded: boolean
  paperCount: number

  // Search state
  query: string
  results: SearchResult[]
  searchHistory: string[]

  // Actions
  setStage: (stage: Stage) => void
  setSubstep: (substep: Substep) => void
  setDevice: (device: DeviceType) => void
  setError: (error: string | null) => void
  updateProgress: (p: LoadingProgress) => void
  clearProgress: (file: string) => void
  setIndexLoaded: (count: number) => void
  setModelsLoaded: () => void
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  addToHistory: (query: string) => void
  reset: () => void
}

const initialState = {
  stage: 'idle' as Stage,
  substep: null as Substep,
  progress: [],
  error: null,
  device: null,
  indexLoaded: false,
  modelsLoaded: false,
  paperCount: 0,
  query: '',
  results: [],
  searchHistory: [],
}

export const useSearchStore = create<SearchState>()(
  persist(
    immer((set) => ({
      ...initialState,

      setStage: (stage) =>
        set((state) => {
          state.stage = stage
          state.substep = null
          state.progress = []
          if (stage !== 'error') state.error = null
        }),

      setSubstep: (substep) =>
        set((state) => {
          state.substep = substep
          state.progress = []
        }),

      setDevice: (device) =>
        set((state) => {
          state.device = device
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
          state.stage = error ? 'error' : state.stage
        }),

      updateProgress: (p) =>
        set((state) => {
          const idx = state.progress.findIndex((x) => x.file === p.file)
          if (idx >= 0) {
            state.progress[idx] = p
          } else {
            state.progress.push(p)
          }
        }),

      clearProgress: (file) =>
        set((state) => {
          state.progress = state.progress.filter((x) => x.file !== file)
        }),

      setIndexLoaded: (count) =>
        set((state) => {
          state.indexLoaded = true
          state.paperCount = count
        }),

      setModelsLoaded: () =>
        set((state) => {
          state.modelsLoaded = true
          state.stage = 'ready'
        }),

      setQuery: (query) =>
        set((state) => {
          state.query = query
        }),

      setResults: (results) =>
        set((state) => {
          state.results = results
          state.stage = 'ready'
        }),

      addToHistory: (query) =>
        set((state) => {
          if (query && !state.searchHistory.includes(query)) {
            state.searchHistory = [query, ...state.searchHistory.slice(0, 9)]
          }
        }),

      reset: () => set(() => initialState),
    })),
    {
      name: 'arxiv-search-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
      }),
    }
  )
)
