import { create } from 'zustand'
import type { CreditScenario } from '../data/credit/payloads'
import type { DebitScenario } from '../data/debit/payloads'

export type { CreditScenario, DebitScenario }
export type FlowType = 'credit' | 'debit'
export type Scenario = CreditScenario | DebitScenario
export type PaymentStatus = 'idle' | 'running' | 'complete' | 'failed'

export interface WebhookEvent {
  id: string
  label: string
  sublabel: string
  timestamp: number
}

interface PaymentStore {
  flowType: FlowType
  scenario: Scenario
  activeStep: number   // -1 = none active
  completedSteps: Set<number>
  failedStep: number   // -1 = none failed
  status: PaymentStatus
  selectedNodeId: string | null
  events: WebhookEvent[]
  drawerOpen: boolean

  setFlowType: (f: FlowType) => void
  setScenario: (s: Scenario) => void
  play: (fromStep: number) => void
  stopPlay: () => void
  jumpToStep: (step: number) => void
  reset: () => void
  selectNode: (id: string | null) => void
  openDrawer: () => void
  closeDrawer: () => void
}

const STEP_DURATION = 900  // ms each step takes to "process"
const STEP_PAUSE = 400     // ms between steps

export const STEP_NODE_IDS: Record<FlowType, string[]> = {
  credit: ['customer', 'stripe-js', 'stripe-api', 'radar', 'network', 'bank', 'merchant', 'payout'],
  debit: ['customer', 'stripe-js', 'stripe-api', 'radar', 'debit-network', 'pin-verify', 'balance-check', 'merchant', 'ach-settlement'],
}

type EventDef = { label: string; sublabel: string }

// ── Credit scenarios ──────────────────────────────────────────────────────────

const CREDIT_SUCCESS_EVENTS: EventDef[] = [
  { label: 'payment_method.created', sublabel: 'PAN vaulted, token pm_xxx issued' },
  { label: 'payment_intent.created', sublabel: 'id: pi_xxx, status: requires_payment_method' },
  { label: 'payment_intent.processing', sublabel: 'Charge ch_xxx created' },
  { label: 'radar.early_fraud_warning.created', sublabel: 'risk_level: normal, risk_score: 12' },
  { label: 'charge.pending', sublabel: 'Auth request sent to Visa network' },
  { label: 'charge.succeeded', sublabel: 'Bank approved, code: 00' },
  { label: 'payment_intent.succeeded', sublabel: 'capture_method: automatic, amount_captured: 4900' },
  { label: 'payout.created', sublabel: 'arrival_date: T+2, type: bank_account' },
]

const CREDIT_DECLINED_EVENTS: EventDef[] = [
  ...CREDIT_SUCCESS_EVENTS.slice(0, 5),
  { label: 'charge.failed', sublabel: 'failure_code: card_declined, bank: 05' },
]

const CREDIT_FRAUD_EVENTS: EventDef[] = [
  ...CREDIT_SUCCESS_EVENTS.slice(0, 3),
  { label: 'radar.early_fraud_warning.created', sublabel: 'risk_level: highest, risk_score: 94' },
]

const CREDIT_SCENARIO_CONFIG: Record<CreditScenario, { failStep: number; events: EventDef[] }> = {
  success:  { failStep: -1, events: CREDIT_SUCCESS_EVENTS },
  declined: { failStep: 5,  events: CREDIT_DECLINED_EVENTS },
  fraud:    { failStep: 3,  events: CREDIT_FRAUD_EVENTS },
}

// ── Debit scenarios ───────────────────────────────────────────────────────────

const DEBIT_SUCCESS_EVENTS: EventDef[] = [
  { label: 'payment_method.created', sublabel: 'PAN vaulted, debit token pm_xxx issued' },
  { label: 'payment_intent.created', sublabel: 'id: pi_xxx, funding: debit' },
  { label: 'payment_intent.processing', sublabel: 'Charge ch_xxx queued for debit network' },
  { label: 'radar.early_fraud_warning.created', sublabel: 'risk_level: normal, risk_score: 8' },
  { label: 'charge.pending', sublabel: 'Auth request sent to Star network' },
  { label: 'payment_method.updated', sublabel: 'PIN verification: success, code: 00' },
  { label: 'charge.pending', sublabel: 'Balance verified: sufficient_funds: true' },
  { label: 'charge.succeeded', sublabel: 'Immediate debit — no capture phase, code: 00' },
  { label: 'payout.created', sublabel: 'method: same_day_ach, arrival: today' },
]

