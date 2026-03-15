import type { Node, Edge } from '@xyflow/react'
import { NODE_X, Y, buildSwimlaneNodes } from '../swimlanes'

export type { NodeData } from '../swimlanes'

const BG_HEIGHT = 1100 // covers 6 steps + header + padding

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
  // ── Return path (yellow) ───────────────────────────────────────────────────
  {
    id: 'stripe-api-return',
    type: 'paymentNode',
    position: { x: NODE_X.stripe, y: Y(4) },
    data: { label: 'Fraud Blocked', sublabel: 'Radar blocks payment, response sent', stepIndex: 4, icon: 'server', timing: '~instant' },
  },
  {
    id: 'customer-return',
    type: 'paymentNode',
    position: { x: NODE_X.customer, y: Y(5) },
    data: { label: 'Payment Blocked', sublabel: 'Error surfaced to cardholder', stepIndex: 5, icon: 'monitor', timing: '~instant' },
  },
]

export const NODES: Node[] = [
  ...buildSwimlaneNodes(BG_HEIGHT, 'Card Network'),
  ...FLOW_NODES,
]

export const EDGES: Edge[] = [
  { id: 'e0-1', source: 'customer',         target: 'stripe-js',        label: 'raw card data' },
  { id: 'e1-2', source: 'stripe-js',        target: 'stripe-api',       label: 'secure token' },
  { id: 'e2-3', source: 'stripe-api',       target: 'radar',            label: 'payment_intent' },
  { id: 'e3-4', source: 'radar',            target: 'stripe-api-return', label: 'fraud block' },
  { id: 'e4-5', source: 'stripe-api-return', target: 'customer-return', label: 'blocked' },
]
