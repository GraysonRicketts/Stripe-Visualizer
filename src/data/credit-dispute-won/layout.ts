import type { Node, Edge } from '@xyflow/react'
import { NODE_X, Y, buildSwimlaneNodes } from '../swimlanes'

export type { NodeData } from '../swimlanes'

const BG_HEIGHT = 1820 // covers 10 Y-slots (0–9) + 2 time chasms + header + padding

const FLOW_NODES: Node[] = [
  {
    id: 'cardholder',
    type: 'paymentNode',
    position: { x: NODE_X.customer, y: Y(0) },
    data: { label: 'Cardholder', sublabel: 'Files dispute with issuing bank', stepIndex: 0, icon: 'flag' },
  },
  {
    id: 'issuer-dispute',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(1) },
    data: { label: 'Issuing Bank', sublabel: 'Opens chargeback, freezes $49.00', stepIndex: 1, icon: 'bank', timing: '1–2 business days' },
  },
  {
    id: 'card-network-dispute',
    type: 'paymentNode',
    position: { x: NODE_X.network, y: Y(2) },
    data: { label: 'Card Network', sublabel: 'Routes dispute to Stripe', stepIndex: 2, icon: 'network', timing: '~1 day' },
  },
  {
    id: 'stripe-dispute',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(3) },
    data: { label: 'Stripe', sublabel: 'charge.dispute.created, $15 fee debited', stepIndex: 3, icon: 'server', timing: '~instant' },
  },
  // ── Time chasm 1: evidence window ─────────────────────────────────────────
  {
    id: 'evidence-submitted',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(5) },
    data: { label: 'Evidence Submitted', sublabel: 'Compelling evidence via Stripe API', stepIndex: 4, icon: 'file-text', timing: 'within 7–21 days' },
  },
  {
    id: 'network-evidence',
    type: 'paymentNode',
    position: { x: NODE_X.network, y: Y(6) },
    data: { label: 'Card Network', sublabel: 'Evidence forwarded to issuer', stepIndex: 5, icon: 'network', timing: '~1 day' },
  },
  {
    id: 'issuer-review',
    type: 'paymentNode',
    position: { x: NODE_X.bank, y: Y(7) },
    data: { label: 'Issuer Reviews', sublabel: 'Bank evaluates evidence submitted', stepIndex: 6, icon: 'bank', timing: '60–75 days' },
  },
  // ── Time chasm 2: review period ────────────────────────────────────────────
  {
    id: 'dispute-won',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(9) },
    data: { label: 'Dispute Won', sublabel: 'charge.dispute.closed — status: won', stepIndex: 7, icon: 'server', timing: '~instant' },
  },
]

const TIME_CHASM_1: Node = {
  id: 'time-chasm-1',
  type: 'timeChasmNode',
  position: { x: NODE_X.stripe, y: Y(4) },
  zIndex: 0,
  selectable: false,
  draggable: false,
  focusable: false,
  data: { label: 'Evidence window: 7–21 days', sublabel: 'merchant must respond before deadline' },
}

const TIME_CHASM_2: Node = {
  id: 'time-chasm-2',
  type: 'timeChasmNode',
  position: { x: NODE_X.stripe, y: Y(8) },
  zIndex: 0,
  selectable: false,
  draggable: false,
  focusable: false,
  data: { label: 'Issuer review: 60–75 days', sublabel: 'bank evaluates evidence and makes decision' },
}

export const NODES: Node[] = [
  ...buildSwimlaneNodes(BG_HEIGHT, 'Card Network'),
  ...FLOW_NODES,
  TIME_CHASM_1,
  TIME_CHASM_2,
]

export const EDGES: Edge[] = [
  { id: 'e0-1',   source: 'cardholder',          target: 'issuer-dispute',       label: 'disputes payment' },
  { id: 'e1-2',   source: 'issuer-dispute',       target: 'card-network-dispute', label: 'chargeback created' },
  { id: 'e2-3',   source: 'card-network-dispute', target: 'stripe-dispute',       label: 'dispute routed' },
  { id: 'e3-tc1', source: 'stripe-dispute',       target: 'time-chasm-1',         label: 'merchant notified' },
  { id: 'etc1-4', source: 'time-chasm-1',         target: 'evidence-submitted',   label: 'evidence submitted' },
  { id: 'e4-5',   source: 'evidence-submitted',   target: 'network-evidence',     label: 'evidence packet' },
  { id: 'e5-6',   source: 'network-evidence',     target: 'issuer-review',        label: 'to issuing bank' },
  { id: 'e6-tc2', source: 'issuer-review',        target: 'time-chasm-2',         label: 'under review' },
  { id: 'etc2-7', source: 'time-chasm-2',         target: 'dispute-won',          label: 'decision reached' },
]
