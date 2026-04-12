import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ADMIN_EMAIL = "petri4215@gmail.com"

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

  // Vercel speed insights
  const vercelToken = process.env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_ACCES_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  // Generate mock data with optional Vercel web vitals
  const mockData = generateMockData(period)

  // Try to fetch Vercel web vitals if configured
  if (vercelToken && projectId) {
    try {
      const webVitals = await fetchVercelWebVitals(
        vercelToken,
        projectId,
        teamId,
        period
      )
      mockData.webVitals = webVitals
      return NextResponse.json({
        configured: true,
        period,
        mockData,
      })
    } catch (e) {
      console.error("Vercel vitals error:", e)
    }
  }

  return NextResponse.json({
    configured: false,
    period,
    mockData,
  })
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
