import Link from 'next/link'
import { Instagram, Music2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-black tracking-[0.15em] text-white text-xl uppercase">SONUM</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Groove · Party · Culture<br />
              Córdoba Capital, Argentina
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://instagram.com/sonum.arg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <Music2 size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/#eventos', label: 'Eventos' },
                { href: '/#nosotros', label: 'Nosotros' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/40 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:info@sonum.ar" className="text-white/40 hover:text-white text-sm transition-colors">
                  info@sonum.ar
                </a>
              </li>
              <li>
                <a href="https://wa.me/5493511234567" className="text-white/40 hover:text-white text-sm transition-colors">
                  WhatsApp
                </a>
              </li>
              <li className="text-white/40 text-sm">
                Marcelo T. de Alvear 651<br />
                Córdoba Capital
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} SONUM. Todos los derechos reservados.
          </p>
          <Link href="/admin" className="text-white/10 hover:text-white/30 text-xs transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
