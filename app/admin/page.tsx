'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users, TrendingUp, Ticket, Search, Plus, Copy, Check, RefreshCw } from 'lucide-react'

interface Order {
  id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  quantity: number
  total_amount: number
  status: string
  ticket_code: string
  created_at: string
  rrpp?: { name: string } | null
  ticket_types?: { name: string; events?: { artist: string } } | null
}

interface RRPP {
  id: string
  name: string
  code: string
  commission_pct: number
  orders?: Order[]
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'ventas' | 'rrpp'>('ventas')
  const [orders, setOrders] = useState<Order[]>([])
  const [rrppList, setRrppList] = useState<RRPP[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [newRrpp, setNewRrpp] = useState({ name: '', code: '', commission_pct: 10, event_id: '' })
  const [showNewRrpp, setShowNewRrpp] = useState(false)
  const [events, setEvents] = useState<{ id: string; artist: string }[]>([])

  const load = useCallback(async () => {
    if (!authed) return
    setLoading(true)
    try {
      const [ordersRes, rrppRes, eventsRes] = await Promise.all([
        fetch('/api/admin/orders', { headers: { 'x-admin-secret': secret } }),
        fetch('/api/admin/rrpp', { headers: { 'x-admin-secret': secret } }),
        fetch('/api/admin/events', { headers: { 'x-admin-secret': secret } }),
      ])
      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (rrppRes.ok) setRrppList(await rrppRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
    } finally {
      setLoading(false)
    }
  }, [authed, secret])

  useEffect(() => { load() }, [load])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // La verificación real se hace en la API
    setAuthed(true)
  }

  const copyLink = (code: string, eventSlug?: string) => {
    const url = `${window.location.origin}/eventos/${eventSlug ?? ''}?rrpp=${code}`
    navigator.clipboard.writeText(url)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  const createRrpp = async () => {
    const res = await fetch('/api/admin/rrpp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(newRrpp),
    })
    if (res.ok) {
      setShowNewRrpp(false)
      setNewRrpp({ name: '', code: '', commission_pct: 10, event_id: '' })
      load()
    }
  }

  const approvedOrders = orders.filter(o => o.status === 'approved')
  const totalRevenue = approvedOrders.reduce((s, o) => s + o.total_amount, 0)
  const filteredOrders = orders.filter(o =>
    search ? (
      o.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.ticket_code?.toLowerCase().includes(search.toLowerCase())
    ) : true
  )

  // ─── Login ───────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black uppercase tracking-wider">SONUM</h1>
            <p className="text-white/40 text-sm mt-1">Panel de administración</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Contraseña de admin"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF] transition-colors"
            />
            <button type="submit" className="btn-primary w-full py-3">Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  // ─── Dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase">Panel Admin</h1>
          <p className="text-white/40 text-sm">SONUM — Córdoba</p>
        </div>
        <button
          onClick={load}
          className={`p-2 text-white/40 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Ventas aprobadas', value: approvedOrders.length, icon: <Ticket size={20} className="text-[#FFFFFF]" /> },
          { label: 'Total recaudado', value: `$${totalRevenue.toLocaleString('es-AR')}`, icon: <TrendingUp size={20} className="text-[#FFFFFF]" /> },
          { label: 'RR.PP. activos', value: rrppList.filter(r => r).length, icon: <Users size={20} className="text-[#FFFFFF]" /> },
        ].map(s => (
          <div key={s.label} className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">{s.icon}</div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {(['ventas', 'rrpp'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              tab === t
                ? 'text-[#FFFFFF] border-b-2 border-[#FFFFFF]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            {t === 'ventas' ? 'Ventas' : 'RR.PP.'}
          </button>
        ))}
      </div>

      {/* ── VENTAS ── */}
      {tab === 'ventas' && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF] transition-colors"
            />
          </div>

          <div className="space-y-2">
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-white/30">Sin resultados.</div>
            )}
            {filteredOrders.map(o => (
              <div key={o.id} className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-semibold">{o.buyer_name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{o.buyer_email} · {o.buyer_phone}</div>
                    <div className="text-white/40 text-xs mt-1">
                      {o.ticket_types?.events?.artist} — {o.ticket_types?.name} × {o.quantity}
                      {o.rrpp && <span className="ml-2 text-[#FFFFFF]">via {o.rrpp.name}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                        o.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                        o.status === 'pending'  ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {o.status === 'approved' ? 'Aprobado' : o.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </div>
                    <div className="font-black mt-1">${o.total_amount.toLocaleString('es-AR')}</div>
                    <div className="text-white/30 text-xs mt-0.5 font-mono">{o.ticket_code}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RR.PP. ── */}
      {tab === 'rrpp' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowNewRrpp(true)}
              className="flex items-center gap-2 btn-primary py-2 px-4 text-xs"
            >
              <Plus size={14} /> Nuevo RR.PP.
            </button>
          </div>

          {showNewRrpp && (
            <div className="border border-[#FFFFFF]/30 rounded-lg p-6 mb-6 bg-[#FFFFFF]/5 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#FFFFFF]">Nuevo RR.PP.</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={newRrpp.name}
                  onChange={e => setNewRrpp({ ...newRrpp, name: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF]"
                />
                <input
                  type="text"
                  placeholder="Código único (ej: martin-g)"
                  value={newRrpp.code}
                  onChange={e => setNewRrpp({ ...newRrpp, code: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF]"
                />
                <select
                  value={newRrpp.event_id}
                  onChange={e => setNewRrpp({ ...newRrpp, event_id: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFFFFF]"
                >
                  <option value="">Seleccionar evento</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.artist}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Comisión %"
                  value={newRrpp.commission_pct}
                  onChange={e => setNewRrpp({ ...newRrpp, commission_pct: Number(e.target.value) })}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={createRrpp} className="btn-primary py-2 px-5 text-sm">Crear</button>
                <button onClick={() => setShowNewRrpp(false)} className="text-white/40 hover:text-white text-sm">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {rrppList.length === 0 && (
              <div className="text-center py-12 text-white/30">No hay RR.PP. cargados.</div>
            )}
            {rrppList.map(r => {
              const rOrders = orders.filter(o => o.rrpp?.name === r.name && o.status === 'approved')
              const rTotal = rOrders.reduce((s, o) => s + o.total_amount, 0)
              const rComm = rTotal * (r.commission_pct / 100)

              return (
                <div key={r.id} className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-bold">{r.name}</div>
                      <div className="text-white/40 text-xs mt-0.5 font-mono">/{r.code}</div>
                      <div className="text-white/40 text-xs mt-2">
                        {rOrders.length} ventas · ${rTotal.toLocaleString('es-AR')} recaudado
                      </div>
                      <div className="text-[#FFFFFF] text-xs mt-0.5">
                        Comisión ({r.commission_pct}%): ${rComm.toLocaleString('es-AR')}
                      </div>
                    </div>
                    <button
                      onClick={() => copyLink(r.code, events[0]?.artist?.toLowerCase().replace(/\s+/g, '-'))}
                      className="flex items-center gap-2 text-xs btn-outline py-1.5 px-3"
                    >
                      {copied === r.code ? <Check size={12} /> : <Copy size={12} />}
                      {copied === r.code ? 'Copiado' : 'Copiar link'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
