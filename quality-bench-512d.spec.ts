import { test, expect } from '@playwright/test'

test.describe('512d Quality Benchmark', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        console.log(`[Browser] ${msg.text()}`)
      }
    })
  })

  test('run hard queries with 512d', async ({ page }) => {
    await page.goto('/quality-bench-512d.html')
    await expect(page.locator('h1')).toContainText('512d')

    console.log('\n🎯 Testing HARD queries with 512d embeddings...\n')
    console.log('Hard queries: q011 (QLoRA), q019 (When Not to Trust), q036 (LLaVA)\n')

    // Set the hard query IDs
    await page.fill('#queryIds', 'q011,q019,q036')

    await page.evaluate(() => window.runSelectedQueries())

    await expect
      .poll(
        async () => await page.evaluate(() => (window as Window).__benchComplete),
        { timeout: 300_000, intervals: [2000] }
      )
      .toBe(true)

    const results = await page.evaluate(() => (window as Window).__qualityResults)

    console.log('\n' + '='.repeat(70))
    console.log('  512d HARD QUERIES RESULTS')
    console.log('='.repeat(70))

    for (const q of results.queries) {
      const status = q.passed ? '✅ PASS' : '❌ FAIL'
      const rankStr = q.rank ? `#${q.rank}` : 'NOT FOUND'
      console.log(`\n${status} ${q.id}: rank=${rankStr}, time=${q.searchTime}ms`)
      console.log(`   Query: "${q.query}"`)
      console.log(`   Expected: ${q.expected_papers.join(', ')}`)
      if (q.results) {
        console.log(`   Top 3: ${q.results.slice(0, 3).map((r: {arxiv_id: string}) => r.arxiv_id).join(', ')}`)
      }
    }

    const passCount = results.queries.filter((q: {passed: boolean}) => q.passed).length
    console.log(`\n${'='.repeat(70)}`)
    console.log(`✨ Result: ${passCount}/3 hard queries passed with 512d`)
    console.log('='.repeat(70) + '\n')
  })

  test('run full benchmark 512d', async ({ page }) => {
    await page.goto('/quality-bench-512d.html')
    await expect(page.locator('h1')).toContainText('512d')

    console.log('\n⚡ Running FULL benchmark with 512d...\n')

    await page.evaluate(() => window.runBatchBenchmark())

    await expect
      .poll(
        async () => await page.evaluate(() => (window as Window).__benchComplete),
        { timeout: 600_000, intervals: [5000] }
      )
      .toBe(true)

    const results = await page.evaluate(() => (window as Window).__qualityResults)

    console.log('\n' + '='.repeat(70))
    console.log('  512d FULL BENCHMARK RESULTS')
    console.log('='.repeat(70))

    console.log('\n📊 Aggregate Metrics:')
    console.log(`  MRR: ${results.metrics.mrr.toFixed(3)}`)
    console.log(`  Recall@1:  ${(results.metrics.recall1 * 100).toFixed(0)}%`)
    console.log(`  Recall@5:  ${(results.metrics.recall5 * 100).toFixed(0)}%`)
    console.log(`  Recall@10: ${(results.metrics.recall10 * 100).toFixed(0)}%`)
    console.log(`  Avg Search: ${results.metrics.avgSearchTime}ms`)

    // Show failures
    const failures = results.queries.filter((q: {passed: boolean}) => !q.passed)
    if (failures.length > 0) {
      console.log('\n❌ Failed queries:')
      for (const q of failures) {
        console.log(`  ${q.id}: "${q.query.slice(0, 40)}..."`)
        console.log(`    Expected: ${q.expected_papers.join(', ')}`)
      }
    }

    const passCount = results.queries.filter((q: {passed: boolean}) => q.passed).length
    console.log(`\n✨ Pass Rate: ${passCount}/${results.queries.length} (${((passCount / results.queries.length) * 100).toFixed(0)}%)`)
    console.log('='.repeat(70) + '\n')

    expect(results.metrics.recall10).toBeGreaterThan(0.8)
  })
})

declare global {
  interface Window {
    runQualityBenchmark: () => Promise<void>
    runBatchBenchmark: () => Promise<void>
    runSelectedQueries: () => Promise<void>
    loadModelsOnly: () => Promise<void>
    __benchComplete: boolean
    __qualityResults: {
      metrics: {
        mrr: number
        recall1: number
        recall5: number
        recall10: number
        avgSearchTime: number
        totalTime: number
      }
      queries: Array<{
        id: string
        query: string
        expected_papers: string[]
        rank: number | null
        searchTime: number
        passed: boolean
        results?: Array<{arxiv_id: string; title: string; score: number}>
      }>
    }
  }
}
