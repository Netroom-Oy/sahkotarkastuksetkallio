"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface AnalyticsData {
  configured: boolean
  message?: string
  mockData?: {
    summary: {
      totalVisitors: number
      totalPageViews: number
      avgSessionDuration: string
      bounceRate: string
    }
    dailyData: Array<{ date: string; visitors: number; pageViews: number }>
    topPages: Array<{ path: string; views: number; percentage: number }>
    webVitals: {
      lcp: { value: number; rating: string }
      fid: { value: number; rating: string }
      cls: { value: number; rating: string }
      fcp: { value: number; rating: string }
      ttfb: { value: number; rating: string }
    }
  }
}

export default function AdminDashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState("30d")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics?period=${period}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }, [period])

  useEffect(() => {
    if (!isLoading && userEmail) {
      fetchAnalytics()
    }
  }, [isLoading, userEmail, fetchAnalytics])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div style={{ color: "#facc15", fontSize: "1.25rem" }}>Ladataan...</div>
      </div>
    )
  }

  const data = analytics?.mockData

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1a",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header
        style={{
          background: "#111827",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#facc15"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span
              style={{
                color: "#f8fafc",
                fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              Sähkötarkastukset Kallio
            </span>
            <span style={{ color: "#64748b", marginLeft: "0.5rem" }}>
              — Hallintapaneeli
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              {userEmail}
            </span>
            <button
              onClick={() => setShowPasswordModal(true)}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                border: "1px solid rgba(250, 204, 21, 0.4)",
                color: "#facc15",
                borderRadius: "8px",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Vaihda salasana
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#94a3b8",
                borderRadius: "8px",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Kirjaudu ulos
            </button>
          </div>

          {/* Password Change Modal */}
          {showPasswordModal && (
            <PasswordModal onClose={() => setShowPasswordModal(false)} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        {/* Period Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              color: "#f8fafc",
              fontSize: "1.5rem",
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.025em",
            }}
          >
            Kävijäanalyysi
          </h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["24h", "7d", "30d"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "0.5rem 1rem",
                  background: period === p ? "#facc15" : "transparent",
                  color: period === p ? "#0a0f1a" : "#94a3b8",
                  border: period === p ? "none" : "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p === "24h" ? "24 tuntia" : p === "7d" ? "7 päivää" : "30 päivää"}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Status Banner */}
        {analytics && !analytics.configured && (
          <div
            style={{
              background: "rgba(250, 204, 21, 0.1)",
              border: "1px solid rgba(250, 204, 21, 0.3)",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <p style={{ color: "#facc15", fontSize: "0.875rem", margin: 0 }}>
              <strong>Huom:</strong> Näytetään esimerkkiratioituja. Vercel Analytics API:n asetukset voivat vaatia lisäkonfiguraatiota Vercel-projektissasi.
            </p>
          </div>
        )}

        {/* Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <MetricCard
            label={`Kävijät (${period})`}
            value={data?.summary.totalVisitors.toLocaleString() || "—"}
            trend="+24.5%"
            isPositive={true}
          />
          <MetricCard
            label="Sivulataukset"
            value={data?.summary.totalPageViews.toLocaleString() || "—"}
            trend="+18.2%"
            isPositive={true}
          />
          <MetricCard
            label="Bounce Rate"
            value={data?.summary.bounceRate || "—"}
            trend="-5.1%"
            isPositive={true}
          />
          <MetricCard
            label="Keskim. kesto"
            value={data?.summary.avgSessionDuration || "—"}
            trend="+12.8%"
            isPositive={true}
          />
        </div>

        {/* Visitor Chart */}
        <div
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "1rem",
            }}
          >
            Päivittäiset kävijät
          </h3>
          <div style={{ height: "256px" }}>
            {data?.dailyData && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.dailyData.map((d) => ({
                    day: new Date(d.date).toLocaleDateString("fi-FI", {
                      day: "numeric",
                      month: "numeric",
                    }),
                    visitors: d.visitors,
                  }))}
                >
                  <defs>
                    <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#facc15"
                    strokeWidth={2}
                    fill="url(#yellowGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Pages Table */}
        <div
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "1rem",
            }}
          >
            Suosituimmat sivut
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "0.875rem",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <th style={{ paddingBottom: "0.75rem", fontWeight: 500 }}>Sivu</th>
                  <th
                    style={{
                      paddingBottom: "0.75rem",
                      fontWeight: 500,
                      textAlign: "right",
                    }}
                  >
                    Katselut
                  </th>
                  <th
                    style={{
                      paddingBottom: "0.75rem",
                      fontWeight: 500,
                      textAlign: "right",
                    }}
                  >
                    % osuus
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.topPages.map((page) => (
                  <tr
                    key={page.path}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 0",
                        color: "#f8fafc",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                      }}
                    >
                      {page.path}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0",
                        color: "#94a3b8",
                        textAlign: "right",
                      }}
                    >
                      {page.views.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 0",
                        color: "#94a3b8",
                        textAlign: "right",
                      }}
                    >
                      {page.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Speed Insights Section */}
        <h2
          style={{
            color: "#f8fafc",
            fontSize: "1.25rem",
            fontWeight: 700,
            fontFamily: "'Barlow Condensed', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.025em",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#facc15"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Sivun nopeus
        </h2>

        {/* Core Web Vitals */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {data?.webVitals && (
            <>
              <VitalCard
                label="LCP"
                value={`${data.webVitals.lcp.value}s`}
                status={data.webVitals.lcp.rating as "good" | "needs-improvement" | "poor"}
              />
              <VitalCard
                label="FID"
                value={`${data.webVitals.fid.value}ms`}
                status={data.webVitals.fid.rating as "good" | "needs-improvement" | "poor"}
              />
              <VitalCard
                label="CLS"
                value={data.webVitals.cls.value.toString()}
                status={data.webVitals.cls.rating as "good" | "needs-improvement" | "poor"}
              />
              <VitalCard
                label="FCP"
                value={`${data.webVitals.fcp.value}s`}
                status={data.webVitals.fcp.rating as "good" | "needs-improvement" | "poor"}
              />
              <VitalCard
                label="TTFB"
                value={`${data.webVitals.ttfb.value}s`}
                status={data.webVitals.ttfb.rating as "good" | "needs-improvement" | "poor"}
              />
            </>
          )}
        </div>

        {/* Deployment Status */}
        <div
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
                <span style={{ color: "#64748b" }}>Viimeisin julkaisu: </span>
                <span style={{ color: "#f8fafc" }}>
                  {new Date().toLocaleDateString("fi-FI")} klo{" "}
                  {new Date().toLocaleTimeString("fi-FI", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#22c55e",
                  borderRadius: "50%",
                }}
              />
              <span
                style={{ color: "#4ade80", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Toiminnassa
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (newPassword.length < 8) {
      setErrorMsg("Salasanan täytyy olla vähintään 8 merkkiä.")
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Salasanat eivät täsmää.")
      return
    }

    setStatus("loading")
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setErrorMsg(error.message)
      setStatus("error")
    } else {
      setStatus("success")
      setTimeout(() => onClose(), 2000)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "400px",
          margin: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ color: "#f8fafc", fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
            Vaihda salasana
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ color: "#4ade80", fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
            <p style={{ color: "#4ade80", fontWeight: 600 }}>Salasana vaihdettu onnistuneesti!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.875rem", display: "block", marginBottom: "0.5rem" }}>
                Uusi salasana
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Vähintään 8 merkkiä"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "#0a0f1a",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.875rem", display: "block", marginBottom: "0.5rem" }}>
                Vahvista salasana
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Toista uusi salasana"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "#0a0f1a",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {errorMsg && (
              <p style={{ color: "#f87171", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: status === "loading" ? "rgba(250, 204, 21, 0.5)" : "#facc15",
                color: "#0a0f1a",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: status === "loading" ? "not-allowed" : "pointer",
              }}
            >
              {status === "loading" ? "Vaihdetaan..." : "Vaihda salasana"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  trend,
  isPositive,
}: {
  label: string
  value: string
  trend: string
  isPositive: boolean
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "1.25rem",
      }}
    >
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
        {label}
      </p>
      <p
        style={{
          color: "#f8fafc",
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.25rem",
        }}
      >
        {value}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          fontSize: "0.875rem",
          color: isPositive ? "#4ade80" : "#f87171",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: isPositive ? "none" : "rotate(180deg)" }}
        >
          <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span>{trend}</span>
      </div>
    </div>
  )
}

function VitalCard({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: "good" | "needs-improvement" | "poor"
}) {
  const statusConfig = {
    good: {
      text: "Hyvä",
      bg: "rgba(34, 197, 94, 0.2)",
      color: "#4ade80",
      border: "rgba(34, 197, 94, 0.3)",
    },
    "needs-improvement": {
      text: "Parannettavaa",
      bg: "rgba(250, 204, 21, 0.2)",
      color: "#facc15",
      border: "rgba(250, 204, 21, 0.3)",
    },
    poor: {
      text: "Heikko",
      bg: "rgba(239, 68, 68, 0.2)",
      color: "#f87171",
      border: "rgba(239, 68, 68, 0.3)",
    },
  }

  const config = statusConfig[status]

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "1.25rem",
      }}
    >
      <p
        style={{
          color: "#64748b",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "#f8fafc",
          fontSize: "1.25rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        {value}
      </p>
      <span
        style={{
          display: "inline-block",
          padding: "0.25rem 0.5rem",
          fontSize: "0.75rem",
          fontWeight: 500,
          borderRadius: "4px",
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
        }}
      >
        {config.text}
      </span>
    </div>
  )
}
