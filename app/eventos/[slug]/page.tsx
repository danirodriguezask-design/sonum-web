import { supabase } from '@/lib/supabase'
import TicketSelector from '@/components/TicketSelector'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
  searchParams: { rrpp?: string }
}

export default async function EventPage({ params, searchParams }: Props) {
  // Buscar evento en DB
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!event) notFound()

  // Tipos de tickets disponibles
  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('*')
    .eq('event_id', event.id)
    .eq('active', true)
    .order('price', { ascending: true })

  // Si viene con código RR.PP., verificarlo
  let rrpp = null
  if (searchParams.rrpp) {
    const { data } = await supabase
      .from('rrpp')
      .select('*')
      .eq('code', searchParams.rrpp)
      .eq('event_id', event.id)
      .eq('active', true)
      .single()
    rrpp = data
  }

  const eventDate = new Date(event.date)
  const dateStr = eventDate.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = eventDate.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-black">
      {/* Hero del evento */}
      <div className="relative h-[50vh] min-h-[350px] bg-gradient-to-b from-[#161616] via-[#0a0a0a] to-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#FFFFFF]/15 blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-10 pt-28">
          {rrpp && (
            <div className="mb-3 inline-flex items-center gap-2 bg-[#FFFFFF]/10 border border-[#FFFFFF]/30 rounded-full px-4 py-1.5 w-fit">
              <span className="text-xs text-[#FFFFFF] font-semibold uppercase tracking-wider">
                Invitación de {rrpp.name}
              </span>
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">{event.artist}</h1>
          <p className="text-white/50 mt-2 font-light tracking-wide">{event.name}</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info del evento */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Sobre el evento</h2>
            <p className="text-white/60 leading-relaxed text-lg mb-8">{event.description}</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-[#FFFFFF] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold capitalize">{dateStr}</div>
                  <div className="text-white/40 text-sm">Fecha del evento</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[#FFFFFF] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{timeStr} hs</div>
                  <div className="text-white/40 text-sm">Hora de apertura</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#FFFFFF] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{event.venue}</div>
                  <div className="text-white/40 text-sm">Lugar</div>
                </div>
              </div>
            </div>

            {/* Info tickets */}
            <div className="mt-10 p-4 border border-white/10 rounded-lg bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
                Información importante
              </h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFFFFF] mt-0.5">•</span>
                  Tu ticket llega por email con un QR único e intransferible.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFFFFF] mt-0.5">•</span>
                  Presentá el QR en puerta desde tu celular.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFFFFF] mt-0.5">•</span>
                  No hay reintegros salvo cancelación del evento.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFFFFF] mt-0.5">•</span>
                  Menores de 18 años no pueden ingresar.
                </li>
              </ul>
            </div>
          </div>

          {/* Selector de tickets */}
          <div id="tickets">
            <TicketSelector
              eventId={event.id}
              eventSlug={params.slug}
              ticketTypes={ticketTypes || []}
              rrppId={rrpp?.id || null}
              rrppName={rrpp?.name || null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
