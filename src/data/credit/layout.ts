import type { Node, Edge } from '@xyflow/react'

export interface NodeData {
  label: string
  sublabel: string
  stepIndex: number
  icon: string
  [key: string]: unknown
}

export const NODES: Node<NodeData>[] = [
  {
    id: 'customer',
    type: 'paymentNode',
    position: { x: 0, y: 0 },
    data: { label: 'Customer Browser', sublabel: 'Card details entered', stepIndex: 0, icon: 'monitor' },
  },
  {
    id: 'stripe-js',
    type: 'paymentNode',
    position: { x: 0, y: 130 },
    data: { label: 'Tokenization', sublabel: 'PAN encrypted → stored in Stripe vault', stepIndex: 1, icon: 'shield' },
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
    id: 'network',
    type: 'paymentNode',
    position: { x: 0, y: 520 },
    data: { label: 'Card Network', sublabel: 'Visa / Mastercard routing', stepIndex: 4, icon: 'network' },
  },
  {
    id: 'bank',
    type: 'paymentNode',
    position: { x: 0, y: 650 },
    data: { label: 'Issuing Bank', sublabel: 'Authorization decision', stepIndex: 5, icon: 'bank' },
  },
  {
    id: 'merchant',
    type: 'paymentNode',
    position: { x: 0, y: 780 },
    data: { label: 'Capture', sublabel: 'Authorized funds acquired', stepIndex: 6, icon: 'store' },
  },
  {
    id: 'payout',
    type: 'paymentNode',
    position: { x: 0, y: 910 },
    data: { label: 'Payout Engine', sublabel: 'T+2 bank transfer', stepIndex: 7, icon: 'payout' },
  },
]

export const EDGES: Edge[] = [
  { id: 'e0-1', source: 'customer', target: 'stripe-js', label: 'raw card data' },
  { id: 'e1-2', source: 'stripe-js', target: 'stripe-api', label: 'secure token' },
  { id: 'e2-3', source: 'stripe-api', target: 'radar', label: 'payment_intent' },
  { id: 'e3-4', source: 'radar', target: 'network', label: 'auth request' },
  { id: 'e4-5', source: 'network', target: 'bank', label: 'ISO 8583 auth' },
  { id: 'e5-6', source: 'bank', target: 'merchant', label: 'auth approved' },
  { id: 'e6-7', source: 'merchant', target: 'payout', label: 'capture complete' },
]
