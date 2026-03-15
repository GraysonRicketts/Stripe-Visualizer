# Claude Code Rules

## Node Version
Always prefix npm/node/vite commands with the nvm Node 24 PATH:

```sh
export PATH="/home/grayson/.local/share/nvm/v24.12.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
```

Example:
```sh
export PATH="/home/grayson/.local/share/nvm/v24.12.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH" && npm run build
```

The system Node is v18 (too old for Vite 7 + Tailwind v4). The nvm LTS is v24 at `~/.local/share/nvm/v24.12.0/bin/`.

---

## Project Overview

Stripe Payment Flow Visualizer — an interactive React app that animates how a payment moves through Stripe's infrastructure (Stripe.js → Stripe API → Radar → Card Network → Issuing Bank → Payout/Settlement). Supports credit and debit scenarios including failure/return paths.

Stack: React + Vite 7, `@xyflow/react` (React Flow), Framer Motion, Tailwind CSS v4, Zustand, lucide-react.

Dev server: `npm run dev` (port 5173). Build: `npm run build`.

---

## Architecture

### Layout (`src/App.tsx`)
- Top bar (branding)
- `TimelineBar` — horizontal scrubber showing all steps for the current scenario
- Main row: 300px `CheckoutPanel` (left) + flex `FlowGraph` + `PayloadDrawer` overlay (right)

### State machine (`src/store/paymentStore.ts`)
Central Zustand store. Key state:
- `scenario: CombinedScenario` — which flow is active
- `activeStep: number` — step currently animating (-1 = none)
- `completedSteps: Set<number>` — forward-path steps that completed green
- `returnCompletedSteps: Set<number>` — return-path steps (decline/fraud paths) that completed
- `failedStep: number` — the step that turned red (-1 = none)
- `status: 'idle' | 'running' | 'complete' | 'failed'`
- `selectedNodeId: string | null` — which node's payload is shown in the drawer
- `events: WebhookEvent[]` — event log entries (newest first)

Key store actions: `play(fromStep)`, `stopPlay()`, `reset()`, `jumpToStep(step)`, `setScenario(s)`, `selectNode(id)`.

Animation timing constants: `STEP_DURATION = 900ms`, `STEP_PAUSE = 400ms`.

### Graph rendering (`src/components/FlowGraph.tsx`)
- Loads the correct `NODES` + `EDGES` for the active scenario from `NODES_DICT` / `EDGES_DICT`
- Dynamically colors edges based on `completedSteps`, `returnCompletedSteps`, `activeStep`, `failedStep`
- Custom node types: `paymentNode`, `swimlaneBackground`, `swimlaneHeader`, `timeChasmNode`

### Swimlane system (`src/data/swimlanes.ts`)
Four lanes at fixed x positions: Customer (x=0), Stripe (x=320), Network (x=640), Bank (x=960).
- `NODE_X` constants: `{ customer: 30, stripe: 350, network: 670, bank: 990 }` — use these for node positions
- `Y(step)` helper: `step * 160` — vertical spacing between nodes
- `buildSwimlaneNodes(bgHeight, networkLabel)` generates background + header nodes (non-interactive)
- Network lane label varies by scenario (e.g. "Visa Network" vs "Star Network" for debit)

---

## Scenarios

Five scenarios, each with its own layout + payloads directory under `src/data/`:

| CombinedScenario | Flow type | Result | Test card |
|---|---|---|---|
| `credit-success` | credit | All 8 nodes green | 4242 4242 4242 4242 |
| `credit-declined` | credit | Fails at step 5 (IssuingBank), return path animates | 4000 0000 0000 0002 |
| `credit-fraud` | credit | Fails at step 3 (Radar), return path animates | 4100 0000 0000 0019 |
| `debit-success` | debit | All 9 nodes green, same-day ACH settlement | — |
| `debit-insufficient-funds` | debit | Fails at step 6 (BalanceCheck), return path animates | — |

