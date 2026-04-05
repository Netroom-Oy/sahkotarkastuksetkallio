"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
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
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1
          style={{
            color: "#f8fafc",
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Ei käyttöoikeutta
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Sinulla ei ole oikeuksia tähän hallintapaneeliin. Ota yhteyttä
          ylläpitäjään, jos uskot tämän olevan virhe.
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
            borderRadius: "8px",
            fontSize: "0.9375rem",
            fontWeight: 500,
            cursor: "pointer",
            marginRight: "0.75rem",
          }}
        >
          Kirjaudu ulos
        </button>

        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: "transparent",
            color: "#64748b",
            border: "none",
            fontSize: "0.9375rem",
            textDecoration: "none",
          }}
        >
          Etusivulle
        </a>
      </div>
    </div>
  )
}