const DEBIT_INSUFFICIENT_FUNDS_EVENTS: EventDef[] = [
  ...DEBIT_SUCCESS_EVENTS.slice(0, 6),
  { label: 'charge.failed', sublabel: 'failure_code: insufficient_funds, bank: 51' },
]

const DEBIT_SCENARIO_CONFIG: Record<DebitScenario, { failStep: number; events: EventDef[] }> = {
  success:            { failStep: -1, events: DEBIT_SUCCESS_EVENTS },
  insufficient_funds: { failStep: 6,  events: DEBIT_INSUFFICIENT_FUNDS_EVENTS },
}

// ── Module-level timeout tracking ─────────────────────────────────────────────

let activeTimeouts: ReturnType<typeof setTimeout>[] = []
function clearAllTimeouts() {
  activeTimeouts.forEach(clearTimeout)
  activeTimeouts = []
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  flowType: 'credit',
  scenario: 'success',
  activeStep: -1,
  completedSteps: new Set(),
  failedStep: -1,
  status: 'idle',
  selectedNodeId: null,
  events: [],
  drawerOpen: true,

  setFlowType: (flowType) => {
    clearAllTimeouts()
    set({
      flowType,
      scenario: 'success',
      activeStep: -1,
      completedSteps: new Set(),
      failedStep: -1,
      status: 'idle',
      selectedNodeId: null,
      events: [],
      drawerOpen: true,
    })
  },

  setScenario: (scenario) => {
    const { status } = get()
    if (status === 'running') return
    set({ scenario })
  },

  reset: () => {
    clearAllTimeouts()
    set({
      activeStep: -1,
      completedSteps: new Set(),
      failedStep: -1,
      status: 'idle',
      selectedNodeId: null,
      events: [],
      drawerOpen: true,
    })
  },

  stopPlay: () => {
    clearAllTimeouts()
    set({ status: 'idle' })
  },

  jumpToStep: (step: number) => {
    clearAllTimeouts()
    const { flowType } = get()
    const preCompleted = new Set(Array.from({ length: step }, (_, i) => i))
    set({
      status: 'idle',
      activeStep: -1,
      completedSteps: preCompleted,
      failedStep: -1,
      selectedNodeId: STEP_NODE_IDS[flowType][step],
      drawerOpen: true,
    })
  },

  play: (fromStep: number) => {
    const { status, scenario, flowType } = get()
    if (status === 'running') return

    clearAllTimeouts()

    const preCompleted = new Set(Array.from({ length: fromStep }, (_, i) => i))
    const config = flowType === 'credit'
      ? CREDIT_SCENARIO_CONFIG[scenario as CreditScenario]
      : DEBIT_SCENARIO_CONFIG[scenario as DebitScenario]
    const { failStep, events: eventList } = config
    const totalSteps = STEP_NODE_IDS[flowType].length

    set({
      status: 'running',
      activeStep: -1,
      completedSteps: preCompleted,
      failedStep: -1,
      selectedNodeId: null,
      events: [],
    })

    const runStep = (step: number) => {
      if (step >= totalSteps) {
        set({ status: 'complete', activeStep: -1 })
        return
      }

      set({ activeStep: step, selectedNodeId: STEP_NODE_IDS[flowType][step] })

      const t1 = setTimeout(() => {
        const eventDef = eventList[step]
        if (eventDef) {
          set((state) => ({
            events: [
              {
                id: `evt-${step}-${Date.now()}`,
                label: eventDef.label,
                sublabel: eventDef.sublabel,
                timestamp: Date.now(),
              },
              ...state.events,
            ],
          }))
        }

        if (step === failStep) {
          set({ status: 'failed', failedStep: step, activeStep: -1 })
          return
        }

        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
          activeStep: -1,
        }))

        const t2 = setTimeout(() => runStep(step + 1), STEP_PAUSE)
        activeTimeouts.push(t2)
      }, STEP_DURATION)

      activeTimeouts.push(t1)
    }

    const t0 = setTimeout(() => runStep(fromStep), 300)
    activeTimeouts.push(t0)
  },

  selectNode: (id) => set({ selectedNodeId: id, drawerOpen: id !== null }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}))
