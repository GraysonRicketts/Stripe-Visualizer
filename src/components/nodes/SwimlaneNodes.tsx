interface SwimlaneBackgroundData {
  color: string
  borderColor: string
  height: number
  [key: string]: unknown
}

interface SwimlaneHeaderData {
  label: string
  color: string
  borderColor: string
  [key: string]: unknown
}

export function SwimlaneBackgroundNode({ data }: { data: SwimlaneBackgroundData }) {
  return (
    <div
      style={{
        width: 320,
        height: data.height,
        backgroundColor: data.color,
        border: `1px solid ${data.borderColor}`,
        borderRadius: 12,
        pointerEvents: 'none',
      }}
    />
  )
}

export function SwimlaneHeaderNode({ data }: { data: SwimlaneHeaderData }) {
  return (
    <div
      style={{
        width: 260,
        backgroundColor: data.color,
        border: `1px solid ${data.borderColor}`,
        borderRadius: 8,
        padding: '6px 14px',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <span style={{ color: data.borderColor, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
        {data.label}
      </span>
    </div>
  )
}
