import { createSearchWorker, type ModelConfig } from './worker-core'

declare const __R2_DATA_URL__: string

const DATA_BASE = __R2_DATA_URL__ || ''

const config: ModelConfig = {
  modelId: 'nomic-ai/nomic-embed-text-v1.5',
  queryPrefix: 'search_query: ',
  dimension: 512,
  pooling: 'mean',
  dataPath: `${DATA_BASE}/data_nomic_512d`,
  defaultBinSize: 66_000_000,
}

createSearchWorker(config)
