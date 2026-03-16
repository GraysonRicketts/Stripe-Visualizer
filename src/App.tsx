import { CheckoutPanel } from './components/CheckoutPanel'
import { FlowGraph } from './components/FlowGraph'
import { TimelineBar } from './components/TimelineBar'

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-[#0a0b14] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1a1b2e] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#635bff] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C4.943 23.102 7.645 24 11.464 24c2.967 0 5.07-.786 6.513-2.043 1.51-1.312 2.243-3.048 2.243-5.158 0-4.14-2.467-5.858-6.244-7.65z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Payment Flow Visualizer</span>
        </div>
        <div className="h-4 w-px bg-[#1a1b2e]" />
        <span className="text-slate-600 text-xs">Stripe infrastructure simulation</span>
      </div>

      {/* Timeline bar */}
      <TimelineBar />

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Checkout Panel */}
        <div className="w-[300px] flex-shrink-0">
          <CheckoutPanel />
        </div>

        {/* Right: Flow Graph */}
        <div className="flex-1 relative min-w-0">
          <FlowGraph />
        </div>
      </div>
    </div>
  )
}
