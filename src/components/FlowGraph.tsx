import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
  type NodeTypes,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { usePaymentStore, getStepNodeIds, getReturnPathStart, type CombinedScenario } from '../store/paymentStore'
import { NODES as CREDIT_SUCCESS_NODES, EDGES as CREDIT_SUCCESS_EDGES } from '../data/credit-success/layout'
import { NODES as CREDIT_DECLINED_NODES, EDGES as CREDIT_DECLINED_EDGES } from '../data/credit-declined/layout'
import { NODES as CREDIT_FRAUD_NODES, EDGES as CREDIT_FRAUD_EDGES } from '../data/credit-fraud/layout'
import { NODES as DEBIT_SUCCESS_NODES, EDGES as DEBIT_SUCCESS_EDGES } from '../data/debit-success/layout'
import { NODES as DEBIT_INSUFFICIENT_FUNDS_NODES, EDGES as DEBIT_INSUFFICIENT_FUNDS_EDGES } from '../data/debit-insufficient-funds/layout'
import { NODES as DISPUTE_WON_NODES, EDGES as DISPUTE_WON_EDGES } from '../data/credit-dispute-won/layout'
import { PaymentNode } from './nodes/PaymentNode'
import { SwimlaneBackgroundNode, SwimlaneHeaderNode } from './nodes/SwimlaneNodes'
import { TimeChasmNode } from './nodes/TimeChasmNode'

const nodeTypes: NodeTypes = {
  paymentNode: PaymentNode as unknown as NodeTypes[string],
  swimlaneBackground: SwimlaneBackgroundNode as unknown as NodeTypes[string],
  swimlaneHeader: SwimlaneHeaderNode as unknown as NodeTypes[string],
  timeChasmNode: TimeChasmNode as unknown as NodeTypes[string],
}

const NODES_DICT: Record<CombinedScenario, Node[]> = {
  'credit-success':            CREDIT_SUCCESS_NODES,
  'credit-declined':           CREDIT_DECLINED_NODES,
  'credit-fraud':              CREDIT_FRAUD_NODES,
  'debit-success':             DEBIT_SUCCESS_NODES,
  'debit-insufficient-funds':  DEBIT_INSUFFICIENT_FUNDS_NODES,
  'credit-dispute-won':        DISPUTE_WON_NODES,
}

const EDGES_DICT: Record<CombinedScenario, Edge[]> = {
  'credit-success':            CREDIT_SUCCESS_EDGES,
  'credit-declined':           CREDIT_DECLINED_EDGES,
  'credit-fraud':              CREDIT_FRAUD_EDGES,
  'debit-success':             DEBIT_SUCCESS_EDGES,
  'debit-insufficient-funds':  DEBIT_INSUFFICIENT_FUNDS_EDGES,
  'credit-dispute-won':        DISPUTE_WON_EDGES,
}

export function FlowGraph() {
  const { scenario, activeStep, completedSteps, returnCompletedSteps, failedStep, selectNode } = usePaymentStore()

  const allNodes = NODES_DICT[scenario]
  const baseEdges = EDGES_DICT[scenario]
  const stepNodeIds = getStepNodeIds(scenario)
  const returnPathStart = getReturnPathStart(scenario)

  const edges = useMemo<Edge[]>(() => {
    return baseEdges.map((edge) => {
      // Non-step sources (e.g. time-chasm) derive their index from the target
      const rawSourceIndex = stepNodeIds.indexOf(edge.source)
      const sourceIndex = rawSourceIndex !== -1 ? rawSourceIndex : stepNodeIds.indexOf(edge.target) - 1
      const isCompleted = completedSteps.has(sourceIndex) && completedSteps.has(sourceIndex + 1)
      const isActive = activeStep === sourceIndex + 1 || activeStep === sourceIndex
      const isFailed = failedStep === sourceIndex + 1

      // Return-path edge: both endpoints are in the return path
      const isReturnCompleted = returnPathStart !== -1
        && returnCompletedSteps.has(sourceIndex)
        && returnCompletedSteps.has(sourceIndex + 1)
      // The edge leading INTO the return path (from failedStep to first return node)
      const isReturnEntryCompleted = returnPathStart !== -1
        && failedStep === sourceIndex
        && returnCompletedSteps.has(sourceIndex + 1)
      const isReturnActive = returnPathStart !== -1
        && (activeStep === sourceIndex || activeStep === sourceIndex + 1)
        && sourceIndex + 1 >= returnPathStart

      let stroke = '#1e2235'
      let animated = false

      if (isFailed && !isReturnActive && !isReturnCompleted && !isReturnEntryCompleted) {
        stroke = '#ff4757'
      } else if (isReturnCompleted || isReturnEntryCompleted) {
        stroke = '#f59e0b'
      } else if (isReturnActive) {
        stroke = '#f59e0b'
        animated = true
      } else if (isCompleted) {
        stroke = '#00d4a0'
        animated = false
      } else if (isActive) {
        stroke = '#635bff'
        animated = true
      }

      return {
        ...edge,
        animated,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 16,
          height: 16,
        },
        style: {
          stroke,
          strokeWidth: 2,
          transition: 'stroke 0.4s ease',
        },
        labelStyle: {
          fill: '#475569',
          fontSize: 10,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#0a0b14',
          fillOpacity: 0.8,
        },
      }
    })
  }, [baseEdges, stepNodeIds, returnPathStart, activeStep, completedSteps, returnCompletedSteps, failedStep])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={allNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        onNodeClick={(_, node) => {
          if (node.type !== 'paymentNode') return
          const stepIndex = stepNodeIds.indexOf(node.id)
          if (stepIndex === -1) return
          if (completedSteps.has(stepIndex) || activeStep === stepIndex || failedStep === stepIndex || returnCompletedSteps.has(stepIndex)) {
            selectNode(node.id)
          }
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e2235"
        />
      </ReactFlow>
    </div>
  )
}
