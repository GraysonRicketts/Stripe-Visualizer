import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
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

const BURST_PARTICLES = [
  { angle: 0,   color: '#635bff', dist: 58, size: 7 },
  { angle: 36,  color: '#00d4a0', dist: 52, size: 5 },
  { angle: 72,  color: '#f472b6', dist: 64, size: 8 },
  { angle: 108, color: '#f59e0b', dist: 50, size: 6 },
  { angle: 144, color: '#60a5fa', dist: 60, size: 5 },
  { angle: 180, color: '#a78bfa', dist: 55, size: 7 },
  { angle: 216, color: '#34d399', dist: 48, size: 6 },
  { angle: 252, color: '#fb923c', dist: 62, size: 5 },
  { angle: 288, color: '#ff6b8a', dist: 56, size: 8 },
  { angle: 324, color: '#818cf8', dist: 50, size: 6 },
  { angle: 18,  color: '#00d4a0', dist: 44, size: 4 },
  { angle: 90,  color: '#635bff', dist: 68, size: 5 },
  { angle: 162, color: '#f59e0b', dist: 46, size: 4 },
  { angle: 234, color: '#f472b6', dist: 66, size: 5 },
  { angle: 306, color: '#60a5fa', dist: 42, size: 4 },
]

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

  const btnControls = useAnimation()
  const shineControls = useAnimation()
  const hasInteracted = useRef(false)
  const [burstActive, setBurstActive] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      if (hasInteracted.current || isRunning || isDone) return

      // Confetti burst
      setBurstActive(true)
      setTimeout(() => setBurstActive(false), 900)

      // Button: big scale pop + purple glow
      btnControls.start({
        scale: [1, 1.28, 1.1, 1.04, 1],
        transition: { duration: 1.25, ease: [0.22, 1, 0.36, 1] },
      })

      // Chrome shine sweep
      shineControls.start({
        x: '260%',
        transition: { duration: 1.55, delay: 0.06, ease: 'easeInOut' },
      }).then(() => shineControls.set({ x: '-100%' }))

    }, 5000)
    return () => clearInterval(id)
  }, [isRunning, isDone, btnControls, shineControls])

  const stepNodeIds = getStepNodeIds(scenario)
  const stepLabels = getStepLabels(scenario)
  const returnPathStart = getReturnPathStart(scenario)
  const selectedStepIndex = selectedNodeId ? stepNodeIds.indexOf(selectedNodeId) : -1

  function handlePlayButton() {
    hasInteracted.current = true
    if (isRunning) {
      stopPlay()
    } else if (isDone) {
      reset()
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
    const nextIsReturnPath = returnPathStart !== -1 && i + 1 >= returnPathStart
    const currentIsReturnPath = returnPathStart !== -1 && i >= returnPathStart

    if (failedStep === i + 1 && !nextIsReturnPath) return '#ff4757'
    if (failedStep === i && !currentIsReturnPath) return '#ff4757'

    if (returnCompletedSteps.has(i) && returnCompletedSteps.has(i + 1)) return '#f59e0b'
    if (failedStep === i && returnCompletedSteps.has(i + 1)) return '#f59e0b'
    if (activeStep === i && nextIsReturnPath) return '#f59e0b'
    if (activeStep === i + 1 && nextIsReturnPath) return '#f59e0b'

    if (completedSteps.has(i) && (completedSteps.has(i + 1) || activeStep === i + 1)) return '#00d4a0'
    if (activeStep === i) return '#635bff'
    return '#1e2235'
  }

  return (
    <div className="flex-shrink-0 flex items-center gap-4 px-5 py-3 bg-[#0a0b14] border-b border-[#1a1b2e]">
      {/* Play / Stop / Reset button — wrapper needed for confetti positioning */}
      <div className="relative flex-shrink-0">

        {/* Confetti particles */}
        <AnimatePresence>
          {burstActive && BURST_PARTICLES.map((p) => (
            <motion.div
              key={p.angle}
              initial={{ opacity: 1, scale: 1.4, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 0,
                x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
                y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
              }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: p.angle % 72 === 0 ? 2 : '50%',
                backgroundColor: p.color,
                top: '50%',
                left: '50%',
                marginTop: -(p.size / 2),
                marginLeft: -(p.size / 2),
                pointerEvents: 'none',
                zIndex: 20,
              }}
            />
          ))}
        </AnimatePresence>

        <motion.button
          animate={btnControls}
          onClick={handlePlayButton}
          className={`relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold transition-colors duration-200 ${
            isRunning
              ? 'bg-[#1a1b2e] border border-[#2a2d4a] text-slate-300 hover:text-white hover:border-slate-500'
              : isDone
              ? 'bg-[#1a1b2e] border border-[#2a2d4a] text-slate-300 hover:bg-[#20223a] hover:text-white'
              : 'bg-[#635bff] hover:bg-[#7c75ff] text-white shadow-lg shadow-[#635bff]/20'
          }`}
        >
          {/* Chrome shine strip */}
          <motion.div
            animate={shineControls}
            initial={{ x: '-100%' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '55%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Button label */}
          <span className="relative z-10 flex items-center gap-2">
            {isRunning ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                Stop
              </>
            ) : isDone ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Reset
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Play
              </>
            )}
          </span>
        </motion.button>
      </div>

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
