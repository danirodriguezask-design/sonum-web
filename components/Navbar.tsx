'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              {/* Sonum S — glitch SVG */}
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <text
                  x="50%" y="50%"
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill="white"
                  fontSize="32"
                  fontWeight="900"
                  fontFamily="Inter, sans-serif"
                  style={{ userSelect: 'none' }}
                >
                  S
                </text>
              </svg>
            </div>
            <span className="font-black tracking-[0.15em] text-white text-lg uppercase">SONUM</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#eventos" className="text-sm font-medium text-white/70 hover:text-white tracking-widest uppercase transition-colors">
              Eventos
            </Link>
            <Link href="/#nosotros" className="text-sm font-medium text-white/70 hover:text-white tracking-widest uppercase transition-colors">
              Nosotros
            </Link>
            <Link href="/#contacto" className="text-sm font-medium text-white/70 hover:text-white tracking-widest uppercase transition-colors">
              Contacto
            </Link>
            <Link
              href="/#tickets"
              className="btn-primary text-xs py-2 px-5"
            >
              Comprar Tickets
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/98 border-t border-white/10 px-4 py-6 space-y-4">
          {[
            { href: '/#eventos', label: 'Eventos' },
            { href: '/#nosotros', label: 'Nosotros' },
            { href: '/#contacto', label: 'Contacto' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white uppercase tracking-widest text-sm font-medium py-2"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#tickets"
            onClick={() => setOpen(false)}
            className="block btn-primary text-center mt-4"
          >
            Comprar Tickets
          </Link>
        </div>
      )}
    </header>
  )
}
