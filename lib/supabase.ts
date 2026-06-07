import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client — solo para server-side (API routes)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Types ───────────────────────────────────────────────────
export interface Event {
  id: string
  slug: string
  name: string
  artist: string
  date: string
  venue: string
  description: string
  cover_url: string | null
  active: boolean
  created_at: string
}

export interface TicketType {
  id: string
  event_id: string
  name: string           // 'General' | 'VIP' | 'Backstage' | 'Mesa'
  price: number          // en pesos ARS
  quantity_total: number
  quantity_sold: number
  active: boolean
}

export interface Order {
  id: string
  event_id: string
  ticket_type_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  quantity: number
  total_amount: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  rrpp_id: string | null
  mp_payment_id: string | null
  mp_preference_id: string | null
  qr_code: string | null       // data URL del QR
  ticket_code: string | null   // código único del ticket
  created_at: string
  ticket_type?: TicketType
  event?: Event
  rrpp?: RRPP
}

export interface RRPP {
  id: string
  name: string
  code: string          // código único (ej: "martin-g")
  event_id: string
  commission_pct: number // porcentaje (ej: 10 = 10%)
  mp_account?: string   // email de su cuenta MP (para futuro split)
  active: boolean
  created_at: string
  orders_count?: number
  total_sold?: number
}
