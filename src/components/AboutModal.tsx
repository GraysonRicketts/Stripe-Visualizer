import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onOpen: () => void
}

export function AboutModal({ open, onClose, onOpen }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Vacuum target: lower-left corner (approx center of the ? About button)
  const targetX = typeof window !== 'undefined' ? -window.innerWidth / 2 + 56 : -600
  const targetY = typeof window !== 'undefined' ? window.innerHeight / 2 - 56 : 350

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              ref={backdropRef}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="fixed z-50 w-[440px] max-w-[calc(100vw-32px)]"
              style={{ top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0, x: targetX, y: targetY }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="rounded-2xl border border-[#2a2b3e] bg-[#0f1020] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#635bff] flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C4.943 23.102 7.645 24 11.464 24c2.967 0 5.07-.786 6.513-2.043 1.51-1.312 2.243-3.048 2.243-5.158 0-4.14-2.467-5.858-6.244-7.65z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-base leading-tight">How Stripe Payments Work</h2>
                      <p className="text-slate-500 text-xs mt-0.5">A simplified, interactive walkthrough</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-300 transition-colors ml-4 mt-0.5"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#1a1b2e] mx-6" />

                {/* Body */}
                <div className="px-6 py-4 space-y-3">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    When you enter a card number and click "Pay," a lot happens in milliseconds. This visualizer
                    shows you the simplified path of payment moving through Stripe's systems and the wider network it connects to.
                  </p>

                  <ul className="space-y-2">
                    {[
                      { color: '#635bff', text: 'See each hop: Stripe.js → API → Radar fraud scoring → Card Network → Issuing Bank' },
                      { color: '#00d4a0', text: 'Watch the real API payloads exchanged at each step' },
                      { color: '#f59e0b', text: 'Explore success, decline, and fraud scenarios with realistic timing' },
                    ].map(({ color, text }) => (
                      <li key={text} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-slate-400 text-sm leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 pt-2">
                  <div className="rounded-xl bg-[#635bff]/10 border border-[#635bff]/25 px-4 py-3">
                    <p className="text-[#635bff] text-sm font-medium">
                      Press <span className="font-bold">Play ▶</span> in the top bar to start the walkthrough
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Or click any step in the timeline bar, or tap a node in the graph to jump directly to it.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ? About button — appears when modal is closed */}
      <AnimatePresence>
        {!open && (
          <motion.button
            onClick={onOpen}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#635bff]/40 bg-[#0f1020] text-[#635bff] text-xs font-medium hover:bg-[#1a1b2e] hover:border-[#635bff]/70 transition-colors shadow-lg"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            aria-label="About this visualizer"
          >
            <span className="text-[#635bff]/70">?</span>
            About
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
