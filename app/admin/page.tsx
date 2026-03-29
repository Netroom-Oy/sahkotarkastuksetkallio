"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
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

// Mock data for analytics
const dailyVisitors = [
  { day: "1.3.", visitors: 42 },
  { day: "2.3.", visitors: 38 },
  { day: "3.3.", visitors: 55 },
  { day: "4.3.", visitors: 48 },
  { day: "5.3.", visitors: 62 },
  { day: "6.3.", visitors: 51 },
  { day: "7.3.", visitors: 45 },
  { day: "8.3.", visitors: 58 },
  { day: "9.3.", visitors: 67 },
  { day: "10.3.", visitors: 72 },
  { day: "11.3.", visitors: 65 },
  { day: "12.3.", visitors: 78 },
  { day: "13.3.", visitors: 82 },
  { day: "14.3.", visitors: 75 },
  { day: "15.3.", visitors: 88 },
  { day: "16.3.", visitors: 92 },
  { day: "17.3.", visitors: 85 },
  { day: "18.3.", visitors: 95 },
  { day: "19.3.", visitors: 102 },
  { day: "20.3.", visitors: 98 },
  { day: "21.3.", visitors: 108 },
  { day: "22.3.", visitors: 115 },
  { day: "23.3.", visitors: 112 },
  { day: "24.3.", visitors: 125 },
  { day: "25.3.", visitors: 118 },
  { day: "26.3.", visitors: 132 },
  { day: "27.3.", visitors: 128 },
  { day: "28.3.", visitors: 145 },
  { day: "29.3.", visitors: 152 },
  { day: "30.3.", visitors: 148 },
]

const performanceData = [
  { day: "Ma", score: 92 },
  { day: "Ti", score: 88 },
  { day: "Ke", score: 95 },
  { day: "To", score: 91 },
  { day: "Pe", score: 94 },
  { day: "La", score: 97 },
  { day: "Su", score: 96 },
]

const topPages = [
  { page: "/", visitors: 1842, percentage: 48.2 },
  { page: "/sahkotarkastukset.html", visitors: 1156, percentage: 30.3 },
  { page: "/maaraaikaistarkastukset.html", visitors: 823, percentage: 21.5 },
]

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple mock login
    if (email && password) {
      setIsLoggedIn(true)
    }
  }

  if (!isLoggedIn) {
    return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={handleLogin} />
  }

  return <Dashboard onLogout={() => setIsLoggedIn(false)} />
}

function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
}: {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  onLogin: (e: React.FormEvent) => void
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] border border-white/10 rounded-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[#facc15] text-2xl">⚡</span>
              <h1 className="text-white text-xl font-bold tracking-tight">
                Sähkötarkastukset <span className="text-[#facc15]">Kallio</span>
              </h1>
            </div>
            <p className="text-[#94a3b8] text-sm">Hallintapaneeli</p>
          </div>

          {/* Login Form */}
          <form onSubmit={onLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8] mb-2">
                Sähköposti
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f1a] border border-white/10 rounded-lg text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8] mb-2">
                Salasana
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f1a] border border-white/10 rounded-lg text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#facc15] text-[#0a0f1a] font-bold rounded-lg hover:bg-[#fbbf24] transition-colors"
            >
              Kirjaudu sisään
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-[#111827] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-[#facc15] text-xl">⚡</span>
              <span className="text-white font-bold">
                Sähkötarkastukset Kallio
              </span>
              <span className="text-[#94a3b8] hidden sm:inline">— Hallintapaneeli</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-white/20 text-[#94a3b8] rounded-lg hover:bg-white/5 hover:text-white transition-colors text-sm"
            >
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Analytics */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-[#facc15]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-white text-xl font-bold">Kävijäanalyysi</h2>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Kävijät (30 pv)"
              value="3,821"
              trend="+24.5%"
              isPositive={true}
            />
            <MetricCard
              label="Sivulataukset"
              value="8,432"
              trend="+18.2%"
              isPositive={true}
            />
            <MetricCard
              label="Bounce Rate"
              value="42.3%"
              trend="-5.1%"
              isPositive={true}
            />
            <MetricCard
              label="Keskim. vierailun kesto"
              value="2:34"
              trend="+12.8%"
              isPositive={true}
            />
          </div>

          {/* Line Chart */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
            <h3 className="text-[#94a3b8] text-sm font-medium mb-4">Päivittäiset kävijät</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyVisitors}>
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
            </div>
          </div>

          {/* Top Pages Table */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-6 mt-4">
            <h3 className="text-[#94a3b8] text-sm font-medium mb-4">Suosituimmat sivut</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#64748b] text-sm border-b border-white/10">
                    <th className="pb-3 font-medium">Sivu</th>
                    <th className="pb-3 font-medium text-right">Kävijät</th>
                    <th className="pb-3 font-medium text-right">% osuus</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((page) => (
                    <tr key={page.page} className="border-b border-white/5 last:border-0">
                      <td className="py-3 text-white font-mono text-sm">{page.page}</td>
                      <td className="py-3 text-[#94a3b8] text-right">{page.visitors.toLocaleString()}</td>
                      <td className="py-3 text-[#94a3b8] text-right">{page.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 2: Speed Insights */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-[#facc15]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-white text-xl font-bold">Sivun nopeus</h2>
          </div>

          {/* Core Web Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <VitalCard label="LCP" value="1.2s" status="Hyvä" />
            <VitalCard label="INP" value="14ms" status="Hyvä" />
            <VitalCard label="CLS" value="0.02" status="Hyvä" />
            <VitalCard label="FCP" value="0.8s" status="Hyvä" />
            <VitalCard label="TTFB" value="180ms" status="Hyvä" />
          </div>

          {/* Performance Bar Chart */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
            <h3 className="text-[#94a3b8] text-sm font-medium mb-4">Suorituskyky (viimeiset 7 päivää)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[80, 100]}
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
                  <Bar dataKey="score" fill="#facc15" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Section 3: Deployment Info */}
        <section>
          <div className="bg-[#111827] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <p className="text-[#94a3b8] text-sm">
                  <span className="text-[#64748b]">Viimeisin julkaisu:</span>{" "}
                  <span className="text-white">29.3.2026 klo 14:32</span>
                </p>
                <p className="text-[#94a3b8] text-sm">
                  <span className="text-[#64748b]">Vercel-projekti:</span>{" "}
                  <span className="text-white font-mono">v0-marketing-website-for-saehkoetar</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Toiminnassa</span>
              </div>
            </div>
          </div>
        </section>
      </main>
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
    <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
      <p className="text-[#64748b] text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
        <svg
          className={`w-4 h-4 ${isPositive ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
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
  status: "Hyvä" | "Parannettavaa" | "Heikko"
}) {
  const statusColors = {
    "Hyvä": "bg-green-500/20 text-green-400 border-green-500/30",
    "Parannettavaa": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Heikko": "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
      <p className="text-[#64748b] text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white text-xl font-bold mb-2">{value}</p>
      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  )
}
