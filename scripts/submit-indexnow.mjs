// Submits all URLs from public/sitemap.xml to IndexNow (Bing, Yandex, Seznam, Naver, etc.)
// so search engines are notified instantly instead of waiting for their normal crawl schedule.
//
// Usage:
//   node scripts/submit-indexnow.mjs
//
// Run this any time page content changes (e.g. after a deploy).

import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const HOST = "www.sähkötarkastuksetkallio.fi"
const INDEXNOW_KEY = "9e7abe98f463485da231eda48f837566"
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`

function getUrlsFromSitemap() {
  const sitemapPath = join(__dirname, "..", "public", "sitemap.xml")
  const xml = readFileSync(sitemapPath, "utf-8")
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
  return matches.map((m) => m[1].trim())
}

async function submitToIndexNow(urls) {
  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  }

  console.log(`[indexnow] Submitting ${urls.length} URL(s) for host ${HOST}...`)

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    console.log(`[indexnow] Success (HTTP ${response.status}). URLs submitted:`)
    urls.forEach((u) => console.log(`  - ${u}`))
  } else {
    const text = await response.text().catch(() => "")
    console.error(`[indexnow] Failed (HTTP ${response.status}): ${text}`)
    process.exitCode = 1
  }
}

const urls = getUrlsFromSitemap()
if (urls.length === 0) {
  console.error("[indexnow] No URLs found in sitemap.xml")
  process.exitCode = 1
} else {
  await submitToIndexNow(urls)
}
