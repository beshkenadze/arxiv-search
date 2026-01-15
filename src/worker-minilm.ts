import { createSearchWorker, type ModelConfig } from './worker-core'

declare const __R2_DATA_URL__: string

const DATA_BASE = __R2_DATA_URL__ || ''

const config: ModelConfig = {
  modelId: 'Xenova/all-MiniLM-L6-v2',
  queryPrefix: '',
  dimension: 384,
  pooling: 'mean',
  dataPath: `${DATA_BASE}/data_minilm_384d`,
  defaultBinSize: 50_000_000,
}

createSearchWorker(config)
