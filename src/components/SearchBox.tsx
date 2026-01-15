import { useState, useCallback, type KeyboardEvent } from 'react'
import { useSearchStore } from '../stores/searchStore'

const SUGGESTED_QUERIES = [
  'transformer attention mechanism',
  'reinforcement learning from human feedback',
  'diffusion models for image generation',
  'why do neural networks generalize',
  'efficient inference on edge devices',
  'contrastive learning representations',
]

interface SearchBoxProps {
  onSearch: (query: string) => void
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const { query, setQuery, modelsLoaded, stage, searchHistory } = useSearchStore()
  const [showHistory, setShowHistory] = useState(false)

  const isSearching = stage === 'searching'
  const isReady = modelsLoaded && stage === 'ready'

  const handleSearch = useCallback(() => {
    if (!query.trim() || !isReady) return
    onSearch(query.trim())
    setShowHistory(false)
  }, [query, isReady, onSearch])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleHistorySelect = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery)
      setShowHistory(false)
      if (isReady) {
        onSearch(historyQuery)
      }
    },
    [setQuery, isReady, onSearch]
  )

  const handleSuggestedQuery = useCallback(
    (suggestedQuery: string) => {
      setQuery(suggestedQuery)
      if (isReady) {
        onSearch(suggestedQuery)
      }
    },
    [setQuery, isReady, onSearch]
  )

  return (
    <div className="search-box">
      <div className="search-input-group">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="Search arXiv papers..."
            disabled={!modelsLoaded}
          />
          {showHistory && searchHistory.length > 0 && (
            <ul className="search-history">
              {searchHistory.map((h, i) => (
                <li key={i} onMouseDown={() => handleHistorySelect(h)}>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="search-btn" onClick={handleSearch} disabled={!isReady || isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="suggested-queries">
        <span className="suggested-label">Try</span>
        {SUGGESTED_QUERIES.map((q) => (
          <button
            key={q}
            className="query-pill"
            onClick={() => handleSuggestedQuery(q)}
            disabled={!modelsLoaded}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
