import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"

const ADMIN_EMAIL = "admin@admin.fi"
const GA4_PROPERTY_ID = "532409803"

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "30d"

  // Vercel speed insights (pysyy samana)
  const vercelToken = process.env.VERCEL_ACCESS_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  // GA4 service account key (JSON string ympäristömuuttujana)
  const ga4KeyJson = process.env.GA4_SERVICE_ACCOUNT_KEY

  if (!ga4KeyJson) {
    return NextResponse.json({
      configured: false,
      message: "Aseta GA4_SERVICE_ACCOUNT_KEY ympäristömuuttuja Vercelissä.",
      mockData: generateMockData(period),
    })
  }

  try {
    // Parsitaan service account key
    const serviceAccountKey = JSON.parse(ga4KeyJson)

    // Google Auth
    const auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    })
    const authClient = await auth.getClient()
    const accessToken = await authClient.getAccessToken()

    // GA4 date range
    const dateRange = periodToDateRange(period)

    // GA4 Data API request
    const ga4Response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [dateRange],
          dimensions: [{ name: "date" }, { name: "pagePath" }],
          metrics: [
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 1000,
        }),
      }
    )

    if (!ga4Response.ok) {
      const err = await ga4Response.text()
      console.error("GA4 API error:", ga4Response.status, err)
      throw new Error(`GA4 API ${ga4Response.status}: ${err}`)
    }

    const ga4Data = await ga4Response.json()

    // Prosessoidaan GA4 data
    const processed = processGA4Data(ga4Data, period)

    // Haetaan Vercel web vitals jos configuroitu
    let webVitals = generateMockWebVitals()
    if (vercelToken && projectId) {
      try {
        webVitals = await fetchVercelWebVitals(
          vercelToken,
          projectId,
          teamId,
          period
        )
      } catch (e) {
        console.error("Vercel vitals error:", e)
      }
    }

    return NextResponse.json({
      configured: true,
      period,
      mockData: {
        ...processed,
        webVitals,
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Tuntematon virhe",
      mockData: generateMockData(period),
    })
  }
}

function periodToDateRange(period: string) {
  switch (period) {
    case "24h":
      return { startDate: "today", endDate: "today" }
    case "7d":
      return { startDate: "7daysAgo", endDate: "today" }
    case "30d":
    default:
      return { startDate: "30daysAgo", endDate: "today" }
  }
}

function processGA4Data(data: any, period: string) {
  if (!data.rows || data.rows.length === 0) {
    return generateMockData(period)
  }

  // Aggregoi per päivä
  const dailyMap: Record<
    string,
    { visitors: number; pageViews: number }
  > = {}
  const pageMap: Record<string, number> = {}

  let totalSessions = 0
  let totalPageViews = 0
  let totalBounceRate = 0
  let totalDuration = 0
  let rowCount = 0

  for (const row of data.rows) {
    const date = row.dimensionValues[0].value // YYYYMMDD
    const pagePath = row.dimensionValues[1].value
    const sessions = parseInt(row.metricValues[0].value) || 0
    const pageViews = parseInt(row.metricValues[1].value) || 0
    const bounceRate = parseFloat(row.metricValues[2].value) || 0
    const duration = parseFloat(row.metricValues[3].value) || 0

    // Daily data
    const dateFormatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
    if (!dailyMap[dateFormatted]) {
      dailyMap[dateFormatted] = { visitors: 0, pageViews: 0 }
    }
    dailyMap[dateFormatted].visitors += sessions
    dailyMap[dateFormatted].pageViews += pageViews

    // Top pages
    pageMap[pagePath] = (pageMap[pagePath] || 0) + pageViews

    totalSessions += sessions
    totalPageViews += pageViews
    totalBounceRate += bounceRate
    totalDuration += duration
    rowCount++
  }

  const avgBounce =
    rowCount > 0 ? Math.round((totalBounceRate / rowCount) * 100) : 0
  const avgDurationSec =
    rowCount > 0 ? Math.round(totalDuration / rowCount) : 0
  const durationMin = Math.floor(avgDurationSec / 60)
  const durationSec = avgDurationSec % 60

  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }))

  const totalPV = Object.values(pageMap).reduce((a, b) => a + b, 0)
  const topPages = Object.entries(pageMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path, views]) => ({
      path,
      views,
      percentage: totalPV > 0 ? Math.round((views / totalPV) * 100) : 0,
    }))

  return {
    summary: {
      totalVisitors: totalSessions,
      totalPageViews,
      avgSessionDuration: `${durationMin}m ${durationSec}s`,
      bounceRate: `${avgBounce}%`,
    },
    dailyData,
    topPages,
    webVitals: generateMockWebVitals(),
  }
}

