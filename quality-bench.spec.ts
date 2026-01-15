import { test, expect } from '@playwright/test'

interface QueryResult {
  id: string
  query: string
  expected_papers: string[]
  rank: number | null
  searchTime: number
  passed: boolean
}

interface QualityMetrics {
  mrr: number
  recall1: number
  recall5: number
  recall10: number
  avgSearchTime: number
  totalTime: number
}

interface BenchmarkResults {
  metrics: QualityMetrics
  queries: QueryResult[]
}

test.describe('Search Quality Benchmark', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        console.log(`[Browser] ${msg.text()}`)
      }
    })
  })

  test('run quality benchmark', async ({ page }) => {
    await page.goto('/quality-bench.html')
    await expect(page.locator('h1')).toContainText('Search Quality Benchmark')

    console.log('\n🎯 Starting quality benchmark...\n')

    await page.evaluate(() => window.runQualityBenchmark())

    await expect
      .poll(
        async () => await page.evaluate(() => (window as Window).__benchComplete),
        { timeout: 600_000, intervals: [5000] }
      )
      .toBe(true)

    const results: BenchmarkResults = await page.evaluate(() => (window as Window).__qualityResults)

    console.log('\n' + '='.repeat(70))
    console.log('  SEARCH QUALITY BENCHMARK RESULTS')
    console.log('='.repeat(70))

    console.log('\n📊 Aggregate Metrics:')
    console.log(`  MRR (Mean Reciprocal Rank): ${results.metrics.mrr.toFixed(3)}`)
    console.log(`  Recall@1:  ${(results.metrics.recall1 * 100).toFixed(0)}%`)
    console.log(`  Recall@5:  ${(results.metrics.recall5 * 100).toFixed(0)}%`)
    console.log(`  Recall@10: ${(results.metrics.recall10 * 100).toFixed(0)}%`)
    console.log(`  Avg Search Time: ${results.metrics.avgSearchTime}ms`)
    console.log(`  Total Time: ${results.metrics.totalTime}s`)

    console.log('\n📋 Query Results:')
    console.log('-'.repeat(70))

    for (const q of results.queries) {
      const status = q.passed ? '✅' : '❌'
      const rankStr = q.rank ? `#${q.rank}` : 'N/A'
      console.log(`${status} ${q.id}: rank=${rankStr.padEnd(4)} time=${q.searchTime}ms`)
      console.log(`   Query: "${q.query.slice(0, 50)}${q.query.length > 50 ? '...' : ''}"`)
    }

    console.log('-'.repeat(70))

    const passCount = results.queries.filter((q) => q.passed).length
    const totalCount = results.queries.length
    console.log(`\n✨ Pass Rate: ${passCount}/${totalCount} (${((passCount / totalCount) * 100).toFixed(0)}%)`)

    console.log('\n' + '='.repeat(70) + '\n')

    expect(results.metrics.mrr).toBeGreaterThan(0)
    expect(results.metrics.recall10).toBeGreaterThan(0)
  })

  test('run batch benchmark (fast)', async ({ page }) => {
    await page.goto('/quality-bench.html')
    await expect(page.locator('h1')).toContainText('Search Quality Benchmark')

    console.log('\n⚡ Starting BATCH quality benchmark...\n')

    await page.evaluate(() => window.runBatchBenchmark())

    await expect
      .poll(
        async () => await page.evaluate(() => (window as Window).__benchComplete),
        { timeout: 600_000, intervals: [5000] }
      )
      .toBe(true)

    const results: BenchmarkResults = await page.evaluate(() => (window as Window).__qualityResults)

    console.log('\n' + '='.repeat(70))
    console.log('  BATCH BENCHMARK RESULTS')
    console.log('='.repeat(70))

    console.log('\n📊 Aggregate Metrics:')
    console.log(`  MRR (Mean Reciprocal Rank): ${results.metrics.mrr.toFixed(3)}`)
    console.log(`  Recall@1:  ${(results.metrics.recall1 * 100).toFixed(0)}%`)
    console.log(`  Recall@5:  ${(results.metrics.recall5 * 100).toFixed(0)}%`)
    console.log(`  Recall@10: ${(results.metrics.recall10 * 100).toFixed(0)}%`)
    console.log(`  Avg Search Time: ${results.metrics.avgSearchTime}ms`)
    console.log(`  Total Time: ${results.metrics.totalTime}s`)

    console.log('\n📋 Query Results:')
    console.log('-'.repeat(70))

    for (const q of results.queries) {
      const status = q.passed ? '✅' : '❌'
      const rankStr = q.rank ? `#${q.rank}` : 'N/A'
      console.log(`${status} ${q.id}: rank=${rankStr.padEnd(4)} time=${q.searchTime}ms`)
      console.log(`   Query: "${q.query.slice(0, 50)}${q.query.length > 50 ? '...' : ''}"`)
    }

    console.log('-'.repeat(70))

    const passCount = results.queries.filter((q) => q.passed).length
    const totalCount = results.queries.length
    console.log(`\n✨ Pass Rate: ${passCount}/${totalCount} (${((passCount / totalCount) * 100).toFixed(0)}%)`)

    console.log('\n' + '='.repeat(70) + '\n')

    expect(results.metrics.mrr).toBeGreaterThan(0)
    expect(results.metrics.recall10).toBeGreaterThan(0)
  })

  test('load models only', async ({ page }) => {
    await page.goto('/quality-bench.html')

    console.log('\n📦 Loading models...\n')

    await page.evaluate(() => window.loadModelsOnly())

    await expect
      .poll(
        async () => {
          const status = await page.locator('#statusText').textContent()
          return status?.includes('loaded')
        },
        { timeout: 180_000, intervals: [2000] }
      )
      .toBe(true)

    console.log('✅ Models loaded successfully\n')
  })

  // Run specific query IDs via env: QUERY_IDS=q010,q011,q019 bunx playwright test --grep "selected"
  test('run selected queries', async ({ page }) => {
    const queryIds = process.env.QUERY_IDS
    if (!queryIds) {
      console.log('⚠️  Set QUERY_IDS env var (e.g., QUERY_IDS=q010,q011,q019)')
      test.skip()
      return
    }

    await page.goto('/quality-bench.html')
    await expect(page.locator('h1')).toContainText('Search Quality Benchmark')

    console.log(`\n🎯 Running selected queries: ${queryIds}\n`)

    await page.evaluate((ids) => {
      const input = document.getElementById('queryIds') as HTMLInputElement
      input.value = ids
      window.runSelectedQueries()
    }, queryIds)

    await expect
      .poll(
        async () => await page.evaluate(() => (window as Window).__benchComplete),
        { timeout: 300_000, intervals: [2000] }
      )
      .toBe(true)

    const results = await page.evaluate(() => (window as Window).__qualityResults)

    console.log('\n' + '='.repeat(70))
    console.log('  SELECTED QUERIES RESULTS')
    console.log('='.repeat(70))

    for (const q of results.queries) {
      const status = q.passed ? '✅' : '❌'
      const rankStr = q.rank ? `#${q.rank}` : 'N/A'
      console.log(`${status} ${q.id}: rank=${rankStr.padEnd(4)} time=${q.searchTime}ms`)
      console.log(`   Query: "${q.query}"`)
      if (!q.passed) {
        console.log(`   Expected: ${q.expected_papers.join(', ')}`)
      }
    }

    const passCount = results.queries.filter((q) => q.passed).length
    console.log(`\n✨ Result: ${passCount}/${results.queries.length} passed`)
    console.log('='.repeat(70) + '\n')
  })
})

declare global {
  interface Window {
    runQualityBenchmark: () => Promise<void>
    runBatchBenchmark: () => Promise<void>
    runSelectedQueries: () => Promise<void>
    loadModelsOnly: () => Promise<void>
    __benchComplete: boolean
    __qualityResults: BenchmarkResults
  }
}
