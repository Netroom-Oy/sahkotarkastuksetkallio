"use client"

import { Zap, ClipboardCheck, Wrench, Phone, Mail, ChevronDown } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Sähkötarkastukset Kallio
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
            Luotettavat sähkötarkastukset — nopeasti ja ammattitaidolla
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Pyydä tarjous
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              Lue lisää <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
            Palvelumme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard
              icon={<Zap className="w-8 h-8" />}
              title="Sähkötarkastukset"
              description="Lakisääteiset tarkastukset asunnoille ja yrityksille"
            />
            <ServiceCard
              icon={<ClipboardCheck className="w-8 h-8" />}
              title="Käyttöönottotarkastukset"
              description="Uudis- ja saneerauskohteet"
            />
            <ServiceCard
              icon={<Wrench className="w-8 h-8" />}
              title="Vikailmoitukset & korjaukset"
              description="Nopea vaste, luotettava toteutus"
            />
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
            Miksi valita meidät
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatBlock value="10+" label="vuotta kokemusta" />
            <StatBlock value="Koko" label="Varsinais-Suomi" />
            <StatBlock value="Nopea" label="vastausaika" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
            Ota yhteyttä
          </h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nimi
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full min-h-[44px] px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
                placeholder="Nimesi"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Puhelinnumero
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full min-h-[44px] px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
                placeholder="+358..."
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Sähköposti
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full min-h-[44px] px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
                placeholder="email@esimerkki.fi"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Viesti
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-base"
                placeholder="Kirjoita viestisi..."
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[44px] px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Lähetä viesti
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-muted-foreground">
              <a
                href="tel:+358505287158"
                className="flex items-center gap-2 hover:text-foreground transition-colors min-h-[44px]"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span>+358 505 287 158</span>
              </a>
              <a
                href="mailto:petri4215@gmail.com"
                className="flex items-center gap-2 hover:text-foreground transition-colors min-h-[44px]"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span>petri4215@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>Sähkötarkastukset Kallio | Y-tunnus: 3569055-8 | © 2026</p>
        </div>
      </footer>
    </main>
  )
}

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6">
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{value}</div>
      <div className="text-lg text-foreground">{label}</div>
    </div>
  )
}
