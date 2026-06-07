import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// POST /api/validate-qr
// Body: { ticket_code: string, admin_secret: string }
// Usado desde la app de scanner en puerta
export async function POST(req: NextRequest) {
  try {
    const { ticket_code, admin_secret } = await req.json()

    if (admin_secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    if (!ticket_code) {
      return NextResponse.json({ error: 'Falta el código.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: order } = await supabase
      .from('orders')
      .select('*, ticket_types(name, events(artist, date, venue))')
      .eq('ticket_code', ticket_code)
      .single()

    if (!order) {
      return NextResponse.json({ valid: false, message: 'Ticket no encontrado.' }, { status: 404 })
    }

    if (order.status !== 'approved') {
      return NextResponse.json({
        valid: false,
        message: `Ticket no habilitado (estado: ${order.status}).`,
      })
    }

    if (order.checked_in) {
      return NextResponse.json({
        valid: false,
        message: `Ya fue escaneado (${new Date(order.checked_in_at).toLocaleTimeString('es-AR')}).`,
        order: {
          buyer_name: order.buyer_name,
          ticket_type: order.ticket_types?.name,
          quantity: order.quantity,
          checked_in_at: order.checked_in_at,
        },
      })
    }

    // Marcar como escaneado
    await supabase
      .from('orders')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('id', order.id)

    return NextResponse.json({
      valid: true,
      message: '✓ Ticket válido',
      order: {
        buyer_name: order.buyer_name,
        ticket_type: order.ticket_types?.name,
        quantity: order.quantity,
        event: order.ticket_types?.events?.artist,
      },
    })
  } catch (err) {
    console.error('Validate QR error:', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
