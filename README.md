# arXiv Search

Semantic search for 1,030,294 arXiv papers running entirely in your browser.

**[Live Demo](https://arxiv.bshk.app/)**

## Features

- **100% Client-Side**: No server, no API calls, just WebGPU and a 70MB download
- **1M+ Papers**: All arXiv papers from 2022+ indexed
- **94% Recall@10**: Near full-precision quality with 32x compression
- **Privacy-First**: Your queries never leave your device

## How It Works

1. **Binary Quantization**: Float32 embeddings compressed to 1-bit (32x smaller)
2. **Asymmetric Search**: Query stays float32, documents are binary
3. **Cross-Encoder Reranking**: ms-marco-MiniLM for final ranking

### Pipeline

```
Query → Embed (WebGPU, 200-500ms) → Binary Search top-300 (8ms) → Rerank top-10 (~10s) → Results
```

### Models

| Model | Recall@10 | Total Size |
|-------|-----------|------------|
| MiniLM | 94% | 70 MB |
| Nomic v1.5 | 94% | 132 MB |
| mxbai-large | 91% | 400 MB |

## Development

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build for production
bun run build
```

## Data Files

The binary embedding files are served from Cloudflare R2 CDN and not included in this repo (~173MB total). The production build fetches them from:

- `https://arxiv.bshk.app/data_minilm_384d/` (default, 47MB)
- `https://arxiv.bshk.app/data_nomic_512d/` (63MB)
- `https://arxiv.bshk.app/data_512d/` (63MB, mxbai)

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Embeddings**: transformers.js with WebGPU/WASM backend
- **Index**: USearch with binary quantization (dtype='b1')
- **Reranker**: ms-marco-MiniLM-L-6-v2
- **Hosting**: Cloudflare Pages + R2

## Key Learnings

1. **dtype='b1' not 'i8'**: One parameter changed quality from 26% to 92%
2. **Asymmetric search**: Solves WebGPU/WASM precision mismatches
3. **Reranker beats Int8**: 60MB reranker outperforms 345MB Int8 rescore

## References

- [Embedding Quantization (SBERT)](https://sbert.net/examples/sentence_transformer/applications/embedding-quantization/README.html)
- [Embedding Quantization (Hugging Face)](https://huggingface.co/blog/embedding-quantization)
- [What is Vector Quantization (Milvus)](https://milvus.io/ai-quick-reference/what-is-vector-quantization-in-embeddings)

## License

MIT

## Author

[Aleksandr Beshkenadze](https://github.com/beshkenadze)
