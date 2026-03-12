import { motion, AnimatePresence } from 'framer-motion'
import { X, Code2 } from 'lucide-react'
import { usePaymentStore, STEP_NODE_IDS } from '../store/paymentStore'
import { getPayload } from '../data/payloads'

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
  const { selectedNodeId, scenario, completedSteps, drawerOpen, closeDrawer } = usePaymentStore()

  const stepIndex = selectedNodeId ? STEP_NODE_IDS.indexOf(selectedNodeId) : -1
  const payload = stepIndex >= 0 ? getPayload(stepIndex, scenario) : null

  const formatted = payload
    ? formatValue(payload.data).split('\n')
    : []

  return (
    <AnimatePresence>
      {drawerOpen && payload && (
        <motion.div
          key={selectedNodeId}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="absolute top-0 right-0 h-full w-[340px] bg-[#0c0d18] border-l border-[#1a1b2e] flex flex-col z-10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1b2e]">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#635bff]" />
              <div>
                <div className="text-sm font-semibold text-white">{payload.title}</div>
                <div className="text-[10px] text-slate-600 font-mono">{payload.object}</div>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="text-slate-600 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div className="px-4 py-3 border-b border-[#1a1b2e] bg-[#0a0b14]/60">
            <p className="text-xs text-slate-400 leading-relaxed">{payload.description}</p>
          </div>

          {/* JSON body */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <pre className="text-[11px] font-mono leading-relaxed text-slate-400 whitespace-pre">
              {formatted.map((line, i) => (
                <JsonLine key={i} text={line} />
              ))}
            </pre>
          </div>

          {/* Step indicator */}
          <div className="px-4 py-3 border-t border-[#1a1b2e] flex items-center gap-2">
            <div className="flex gap-1">
              {STEP_NODE_IDS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === stepIndex ? 'w-4 bg-[#635bff]' : completedSteps.has(i) ? 'w-2 bg-[#00d4a0]/60' : 'w-2 bg-[#1e2235]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600 ml-1">
              Step {stepIndex + 1} of {STEP_NODE_IDS.length}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
