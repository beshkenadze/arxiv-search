# Task: Generate Question-Paper Pairs for Retrieval Benchmark

## Context

You are creating a benchmark dataset to evaluate semantic search quality over arXiv papers. The goal is to generate natural language queries paired with ground-truth papers that MUST appear in top-10 results.

## Constraints

- **Index contains only papers from 2022 onwards** (1M+ papers)
- Papers before 2022 (BERT, GPT-3, LoRA original, etc.) are NOT in the index
- Each query should have 1-3 expected papers (papers that MUST be found)

## Available Papers (Examples)

These foundational papers ARE in the index:

| arxiv_id | Title |
|----------|-------|
| 1706.03762 | Attention Is All You Need |
| 2303.08774 | GPT-4 Technical Report |
| 2302.13971 | LLaMA: Open and Efficient Foundation Language Models |
| 2307.09288 | Llama 2: Open Foundation and Fine-Tuned Chat Models |
| 2203.02155 | Training language models to follow instructions with human feedback (InstructGPT) |
| 2305.14314 | QLoRA: Efficient Finetuning of Quantized LLMs |
| 2312.10997 | Retrieval-Augmented Generation for Large Language Models: A Survey |
| 2210.11416 | Scaling Instruction-Finetuned Language Models (FLAN-T5) |

## Output Format

Generate a JSON file with this structure:

```json
{
  "version": "1.0",
  "description": "Benchmark queries for arxiv semantic search",
  "queries": [
    {
      "id": "q001",
      "query": "efficient fine-tuning large language models with quantization",
      "expected_papers": ["2305.14314"],
      "category": "fine-tuning",
      "difficulty": "easy"
    },
    {
      "id": "q002",
      "query": "how to train LLMs to follow human instructions",
      "expected_papers": ["2203.02155"],
      "category": "alignment",
      "difficulty": "medium"
    }
  ]
}
```

## Query Categories to Cover

Generate queries across these categories (aim for 50-100 total):

| Category | Target Count | Example Topics |
|----------|--------------|----------------|
| `llm-architecture` | 10-15 | Transformers, attention, model scaling |
| `fine-tuning` | 10-15 | LoRA, QLoRA, PEFT, adapter methods |
| `rag` | 10-15 | Retrieval augmented generation, dense retrieval |
| `alignment` | 8-12 | RLHF, instruction tuning, safety |
| `efficiency` | 8-12 | Quantization, pruning, distillation |
| `multimodal` | 5-8 | Vision-language, image generation |
| `evaluation` | 5-8 | Benchmarks, metrics, leaderboards |

## Query Design Guidelines

### Good Queries (Natural, Diverse)
- "how to fine-tune large models with limited GPU memory"
- "open source alternative to GPT-4"
- "retrieval augmented generation survey"
- "training language models with human feedback"

### Bad Queries (Too Exact)
- "QLoRA paper" (just searching for title)
- "arxiv 2305.14314" (ID lookup)
- "LLaMA 2 Meta AI" (brand name search)

### Difficulty Levels
- **easy**: Query closely matches paper title/abstract
- **medium**: Query describes concept, paper is relevant
- **hard**: Query is indirect, requires understanding

## How to Find Papers

1. Search the metadata for papers with relevant keywords in titles
2. Focus on papers with clear, descriptive titles
3. Prefer papers that are well-known in the ML community
4. Verify the arxiv_id exists in the index

## Metadata Access

The metadata is at: `browser_demo/public/data/metadata.json`

Structure:
```json
[
  {
    "arxiv_id": "2305.14314",
    "title": "QLoRA: Efficient Finetuning of Quantized LLMs",
    "categories": "cs.LG cs.CL"
  }
]
```

Filter for AI/ML categories: `cs.CL`, `cs.LG`, `cs.AI`, `cs.IR`, `cs.CV`

## Deliverable

Create file: `browser_demo/benchmark/test_queries.json`

With 50-100 diverse queries covering all categories above.
