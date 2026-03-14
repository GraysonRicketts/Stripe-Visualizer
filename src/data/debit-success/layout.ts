import type { Node, Edge } from '@xyflow/react'
import { NODE_X, Y, buildSwimlaneNodes } from '../swimlanes'

export type { NodeData } from '../swimlanes'

const BG_HEIGHT = 1660 // covers 9 steps + time chasm + header + padding

const FLOW_NODES: Node[] = [
  {
    id: 'customer',
    type: 'paymentNode',
    position: { x: NODE_X.customer, y: Y(0) },
    data: { label: 'Customer Browser', sublabel: 'Card + PIN entered', stepIndex: 0, icon: 'monitor', timing: '~instant' },
  },
  {
    id: 'stripe-js',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(1) },
    data: { label: 'Tokenization', sublabel: 'PAN + PIN block → vault', stepIndex: 1, icon: 'shield', timing: '~100–200ms' },
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
    id: 'debit-network',
    type: 'paymentNode',
    position: { x: NODE_X.network, y: Y(4) },
    data: { label: 'Debit Network', sublabel: 'Star / Interac routing', stepIndex: 4, icon: 'network', timing: '~500ms–2s' },
  },
  {
    id: 'pin-verify',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(5) },
    data: { label: 'PIN Verification', sublabel: 'Encrypted PIN validated', stepIndex: 5, icon: 'lock', timing: '~1–2s' },
  },
  {
    id: 'balance-check',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(6) },
    data: { label: 'Balance Check', sublabel: 'Account balance verified', stepIndex: 6, icon: 'wallet', timing: '~500ms–1s' },
  },
  {
    id: 'merchant',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(7) },
    data: { label: 'Immediate Debit', sublabel: 'No auth-then-capture; funds debited now', stepIndex: 7, icon: 'store', timing: '~instant (atomic)' },
  },
  {
    id: 'ach-settlement',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(9) },
    data: { label: 'ACH Settlement', sublabel: 'Same-day settlement', stepIndex: 8, icon: 'payout', timing: 'same-day ACH' },
  },
]

const TIME_CHASM: Node = {
  id: 'time-chasm',
  type: 'timeChasmNode',
  position: { x: NODE_X.stripe, y: Y(8) },
  zIndex: 0,
  selectable: false,
  draggable: false,
  focusable: false,
  data: { label: 'same-day ACH', sublabel: 'settles by end of business' },
}

export const NODES: Node[] = [
  ...buildSwimlaneNodes(BG_HEIGHT, 'Debit Network'),
  ...FLOW_NODES,
  TIME_CHASM,
]

export const EDGES: Edge[] = [
  { id: 'e0-1',  source: 'customer',      target: 'stripe-js',      label: 'raw card + PIN' },
  { id: 'e1-2',  source: 'stripe-js',     target: 'stripe-api',     label: 'secure token' },
  { id: 'e2-3',  source: 'stripe-api',    target: 'radar',          label: 'payment_intent' },
  { id: 'e3-4',  source: 'radar',         target: 'debit-network',  label: 'auth request' },
  { id: 'e4-5',  source: 'debit-network', target: 'pin-verify',     label: 'PIN debit auth' },
  { id: 'e5-6',  source: 'pin-verify',    target: 'balance-check',  label: 'PIN valid' },
  { id: 'e6-7',  source: 'balance-check', target: 'merchant',       label: 'debit authorized' },
  { id: 'e7-tc', source: 'merchant',      target: 'time-chasm',     label: 'debit complete' },
  { id: 'etc-8', source: 'time-chasm',    target: 'ach-settlement', label: 'settlement' },
]
