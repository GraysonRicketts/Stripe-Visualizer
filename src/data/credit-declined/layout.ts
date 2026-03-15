import type { Node, Edge } from '@xyflow/react'
import { NODE_X, Y, buildSwimlaneNodes } from '../swimlanes'

export type { NodeData } from '../swimlanes'

const BG_HEIGHT = 1600 // covers 9 steps + header + padding

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
  // ── Return path (yellow) ───────────────────────────────────────────────────
  {
    id: 'network-return',
    type: 'paymentNode',
    position: { x: NODE_X.network, y: Y(6) },
    data: { label: 'Decline Response', sublabel: 'Decline code 05 routed back via Visa', stepIndex: 6, icon: 'network', timing: '~200–500ms' },
  },
  {
    id: 'stripe-api-return',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(7) },
    data: { label: 'Decline Forwarded', sublabel: 'Stripe relays decline to browser', stepIndex: 7, icon: 'server', timing: '~instant' },
  },
  {
    id: 'customer-return',
    type: 'paymentNode',
    position: { x: NODE_X.customer, y: Y(8) },
    data: { label: 'Card Declined', sublabel: 'Error surfaced to cardholder', stepIndex: 8, icon: 'monitor', timing: '~instant' },
  },
]

export const NODES: Node[] = [
  ...buildSwimlaneNodes(BG_HEIGHT, 'Card Network'),
  ...FLOW_NODES,
]

export const EDGES: Edge[] = [
  { id: 'e0-1',  source: 'customer',          target: 'stripe-js',        label: 'raw card data' },
  { id: 'e1-2',  source: 'stripe-js',         target: 'stripe-api',       label: 'secure token' },
  { id: 'e2-3',  source: 'stripe-api',        target: 'radar',            label: 'payment_intent' },
  { id: 'e3-4',  source: 'radar',             target: 'network',          label: 'auth request' },
  { id: 'e4-5',  source: 'network',           target: 'bank',             label: 'ISO 8583 auth' },
  { id: 'e5-6',  source: 'bank',              target: 'network-return',   label: 'decline code 05' },
  { id: 'e6-7',  source: 'network-return',    target: 'stripe-api-return', label: 'decline response' },
  { id: 'e7-8',  source: 'stripe-api-return', target: 'customer-return',  label: 'card_declined' },
]