async function fetchVercelWebVitals(
  token: string,
  projectId: string,
  teamId: string | undefined,
  period: string
) {
  const now = new Date()
  const days = period === "30d" ? 30 : period === "7d" ? 7 : 1
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const teamQuery = teamId ? `&teamId=${teamId}` : ""

  const res = await fetch(
    `https://vercel.com/api/web/insights/vitals?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}${teamQuery}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) throw new Error(`Vercel vitals ${res.status}`)

  const vitalsData = await res.json()

  // Muunna Vercel vitals formaatti
  const vitals = vitalsData?.data || {}
  return {
    lcp: {
      value: vitals.lcp?.p75 ? Math.round(vitals.lcp.p75) / 1000 : 1.8,
      rating: rateVital("lcp", vitals.lcp?.p75 || 1800),
    },
    fid: {
      value: vitals.fid?.p75 ? Math.round(vitals.fid.p75) : 12,
      rating: rateVital("fid", vitals.fid?.p75 || 12),
    },
    cls: {
      value: vitals.cls?.p75 ? Math.round(vitals.cls.p75 * 1000) / 1000 : 0.05,
      rating: rateVital("cls", vitals.cls?.p75 || 0.05),
    },
    fcp: {
      value: vitals.fcp?.p75 ? Math.round(vitals.fcp.p75) / 1000 : 1.2,
      rating: rateVital("fcp", vitals.fcp?.p75 || 1200),
    },
    ttfb: {
      value: vitals.ttfb?.p75 ? Math.round(vitals.ttfb.p75) / 1000 : 0.4,
      rating: rateVital("ttfb", vitals.ttfb?.p75 || 400),
    },
  }
}

function rateVital(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, [number, number]> = {
    lcp: [2500, 4000],
    fid: [100, 300],
    cls: [0.1, 0.25],
    fcp: [1800, 3000],
    ttfb: [800, 1800],
  }
  const [good, poor] = thresholds[name] || [1000, 2000]
  if (value <= good) return "good"
  if (value <= poor) return "needs-improvement"
  return "poor"
}

function generateMockWebVitals() {
  return {
    lcp: { value: 1.8, rating: "good" },
    fid: { value: 12, rating: "good" },
    cls: { value: 0.05, rating: "good" },
    fcp: { value: 1.2, rating: "good" },
    ttfb: { value: 0.4, rating: "good" },
  }
}

function generateMockData(period: string) {
  const days = period === "30d" ? 30 : period === "7d" ? 7 : 1
  const baseVisitors = 45
  const basePageViews = 120

  const dailyData = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const randomMultiplier = 0.8 + Math.random() * 0.4
    dailyData.push({
      date: date.toISOString().split("T")[0],
      visitors: Math.round(baseVisitors * randomMultiplier),
      pageViews: Math.round(basePageViews * randomMultiplier),
    })
  }

  return {
    summary: {
      totalVisitors: dailyData.reduce((sum, d) => sum + d.visitors, 0),
      totalPageViews: dailyData.reduce((sum, d) => sum + d.pageViews, 0),
      avgSessionDuration: "2m 34s",
      bounceRate: "42%",
    },
    dailyData,
    topPages: [
      {
        path: "/",
        views: Math.round(basePageViews * days * 0.4),
        percentage: 40,
      },
      {
        path: "/sahkotarkastukset.html",
        views: Math.round(basePageViews * days * 0.25),
        percentage: 25,
      },
      {
        path: "/maaraaikaistarkastukset.html",
        views: Math.round(basePageViews * days * 0.2),
        percentage: 20,
      },
      {
        path: "/admin",
        views: Math.round(basePageViews * days * 0.1),
        percentage: 10,
      },
    ],
    webVitals: generateMockWebVitals(),
  }
}