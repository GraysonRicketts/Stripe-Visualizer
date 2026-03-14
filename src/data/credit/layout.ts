import type { Node, Edge } from '@xyflow/react'
import { NODE_X, Y, buildSwimlaneNodes } from '../swimlanes'

export type { NodeData } from '../swimlanes'

const BG_HEIGHT = 1500 // covers 8 steps + time chasm + header + padding

const FLOW_NODES: Node[] = [
  {
    id: 'customer',
    type: 'paymentNode',
    position: { x: NODE_X.customer, y: Y(0) },
    data: { label: 'Customer Browser', sublabel: 'Card details entered', stepIndex: 0, icon: 'monitor', timing: '~instant' },
  },
  {
    id: 'stripe-js',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(1) },
    data: { label: 'Tokenization', sublabel: 'PAN encrypted → stored in Stripe vault', stepIndex: 1, icon: 'shield', timing: '~100–200ms' },
  },
  {
    id: 'stripe-api',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(2) },
    data: { label: 'Stripe API', sublabel: 'PaymentIntent created', stepIndex: 2, icon: 'server', timing: '~200–500ms' },
  },
  {
    id: 'radar',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(3) },
    data: { label: 'Stripe Radar', sublabel: 'ML fraud scoring', stepIndex: 3, icon: 'radar', timing: '~100–300ms' },
  },
  {
    id: 'network',
    type: 'paymentNode',
    position: { x: NODE_X.network, y: Y(4) },
    data: { label: 'Card Network', sublabel: 'Visa / Mastercard routing', stepIndex: 4, icon: 'network', timing: '~500ms–2s' },
  },
  {
    id: 'bank',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(5) },
    data: { label: 'Issuing Bank', sublabel: 'Authorization decision', stepIndex: 5, icon: 'bank', timing: '~1–3s' },
  },
  {
    id: 'merchant',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(6) },
    data: { label: 'Capture', sublabel: 'Authorized funds acquired', stepIndex: 6, icon: 'store', timing: '~instant (automatic)' },
  },
  {
    id: 'payout',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(8) },
    data: { label: 'Payout Engine', sublabel: 'T+2 bank transfer', stepIndex: 7, icon: 'payout', timing: '2–3 business days' },
  },
]

const TIME_CHASM: Node = {
  id: 'time-chasm',
  type: 'timeChasmNode',
  position: { x: NODE_X.stripe, y: Y(7) },
  zIndex: 0,
  selectable: false,
  draggable: false,
  focusable: false,
  data: { label: '2–3 business days', sublabel: 'settlement & reconciliation' },
}

export const NODES: Node[] = [
  ...buildSwimlaneNodes(BG_HEIGHT, 'Card Network'),
  ...FLOW_NODES,
  TIME_CHASM,
]

export const EDGES: Edge[] = [
  { id: 'e0-1',  source: 'customer',    target: 'stripe-js',  label: 'raw card data' },
  { id: 'e1-2',  source: 'stripe-js',   target: 'stripe-api', label: 'secure token' },
  { id: 'e2-3',  source: 'stripe-api',  target: 'radar',      label: 'payment_intent' },
  { id: 'e3-4',  source: 'radar',       target: 'network',    label: 'auth request' },
  { id: 'e4-5',  source: 'network',     target: 'bank',       label: 'ISO 8583 auth' },
  { id: 'e5-6',  source: 'bank',        target: 'merchant',   label: 'auth approved' },
  { id: 'e6-tc', source: 'merchant',    target: 'time-chasm', label: 'capture complete' },
  { id: 'etc-7', source: 'time-chasm',  target: 'payout',     label: 'settlement' },
]
