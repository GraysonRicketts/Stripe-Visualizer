import type { Node, Edge } from '@xyflow/react'

export interface NodeData {
  label: string
  sublabel: string
  stepIndex: number
  icon: string
  [key: string]: unknown
}

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

const BG_HEIGHT = 1340 // covers 8 steps * 160px + header + padding
const BG_Y = -100

export const NODES: Node[] = [
  // ── Swimlane backgrounds (render behind everything) ──────────────────
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
    data: { label: 'Card Network', ...LANES.network, borderColor: HEADER_LABEL_COLOR.network },
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
    data: { label: 'Customer Browser', sublabel: 'Card details entered', stepIndex: 0, icon: 'monitor' },
  },
  {
    id: 'stripe-js',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(1) },
    data: { label: 'Tokenization', sublabel: 'PAN encrypted → stored in Stripe vault', stepIndex: 1, icon: 'shield' },
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
    id: 'network',
    type: 'paymentNode',
    position: { x: NODE_X.network, y: Y(4) },
    data: { label: 'Card Network', sublabel: 'Visa / Mastercard routing', stepIndex: 4, icon: 'network' },
  },
  {
    id: 'bank',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(5) },
    data: { label: 'Issuing Bank', sublabel: 'Authorization decision', stepIndex: 5, icon: 'bank' },
  },
  {
    id: 'merchant',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(6) },
    data: { label: 'Capture', sublabel: 'Authorized funds acquired', stepIndex: 6, icon: 'store' },
  },
  {
    id: 'payout',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(7) },
    data: { label: 'Payout Engine', sublabel: 'T+2 bank transfer', stepIndex: 7, icon: 'payout' },
  },
]

export const EDGES: Edge[] = [
  { id: 'e0-1', source: 'customer',   target: 'stripe-js',  label: 'raw card data' },
  { id: 'e1-2', source: 'stripe-js',  target: 'stripe-api', label: 'secure token' },
  { id: 'e2-3', source: 'stripe-api', target: 'radar',      label: 'payment_intent' },
  { id: 'e3-4', source: 'radar',      target: 'network',    label: 'auth request' },
  { id: 'e4-5', source: 'network',    target: 'bank',       label: 'ISO 8583 auth' },
  { id: 'e5-6', source: 'bank',       target: 'merchant',   label: 'auth approved' },
  { id: 'e6-7', source: 'merchant',   target: 'payout',     label: 'capture complete' },
]
