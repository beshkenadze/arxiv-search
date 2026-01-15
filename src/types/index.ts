export interface Paper {
  arxiv_id: string
  title: string
  categories: string
}

export interface ColumnarMetadata {
  titles: string[]
  arxiv_ids: string[]
  categories: string[]
}

export interface SearchResult extends Paper {
  rank: number
  score: number
  hammingDist?: number
}

export interface LoadingProgress {
  file: string
  loaded: number
  total: number
  progress: number
}

export type Stage =
  | 'idle'
  | 'loading-index'
  | 'loading-embedder'
  | 'loading-reranker'
  | 'ready'
  | 'searching'
  | 'error'

export type Substep =
  | 'downloading-embeddings'
  | 'downloading-metadata'
  | 'loading-memory'
  | 'downloading-model'
  | 'initializing'
  | null

export interface StageInfo {
  stage: Stage
  substep: Substep
  substepProgress: number
}

export type DeviceType = 'webgpu' | 'wasm' | 'cpu'

export interface WorkerMessage {
  type: 'init' | 'search' | 'progress' | 'result' | 'error' | 'ready'
  payload?: unknown
}

export interface SearchRequest {
  query: string
  topK?: number
  candidates?: number
}
