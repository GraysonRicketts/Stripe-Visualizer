interface TimeChasmNodeData {
  label: string
  sublabel?: string
}

interface TimeChasmNodeProps {
  data: TimeChasmNodeData
}

export function TimeChasmNode({ data }: TimeChasmNodeProps) {
  return (
    <div style={{ width: 1280, height: 48, position: 'relative', pointerEvents: 'none' }}>
      {/* Left arm + pill + right arm */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Left dashed arm */}
        <div style={{ flex: 1, height: 1, borderTop: '1px dashed rgba(245, 158, 11, 0.35)' }} />

        {/* Pill label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 14px',
          borderRadius: 20,
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: 'rgba(245, 158, 11, 0.06)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13 }}>⏳</span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#f59e0b',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}>
            {data.label}
          </span>
          {data.sublabel && (
            <span style={{
              fontSize: 10,
              color: 'rgba(245, 158, 11, 0.55)',
              fontFamily: 'monospace',
            }}>
              — {data.sublabel}
            </span>
          )}
        </div>

        {/* Right dashed arm */}
        <div style={{ flex: 1, height: 1, borderTop: '1px dashed rgba(245, 158, 11, 0.35)' }} />
      </div>
    </div>
  )
}
