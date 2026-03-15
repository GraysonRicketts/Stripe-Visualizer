import { Handle, Position } from '@xyflow/react'
import { Code2, ChevronRight } from 'lucide-react'
import { usePaymentStore, getStepNodeIds, toCreditScenario, toDebitScenario } from '../../store/paymentStore'
import { getPayload as getCreditPayload } from '../../data/credit-success/payloads'
import { getPayload as getDebitPayload } from '../../data/debit-success/payloads'

function compactEntries(data: Record<string, unknown>): Array<{ key: string; val: string }> {
  return Object.entries(data).slice(0, 4).map(([k, v]) => {
    let val: string
    if (v === null) val = 'null'
    else if (typeof v === 'boolean' || typeof v === 'number') val = String(v)
    else if (typeof v === 'string') val = `"${v.length > 24 ? v.slice(0, 24) + '…' : v}"`
    else if (Array.isArray(v)) val = v.length === 0 ? '[]' : '[…]'
    else val = '{…}'
    return { key: k, val }
  })
}

export function PayloadPreviewNode() {
  const { selectedNodeId, scenario, completedSteps, activeStep, failedStep, openDrawer } = usePaymentStore()

  const stepNodeIds = getStepNodeIds(scenario)
  const stepIndex = selectedNodeId ? stepNodeIds.indexOf(selectedNodeId) : -1
  const hasContent =
    stepIndex !== -1 &&
    (completedSteps.has(stepIndex) || activeStep === stepIndex || failedStep === stepIndex)
  const payload = hasContent
    ? scenario.startsWith('credit-')
      ? getCreditPayload(stepIndex, toCreditScenario(scenario))
      : getDebitPayload(stepIndex, toDebitScenario(scenario))
    : null

  return (
    <div className="w-[272px] rounded-xl border border-[#1e2235] bg-[#0c0d18] overflow-hidden shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />

      {payload ? (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#1a1b2e] flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-[#635bff] flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{payload.title}</div>
              <div className="text-[10px] text-slate-600 font-mono">{payload.object}</div>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 py-2.5 border-b border-[#1a1b2e]">
            <p className="text-[11px] text-slate-500 leading-relaxed">{payload.description}</p>
          </div>

          {/* Compact JSON preview */}
          <div className="px-4 py-2.5 border-b border-[#1a1b2e]">
            <pre className="text-[10px] font-mono leading-relaxed">
              <span className="text-slate-500">{'{\n'}</span>
              {compactEntries(payload.data).map(({ key, val }, i) => (
                <span key={i}>
                  {'  '}
                  <span className="text-slate-500">"{key}"</span>
                  <span className="text-slate-600">{': '}</span>
                  <span className="text-[#00d4a0]">{val}</span>
                  <span className="text-slate-600">,</span>
                  {'\n'}
                </span>
              ))}
              <span className="text-slate-600">{'  ...\n'}</span>
              <span className="text-slate-500">{'}'}</span>
            </pre>
          </div>

          {/* View full button */}
          <button
            onClick={openDrawer}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-[#635bff] hover:bg-[#1a1b2e] transition-colors cursor-pointer"
          >
            <span>View full payload</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <div className="px-4 py-6 flex flex-col items-center gap-2 text-center">
          <Code2 className="w-5 h-5 text-slate-700" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Click any active node to<br />inspect its API payload
          </p>
        </div>
      )}
    </div>
  )
}
