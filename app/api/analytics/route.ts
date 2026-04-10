import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ADMIN_EMAIL = "admin@admin.fi"
const VERCEL_API_BASE = "https://vercel.com/api"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "24h"

  // Korjattu: oikea env var nimi
  const vercelToken = process.env.VERCEL_ACCESS_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID // tarvitaan jos projekti on tiimin alla

  if (!vercelToken || !projectId) {
    return NextResponse.json({
      configured: false,
      message: "Aseta VERCEL_ACCESS_TOKEN ja VERCEL_PROJECT_ID ympäristömuuttujiin.",
      mockData: generateMockData(period),
    })
  }

  try {
    const now = new Date()
    let from: Date

    switch (period) {
      case "7d":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const fromTs = from.getTime()
    const toTs = now.getTime()

    // Oikeat Vercel Analytics Web Insights endpointit
    const teamQuery = teamId ? `&teamId=${teamId}` : ""

    const [pageviewsRes, referrersRes] = await Promise.all([
      fetch(
        `${VERCEL_API_BASE}/web/insights/pageviews?projectId=${projectId}&from=${fromTs}&to=${toTs}&period=${period}${teamQuery}`,
        { headers: { Authorization: `Bearer ${vercelToken}` } }
      ),
      fetch(
        `${VERCEL_API_BASE}/web/insights/referrers?projectId=${projectId}&from=${fromTs}&to=${toTs}&limit=5${teamQuery}`,
        { headers: { Authorization: `Bearer ${vercelToken}` } }
      ),
    ])

    if (!pageviewsRes.ok) {
      const err = await pageviewsRes.text()
      console.error("Vercel Analytics error:", pageviewsRes.status, err)
      throw new Error(`Vercel API ${pageviewsRes.status}: ${err}`)
    }

    const pageviewsData = await pageviewsRes.json()
    const referrersData = referrersRes.ok ? await referrersRes.json() : null

    return NextResponse.json({
      configured: true,
      period,
      pageViews: pageviewsData,
      referrers: referrersData,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Tuntematon virhe",
      mockData: generateMockData(period),
    })
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
      { path: "/", views: Math.round(basePageViews * days * 0.4), percentage: 40 },
      { path: "/sahkotarkastukset.html", views: Math.round(basePageViews * days * 0.25), percentage: 25 },
      { path: "/maaraaikaistarkastukset.html", views: Math.round(basePageViews * days * 0.2), percentage: 20 },
      { path: "/admin", views: Math.round(basePageViews * days * 0.1), percentage: 10 },
    ],
    webVitals: {
      lcp: { value: 1.8, rating: "good" },
      fid: { value: 12, rating: "good" },
      cls: { value: 0.05, rating: "good" },
      fcp: { value: 1.2, rating: "good" },
      ttfb: { value: 0.4, rating: "good" },
    },
  }
}