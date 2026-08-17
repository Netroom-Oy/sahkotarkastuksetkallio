// Submits all URLs from public/sitemap.xml to IndexNow (Bing, Yandex, Seznam, Naver, etc.)
// so search engines are notified instantly instead of waiting for their normal crawl schedule.
//
// Usage:
//   node scripts/submit-indexnow.mjs
//
// Run this any time page content changes (e.g. after a deploy).
//
// Note on the internationalized (ä/ö) domain: IndexNow validates that every
// submitted URL belongs to `host`. To keep host and urlList in a single,
// unambiguous form we normalize everything through the WHATWG URL parser,
// which converts the hostname to its ASCII/punycode form
// (www.sähkötarkastuksetkallio.fi -> www.xn--shtarkastuksetkallio-51b03b.fi)
// and percent-encodes paths. This avoids the Unicode-vs-punycode mismatch that
// can otherwise trigger 403/422 responses.

import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Unicode form (human readable) — used only as the source of truth.
const UNICODE_HOST = "www.sähkötarkastuksetkallio.fi"

// ASCII/punycode form derived from the Unicode host. Both `host` and every URL
// we submit use this same form so IndexNow's ownership check always matches.
const HOST = new URL(`https://${UNICODE_HOST}/`).hostname

const INDEXNOW_KEY = "9850dcd005314a2889330bbb508ff5ed"
const HOST = "www.sähkötarkastuksetkallio.fi"
const INDEXNOW_KEY = "6c49cd210a6c4d57bdbaa813b8d93d5f"
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`

function getUrlsFromSitemap() {
  const sitemapPath = join(__dirname, "..", "public", "sitemap.xml")
  const xml = readFileSync(sitemapPath, "utf-8")
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
  // Normalize each URL: hostname -> punycode, path -> percent-encoded.
  return matches.map((m) => new URL(m[1].trim()).href)
}

async function submitToIndexNow(urls, { maxRetries = 3 } = {}) {
  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  }

  console.log(`[indexnow] Submitting ${urls.length} URL(s) for host ${HOST}...`)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      console.log(`[indexnow] Success (HTTP ${response.status}). URLs submitted:`)
      urls.forEach((u) => console.log(`  - ${u}`))
      return
    }

    // Retry only on 429 (rate limit) with exponential backoff.
    if (response.status === 429 && attempt < maxRetries) {
      const waitMs = 2000 * attempt
      console.warn(`[indexnow] Rate limited (HTTP 429). Retrying in ${waitMs}ms (attempt ${attempt}/${maxRetries})...`)
      await new Promise((r) => setTimeout(r, waitMs))
      continue
    }

    const text = await response.text().catch(() => "")
    console.error(`[indexnow] Failed (HTTP ${response.status}): ${text}`)
    process.exitCode = 1
    return
  }
}

const urls = getUrlsFromSitemap()
if (urls.length === 0) {
  console.error("[indexnow] No URLs found in sitemap.xml")
  process.exitCode = 1
} else {
  await submitToIndexNow(urls)
}
