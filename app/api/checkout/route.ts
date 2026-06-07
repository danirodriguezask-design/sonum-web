import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      event_id,
      ticket_type_id,
      quantity,
      buyer_name,
      buyer_email,
      buyer_phone,
      rrpp_id,
    } = body

    // Validaciones básicas
    if (!event_id || !ticket_type_id || !buyer_name || !buyer_email || !buyer_phone) {
      return NextResponse.json({ error: 'Faltan datos obligatorios.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verificar ticket type y disponibilidad
    const { data: ticketType, error: ttErr } = await supabase
      .from('ticket_types')
      .select('*, events(*)')
      .eq('id', ticket_type_id)
      .eq('event_id', event_id)
      .single()

    if (ttErr || !ticketType) {
      return NextResponse.json({ error: 'Tipo de ticket no encontrado.' }, { status: 404 })
    }

    const available = ticketType.quantity_total - ticketType.quantity_sold
    if (ticketType.price > 0 && available < quantity) {
      return NextResponse.json({ error: 'No hay suficientes entradas disponibles.' }, { status: 409 })
    }

    const totalAmount = ticketType.price * quantity
    const ticketCode = randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase()

    // Crear orden en DB (pendiente)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        event_id,
        ticket_type_id,
        buyer_name,
        buyer_email,
        buyer_phone,
        quantity,
        total_amount: totalAmount,
        status: 'pending',
        rrpp_id: rrpp_id || null,
        ticket_code: ticketCode,
      })
      .select()
      .single()

    if (orderErr || !order) {
      console.error('Error creando orden:', orderErr)
      return NextResponse.json({ error: 'Error al crear la orden.' }, { status: 500 })
    }

    // Si es Mesa (precio 0), responder directo sin MP
    if (ticketType.price === 0) {
      return NextResponse.json({ order_id: order.id, type: 'mesa' })
    }

    // Crear preferencia en Mercado Pago
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        external_reference: order.id,
        items: [
          {
            id: ticketType.id,
            title: `${ticketType.events?.artist ?? 'Evento'} — ${ticketType.name}`,
            quantity,
            unit_price: ticketType.price,
            currency_id: 'ARS',
          },
        ],
        payer: {
          name: buyer_name,
          email: buyer_email,
          phone: { number: buyer_phone },
        },
        back_urls: {
          success: `${appUrl}/success?order=${order.id}`,
          failure: `${appUrl}/eventos/${ticketType.events?.slug ?? ''}?error=pago`,
          pending: `${appUrl}/success?order=${order.id}&status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhook`,
        statement_descriptor: 'SONUM TICKETS',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      },
    })

    // Guardar preference ID en la orden
    await supabase
      .from('orders')
      .update({ mp_preference_id: result.id })
      .eq('id', order.id)

    return NextResponse.json({
      order_id: order.id,
      init_point: result.init_point,
    })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
