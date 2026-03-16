import { motion, AnimatePresence } from 'framer-motion'
import { X, Code2, Clock } from 'lucide-react'
import { useNodes, useViewport } from '@xyflow/react'
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

// Must be rendered inside <ReactFlow> to access viewport context
export function PayloadCard() {
  const { selectedNodeId, scenario, selectNode } = usePaymentStore()
  const nodes = useNodes()
  const { y: vpY, zoom } = useViewport()

  const stepNodeIds = getStepNodeIds(scenario)
  const stepIndex = selectedNodeId ? stepNodeIds.indexOf(selectedNodeId) : -1

  const payload = stepIndex >= 0
    ? scenario.startsWith('credit-dispute-')
      ? getDisputePayload(stepIndex, scenario === 'credit-dispute-won' ? 'won' : 'lost')
      : scenario.startsWith('credit-')
        ? getCreditPayload(stepIndex, toCreditScenario(scenario))
        : getDebitPayload(stepIndex, toDebitScenario(scenario))
    : null

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null

  // Convert graph-space Y to screen-space Y within the ReactFlow container
  const screenY = selectedNode ? selectedNode.position.y * zoom + vpY : 0

  // Align card top near the node's vertical center (~40px = half of ~80px node height)
  const cardTop = Math.max(8, screenY + 40 * zoom - 80)

  const formatted = payload ? formatValue(payload.data).split('\n') : []

  return (
    <AnimatePresence>
      {payload && selectedNode && (
        <motion.div
          key={selectedNodeId}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: cardTop,
            right: 16,
            width: 300,
            maxHeight: 420,
            zIndex: 10,
          }}
          className="bg-[#0c0d18] border border-[#1a1b2e] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1b2e] flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Code2 className="w-4 h-4 text-[#635bff] flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{payload.title}</div>
                <div className="text-[11px] text-slate-600 font-mono">{payload.object}</div>
              </div>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timing badge */}
          {payload.timing && (
            <div className="px-4 py-2 border-b border-[#1a1b2e] flex items-center gap-2 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
              <span className="text-xs font-mono font-semibold text-[#f59e0b]">{payload.timing}</span>
              <span className="text-xs text-slate-600">typical latency</span>
            </div>
          )}

          {/* Description */}
          <div className="px-4 py-2.5 border-b border-[#1a1b2e] bg-[#0a0b14]/60 flex-shrink-0">
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{payload.description}</p>
          </div>

          {/* JSON body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            <pre className="text-[11px] font-mono leading-relaxed text-slate-400 whitespace-pre">
              {formatted.map((line, i) => (
                <JsonLine key={i} text={line} />
              ))}
            </pre>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
