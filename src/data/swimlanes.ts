import type { Node } from '@xyflow/react'

export interface NodeData {
  label: string
  sublabel: string
  stepIndex: number
  icon: string
  timing?: string
  [key: string]: unknown
}

// Swimlane lane x positions (left edge of each 320px lane)
export const LANE = { customer: 0, stripe: 320, network: 640, bank: 960 }
// Payment node x = lane + 30px padding (node is 260px wide, lane is 320px)
export const NODE_X = { customer: 30, stripe: 350, network: 670, bank: 990 }
export const Y = (step: number) => step * 160

const LANE_STYLE = { color: '#0d0e1a', borderColor: '#1e2235' }
const HEADER_COLOR = '#475569'
const BG_Y = -100

const NON_INTERACTIVE = {
  selectable: false,
  draggable: false,
  focusable: false,
  style: { pointerEvents: 'none' as const },
}

export function buildSwimlaneNodes(bgHeight: number, networkLabel: string): Node[] {
  return [
    // ── Swimlane backgrounds (render behind everything) ───────────────────
    {
      id: 'lane-customer-bg',
      type: 'swimlaneBackground',
      position: { x: LANE.customer, y: BG_Y },
      zIndex: -1,
      ...NON_INTERACTIVE,
      data: { ...LANE_STYLE, height: bgHeight },
    },
    {
      id: 'lane-stripe-bg',
      type: 'swimlaneBackground',
      position: { x: LANE.stripe, y: BG_Y },
      zIndex: -1,
      ...NON_INTERACTIVE,
      data: { ...LANE_STYLE, height: bgHeight },
    },
    {
      id: 'lane-network-bg',
      type: 'swimlaneBackground',
      position: { x: LANE.network, y: BG_Y },
      zIndex: -1,
      ...NON_INTERACTIVE,
      data: { ...LANE_STYLE, height: bgHeight },
    },
    {
      id: 'lane-bank-bg',
      type: 'swimlaneBackground',
      position: { x: LANE.bank, y: BG_Y },
      zIndex: -1,
      ...NON_INTERACTIVE,
      data: { ...LANE_STYLE, height: bgHeight },
    },

    // ── Swimlane headers ──────────────────────────────────────────────────
    {
      id: 'lane-customer-header',
      type: 'swimlaneHeader',
      position: { x: NODE_X.customer, y: -72 },
      ...NON_INTERACTIVE,
      data: { label: 'Customer', ...LANE_STYLE, borderColor: HEADER_COLOR },
    },
    {
      id: 'lane-stripe-header',
      type: 'swimlaneHeader',
      position: { x: NODE_X.stripe, y: -72 },
      ...NON_INTERACTIVE,
      data: { label: 'Stripe', ...LANE_STYLE, borderColor: HEADER_COLOR },
    },
    {
      id: 'lane-network-header',
      type: 'swimlaneHeader',
      position: { x: NODE_X.network, y: -72 },
      ...NON_INTERACTIVE,
      data: { label: networkLabel, ...LANE_STYLE, borderColor: HEADER_COLOR },
    },
    {
      id: 'lane-bank-header',
      type: 'swimlaneHeader',
      position: { x: NODE_X.bank, y: -72 },
      ...NON_INTERACTIVE,
      data: { label: 'Issuing Bank', ...LANE_STYLE, borderColor: HEADER_COLOR },
    },
  ]
}
