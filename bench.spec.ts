import { test, expect } from '@playwright/test'

// Increase timeout for model loading
test.setTimeout(300_000) // 5 minutes

test.describe('Edge Model Benchmark', () => {
  test.beforeEach(async ({ page }) => {
    // Listen to console for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        console.log(`[Browser] ${msg.text()}`)
      }
    })
  })

  test('benchmark all models', async ({ page }) => {
    await page.goto('/bench.html')
    await expect(page.locator('h1')).toContainText('Edge Model Benchmark')

    // Run all benchmarks
    console.log('\n📊 Starting benchmark...\n')
    await page.evaluate(() => window.runAllBenchmarks())

    // Wait for completion (poll every 2s, max 5min)
    await expect
      .poll(
        async () => {
          return await page.evaluate(() => (window as any).__benchComplete)
        },
        { timeout: 300_000, intervals: [2000] }
      )
      .toBe(true)

    // Get results
    const embedderResults = await page.evaluate(() => (window as any).__embedderResults)
    const rerankerResults = await page.evaluate(() => (window as any).__rerankerResults)

    console.log('\n=== EMBEDDER RESULTS ===')
    console.table(
      Object.entries(embedderResults).map(([id, r]: [string, any]) => ({
        model: id,
        loadMs: r.loadTime || 'error',
        encodeMs: r.encodeTime || '-',
        dims: r.dims || '-',
        first5: r.first5 ? r.first5.map((v: number) => v.toFixed(3)).join(', ') : '-',
      }))
    )

    console.log('\n=== RERANKER RESULTS ===')
    console.table(
      Object.entries(rerankerResults).map(([id, r]: [string, any]) => ({
        model: id,
        loadMs: r.loadTime || 'error',
        rerankMs: r.rerankTime || '-',
        scores: r.scores ? r.scores.map((v: number) => v.toFixed(3)).join(', ') : '-',
      }))
    )

    // Basic assertions
    expect(Object.keys(embedderResults).length).toBeGreaterThan(0)
    expect(Object.keys(rerankerResults).length).toBeGreaterThan(0)

    // Check embedders produced valid output
    for (const [id, result] of Object.entries(embedderResults) as [string, any][]) {
      if (!result.error) {
        expect(result.dims).toBeGreaterThan(0)
        expect(result.first5).toHaveLength(5)
        console.log(`✅ ${id}: ${result.dims}d, load=${result.loadTime}ms, encode=${result.encodeTime}ms`)
      } else {
        console.log(`❌ ${id}: ${result.error}`)
      }
    }

    // Check rerankers produced valid scores
    for (const [id, result] of Object.entries(rerankerResults) as [string, any][]) {
      if (!result.error) {
        expect(result.scores).toHaveLength(4) // 4 test docs
        // First doc should score higher than second (weather)
        expect(result.scores[0]).toBeGreaterThan(result.scores[1])
        console.log(`✅ ${id}: load=${result.loadTime}ms, rerank=${result.rerankTime}ms`)
      } else {
        console.log(`❌ ${id}: ${result.error}`)
      }
    }
  })

  test('embedder comparison', async ({ page }) => {
    await page.goto('/bench.html')

    console.log('\n📊 Testing embedders only...\n')
    await page.evaluate(() => window.runEmbedderBenchmarks())

    // Wait for embedder results
    await expect
      .poll(
        async () => {
          const r = await page.evaluate(() => (window as any).__embedderResults)
          return r && Object.keys(r).length === 3
        },
        { timeout: 180_000, intervals: [2000] }
      )
      .toBe(true)

    const results = await page.evaluate(() => (window as any).__embedderResults)

    // Compare dimensions
    console.log('\n=== EMBEDDER COMPARISON ===')
    for (const [id, r] of Object.entries(results) as [string, any][]) {
      if (r.dims) {
        console.log(`${id}: ${r.dims}d, first5=[${r.first5.map((v: number) => v.toFixed(4)).join(', ')}]`)
      }
    }

    // xsmall and minilm should both be 384d
    if (results['mxbai-xsmall']?.dims && results['minilm-l6']?.dims) {
      expect(results['mxbai-xsmall'].dims).toBe(384)
      expect(results['minilm-l6'].dims).toBe(384)
    }
  })

  test('reranker score sanity check', async ({ page }) => {
    await page.goto('/bench.html')

    console.log('\n📊 Testing rerankers only...\n')
    await page.evaluate(() => window.runRerankerBenchmarks())

    // Wait for reranker results
    await expect
      .poll(
        async () => {
          const r = await page.evaluate(() => (window as any).__rerankerResults)
          return r && Object.keys(r).length === 3
        },
        { timeout: 180_000, intervals: [2000] }
      )
      .toBe(true)

    const results = await page.evaluate(() => (window as any).__rerankerResults)

    // For query "binary quantization for vector search":
    // Doc 0 (binary quant) and Doc 3 (hamming) should score high
    // Doc 1 (weather) should score lowest
    console.log('\n=== RERANKER SCORE SANITY ===')
    for (const [id, r] of Object.entries(results) as [string, any][]) {
      if (r.scores) {
        const [binaryQuant, weather, pq, hamming] = r.scores
        console.log(`${id}:`)
        console.log(`  Binary Quant: ${binaryQuant.toFixed(4)}`)
        console.log(`  Weather:      ${weather.toFixed(4)} (should be lowest)`)
        console.log(`  PQ:           ${pq.toFixed(4)}`)
        console.log(`  Hamming:      ${hamming.toFixed(4)}`)

        // Weather should be lowest
        expect(weather).toBeLessThan(binaryQuant)
        expect(weather).toBeLessThan(hamming)
      }
    }
  })
})

declare global {
  interface Window {
    runAllBenchmarks: () => Promise<void>
    runEmbedderBenchmarks: () => Promise<any>
    runRerankerBenchmarks: () => Promise<any>
    __benchComplete: boolean
    __embedderResults: any
    __rerankerResults: any
  }
}
