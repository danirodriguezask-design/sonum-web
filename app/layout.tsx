import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'SONUM — Groove · Party · Culture',
  description: 'La experiencia de música electrónica más grande de Córdoba. Entradas online, eventos exclusivos.',
  keywords: ['sonum', 'electrónica', 'córdoba', 'fiestas', 'eventos', 'techno'],
  openGraph: {
    title: 'SONUM — Groove · Party · Culture',
    description: 'La experiencia de música electrónica más grande de Córdoba.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SONUM',
    description: 'Groove · Party · Culture',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
