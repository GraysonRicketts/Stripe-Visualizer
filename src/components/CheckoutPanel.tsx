import { usePaymentStore, type Scenario } from '../store/paymentStore'

const SCENARIO_LABELS: Record<Scenario, { label: string; color: string; desc: string }> = {
  success: { label: 'Success', color: '#00d4a0', desc: 'Payment authorized and captured' },
  declined: { label: 'Declined', color: '#ff4757', desc: 'Card declined by issuing bank' },
  fraud: { label: 'Fraud Block', color: '#f59e0b', desc: 'Blocked by Radar fraud detection' },
}

export function CheckoutPanel() {
  const { scenario, setScenario, status } = usePaymentStore()
  const isRunning = status === 'running'

  return (
    <div className="flex flex-col h-full bg-[#0c0d18] border-r border-[#1a1b2e] overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#1a1b2e]">
        <h2 className="text-slate-500 text-xl font-semibold mt-2">
          Visualize how a payment flows through Stripe's infrastructure end-to-end.
        </h2>
        <a
          href="https://stripe.dev/blog/building-a-mental-model-for-stripe-payments"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-[#635bff] hover:text-[#7c75ff] transition-colors"
        >
          Read: Building a mental model for Stripe payments
          <svg viewBox="0 0 12 12" className="w-3 h-3 fill-current">
            <path d="M3.5 3a.5.5 0 0 0 0 1H7.3L2.15 9.15a.5.5 0 1 0 .7.7L8 4.7V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5z"/>
          </svg>
        </a>
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
    </div>
  )
}
