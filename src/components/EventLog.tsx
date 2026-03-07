import { motion, AnimatePresence } from 'framer-motion'
import { usePaymentStore } from '../store/paymentStore'
import { Activity } from 'lucide-react'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 1000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  return `${Math.floor(diff / 60000)}m ago`
}

function getEventColor(label: string): string {
  if (label.includes('failed') || label.includes('fraud')) return 'text-[#ff4757]'
  if (label.includes('succeeded') || label.includes('created')) return 'text-[#00d4a0]'
  if (label.includes('processing') || label.includes('pending')) return 'text-[#635bff]'
  return 'text-slate-400'
}

export function EventLog() {
  const { events, status } = usePaymentStore()

  return (
    <div className="h-full flex flex-col bg-[#0a0b14] border-t border-[#1a1b2e]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1b2e] flex-shrink-0">
        <Activity className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Webhook Events</span>
        {status === 'running' && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#635bff] animate-pulse" />
            <span className="text-[10px] text-[#635bff]">live</span>
          </div>
        )}
        {events.length > 0 && status !== 'running' && (
          <span className="ml-auto text-[10px] text-slate-600">{events.length} events</span>
        )}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-700 italic">
            {status === 'idle' ? 'Click "Pay $49.00" to start the simulation' : 'Waiting for events...'}
          </div>
        ) : (
          <div className="flex items-center gap-0 h-full px-2">
            <AnimatePresence initial={false} mode="popLayout">
              {[...events].reverse().map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="flex-shrink-0 flex flex-col justify-center px-3 py-2 mr-2 rounded-lg bg-[#12131e] border border-[#1a1b2e] min-w-[220px]"
                >
                  <div className={`text-[11px] font-mono font-medium ${getEventColor(event.label)}`}>
                    {event.label}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5 truncate">{event.sublabel}</div>
                  <div className="text-[9px] text-slate-700 mt-1">{timeAgo(event.timestamp)}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
