import { motion } from 'framer-motion'
import { X, Code2, Clock } from 'lucide-react'
import { usePaymentStore, getStepNodeIds, toCreditScenario, toDebitScenario } from '../../store/paymentStore'
import { getPayload as getCreditPayload } from '../../data/credit-success/payloads'
import { getPayload as getDebitPayload } from '../../data/debit-success/payloads'
import { getPayload as getDisputePayload } from '../../data/credit-dispute-won/payloads'

// Rendered as a React Flow node — lives in graph space, scales with zoom
export function PayloadCardNode() {
  const { selectedNodeId, scenario, selectNode } = usePaymentStore()

  const stepNodeIds = getStepNodeIds(scenario)
  const stepIndex = selectedNodeId ? stepNodeIds.indexOf(selectedNodeId) : -1

  const payload = stepIndex >= 0
    ? scenario.startsWith('credit-dispute-')
      ? getDisputePayload(stepIndex, scenario === 'credit-dispute-won' ? 'won' : 'lost')
      : scenario.startsWith('credit-')
        ? getCreditPayload(stepIndex, toCreditScenario(scenario))
        : getDebitPayload(stepIndex, toDebitScenario(scenario))
    : null

  if (!payload) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="w-[280px] rounded-xl border border-[#2a2d4a] bg-[#0c0d18] shadow-2xl flex flex-col overflow-hidden nopan"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1a1b2e]">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-3.5 h-3.5 text-[#635bff] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate leading-tight">{payload.title}</div>
            <div className="text-[10px] text-slate-600 font-mono leading-tight">{payload.object}</div>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 ml-2 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timing badge */}
      {payload.timing && (
        <div className="px-3 py-1.5 border-b border-[#1a1b2e] flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#f59e0b] flex-shrink-0" />
          <span className="text-[10px] font-mono font-semibold text-[#f59e0b]">{payload.timing}</span>
          <span className="text-[10px] text-slate-600">typical latency</span>
        </div>
      )}

      {/* Description */}
      <div className="px-3 py-2.5 bg-[#0a0b14]/60">
        <p className="text-[11px] text-slate-400 leading-relaxed">{payload.description}</p>
      </div>
    </motion.div>
  )
}
