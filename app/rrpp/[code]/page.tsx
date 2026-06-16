import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { TrendingUp, Ticket, DollarSign } from 'lucide-react'
import { notFound } from 'next/navigation'

interface Props {
  params: { code: string }
}

export default async function RrppPage({ params }: Props) {
  // Buscar RR.PP. por código
  const { data: rrpp } = await supabase
    .from('rrpp')
    .select('*, events(id, artist, slug, date, venue)')
    .eq('code', params.code)
    .eq('active', true)
    .single()

  if (!rrpp) notFound()

  // Ventas de este RR.PP.
  const { data: orders } = await supabase
    .from('orders')
    .select('*, ticket_types(name, price)')
    .eq('rrpp_id', rrpp.id)
    .order('created_at', { ascending: false })

  const approvedOrders = (orders || []).filter(o => o.status === 'approved')
  const totalAmount = approvedOrders.reduce((s: number, o: { total_amount: number }) => s + o.total_amount, 0)
  const commission = totalAmount * (rrpp.commission_pct / 100)

  const event = rrpp.events

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-2">Panel RR.PP.</p>
        <h1 className="text-4xl font-black uppercase">{rrpp.name}</h1>
        <p className="text-white/40 text-sm mt-1">Código: <span className="font-mono text-white/60">{rrpp.code}</span></p>
      </div>

      {/* Event info */}
      {event && (
        <div className="border border-white/10 rounded-lg p-5 mb-8 bg-white/[0.02]">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Evento asignado</div>
          <div className="text-xl font-black">{event.artist}</div>
          <div className="text-white/50 text-sm mt-1">
            {new Date(event.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}{event.venue}
          </div>
          <Link
            href={`/eventos/${event.slug}?rrpp=${rrpp.code}`}
            className="inline-block mt-4 btn-primary text-xs py-2 px-4"
          >
            Ver mi link de venta →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Entradas vendidas', value: approvedOrders.reduce((s: number, o: { quantity: number }) => s + o.quantity, 0), icon: <Ticket size={18} className="text-[#FFFFFF]" /> },
          { label: 'Total generado', value: `$${totalAmount.toLocaleString('es-AR')}`, icon: <TrendingUp size={18} className="text-[#FFFFFF]" /> },
          { label: `Mi comisión (${rrpp.commission_pct}%)`, value: `$${commission.toLocaleString('es-AR')}`, icon: <DollarSign size={18} className="text-[#FFFFFF]" /> },
        ].map(s => (
          <div key={s.label} className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
            <div className="mb-2">{s.icon}</div>
            <div className="text-xl font-black">{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div>
        <h2 className="text-lg font-bold mb-4">Mis ventas</h2>
        <div className="space-y-2">
          {(orders || []).length === 0 && (
            <div className="text-center py-12 text-white/30">Todavía no hay ventas. Compartí tu link.</div>
          )}
          {(orders || []).map((o: {
            id: string
            buyer_name: string
            buyer_email: string
            quantity: number
            total_amount: number
            status: string
            ticket_types?: { name: string }
            created_at: string
          }) => (
            <div key={o.id} className="border border-white/10 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold text-sm">{o.buyer_name}</div>
                <div className="text-white/40 text-xs">{o.buyer_email}</div>
                <div className="text-white/40 text-xs mt-1">{o.ticket_types?.name} × {o.quantity}</div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                    o.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    o.status === 'pending'  ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}
                >
                  {o.status === 'approved' ? 'Confirmado' : o.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                </div>
                <div className="font-bold mt-1">${o.total_amount.toLocaleString('es-AR')}</div>
                <div className="text-white/30 text-xs">
                  {new Date(o.created_at).toLocaleDateString('es-AR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
