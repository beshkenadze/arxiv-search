import { getModelFromUrl } from '../hooks/useMLWorker'

type ModelType = 'mxbai' | 'nomic' | 'minilm'

interface ModelInfo {
  id: ModelType
  name: string
  fullName: string
  accuracy: number // Recall@10 %
  modelSize: string
  indexSize: string
  speed: 'fast' | 'medium' | 'slow'
  description: string
}

const MODELS: ModelInfo[] = [
  {
    id: 'minilm',
    name: 'MiniLM',
    fullName: 'sentence-transformers/all-MiniLM-L6-v2',
    accuracy: 94,
    modelSize: '23 MB',
    indexSize: '47 MB',
    speed: 'fast',
    description: 'Fastest model with smallest footprint. Best for quick searches.',
  },
  {
    id: 'nomic',
    name: 'nomic-v1.5',
    fullName: 'nomic-ai/nomic-embed-text-v1.5',
    accuracy: 94,
    modelSize: '69 MB',
    indexSize: '63 MB',
    speed: 'medium',
    description: 'Higher quality embeddings with same recall. Better semantic understanding.',
  },
  {
    id: 'mxbai',
    name: 'mxbai-large',
    fullName: 'mixedbread-ai/mxbai-embed-2d-large-v1',
    accuracy: 91,
    modelSize: '337 MB',
    indexSize: '63 MB',
    speed: 'slow',
    description: 'Stricter embeddings with higher precision. Lower recall but fewer false positives.',
  },
]

function SpeedIndicator({ speed }: { speed: 'fast' | 'medium' | 'slow' }) {
  const bars = speed === 'fast' ? 3 : speed === 'medium' ? 2 : 1
  return (
    <span className="speed-indicator" title={`Speed: ${speed}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`speed-bar ${i <= bars ? 'active' : ''}`} />
      ))}
    </span>
  )
}

export function ModelSelector() {
  const currentModel = getModelFromUrl()

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <span className="model-selector-label">Embedding Model</span>
        <span className="model-selector-hint">Different models = different results</span>
      </div>
      <div className="model-cards">
        {MODELS.map((model) => {
          const isActive = model.id === currentModel
          const href = model.id === 'minilm' ? '/' : `/?model=${model.id}`

          return (
            <a
              key={model.id}
              href={href}
              className={`model-card ${isActive ? 'active' : ''}`}
              title={model.description}
            >
              <div className="model-card-header">
                <span className="model-name">{model.name}</span>
                {isActive && <span className="active-badge">Active</span>}
              </div>

              <div className="model-metrics">
                <div className="metric accuracy">
                  <span className="metric-value">{model.accuracy}%</span>
                  <span className="metric-label">R@10</span>
                </div>
                <div className="metric size">
                  <span className="metric-value">{model.modelSize}</span>
                  <span className="metric-label">Model</span>
                </div>
                <div className="metric speed">
                  <SpeedIndicator speed={model.speed} />
                  <span className="metric-label">Speed</span>
                </div>
              </div>

              <p className="model-description">{model.description}</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
