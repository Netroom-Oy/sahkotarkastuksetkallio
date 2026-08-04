import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.xn--shtarkastuksetkallio-51b03b.fi'),
  title: 'Sähkötarkastukset Kallio | Luotettavat sähkötarkastukset',
  description: 'Sähkötarkastukset Kallio tarjoaa luotettavat sähkötarkastukset nopeasti ja ammattitaidolla. Palvelemme koko Varsinais-Suomea.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.jpg',
    apple: '/apple-icon.png',
  },
  // Admin-alue ja kirjautuminen pidetään pois hakuindeksistä
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fi" className="bg-background scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
