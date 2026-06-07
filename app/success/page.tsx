import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle, Mail, Clock } from 'lucide-react'

interface Props {
  searchParams: { order?: string; status?: string; type?: string }
}

export default async function SuccessPage({ searchParams }: Props) {
  const orderId = searchParams.order
  const isPending = searchParams.status === 'pending'
  const isMesa = searchParams.type === 'mesa'

  let order = null
  if (orderId) {
    const { data } = await supabase
      .from('orders')
      .select('*, ticket_types(name, events(artist, date, venue))')
      .eq('id', orderId)
      .single()
    order = data
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          {isPending ? (
            <div className="w-20 h-20 rounded-full border-2 border-yellow-500/50 flex items-center justify-center">
              <Clock size={36} className="text-yellow-500" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7B2FBE] flex items-center justify-center">
              <CheckCircle size={36} />
            </div>
          )}
        </div>

        {isPending ? (
          <>
            <h1 className="text-4xl font-black uppercase mb-4">Pago en proceso</h1>
            <p className="text-white/50 mb-6">
              Tu pago está siendo procesado. Cuando se confirme, te enviamos el ticket QR por email.
            </p>
          </>
        ) : isMesa ? (
          <>
            <h1 className="text-4xl font-black uppercase mb-4">Solicitud enviada</h1>
            <p className="text-white/50 mb-6">
              Recibimos tu solicitud de mesa. Nos contactaremos por WhatsApp o email para confirmar y coordinar el pago.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-black uppercase mb-4">¡Listo!</h1>
            <p className="text-white/50 mb-6">
              Tu entrada está confirmada. Te enviamos el ticket QR a tu email.
            </p>
          </>
        )}

        {/* Email notice */}
        {!isPending && !isMesa && (
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-lg p-4 mb-8 text-left">
            <Mail size={20} className="text-[#E91E8C] flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold">Revisá tu email</div>
              {order && (
                <div className="text-xs text-white/40 mt-0.5">Enviado a {order.buyer_email}</div>
              )}
              <div className="text-xs text-white/40 mt-0.5">
                Si no lo ves, revisá en Spam.
              </div>
            </div>
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="border border-white/10 rounded-lg p-6 mb-8 text-left space-y-3">
            <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4">Detalle de tu compra</div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Evento</span>
              <span className="font-bold">{order.ticket_types?.events?.artist}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Entrada</span>
              <span>{order.ticket_types?.name} × {order.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Total</span>
              <span className="font-bold gradient-text">
                ${order.total_amount.toLocaleString('es-AR')}
              </span>
            </div>
            {order.ticket_code && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Código</span>
                <span className="font-mono text-xs">{order.ticket_code}</span>
              </div>
            )}
          </div>
        )}

        <Link href="/" className="btn-outline inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
