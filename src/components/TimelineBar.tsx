import { Play, Square, RotateCcw } from 'lucide-react'
import { usePaymentStore, getStepNodeIds, getReturnPathStart, type CombinedScenario } from '../store/paymentStore'

function getStepLabels(scenario: CombinedScenario): string[] {
  if (scenario === 'debit-insufficient-funds') {
    return ['Browser', 'Stripe.js', 'API', 'Radar', 'Debit Net', 'PIN', 'Balance', 'Net↩', 'API↩', 'Declined']
  }
  if (scenario === 'debit-success') {
    return ['Browser', 'Stripe.js', 'API', 'Radar', 'Debit Net', 'PIN', 'Balance', 'Merchant', 'ACH']
  }
  if (scenario === 'credit-declined') {
    return ['Browser', 'Stripe.js', 'API', 'Radar', 'Network', 'Bank', 'Net↩', 'API↩', 'Declined']
  }
  if (scenario === 'credit-fraud') {
    return ['Browser', 'Stripe.js', 'API', 'Radar', 'API↩', 'Blocked']
  }
  return ['Browser', 'Stripe.js', 'API', 'Radar', 'Network', 'Bank', 'Merchant', 'Payout']
}

export function TimelineBar() {
  const {
    scenario,
    status,
    activeStep,
    completedSteps,
    returnCompletedSteps,
    failedStep,
    selectedNodeId,
    play,
    stopPlay,
    jumpToStep,
    reset,
  } = usePaymentStore()

  const isRunning = status === 'running'
  const isDone = status === 'complete' || status === 'failed'

  const stepNodeIds = getStepNodeIds(scenario)
  const stepLabels = getStepLabels(scenario)
  const returnPathStart = getReturnPathStart(scenario)
  const selectedStepIndex = selectedNodeId ? stepNodeIds.indexOf(selectedNodeId) : -1

  function handlePlayButton() {
    if (isRunning) {
      stopPlay()
    } else if (isDone) {
      reset()
      // play will be triggered by user clicking Play again after reset
    } else {
      play(selectedStepIndex >= 0 ? selectedStepIndex : 0)
    }
  }

  function getNodeStyle(i: number): { bg: string; border: string; ring: boolean; pulse: boolean } {
    if (failedStep === i) return { bg: '#ff4757', border: '#ff4757', ring: false, pulse: false }
    if (returnCompletedSteps.has(i)) return { bg: '#f59e0b', border: '#f59e0b', ring: false, pulse: false }
    if (activeStep === i) {
      const isReturnActive = returnPathStart !== -1 && i >= returnPathStart
      const color = isReturnActive ? '#f59e0b' : '#635bff'
      return { bg: color, border: color, ring: false, pulse: true }
    }
    if (completedSteps.has(i)) return { bg: '#00d4a0', border: '#00d4a0', ring: false, pulse: false }
    if (selectedStepIndex === i && !isRunning) return { bg: 'transparent', border: '#635bff', ring: true, pulse: false }
    return { bg: '#1e2235', border: '#1e2235', ring: false, pulse: false }
  }

  function getConnectorColor(i: number): string {
    // connector between node i and i+1
    const nextIsReturnPath = returnPathStart !== -1 && i + 1 >= returnPathStart
    const currentIsReturnPath = returnPathStart !== -1 && i >= returnPathStart

    if (failedStep === i + 1 && !nextIsReturnPath) return '#ff4757'
    if (failedStep === i && !currentIsReturnPath) return '#ff4757'

    if (returnCompletedSteps.has(i) && returnCompletedSteps.has(i + 1)) return '#f59e0b'
    // Entry edge from failedStep into first return-path node
    if (failedStep === i && returnCompletedSteps.has(i + 1)) return '#f59e0b'
    if (activeStep === i && nextIsReturnPath) return '#f59e0b'
    if (activeStep === i + 1 && nextIsReturnPath) return '#f59e0b'

    if (completedSteps.has(i) && (completedSteps.has(i + 1) || activeStep === i + 1)) return '#00d4a0'
    if (activeStep === i) return '#635bff'
    return '#1e2235'
  }

  return (
    <div className="flex-shrink-0 flex items-center gap-4 px-5 py-3 bg-[#0a0b14] border-b border-[#1a1b2e]">
      {/* Play / Stop / Reset button */}
      <button
        onClick={handlePlayButton}
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          isRunning
            ? 'bg-[#1a1b2e] border border-[#2a2d4a] text-slate-300 hover:text-white hover:border-slate-500'
            : isDone
            ? 'bg-[#1a1b2e] border border-[#2a2d4a] text-slate-300 hover:bg-[#20223a] hover:text-white'
            : 'bg-[#635bff] hover:bg-[#7c75ff] text-white shadow-lg shadow-[#635bff]/20'
        }`}
      >
        {isRunning ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </>
        ) : isDone ? (
          <>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            Play
          </>
        )}
      </button>

      {/* Divider */}
      <div className="h-8 w-px bg-[#1a1b2e] flex-shrink-0" />

      {/* Timeline steps */}
      <div className="flex-1 flex items-center min-w-0">
        {stepNodeIds.map((_, i) => {
          const { bg, border, ring, pulse } = getNodeStyle(i)
          const connectorColor = i < stepNodeIds.length - 1 ? getConnectorColor(i) : null

          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              {/* Step node */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => !isRunning && jumpToStep(i)}
                  disabled={isRunning}
                  title={stepLabels[i]}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 text-[10px] font-bold ${
                    isRunning ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-125'
                  } ${pulse ? 'animate-pulse' : ''}`}
                  style={{
                    background: bg,
                    border: `2px solid ${border}`,
                    boxShadow: ring ? `0 0 0 2px #635bff40` : pulse ? '0 0 10px 2px rgba(99,91,255,0.4)' : 'none',
                    color: bg === 'transparent' ? '#635bff' : '#fff',
                  }}
                >
                  {i + 1}
                </button>
                <span className="text-[9px] text-slate-600 whitespace-nowrap">{stepLabels[i]}</span>
              </div>

              {/* Connector line */}
              {connectorColor && (
                <div
                  className="flex-1 h-px mx-1 transition-colors duration-300"
                  style={{ background: connectorColor }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
