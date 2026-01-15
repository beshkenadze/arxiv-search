#!/usr/bin/env python3
"""Search arxiv metadata for papers by keyword."""

import json
import sys
from pathlib import Path

METADATA_PATH = Path(__file__).parent.parent / "public" / "data" / "metadata.json"
AI_CATEGORIES = {"cs.CL", "cs.LG", "cs.AI", "cs.IR", "cs.CV"}


def load_metadata():
    with open(METADATA_PATH) as f:
        return json.load(f)


def search(keyword: str, limit: int = 20, ai_only: bool = True):
    """Search papers by keyword in title."""
    data = load_metadata()
    keyword_lower = keyword.lower()

    results = []
    for paper in data:
        if keyword_lower in paper["title"].lower():
            if ai_only:
                cats = set(paper["categories"].split())
                if not cats & AI_CATEGORIES:
                    continue
            results.append(paper)
            if len(results) >= limit:
                break

    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python search_papers.py <keyword> [limit]")
        print("\nExamples:")
        print("  python search_papers.py 'retrieval augmented'")
        print("  python search_papers.py 'fine-tuning' 50")
        print("  python search_papers.py 'llama' 30")
        sys.exit(1)

    keyword = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20

    results = search(keyword, limit)

    print(f"\n{'='*80}")
    print(f"Found {len(results)} papers matching '{keyword}'")
    print(f"{'='*80}\n")

    for p in results:
        print(f"arxiv_id: {p['arxiv_id']}")
        print(f"title: {p['title']}")
        print(f"categories: {p['categories']}")
        print("-" * 40)


if __name__ == "__main__":
    main()
