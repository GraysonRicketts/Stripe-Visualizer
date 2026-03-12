import { create } from 'zustand'

export type Scenario = 'success' | 'declined' | 'fraud'
export type PaymentStatus = 'idle' | 'running' | 'complete' | 'failed'

export interface WebhookEvent {
  id: string
  label: string
  sublabel: string
  timestamp: number
}

interface PaymentStore {
  scenario: Scenario
  activeStep: number   // -1 = none active
  completedSteps: Set<number>
  failedStep: number   // -1 = none failed
  status: PaymentStatus
  selectedNodeId: string | null
  events: WebhookEvent[]
  drawerOpen: boolean

  setScenario: (s: Scenario) => void
  startPayment: () => void
  reset: () => void
  selectNode: (id: string | null) => void
  openDrawer: () => void
  closeDrawer: () => void
}

const STEP_DURATION = 900  // ms each step takes to "process"
const STEP_PAUSE = 400     // ms between steps

const SCENARIO_FAIL_STEP: Record<Scenario, number> = {
  success: -1,
  declined: 5,   // IssuingBank
  fraud: 3,      // Radar
}

const STEP_EVENTS: Array<{ label: string; sublabel: string } | null> = [
  { label: 'payment_method.created', sublabel: 'Token pm_xxx generated' },
  { label: 'payment_intent.created', sublabel: 'id: pi_xxx, status: requires_payment_method' },
  { label: 'payment_intent.processing', sublabel: 'Charge ch_xxx created' },
  { label: 'radar.early_fraud_warning.created', sublabel: 'risk_level: normal, risk_score: 12' },
  { label: 'charge.pending', sublabel: 'Auth request sent to Visa network' },
  { label: 'charge.succeeded', sublabel: 'Bank approved, code: 00' },
  { label: 'payment_intent.succeeded', sublabel: 'amount_captured: 4900' },
  { label: 'payout.created', sublabel: 'arrival_date: T+2, type: bank_account' },
]

const FRAUD_EVENTS: Array<{ label: string; sublabel: string } | null> = [
  ...STEP_EVENTS.slice(0, 3),
  { label: 'radar.early_fraud_warning.created', sublabel: 'risk_level: highest, risk_score: 94' },
]

const DECLINED_EVENTS: Array<{ label: string; sublabel: string } | null> = [
  ...STEP_EVENTS.slice(0, 5),
  { label: 'charge.failed', sublabel: 'failure_code: card_declined, bank: 05' },
]

export const STEP_NODE_IDS = [
  'customer',
  'stripe-js',
  'stripe-api',
  'radar',
  'network',
  'bank',
  'merchant',
  'payout',
]

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  scenario: 'success',
  activeStep: -1,
  completedSteps: new Set(),
  failedStep: -1,
  status: 'idle',
  selectedNodeId: null,
  events: [],
  drawerOpen: false,

  setScenario: (scenario) => {
    const { status } = get()
    if (status === 'running') return
    set({ scenario })
  },

  reset: () => {
    set({
      activeStep: -1,
      completedSteps: new Set(),
      failedStep: -1,
      status: 'idle',
      selectedNodeId: null,
      events: [],
      drawerOpen: false,
    })
  },

  selectNode: (id) => set({ selectedNodeId: id }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  startPayment: () => {
    const { status, scenario } = get()
    if (status === 'running') return

    set({
      status: 'running',
      activeStep: -1,
      completedSteps: new Set(),
      failedStep: -1,
      selectedNodeId: null,
      events: [],
    })

    const failStep = SCENARIO_FAIL_STEP[scenario]
    const eventList = scenario === 'fraud' ? FRAUD_EVENTS : scenario === 'declined' ? DECLINED_EVENTS : STEP_EVENTS

    const runStep = (step: number) => {
      if (step > 7) {
        set({ status: 'complete', activeStep: -1 })
        return
      }

      // Set this step as active
      set({ activeStep: step, selectedNodeId: STEP_NODE_IDS[step] })

      setTimeout(() => {
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

        setTimeout(() => runStep(step + 1), STEP_PAUSE)
      }, STEP_DURATION)
    }

    setTimeout(() => runStep(0), 300)
  },
}))
