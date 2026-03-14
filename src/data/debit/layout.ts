import type { Node, Edge } from '@xyflow/react'
import type { NodeData } from '../credit/layout'

export type { NodeData }

// Swimlane lane x positions (left edge of each 320px lane)
const LANE = { customer: 0, stripe: 320, network: 640, bank: 960 }
// Payment node x = lane + 30px padding (node is 260px wide, lane is 320px)
const NODE_X = { customer: 30, stripe: 350, network: 670, bank: 990 }
const Y = (step: number) => step * 160

// Lane styling — all lanes share the same neutral dark look
const LANE_STYLE = { color: '#0d0e1a', borderColor: '#1e2235' }
const LANES = {
  customer: LANE_STYLE,
  stripe:   LANE_STYLE,
  network:  LANE_STYLE,
  bank:     LANE_STYLE,
}
const HEADER_LABEL_COLOR = {
  customer: '#475569',
  stripe:   '#475569',
  network:  '#475569',
  bank:     '#475569',
}

const BG_HEIGHT = 1500 // covers 9 steps * 160px + header + padding
const BG_Y = -100

export const NODES: Node[] = [
  // ── Swimlane backgrounds ──────────────────────────────────────────────
  {
    id: 'lane-customer-bg',
    type: 'swimlaneBackground',
    position: { x: LANE.customer, y: BG_Y },
    zIndex: -1,
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { ...LANES.customer, height: BG_HEIGHT },
  },
  {
    id: 'lane-stripe-bg',
    type: 'swimlaneBackground',
    position: { x: LANE.stripe, y: BG_Y },
    zIndex: -1,
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { ...LANES.stripe, height: BG_HEIGHT },
  },
  {
    id: 'lane-network-bg',
    type: 'swimlaneBackground',
    position: { x: LANE.network, y: BG_Y },
    zIndex: -1,
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { ...LANES.network, height: BG_HEIGHT },
  },
  {
    id: 'lane-bank-bg',
    type: 'swimlaneBackground',
    position: { x: LANE.bank, y: BG_Y },
    zIndex: -1,
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { ...LANES.bank, height: BG_HEIGHT },
  },

  // ── Swimlane headers ──────────────────────────────────────────────────
  {
    id: 'lane-customer-header',
    type: 'swimlaneHeader',
    position: { x: NODE_X.customer, y: -72 },
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { label: 'Customer', ...LANES.customer, borderColor: HEADER_LABEL_COLOR.customer },
  },
  {
    id: 'lane-stripe-header',
    type: 'swimlaneHeader',
    position: { x: NODE_X.stripe, y: -72 },
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { label: 'Stripe', ...LANES.stripe, borderColor: HEADER_LABEL_COLOR.stripe },
  },
  {
    id: 'lane-network-header',
    type: 'swimlaneHeader',
    position: { x: NODE_X.network, y: -72 },
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { label: 'Debit Network', ...LANES.network, borderColor: HEADER_LABEL_COLOR.network },
  },
  {
    id: 'lane-bank-header',
    type: 'swimlaneHeader',
    position: { x: NODE_X.bank, y: -72 },
    selectable: false,
    draggable: false,
    focusable: false,
    style: { pointerEvents: 'none' as const },
    data: { label: 'Issuing Bank', ...LANES.bank, borderColor: HEADER_LABEL_COLOR.bank },
  },

  // ── Payment flow nodes ────────────────────────────────────────────────
  {
    id: 'customer',
    type: 'paymentNode',
    position: { x: NODE_X.customer, y: Y(0) },
    data: { label: 'Customer Browser', sublabel: 'Card + PIN entered', stepIndex: 0, icon: 'monitor' },
  },
  {
    id: 'stripe-js',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(1) },
    data: { label: 'Tokenization', sublabel: 'PAN + PIN block → vault', stepIndex: 1, icon: 'shield' },
  },
  {
    id: 'stripe-api',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(2) },
    data: { label: 'Stripe API', sublabel: 'PaymentIntent created', stepIndex: 2, icon: 'server' },
  },
  {
    id: 'radar',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(3) },
    data: { label: 'Stripe Radar', sublabel: 'ML fraud scoring', stepIndex: 3, icon: 'radar' },
  },
  {
    id: 'debit-network',
    type: 'paymentNode',
    position: { x: NODE_X.network, y: Y(4) },
    data: { label: 'Debit Network', sublabel: 'Star / Interac routing', stepIndex: 4, icon: 'network' },
  },
  {
    id: 'pin-verify',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(5) },
    data: { label: 'PIN Verification', sublabel: 'Encrypted PIN validated', stepIndex: 5, icon: 'lock' },
  },
  {
    id: 'balance-check',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(6) },
    data: { label: 'Balance Check', sublabel: 'Account balance verified', stepIndex: 6, icon: 'wallet' },
  },
  {
    id: 'merchant',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(7) },
    data: { label: 'Immediate Debit', sublabel: 'No auth-then-capture; funds debited now', stepIndex: 7, icon: 'store' },
  },
  {
    id: 'ach-settlement',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(8) },
    data: { label: 'ACH Settlement', sublabel: 'Same-day settlement', stepIndex: 8, icon: 'payout' },
  },
]

export const EDGES: Edge[] = [
  { id: 'e0-1', source: 'customer',      target: 'stripe-js',    label: 'raw card + PIN' },
  { id: 'e1-2', source: 'stripe-js',     target: 'stripe-api',   label: 'secure token' },
  { id: 'e2-3', source: 'stripe-api',    target: 'radar',        label: 'payment_intent' },
  { id: 'e3-4', source: 'radar',         target: 'debit-network', label: 'auth request' },
  { id: 'e4-5', source: 'debit-network', target: 'pin-verify',   label: 'PIN debit auth' },
  { id: 'e5-6', source: 'pin-verify',    target: 'balance-check', label: 'PIN valid' },
  { id: 'e6-7', source: 'balance-check', target: 'merchant',     label: 'debit authorized' },
  { id: 'e7-8', source: 'merchant',      target: 'ach-settlement', label: 'debit complete' },
]
