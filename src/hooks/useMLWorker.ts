import { useEffect, useRef, useCallback } from 'react'
import { useSearchStore } from '../stores/searchStore'
import type { LoadingProgress, SearchResult, DeviceType, Stage, Substep } from '../types'

import MxbaiWorker from '../worker?worker'
import NomicWorker from '../worker-nomic?worker'
import MinilmWorker from '../worker-minilm?worker'

type WorkerMessageType =
  | 'worker-ready'
  | 'device'
  | 'stage'
  | 'substep'
  | 'progress'
  | 'index-loaded'
  | 'models-loaded'
  | 'results'
  | 'error'

interface WorkerMessage {
  type: WorkerMessageType
  payload?: unknown
}

type ModelType = 'mxbai' | 'nomic' | 'minilm'

function createWorker(model: ModelType): Worker {
  switch (model) {
    case 'nomic':
      return new NomicWorker()
    case 'minilm':
      return new MinilmWorker()
    default:
      return new MxbaiWorker()
  }
}

export function getModelFromUrl(): ModelType {
  const params = new URLSearchParams(window.location.search)
  const model = params.get('model')
  if (model === 'nomic' || model === 'mxbai') return model
  return 'minilm'
}

export function useMLWorker() {
  const workerRef = useRef<Worker | null>(null)
  const readyRef = useRef(false)

  const {
    setStage,
    setSubstep,
    setDevice,
    setError,
    updateProgress,
    setIndexLoaded,
    setModelsLoaded,
    setResults,
    addToHistory,
  } = useSearchStore()

  useEffect(() => {
    const model = getModelFromUrl()
    const worker = createWorker(model)

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, payload } = event.data

      switch (type) {
        case 'worker-ready':
          readyRef.current = true
          worker.postMessage({ type: 'load-index' })
          break

        case 'device':
          setDevice(payload as DeviceType)
          break

        case 'stage':
          setStage(payload as Stage)
          break

        case 'substep':
          setSubstep(payload as Substep)
          break

        case 'progress':
          updateProgress(payload as LoadingProgress)
          break

        case 'index-loaded': {
          const { count } = payload as { count: number }
          setIndexLoaded(count)
          worker.postMessage({ type: 'load-models' })
          break
        }

        case 'models-loaded':
          setModelsLoaded()
          break

        case 'results': {
          setResults(payload as SearchResult[])
          // Expose debug info for Playwright
          const debug = (event.data as { debug?: unknown }).debug
          if (debug) {
            ;(window as unknown as { __searchDebug: unknown }).__searchDebug = debug
          }
          break
        }

        case 'error':
          setError(payload as string)
          break
      }
    }

    worker.onerror = (error) => {
      setError(error.message)
    }

    workerRef.current = worker

    return () => {
      worker.terminate()
    }
  }, [setStage, setSubstep, setDevice, setError, updateProgress, setIndexLoaded, setModelsLoaded, setResults])

  const search = useCallback(
    (query: string, topK = 10, candidates = 300) => {
      if (!workerRef.current || !readyRef.current) return

      addToHistory(query)
      setStage('searching')
      workerRef.current.postMessage({
        type: 'search',
        payload: { query, topK, candidates },
      })
    },
    [addToHistory, setStage]
  )

  return { search }
}
