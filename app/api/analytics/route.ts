import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ADMIN_EMAIL = "petri4215@gmail.com"

// Vercel Analytics API endpoint
const VERCEL_API_BASE = "https://api.vercel.com"

export async function GET(request: Request) {
  // Verify admin authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "24h"

  // Check for required environment variables (note: env var is VERCEL_ACCES_TOKEN with typo)
  const vercelToken = process.env.VERCEL_ACCES_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID

  if (!vercelToken || !projectId) {
    // Return mock data if Vercel Analytics is not configured
    return NextResponse.json({
      configured: false,
      message: "Vercel Analytics not configured. Set VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID.",
      mockData: generateMockData(period),
    })
  }

  try {
    // Calculate date range based on period
    const now = new Date()
    let from: Date

    switch (period) {
      case "7d":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "24h":
      default:
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Fetch page views
    const pageViewsResponse = await fetch(
      `${VERCEL_API_BASE}/${projectId}/data/pageviews?from=${from.toISOString()}&to=${now.toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    )

    // Fetch Web Vitals
    const webVitalsResponse = await fetch(
      `${VERCEL_API_BASE}/${projectId}/data/rum?from=${from.toISOString()}&to=${now.toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    )

    if (!pageViewsResponse.ok || !webVitalsResponse.ok) {
      throw new Error("Failed to fetch Vercel Analytics data")
    }

    const pageViewsData = await pageViewsResponse.json()
    const webVitalsData = await webVitalsResponse.json()

    return NextResponse.json({
      configured: true,
      period,
      pageViews: pageViewsData,
      webVitals: webVitalsData,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({
      configured: false,
      error: "Failed to fetch analytics",
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
