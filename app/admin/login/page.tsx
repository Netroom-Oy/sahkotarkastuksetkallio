"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/admin")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Kirjautuminen epäonnistui")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#111827",
          borderRadius: "12px",
          border: "1px solid #1e293b",
          padding: "2.5rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <svg
              width="28"
              height="28"
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
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "#f8fafc",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              Sähkötarkastukset{" "}
              <span style={{ color: "#facc15" }}>Kallio</span>
            </span>
          </div>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              marginTop: "0.5rem",
            }}
          >
            Hallintapaneeli
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                color: "#94a3b8",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Sähköposti
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "0.9375rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                color: "#94a3b8",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Salasana
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "0.9375rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                marginBottom: "1.25rem",
              }}
            >
              <p style={{ color: "#f87171", fontSize: "0.875rem", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.875rem 1.5rem",
              background: isLoading ? "#a3a3a3" : "#facc15",
              color: "#0a0f1a",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {isLoading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <a
            href="/"
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            ← Takaisin etusivulle
          </a>
        </div>
      </div>
    </div>
  )
}
