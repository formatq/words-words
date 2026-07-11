import { useEffect, useState } from 'react'
import type { HistoryEntry } from '../App'

const TYPE_INTERVAL_MS = 18

const format = (entry: HistoryEntry) => `${entry.combo} — ${entry.ru}`

export function HistoryFeed({ entries }: { entries: HistoryEntry[] }) {
  return (
    <div className="history">
      {entries.map((entry, i) => (
        <div className="history-entry" key={entry.id}>
          {i === 0 ? <TypedText text={format(entry)} /> : format(entry)}
        </div>
      ))}
    </div>
  )
}

function TypedText({ text }: { text: string }) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setShown(0)
    const timer = setInterval(() => {
      setShown(n => {
        if (n + 1 >= text.length) clearInterval(timer)
        return Math.min(n + 1, text.length)
      })
    }, TYPE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [text])

  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && <span className="caret">▌</span>}
    </span>
  )
}
