import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase'
import QRCode from 'qrcode'
import nodemailer from 'nodemailer'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP puede enviar distintos tipos de notificaciones
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Obtener info del pago desde MP
    const paymentClient = new Payment(mp)
    const payment = await paymentClient.get({ id: paymentId })

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ ok: true })
    }

    const orderId = payment.external_reference
    const status = payment.status // 'approved' | 'rejected' | 'pending' | ...

    const supabase = createAdminClient()

    // Buscar la orden
    const { data: order } = await supabase
      .from('orders')
      .select('*, ticket_types(*, events(*))')
      .eq('id', orderId)
      .single()

    if (!order) return NextResponse.json({ ok: true })

    // Si ya fue procesada, ignorar
    if (order.status === 'approved') return NextResponse.json({ ok: true })

    if (status === 'approved') {
      // Actualizar cantidad vendida
      await supabase.rpc('increment_sold', {
        type_id: order.ticket_type_id,
        qty: order.quantity,
      })

      // Generar QR con el ticket_code
      const qrData = JSON.stringify({
        ticket_code: order.ticket_code,
        order_id: order.id,
        event_id: order.event_id,
      })
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      })

      // Guardar QR en la orden
      await supabase
        .from('orders')
        .update({
          status: 'approved',
          mp_payment_id: String(paymentId),
          qr_code: qrDataUrl,
        })
        .eq('id', orderId)

      // Enviar email con el ticket
      await sendTicketEmail({
        buyerName: order.buyer_name,
        buyerEmail: order.buyer_email,
        eventName: order.ticket_types?.events?.artist ?? 'Evento',
        eventDate: order.ticket_types?.events?.date ?? '',
        eventVenue: order.ticket_types?.events?.venue ?? '',
        ticketType: order.ticket_types?.name ?? '',
        quantity: order.quantity,
        ticketCode: order.ticket_code,
        qrDataUrl,
      })
    } else if (status === 'rejected' || status === 'cancelled') {
      await supabase
        .from('orders')
        .update({ status: 'rejected', mp_payment_id: String(paymentId) })
        .eq('id', orderId)
    } else {
      // pending, in_process, etc.
      await supabase
        .from('orders')
        .update({ mp_payment_id: String(paymentId) })
        .eq('id', orderId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function sendTicketEmail(data: {
  buyerName: string
  buyerEmail: string
  eventName: string
  eventDate: string
  eventVenue: string
  ticketType: string
  quantity: number
  ticketCode: string
  qrDataUrl: string
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const eventDateStr = data.eventDate
    ? new Date(data.eventDate).toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background: #000; color: #fff; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; }
    .container { max-width: 520px; margin: 0 auto; background: #0a0a0a; border: 1px solid #222; }
    .header { background: linear-gradient(135deg, #E91E8C, #7B2FBE); padding: 40px; text-align: center; }
    .header h1 { font-size: 48px; font-weight: 900; letter-spacing: 0.1em; margin: 0; }
    .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; letter-spacing: 0.2em; font-size: 12px; }
    .body { padding: 40px; }
    .event-name { font-size: 32px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; }
    .ticket-type { font-size: 14px; color: #E91E8C; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 24px; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 14px; color: rgba(255,255,255,0.6); }
    .qr-section { text-align: center; padding: 32px; border-top: 1px solid #222; border-bottom: 1px solid #222; margin: 32px 0; }
    .qr-section img { width: 200px; height: 200px; background: white; padding: 12px; border-radius: 8px; }
    .code { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 12px; letter-spacing: 0.1em; font-family: monospace; }
    .footer { padding: 24px 40px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.3); }
    .important { background: rgba(233,30,140,0.08); border: 1px solid rgba(233,30,140,0.2); border-radius: 8px; padding: 16px; font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SONUM</h1>
      <p>GROOVE · PARTY · CULTURE</p>
    </div>
    <div class="body">
      <p style="color:rgba(255,255,255,0.5); font-size:14px;">Hola <strong style="color:#fff">${data.buyerName}</strong>,</p>
      <p style="color:rgba(255,255,255,0.5); font-size:14px; margin-bottom:24px;">Tu entrada está confirmada. Nos vemos en la pista.</p>

      <div class="event-name">${data.eventName}</div>
      <div class="ticket-type">${data.ticketType} × ${data.quantity}</div>

      <div class="info-row">📅 <span>${eventDateStr}</span></div>
      <div class="info-row">📍 <span>${data.eventVenue}</span></div>

      <div class="qr-section">
        <p style="color:rgba(255,255,255,0.4); font-size:12px; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:20px;">Tu ticket QR</p>
        <img src="${data.qrDataUrl}" alt="QR Ticket" />
        <div class="code">Código: ${data.ticketCode}</div>
      </div>

      <div class="important">
        ⚠️ Este QR es único e intransferible. Presentalo en puerta desde tu celular o impreso. El mismo QR no puede ser escaneado dos veces.
      </div>
    </div>
    <div class="footer">
      <p>SONUM — Córdoba Capital</p>
      <p>¿Dudas? Escribinos por <a href="https://instagram.com/sonum.arg" style="color:#E91E8C">Instagram</a></p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: `"SONUM Tickets" <${process.env.EMAIL_FROM}>`,
    to: data.buyerEmail,
    subject: `🎟 Tu ticket para ${data.eventName} — SONUM`,
    html,
  })
}
