import { Handle, Position } from '@xyflow/react'
import { usePaymentStore, STEP_NODE_IDS } from '../../store/paymentStore'
import type { NodeData } from '../../data/flowLayout'
import {
  Monitor,
  Shield,
  Server,
  Radar,
  Network,
  Building2,
  Store,
  Banknote,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'

const ICONS: Record<string, React.ElementType> = {
  monitor: Monitor,
  shield: Shield,
  server: Server,
  radar: Radar,
  network: Network,
  bank: Building2,
  store: Store,
  payout: Banknote,
}

interface PaymentNodeProps {
  data: NodeData
}

export function PaymentNode({ data }: PaymentNodeProps) {
  const { activeStep, completedSteps, failedStep, status, selectNode } = usePaymentStore()
  const { label, sublabel, stepIndex, icon } = data

  const isActive = activeStep === stepIndex
  const isCompleted = completedSteps.has(stepIndex)
  const isFailed = failedStep === stepIndex

  const IconComponent = ICONS[icon] ?? Monitor

  let borderColor = 'border-[#1e2235]'
  let bgColor = 'bg-[#12131e]'
  let iconColor = 'text-slate-500'
  let labelColor = 'text-slate-400'
  let glowStyle = {}
  let animStyle: React.CSSProperties = {}

  if (isActive) {
    borderColor = 'border-[#635bff]'
    bgColor = 'bg-[#1a1b2e]'
    iconColor = 'text-[#635bff]'
    labelColor = 'text-white'
    glowStyle = { boxShadow: '0 0 16px 4px rgba(99,91,255,0.35)' }
    animStyle = { animation: 'pulse-glow 1.5s ease-in-out infinite' }
  } else if (isFailed) {
    borderColor = 'border-[#ff4757]'
    bgColor = 'bg-[#1e1215]'
    iconColor = 'text-[#ff4757]'
    labelColor = 'text-[#ff4757]'
    glowStyle = { boxShadow: '0 0 12px 3px rgba(255,71,87,0.3)' }
    animStyle = { animation: 'shake 0.4s ease-in-out' }
  } else if (isCompleted) {
    borderColor = 'border-[#00d4a0]/40'
    bgColor = 'bg-[#0f1a16]'
    iconColor = 'text-[#00d4a0]'
    labelColor = 'text-slate-300'
  }

  const clickable = isCompleted || isActive || isFailed
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEP_NODE_IDS.length - 1

  return (
    <div
      className={`relative w-[260px] rounded-xl border ${borderColor} ${bgColor} px-4 py-3 transition-all duration-300 ${clickable ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}`}
      style={{ ...glowStyle, ...animStyle }}
      onClick={() => {
        if (clickable) selectNode(STEP_NODE_IDS[stepIndex])
      }}
    >
      {!isFirst && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-transparent !border-0 !w-0 !h-0"
        />
      )}

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-[#0a0b14] border border-[#1e2235] ${isActive ? 'border-[#635bff]/40' : ''}`}>
          <IconComponent className={`w-4 h-4 ${iconColor}`} />
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold leading-tight ${labelColor} transition-colors duration-300`}>
            {label}
          </div>
          <div className="text-xs text-slate-600 mt-0.5 truncate">{sublabel}</div>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {isActive && (
            <Loader2 className="w-4 h-4 text-[#635bff] animate-spin" />
          )}
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 text-[#00d4a0]" />
          )}
          {isFailed && (
            <XCircle className="w-4 h-4 text-[#ff4757]" />
          )}
          {!isActive && !isCompleted && !isFailed && status !== 'idle' && (
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          )}
        </div>
      </div>

      {!isLast && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-transparent !border-0 !w-0 !h-0"
        />
      )}
    </div>
  )
}
