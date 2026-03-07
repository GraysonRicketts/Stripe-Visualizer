import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
  type NodeTypes,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { usePaymentStore, STEP_NODE_IDS } from '../store/paymentStore'
import { FLOW_NODES, FLOW_EDGES } from '../data/flowLayout'
import { PaymentNode } from './nodes/PaymentNode'

const nodeTypes: NodeTypes = {
  paymentNode: PaymentNode as unknown as NodeTypes[string],
}

export function FlowGraph() {
  const { activeStep, completedSteps, failedStep } = usePaymentStore()

  const edges = useMemo<Edge[]>(() => {
    return FLOW_EDGES.map((edge) => {
      const sourceIndex = STEP_NODE_IDS.indexOf(edge.source)
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
  }, [activeStep, completedSteps, failedStep])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={FLOW_NODES}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
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
