import { usePaymentStore, type CombinedScenario } from '../store/paymentStore'

const SCENARIOS: { value: CombinedScenario; label: string; color: string; desc: string }[] = [
  { value: 'credit-success',           label: 'Credit Card — Success',           color: '#00d4a0', desc: 'Payment authorized and captured' },
  { value: 'credit-declined',          label: 'Credit Card — Declined',          color: '#ff4757', desc: 'Card declined by issuing bank' },
  { value: 'credit-fraud',             label: 'Credit Card — Fraud Block',       color: '#f59e0b', desc: 'Blocked by Radar fraud detection' },
  { value: 'debit-success',            label: 'Debit Card — Success',            color: '#00d4a0', desc: 'Debit authorized and settled via ACH' },
  { value: 'debit-insufficient-funds', label: 'Debit Card — Insufficient Funds', color: '#ff4757', desc: 'Balance check fails at issuing bank' },
  { value: 'credit-dispute-won',       label: 'Dispute — Merchant Wins',         color: '#00d4a0', desc: 'Merchant submits evidence and wins' },
  { value: 'credit-dispute-lost',      label: 'Dispute — Merchant Loses',        color: '#ff4757', desc: 'Issuer rules in favor of cardholder' },
]

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
          {SCENARIOS.map(({ value, label, color, desc }) => {
            const active = scenario === value
            return (
              <button
                key={value}
                onClick={() => !isRunning && setScenario(value)}
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
