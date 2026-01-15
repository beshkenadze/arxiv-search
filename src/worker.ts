import { createSearchWorker, type ModelConfig } from './worker-core'

declare const __R2_DATA_URL__: string

const DATA_BASE = __R2_DATA_URL__ || ''

const config: ModelConfig = {
  modelId: 'mixedbread-ai/mxbai-embed-2d-large-v1',
  queryPrefix: 'Represent this sentence for searching relevant passages: ',
  dimension: 512,
  pooling: 'cls',
  dataPath: `${DATA_BASE}/data_512d`,
  defaultBinSize: 66_000_000,
}

createSearchWorker(config)
