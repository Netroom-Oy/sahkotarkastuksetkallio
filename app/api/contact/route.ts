import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Puuttuvat pakolliset kentät' },
        { status: 400 }
      )
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: 'Sähkötarkastukset Kallio <petri.kallio@sahkotarkastuksetkallio.fi>',
      to: 'petri.kallio@sahkotarkastuksetkallio.fi',
      replyTo: email,
      subject: `Uusi yhteydenotto: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a0f1a;">Uusi yhteydenotto</h2>
          <p><strong>Nimi:</strong> ${name}</p>
          <p><strong>Sähköposti:</strong> ${email}</p>
          ${phone ? `<p><strong>Puhelin:</strong> ${phone}</p>` : ''}
          <p><strong>Viesti:</strong></p>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 6px;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Tämä on automaattinen viesti Sähkötarkastukset Kallio -sivustosta.</p>
        </div>
      `,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json(
        { error: 'Viestin lähettäminen epäonnistui' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Viesti lähetetty onnistuneesti' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Sisäinen palvelinvirhe' },
      { status: 500 }
    )
  }
}
