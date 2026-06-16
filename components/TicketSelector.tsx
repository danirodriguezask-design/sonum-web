'use client'
import { useState } from 'react'
import { Minus, Plus, Loader2, AlertCircle } from 'lucide-react'
import type { TicketType } from '@/lib/supabase'

interface Props {
  eventId: string
  eventSlug: string
  ticketTypes: TicketType[]
  rrppId: string | null
  rrppName: string | null
}

type FormStep = 'select' | 'form' | 'loading'

export default function TicketSelector({ eventId, ticketTypes, rrppId, rrppName }: Props) {
  const [selectedType, setSelectedType] = useState<TicketType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [step, setStep] = useState<FormStep>('select')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const available = (t: TicketType) => t.quantity_total - t.quantity_sold
  const isSoldOut = (t: TicketType) => available(t) <= 0

  const formatPrice = (p: number) =>
    p === 0 ? 'Consultar' : `$${p.toLocaleString('es-AR')}`

  const total = selectedType && selectedType.price > 0
    ? selectedType.price * quantity
    : 0

  const handleCheckout = async () => {
    if (!selectedType) return
    setError('')

    // Validaciones
    if (!form.name.trim()) return setError('Ingresá tu nombre completo.')
    if (!form.email.trim() || !form.email.includes('@')) return setError('Ingresá un email válido.')
    if (!form.phone.trim()) return setError('Ingresá tu teléfono.')

    setStep('loading')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          ticket_type_id: selectedType.id,
          quantity,
          buyer_name: form.name.trim(),
          buyer_email: form.email.trim(),
          buyer_phone: form.phone.trim(),
          rrpp_id: rrppId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Hubo un error. Intentá de nuevo.')
        setStep('form')
        return
      }

      if (selectedType.price === 0) {
        // Mesa o ticket gratuito — redirigir a confirmación directa
        window.location.href = `/success?order=${data.order_id}&type=mesa`
      } else {
        // Redirigir a Mercado Pago
        window.location.href = data.init_point
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
      setStep('form')
    }
  }

  // ─── STEP: Select ticket ─────────────────────────────────────
  if (step === 'select') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Seleccioná tu entrada</h2>

        {rrppName && (
          <div className="mb-4 p-3 border border-[#FFFFFF]/30 rounded-lg bg-[#FFFFFF]/5 text-sm text-[#FFFFFF]">
            Comprando a través de <strong>{rrppName}</strong>
          </div>
        )}

        <div className="space-y-3">
          {ticketTypes.length === 0 && (
            <div className="text-center py-12 text-white/40">
              No hay tickets disponibles para este evento.
            </div>
          )}

          {ticketTypes.map((t) => {
            const soldOut = isSoldOut(t)
            const isSelected = selectedType?.id === t.id

            return (
              <button
                key={t.id}
                onClick={() => !soldOut && setSelectedType(t)}
                disabled={soldOut}
                className={`ticket-card w-full rounded-lg p-4 text-left transition-all ${
                  isSelected ? 'selected' : ''
                } ${soldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-base flex items-center gap-2">
                      {t.name}
                      {soldOut && (
                        <span className="text-xs text-white/40 font-normal uppercase tracking-wider">
                          Agotado
                        </span>
                      )}
                    </div>
                    {t.price === 0 ? (
                      <div className="text-sm text-white/50 mt-0.5">
                        Consultá disponibilidad
                      </div>
                    ) : (
                      <div className="text-sm text-white/50 mt-0.5">
                        {available(t)} disponibles
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-black text-lg">{formatPrice(t.price)}</div>
                    {t.price > 0 && (
                      <div className="text-xs text-white/40">por persona</div>
                    )}
                  </div>
                </div>

                {/* Radio indicator */}
                <div className="flex justify-end mt-2">
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'border-[#FFFFFF] bg-[#FFFFFF]'
                      : 'border-white/30'
                  }`} />
                </div>
              </button>
            )
          })}
        </div>

        {selectedType && (
          <div className="mt-6 space-y-4">
            {/* Quantity selector (solo si no es Mesa consulta) */}
            {selectedType.price > 0 && (
              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                <span className="text-white/70 text-sm font-medium">Cantidad</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-[#FFFFFF] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-[#FFFFFF] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Total */}
            {selectedType.price > 0 && (
              <div className="flex items-center justify-between p-4 border border-[#FFFFFF]/20 rounded-lg bg-[#FFFFFF]/5">
                <span className="font-semibold">Total</span>
                <span className="font-black text-xl gradient-text">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
            )}

            <button
              onClick={() => setStep('form')}
              className="btn-primary w-full text-center py-4"
            >
              {selectedType.price === 0 ? 'Solicitar Mesa' : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ─── STEP: Form ──────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div>
        <button
          onClick={() => setStep('select')}
          className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors"
        >
          ← Volver
        </button>

        <h2 className="text-2xl font-bold mb-2">Tus datos</h2>
        <p className="text-white/50 text-sm mb-6">
          El ticket QR se envía al email que ingreses.
        </p>

        {/* Resumen */}
        <div className="p-4 border border-white/10 rounded-lg bg-white/[0.02] mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{selectedType?.name} × {quantity}</span>
            <span className="font-bold">
              {selectedType?.price === 0 ? 'Consulta' : `$${total.toLocaleString('es-AR')}`}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5 font-medium">Nombre completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Tu nombre y apellido"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5 font-medium">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5 font-medium">Teléfono *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+54 9 351 XXX XXXX"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF] transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm p-3 border border-red-400/20 rounded-lg bg-red-400/5">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          className="btn-primary w-full text-center py-4 mt-6"
        >
          {selectedType?.price === 0
            ? 'Enviar solicitud de mesa'
            : `Pagar $${total.toLocaleString('es-AR')} con Mercado Pago`}
        </button>

        <p className="text-white/30 text-xs text-center mt-4">
          Serás redirigido a Mercado Pago para completar el pago de forma segura.
        </p>
      </div>
    )
  }

  // ─── STEP: Loading ───────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin text-[#FFFFFF]" />
      <p className="text-white/50 text-sm">Procesando tu pedido...</p>
    </div>
  )
}