`STEP_NODE_IDS` in the store maps each scenario to an ordered array of node IDs that defines the animation sequence. **Return-path nodes** (decline/fraud) come after the fail step in this array and use `returnCompletedSteps` instead of `completedSteps`.

`SCENARIO_CONFIG` maps each scenario to `{ failStep, returnPathStart, events }`. `failStep = -1` means success (no failure). `returnPathStart` is the index in `STEP_NODE_IDS` where return-path nodes begin.

---

## Data File Conventions

Each scenario lives in `src/data/<scenario-name>/`:

### `layout.ts`
Exports `NODES: Node[]` and `EDGES: Edge[]`.
- Uses helpers from `swimlanes.ts` (`NODE_X`, `Y`, `buildSwimlaneNodes`)
- `NodeData` shape: `{ label, sublabel, stepIndex, icon, timing? }`
- `stepIndex` must match the node's position in `STEP_NODE_IDS`
- `timing` is an optional amber annotation showing real-world latency (e.g. `"~100–200ms"`)
- Includes swimlane background/header nodes from `buildSwimlaneNodes()`
- May include a `timeChasmNode` separator (type `timeChasmNode`) between sync and async phases

### `payloads.ts`
Exports `PAYLOADS: Record<string, StepPayload>` keyed by node ID, plus a scenario type.
- `StepPayload` shape: `{ title, description, timing?, badge?, json }`
- `timing` shows in the PayloadDrawer as an amber Clock badge
- `json` is the mock Stripe API response object shown in the drawer

---

## Component Summary

| File | Purpose |
|---|---|
| `src/components/CheckoutPanel.tsx` | Left panel: scenario picker + mock card form + Play/Reset controls |
| `src/components/FlowGraph.tsx` | React Flow graph with dynamic edge colors |
| `src/components/PayloadDrawer.tsx` | Framer Motion slide-in panel showing node's JSON payload |
| `src/components/TimelineBar.tsx` | Horizontal scrubber; clicking a step calls `jumpToStep()` |
| `src/components/EventLog.tsx` | Bottom strip — webhook event log (currently unused in layout but exists) |
| `src/components/nodes/PaymentNode.tsx` | Single custom React Flow node (icon, label, sublabel, timing annotation) |
| `src/components/nodes/SwimlaneNodes.tsx` | `swimlaneBackground` + `swimlaneHeader` non-interactive node types |
| `src/components/nodes/TimeChasmNode.tsx` | Full-width amber dashed separator between sync/async phases |
| `src/components/nodes/PayloadPreviewNode.tsx` | Inline payload preview node (for compact views) |

---

## Adding a New Scenario

1. Create `src/data/<scenario-name>/layout.ts` — define `NODES` and `EDGES` using swimlane helpers
2. Create `src/data/<scenario-name>/payloads.ts` — define `PAYLOADS` keyed by node ID
3. Add the scenario key to `CombinedScenario` union in `paymentStore.ts`
4. Add its node ID sequence to `STEP_NODE_IDS`
5. Add its config to `SCENARIO_CONFIG` (failStep, returnPathStart, events array)
6. Register `NODES` + `EDGES` in `NODES_DICT` / `EDGES_DICT` in `FlowGraph.tsx`
7. Add it to the scenario picker in `CheckoutPanel.tsx`
8. Add payloads lookup in `PayloadDrawer.tsx` (if not already using a dynamic lookup)

---

## Timing Display (Three Layers)

Added to communicate real Stripe timescales (ms for sync, days for async settlement):

1. **`TimeChasmNode`** — amber dashed full-width separator inserted between the last sync node and first async node in a layout. Registered as `timeChasmNode` in FlowGraph.
2. **PaymentNode timing annotation** — small amber mono line below sublabel, visible when `isActive || isCompleted`. Comes from `timing` in `NodeData`.
3. **PayloadDrawer timing badge** — amber Clock icon + timing string in the drawer header area. Comes from `timing` in `StepPayload`.
