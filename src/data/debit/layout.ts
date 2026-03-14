import type { Node, Edge } from '@xyflow/react'
import type { NodeData } from '../credit/layout'

export type { NodeData }

export const NODES: Node<NodeData>[] = [
  {
    id: 'customer',
    type: 'paymentNode',
    position: { x: 0, y: 0 },
    data: { label: 'Customer Browser', sublabel: 'Card + PIN entered', stepIndex: 0, icon: 'monitor' },
  },
  {
    id: 'stripe-js',
    type: 'paymentNode',
    position: { x: 0, y: 130 },
    data: { label: 'Stripe.js', sublabel: 'PAN + PIN block encrypted', stepIndex: 1, icon: 'shield' },
  },
  {
    id: 'stripe-api',
    type: 'paymentNode',
    position: { x: 0, y: 260 },
    data: { label: 'Stripe API', sublabel: 'PaymentIntent created', stepIndex: 2, icon: 'server' },
  },
  {
    id: 'radar',
    type: 'paymentNode',
    position: { x: 0, y: 390 },
    data: { label: 'Stripe Radar', sublabel: 'ML fraud scoring', stepIndex: 3, icon: 'radar' },
  },
  {
    id: 'debit-network',
    type: 'paymentNode',
    position: { x: 0, y: 520 },
    data: { label: 'Debit Network', sublabel: 'Star / Interac routing', stepIndex: 4, icon: 'network' },
  },
  {
    id: 'pin-verify',
    type: 'paymentNode',
    position: { x: 0, y: 650 },
    data: { label: 'PIN Verification', sublabel: 'Encrypted PIN validated', stepIndex: 5, icon: 'lock' },
  },
  {
    id: 'balance-check',
    type: 'paymentNode',
    position: { x: 0, y: 780 },
    data: { label: 'Balance Check', sublabel: 'Account balance verified', stepIndex: 6, icon: 'wallet' },
  },
  {
    id: 'merchant',
    type: 'paymentNode',
    position: { x: 0, y: 910 },
    data: { label: 'Merchant Account', sublabel: 'Funds debited', stepIndex: 7, icon: 'store' },
  },
  {
    id: 'ach-settlement',
    type: 'paymentNode',
    position: { x: 0, y: 1040 },
    data: { label: 'ACH Settlement', sublabel: 'Same-day settlement', stepIndex: 8, icon: 'payout' },
  },
]

export const EDGES: Edge[] = [
  { id: 'e0-1', source: 'customer', target: 'stripe-js', label: 'card + PIN' },
  { id: 'e1-2', source: 'stripe-js', target: 'stripe-api', label: 'pm_token' },
  { id: 'e2-3', source: 'stripe-api', target: 'radar', label: 'payment_intent' },
  { id: 'e3-4', source: 'radar', target: 'debit-network', label: 'auth request' },
  { id: 'e4-5', source: 'debit-network', target: 'pin-verify', label: 'PIN debit auth' },
  { id: 'e5-6', source: 'pin-verify', target: 'balance-check', label: 'PIN valid' },
  { id: 'e6-7', source: 'balance-check', target: 'merchant', label: 'funds confirmed' },
  { id: 'e7-8', source: 'merchant', target: 'ach-settlement', label: 'debit complete' },
]
