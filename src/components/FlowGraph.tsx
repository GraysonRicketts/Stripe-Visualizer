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
import { usePaymentStore, STEP_NODE_IDS } from '../store/paymentStore'
import { NODES as CREDIT_NODES, EDGES as CREDIT_EDGES } from '../data/credit/layout'
import { NODES as DEBIT_NODES, EDGES as DEBIT_EDGES } from '../data/debit/layout'
import { PaymentNode } from './nodes/PaymentNode'
import { SwimlaneBackgroundNode, SwimlaneHeaderNode } from './nodes/SwimlaneNodes'

const nodeTypes: NodeTypes = {
  paymentNode: PaymentNode as unknown as NodeTypes[string],
  swimlaneBackground: SwimlaneBackgroundNode as unknown as NodeTypes[string],
  swimlaneHeader: SwimlaneHeaderNode as unknown as NodeTypes[string],
}

export function FlowGraph() {
  const { flowType, activeStep, completedSteps, failedStep, selectNode } = usePaymentStore()

  const allNodes = (flowType === 'credit' ? CREDIT_NODES : DEBIT_NODES) as Node[]
  const baseEdges = flowType === 'credit' ? CREDIT_EDGES : DEBIT_EDGES
  const stepNodeIds = STEP_NODE_IDS[flowType]

  const edges = useMemo<Edge[]>(() => {
    return baseEdges.map((edge) => {
      const sourceIndex = stepNodeIds.indexOf(edge.source)
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
