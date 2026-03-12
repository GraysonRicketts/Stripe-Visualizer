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
import { FLOW_NODES, FLOW_EDGES } from '../data/flowLayout'
import { PaymentNode } from './nodes/PaymentNode'
import { PayloadPreviewNode } from './nodes/PayloadPreviewNode'

const nodeTypes: NodeTypes = {
  paymentNode: PaymentNode as unknown as NodeTypes[string],
  payloadPreviewNode: PayloadPreviewNode as unknown as NodeTypes[string],
}

const PREVIEW_NODE: Node = {
  id: 'payload-preview',
  type: 'payloadPreviewNode',
  position: { x: 360, y: 390 },
  data: {},
  selectable: false,
  draggable: false,
}

const ALL_NODES: Node[] = [...(FLOW_NODES as Node[]), PREVIEW_NODE]

export function FlowGraph() {
  const { activeStep, completedSteps, failedStep, selectedNodeId } = usePaymentStore()

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = FLOW_EDGES.map((edge) => {
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

    // Dynamic edge from selected node to preview node
    if (selectedNodeId) {
      const stepIndex = STEP_NODE_IDS.indexOf(selectedNodeId)
      const isReached =
        stepIndex !== -1 &&
        (completedSteps.has(stepIndex) || activeStep === stepIndex || failedStep === stepIndex)

      if (isReached) {
        result.push({
          id: 'e-preview',
          source: selectedNodeId,
          sourceHandle: 'right',
          target: 'payload-preview',
          animated: activeStep === stepIndex || false,
          style: {
            stroke: '#635bff',
            strokeWidth: 1.5,
            transition: 'stroke 0.4s ease',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#635bff',
            width: 12,
            height: 12,
          },
        })
      }
    }

    return result
  }, [activeStep, completedSteps, failedStep, selectedNodeId])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={ALL_NODES}
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
