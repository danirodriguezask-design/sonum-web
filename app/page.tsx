import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Users, Zap, Shield } from 'lucide-react'
import Countdown from '@/components/Countdown'

// Próximo evento — editá esto cuando cambie el evento
const NEXT_EVENT = {
  slug: 'louden-19-junio-2026',
  artist: 'LOUDEN',
  date: '2026-06-19T23:00:00-03:00',
  dateDisplay: 'Jueves 19 de Junio, 2026',
  venue: 'Club Paraguay — Av. Marcelo T. de Alvear 651',
  description: 'LOUDEN vuelve a Córdoba para sacudir la pista en una noche que no vas a olvidar.',
  coverBg: 'from-[#1a0025] via-[#0d0010] to-black',
}

const PAST_EVENTS = [
  { name: 'DIMMISH', date: 'Noviembre 2025', img: null },
  { name: 'DALE HOWARD', date: 'Abril 2025', img: null },
  { name: 'AJ CHRISTOU', date: 'Agosto 2025', img: null },
  { name: '1º ANIVERSARIO', date: 'Octubre 2025', img: null },
]

export default function Home() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className={`relative min-h-screen flex flex-col justify-center bg-gradient-to-b ${NEXT_EVENT.coverBg} overflow-hidden`}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E91E8C]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#7B2FBE]/10 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          {/* SONUM logo */}
          <div className="mb-6 flex justify-center">
            <span className="text-xs font-semibold tracking-[0.4em] text-[#E91E8C] uppercase">
              Groove · Party · Culture
            </span>
          </div>

          <h1
            className="font-black uppercase text-[clamp(64px,18vw,200px)] leading-none tracking-tight"
            style={{ fontFamily: "'Bebas Neue', 'Inter', sans-serif" }}
          >
            SONUM
          </h1>

          {/* Next event label */}
          <p className="text-white/50 text-sm uppercase tracking-[0.3em] mt-4 mb-2">Próxima fecha</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-wider mb-2 gradient-text">
            {NEXT_EVENT.artist}
          </h2>

          <div className="flex items-center justify-center gap-4 text-white/50 text-sm mt-3 mb-10 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {NEXT_EVENT.dateDisplay}
            </span>
            <span className="w-px h-4 bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {NEXT_EVENT.venue}
            </span>
          </div>

          {/* Countdown */}
          <div className="flex justify-center mb-10">
            <Countdown targetDate={NEXT_EVENT.date} />
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center" id="tickets">
            <Link href={`/eventos/${NEXT_EVENT.slug}`} className="btn-primary text-base py-4 px-10">
              Comprar Tickets
            </Link>
            <a href="#eventos" className="btn-outline text-base py-4 px-10">
              Ver más eventos
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-white animate-pulse" />
        </div>
      </section>

      {/* ─── NEXT EVENT DETAIL ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" id="eventos">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold tracking-[0.3em] text-[#E91E8C] uppercase">Próxima fecha</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase mt-3 mb-6">{NEXT_EVENT.artist}</h2>
            <p className="text-white/60 leading-relaxed text-lg mb-8">{NEXT_EVENT.description}</p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-white/70">
                <Calendar size={16} className="text-[#E91E8C] flex-shrink-0" />
                <span>{NEXT_EVENT.dateDisplay}</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <MapPin size={16} className="text-[#E91E8C] flex-shrink-0" />
                <span>{NEXT_EVENT.venue}</span>
              </div>
            </div>

            <Link href={`/eventos/${NEXT_EVENT.slug}`} className="btn-primary inline-flex items-center gap-2">
              Ver tickets <ArrowRight size={16} />
            </Link>
          </div>

          {/* Ticket types preview */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { type: 'General', price: '$8.000', desc: 'Acceso general al evento', color: 'border-white/20' },
              { type: 'VIP', price: '$15.000', desc: 'Zona VIP con mejor vista', color: 'border-[#E91E8C]/60' },
              { type: 'Backstage', price: '$25.000', desc: 'Acceso backstage exclusivo', color: 'border-[#7B2FBE]/60' },
              { type: 'Mesa', price: 'Consultar', desc: 'Mesa reservada con servicio', color: 'border-white/20' },
            ].map(t => (
              <div key={t.type} className={`ticket-card rounded-lg p-4 cursor-pointer border ${t.color} bg-white/2`}>
                <div className="text-xs text-white/50 uppercase tracking-widest mb-1">{t.type}</div>
                <div className="text-xl font-black">{t.price}</div>
                <div className="text-xs text-white/40 mt-1">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY SONUM ─────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Zap size={24} className="text-[#E91E8C]" />,
                title: 'Pagá con tarjeta',
                desc: 'Comprá tus entradas online con Mercado Pago, directo y seguro.',
              },
              {
                icon: <Shield size={24} className="text-[#E91E8C]" />,
                title: 'QR único e intransferible',
                desc: 'Cada ticket tiene un QR único. Lo recibís por mail y lo mostrás en puerta.',
              },
              {
                icon: <Users size={24} className="text-[#E91E8C]" />,
                title: 'Comprá por tu RR.PP.',
                desc: 'Si tenés un relaciones públicas, usá su link y el pago es instantáneo.',
              },
            ].map(f => (
              <div key={f.title} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PAST EVENTS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" id="nosotros">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold tracking-[0.3em] text-[#E91E8C] uppercase">Historia</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase mt-2">Fechas anteriores</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PAST_EVENTS.map((e) => (
            <div
              key={e.name}
              className="relative aspect-square bg-white/5 border border-white/10 rounded-lg overflow-hidden flex flex-col justify-end p-4 hover:border-[#E91E8C]/40 transition-all duration-300 group"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-[#E91E8C]/0 group-hover:bg-[#E91E8C]/5 transition-colors duration-300" />

              <div className="relative z-10">
                <div className="font-black text-lg uppercase">{e.name}</div>
                <div className="text-white/40 text-xs mt-1">{e.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTACT ───────────────────────────────────────────────── */}
      <section className="border-t border-white/5 py-20" id="contacto">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-[#E91E8C] uppercase">¿Querés ser parte?</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase mt-3 mb-6">Trabajá con nosotros</h2>
          <p className="text-white/50 mb-10 leading-relaxed">
            Buscamos embajadoras, RR.PP. e influencers para ser parte de la familia Sonum.
            Si querés sumarte, escribinos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://instagram.com/sonum.arg" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Escribir por Instagram
            </a>
            <a href="mailto:info@sonum.ar" className="btn-outline">
              Enviar email
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
