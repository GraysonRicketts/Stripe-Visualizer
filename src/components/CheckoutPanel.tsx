import { usePaymentStore, type Scenario } from '../store/paymentStore'
import { CreditCard, Lock, RefreshCw } from 'lucide-react'

const SCENARIO_LABELS: Record<Scenario, { label: string; color: string; desc: string }> = {
  success: { label: 'Success', color: '#00d4a0', desc: 'Payment authorized and captured' },
  declined: { label: 'Declined', color: '#ff4757', desc: 'Card declined by issuing bank' },
  fraud: { label: 'Fraud Block', color: '#f59e0b', desc: 'Blocked by Radar fraud detection' },
}

export function CheckoutPanel() {
  const { scenario, setScenario, startPayment, reset, status } = usePaymentStore()
  const isRunning = status === 'running'
  const isDone = status === 'complete' || status === 'failed'

  return (
    <div className="flex flex-col h-full bg-[#0c0d18] border-r border-[#1a1b2e] overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#1a1b2e]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-md bg-[#635bff] flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">stripe</span>
          <span className="text-slate-500 text-xs ml-1">checkout</span>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Visualize how a payment flows through Stripe's infrastructure end-to-end.
        </p>
      </div>

      {/* Scenario Picker */}
      <div className="px-6 pt-5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
          Scenario
        </label>
        <div className="flex flex-col gap-2">
          {(Object.keys(SCENARIO_LABELS) as Scenario[]).map((s) => {
            const { label, color, desc } = SCENARIO_LABELS[s]
            const active = scenario === s
            return (
              <button
                key={s}
                onClick={() => !isRunning && setScenario(s)}
                disabled={isRunning}
                className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? 'border-[#635bff]/60 bg-[#1a1b2e]'
                    : 'border-[#1a1b2e] bg-transparent hover:border-[#2a2d4a] hover:bg-[#12131e]'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: active ? color : '#374151' }}
                  />
                  <span className="text-sm font-medium text-slate-200">{label}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 ml-4">{desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Order summary */}
      <div className="px-6 pt-5 flex-1">
        <div className="rounded-lg bg-[#12131e] border border-[#1a1b2e] p-3 mb-5">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-slate-200 font-medium">Professional Plan</div>
              <div className="text-xs text-slate-500">Monthly subscription</div>
            </div>
            <div className="text-sm font-semibold text-white">$49.00</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 pb-6 space-y-3">
        {isDone ? (
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-3 bg-[#1a1b2e] border border-[#2a2d4a] text-slate-300 text-sm font-medium hover:bg-[#20223a] hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        ) : (
          <button
            onClick={startPayment}
            disabled={isRunning}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200 ${
              isRunning
                ? 'bg-[#635bff]/50 text-white/50 cursor-not-allowed'
                : 'bg-[#635bff] hover:bg-[#7c75ff] text-white shadow-lg shadow-[#635bff]/20 hover:shadow-[#635bff]/30'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin 0.7s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Pay $49.00
              </>
            )}
          </button>
        )}

      </div>
    </div>
  )
}
