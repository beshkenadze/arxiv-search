interface AboutProps {
  onBack: () => void
}

export function About({ onBack }: AboutProps) {
  return (
    <div className="about-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Search
      </button>

      <h1>How It Works</h1>

      <section className="about-section">
        <h2>The Short Version</h2>
        <p>
          This demo searches <strong>over 1 million arXiv papers</strong> using neural
          embeddings that run <strong>entirely in your browser</strong>. No servers process
          your queries. No data leaves your device. Everything happens locally using
          WebAssembly-powered machine learning.
        </p>
      </section>

      <section className="about-section">
        <h2>What Makes This Different</h2>

        <div className="comparison">
          <div className="comparison-column">
            <h3>Traditional Search (Perplexity, etc.)</h3>
            <ul>
              <li>Your query is sent to remote servers</li>
              <li>Server-side vector database lookup</li>
              <li>API calls to embedding models</li>
              <li>Results transmitted back to you</li>
            </ul>
          </div>

          <div className="comparison-column highlight">
            <h3>This Demo</h3>
            <ul>
              <li>Everything runs in your browser tab</li>
              <li>65 MB compressed index loads once</li>
              <li>Neural models via WebAssembly</li>
              <li>Sub-second search, completely private</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Technical Details</h2>
        <dl className="tech-details">
          <dt>Binary Quantization</dt>
          <dd>
            512-dimensional embeddings compressed to just 64 bytes per paper using
            binary quantization. This achieves 8× compression while preserving
            semantic similarity for initial retrieval.
          </dd>

          <dt>Matryoshka Embeddings</dt>
          <dd>
            Using mxbai-embed-2d-large-v1, a model trained with Matryoshka
            representation learning. This allows truncating from 1024 to 512 dimensions
            without quality loss.
          </dd>

          <dt>Two-Stage Retrieval</dt>
          <dd>
            Fast Hamming distance search over binary vectors identifies candidates,
            then a neural cross-encoder (ms-marco-MiniLM) reranks for precise relevance.
          </dd>

          <dt>Asymmetric Search</dt>
          <dd>
            Query embeddings remain at full float32 precision while documents use
            binary vectors. This asymmetry improves retrieval quality compared to
            quantizing both sides.
          </dd>

          <dt>Columnar JSON</dt>
          <dd>
            Metadata stored as columns rather than rows. Grouping similar data
            (all titles together, all IDs together) reduces entropy and improves
            compression by 1.4-2x compared to row-oriented JSON.
          </dd>

          <dt>Index Size</dt>
          <dd>
            65 MB for 1M+ papers (binary embeddings) + ~25 MB metadata (columnar
            JSON with gzip). Compare to ~2 GB for uncompressed float32 vectors.
          </dd>
        </dl>
      </section>

      <section className="about-section">
        <h2>The Stack</h2>
        <ul className="tech-stack">
          <li>
            <strong>Embeddings:</strong> transformers.js with WebAssembly/WebGPU backend
          </li>
          <li>
            <strong>Vector Search:</strong> Binary vectors with POPCOUNT-based Hamming distance
          </li>
          <li>
            <strong>Reranking:</strong> Cross-encoder neural model for relevance scoring
          </li>
          <li>
            <strong>Frontend:</strong> React 19 + Zustand + Web Workers for non-blocking ML
          </li>
        </ul>
      </section>
    </div>
  )
}
