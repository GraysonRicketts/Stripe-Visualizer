import { Handle, Position } from '@xyflow/react'

interface TimeChasmNodeData {
  label: string
  sublabel?: string
}

interface TimeChasmNodeProps {
  data: TimeChasmNodeData
}

export function TimeChasmNode({ data }: TimeChasmNodeProps) {
  return (
    <div style={{ width: 260, position: 'relative', pointerEvents: 'none' }}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 20px',
        borderRadius: 9999,
        border: '1px solid rgba(245, 158, 11, 0.4)',
        background: 'rgba(245, 158, 11, 0.06)',
        boxShadow: '0 0 12px 2px rgba(245, 158, 11, 0.08)',
      }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>⏳</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#f59e0b',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            {data.label}
          </span>
          {data.sublabel && (
            <span style={{
              fontSize: 10,
              color: 'rgba(245, 158, 11, 0.55)',
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
