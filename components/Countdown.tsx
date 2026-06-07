'use client'
import { useState, useEffect } from 'react'

interface Props {
  targetDate: string // ISO string
}

export default function Countdown({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const units = [
    { value: timeLeft.days,    label: 'Días' },
    { value: timeLeft.hours,   label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ]

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2 md:gap-4">
          <div className="countdown-unit">
            <span className="countdown-number">{String(u.value).padStart(2, '0')}</span>
            <span className="countdown-label">{u.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="countdown-number text-[#E91E8C] pb-4">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
