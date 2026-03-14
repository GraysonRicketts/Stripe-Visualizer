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
import { usePaymentStore, getStepNodeIds, type CreditScenario, type DebitScenario } from '../store/paymentStore'
import { NODES as CREDIT_SUCCESS_NODES, EDGES as CREDIT_SUCCESS_EDGES } from '../data/credit-success/layout'
import { NODES as CREDIT_FRAUD_NODES, EDGES as CREDIT_FRAUD_EDGES } from '../data/credit-fraud/layout'
import { NODES as DEBIT_SUCCESS_NODES, EDGES as DEBIT_SUCCESS_EDGES } from '../data/debit-success/layout'
import { PaymentNode } from './nodes/PaymentNode'
import { SwimlaneBackgroundNode, SwimlaneHeaderNode } from './nodes/SwimlaneNodes'
import { TimeChasmNode } from './nodes/TimeChasmNode'

const nodeTypes: NodeTypes = {
  paymentNode: PaymentNode as unknown as NodeTypes[string],
  swimlaneBackground: SwimlaneBackgroundNode as unknown as NodeTypes[string],
  swimlaneHeader: SwimlaneHeaderNode as unknown as NodeTypes[string],
  timeChasmNode: TimeChasmNode as unknown as NodeTypes[string],
}

const NODES_DICT: { credit: Record<CreditScenario, Node[]>, debit: Record<DebitScenario, Node[]> } = {
  credit: {
    success: CREDIT_SUCCESS_NODES,
    fraud: CREDIT_FRAUD_NODES,
    declined: CREDIT_SUCCESS_NODES,  // same nodes as success, just different edge styling
  },
  debit: {
    success: DEBIT_SUCCESS_NODES,
    insufficient_funds: DEBIT_SUCCESS_NODES,  // same nodes as success, just different edge styling
  },
}

const EDGES_DICT: { credit: Record<CreditScenario, Edge[]>, debit: Record<DebitScenario, Edge[]> } = {
  credit: {
    success: CREDIT_SUCCESS_EDGES,
    fraud: CREDIT_FRAUD_EDGES,
    declined: CREDIT_SUCCESS_EDGES,  // same edges as success, just different styling
  },
  debit: {
    success: DEBIT_SUCCESS_EDGES,
    insufficient_funds: DEBIT_SUCCESS_EDGES,  // same edges as success, just different styling
  },
}

export function FlowGraph() {
  const { flowType, scenario, activeStep, completedSteps, failedStep, selectNode } = usePaymentStore()

  const allNodes = flowType === 'credit'
    ? NODES_DICT.credit[scenario as CreditScenario]
    : NODES_DICT.debit[scenario as DebitScenario]
  const baseEdges = flowType === 'credit'
    ? EDGES_DICT.credit[scenario as CreditScenario]
    : EDGES_DICT.debit[scenario as DebitScenario]
  const stepNodeIds = getStepNodeIds(flowType, scenario)

  const edges = useMemo<Edge[]>(() => {
    return baseEdges.map((edge) => {
      // Non-step sources (e.g. time-chasm) derive their index from the target
      const rawSourceIndex = stepNodeIds.indexOf(edge.source)
      const sourceIndex = rawSourceIndex !== -1 ? rawSourceIndex : stepNodeIds.indexOf(edge.target) - 1
      const isCompleted = completedSteps.has(sourceIndex) && completedSteps.has(sourceIndex + 1)
      const isActive = activeStep === sourceIndex + 1 || activeStep === sourceIndex
      const isFailed = failedStep === sourceIndex + 1

      let stroke = '#1e2235'
      let animated = false

      if (isFailed) {
        stroke = '#ff4757'
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
  }, [flowType, baseEdges, stepNodeIds, activeStep, completedSteps, failedStep])

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
          if (completedSteps.has(stepIndex) || activeStep === stepIndex || failedStep === stepIndex) {
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
