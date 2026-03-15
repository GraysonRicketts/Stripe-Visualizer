import { Handle, Position } from '@xyflow/react'
import { CheckCircle2 } from 'lucide-react'

interface ScenarioContextNodeData {
  label: string
  sublabel?: string
}

interface ScenarioContextNodeProps {
  data: ScenarioContextNodeData
}

export function ScenarioContextNode({ data }: ScenarioContextNodeProps) {
  return (
    <div style={{ width: 1220, position: 'relative', pointerEvents: 'none' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '10px 28px',
        borderRadius: 10,
        border: '1px solid rgba(0, 212, 160, 0.3)',
        background: 'rgba(0, 212, 160, 0.05)',
        boxShadow: '0 0 16px 4px rgba(0, 212, 160, 0.04)',
      }}>
        <CheckCircle2 style={{ width: 15, height: 15, color: '#00d4a0', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#00d4a0',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            {data.label}
          </span>
          {data.sublabel && (
            <span style={{
              fontSize: 10,
              color: 'rgba(0, 212, 160, 0.5)',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}>
              {data.sublabel}
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
    </div>
  )
}
