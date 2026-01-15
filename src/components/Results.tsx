import { useSearchStore } from '../stores/searchStore'

export function Results() {
  const { results, stage, query } = useSearchStore()

  if (stage === 'searching') {
    return (
      <div className="results-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Results</h2>
        <span className="results-meta">
          {results.length} papers for "{query}"
        </span>
      </div>
      {results.map((result) => (
        <div key={result.arxiv_id} className="result-card">
          <div className="rank">{result.rank}</div>
          <div className="result-content">
            <a
              href={`https://arxiv.org/abs/${result.arxiv_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="title"
            >
              {result.title}
            </a>
            <div className="meta">
              <span className="arxiv-id">{result.arxiv_id}</span>
              <span className="categories">{result.categories}</span>
              <span className="score">{result.score.toFixed(3)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
