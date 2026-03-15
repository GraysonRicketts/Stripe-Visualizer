import { motion, AnimatePresence } from 'framer-motion'
import { X, Code2, Clock } from 'lucide-react'
import { usePaymentStore, getStepNodeIds, toCreditScenario, toDebitScenario } from '../store/paymentStore'
import { getPayload as getCreditPayload } from '../data/credit-success/payloads'
import { getPayload as getDebitPayload } from '../data/debit-success/payloads'
import { getPayload as getDisputePayload } from '../data/credit-dispute-won/payloads'

function formatValue(value: unknown, depth = 0): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return `"${value}"`
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const indent = '  '.repeat(depth + 1)
    const items = value.map((v) => `${indent}${formatValue(v, depth + 1)}`).join(',\n')
    return `[\n${items}\n${'  '.repeat(depth)}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const indent = '  '.repeat(depth + 1)
    const lines = entries
      .map(([k, v]) => `${indent}"${k}": ${formatValue(v, depth + 1)}`)
      .join(',\n')
    return `{\n${lines}\n${'  '.repeat(depth)}}`
  }
  return String(value)
}

function JsonLine({ text }: { text: string }) {
  const colored = text
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"(,?)$/g, ': <span class="json-string">"$1"</span>$2')
    .replace(/: (\d+\.?\d*)(,?)$/g, ': <span class="json-number">$1</span>$2')
    .replace(/: (true|false)(,?)$/g, ': <span class="json-boolean">$1</span>$2')
    .replace(/: (null)(,?)$/g, ': <span class="json-null">$1</span>$2')

  return <div dangerouslySetInnerHTML={{ __html: colored }} />
}

export function PayloadDrawer() {
  const { selectedNodeId, scenario, drawerOpen, closeDrawer } = usePaymentStore()

  const stepNodeIds = getStepNodeIds(scenario)
  const stepIndex = selectedNodeId ? stepNodeIds.indexOf(selectedNodeId) : -1
  const payload = stepIndex >= 0
    ? scenario.startsWith('credit-dispute-')
      ? getDisputePayload(stepIndex, scenario === 'credit-dispute-won' ? 'won' : 'lost')
      : scenario.startsWith('credit-')
        ? getCreditPayload(stepIndex, toCreditScenario(scenario))
        : getDebitPayload(stepIndex, toDebitScenario(scenario))
    : null

  const formatted = payload
    ? formatValue(payload.data).split('\n')
    : []

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="absolute top-0 right-0 h-full w-[340px] bg-[#0c0d18] border-l border-[#1a1b2e] flex flex-col z-10 shadow-2xl"
        >
          {payload ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1b2e]">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#635bff]" />
                  <div>
                    <div className="text-lg font-semibold text-white">{payload.title}</div>
                    <div className="text-md text-slate-600 font-mono">{payload.object}</div>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Timing badge */}
              {payload.timing && (
                <div className="px-4 py-2 border-b border-[#1a1b2e] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
                  <span className="text-sm font-mono font-semibold text-[#f59e0b]">{payload.timing}</span>
                  <span className="text-xs text-slate-600">typical latency</span>
                </div>
              )}

              {/* Description */}
              <div className="px-4 py-3 border-b border-[#1a1b2e] bg-[#0a0b14]/60">
                <p className="text-lg text-slate-400 leading-relaxed">{payload.description}</p>
              </div>

              {/* JSON body */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <pre className="text-sm font-mono leading-relaxed text-slate-400 whitespace-pre">
                  {formatted.map((line, i) => (
                    <JsonLine key={i} text={line} />
                  ))}
                </pre>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1b2e]">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#635bff]" />
                  <span className="text-sm font-semibold text-white">API Payload</span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Placeholder */}
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <Code2 className="w-8 h-8 text-slate-700" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  Click any active node to inspect its API payload
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
