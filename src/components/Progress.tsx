import { useState, useEffect } from 'react'
import { useSearchStore } from '../stores/searchStore'
import { getModelFromUrl } from '../hooks/useMLWorker'
import type { Stage, Substep } from '../types'

interface StageConfig {
  label: string
  substeps: { id: Substep; label: string }[]
}

const MODEL_SIZES = {
  mxbai: { index: '63 MB', embedder: '337 MB' },
  nomic: { index: '63 MB', embedder: '69 MB' },
  minilm: { index: '47 MB', embedder: '23 MB' },
} as const

function getStageConfig(model: keyof typeof MODEL_SIZES): Record<string, StageConfig> {
  const sizes = MODEL_SIZES[model]
  return {
    'loading-index': {
      label: 'Loading Index',
      substeps: [
        { id: 'downloading-embeddings', label: `Downloading embeddings (${sizes.index})` },
        { id: 'downloading-metadata', label: 'Downloading metadata (~112 MB)' },
        { id: 'loading-memory', label: 'Loading into memory' },
      ],
    },
    'loading-embedder': {
      label: 'Loading Embedder',
      substeps: [
        { id: 'downloading-model', label: `Downloading model (${sizes.embedder})` },
        { id: 'initializing', label: 'Initializing WASM runtime' },
      ],
    },
    'loading-reranker': {
      label: 'Loading Reranker',
      substeps: [
        { id: 'downloading-model', label: 'Downloading model (23 MB)' },
        { id: 'initializing', label: 'Initializing' },
      ],
    },
    ready: {
      label: 'Ready',
      substeps: [],
    },
  }
}

const STAGE_ORDER: Stage[] = ['loading-index', 'loading-embedder', 'loading-reranker', 'ready']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Progress() {
  const { stage, substep, progress, error, device, paperCount } = useSearchStore()
  const currentModel = getModelFromUrl()
  const STAGE_CONFIG = getStageConfig(currentModel)
  const [isExpanded, setIsExpanded] = useState(true)

  const displayStage = stage === 'searching' ? 'ready' : stage
  const isReady = displayStage === 'ready'

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setIsExpanded(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isReady])

  if (stage === 'idle') return null

  const stageIndex = STAGE_ORDER.indexOf(displayStage)
  const currentStageNum = stageIndex >= 0 ? stageIndex + 1 : 0
  const totalStages = STAGE_ORDER.length

  // Collapsed "Ready" state - minimal footprint
  if (isReady && !isExpanded) {
    return (
      <button
        className="progress-collapsed"
        onClick={() => setIsExpanded(true)}
        type="button"
      >
        <span className="collapsed-status">
          <span className="collapsed-checkmark">✓</span>
          <span className="collapsed-label">Ready</span>
        </span>
        <span className="collapsed-meta">
          {paperCount > 0 && (
            <span className="collapsed-papers">{paperCount.toLocaleString()} papers</span>
          )}
          {device && (
            <span className="collapsed-device">{device === 'webgpu' ? 'WebGPU' : 'WASM'}</span>
          )}
        </span>
        <span className="collapsed-expand" aria-label="Expand details">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
    )
  }

  return (
    <div className={`progress-container ${stage === 'error' ? 'error' : ''}`}>
      {stage === 'error' ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="progress-header">
            <span className="step-indicator">
              {isReady ? 'Ready!' : `Step ${currentStageNum} of ${totalStages}`}
            </span>
            <div className="progress-header-actions">
              {device && (
                <span className="device-badge">{device === 'webgpu' ? 'WebGPU' : 'WASM'}</span>
              )}
              {isReady && (
                <button
                  className="collapse-btn"
                  onClick={() => setIsExpanded(false)}
                  type="button"
                  aria-label="Collapse progress"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="stages-list">
            {STAGE_ORDER.map((s, i) => {
              const config = STAGE_CONFIG[s]
              const isCompleted = i < stageIndex
              const isActive = s === displayStage
              const isFuture = i > stageIndex

              return (
                <div key={s} className={`stage-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}`}>
                  <div className="stage-header">
                    <span className="stage-dot">
                      {isCompleted ? '✓' : isActive ? '●' : '○'}
                    </span>
                    <span className="stage-label">
                      {config.label}
                      {s === 'ready' && paperCount > 0 && (
                        <span className="paper-count"> ({paperCount.toLocaleString()} papers)</span>
                      )}
                    </span>
                  </div>

                  {isActive && config.substeps.length > 0 && (
                    <div className="substeps-list">
                      {config.substeps.map((sub) => {
                        const isSubstepActive = substep === sub.id
                        const substepIndex = config.substeps.findIndex((x) => x.id === substep)
                        const subIndex = config.substeps.indexOf(sub)
                        const isSubstepCompleted = substepIndex > subIndex

                        return (
                          <div
                            key={sub.id}
                            className={`substep-item ${isSubstepCompleted ? 'completed' : ''} ${isSubstepActive ? 'active' : ''}`}
                          >
                            <span className="substep-indicator">
                              {isSubstepCompleted ? '✓' : isSubstepActive ? '→' : '·'}
                            </span>
                            <span className="substep-label">{sub.label}</span>

                            {isSubstepActive && progress.length > 0 && (
                              <div className="download-progress">
                                {progress.map((p) => (
                                  <div key={p.file} className="progress-item">
                                    <div className="progress-bar">
                                      <div
                                        className="progress-fill"
                                        style={{ width: `${p.progress}%` }}
                                      />
                                    </div>
                                    <span className="progress-text">
                                      {formatBytes(p.loaded)} / {formatBytes(p.total)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
