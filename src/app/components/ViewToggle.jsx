import { motion } from 'framer-motion'
import { LayoutGrid, List } from 'lucide-react'

export function ViewToggle({ view, onViewChange }) {
  return (
    <div className="inline-flex bg-muted rounded-[var(--radius-xl)] p-1 gap-1">
      {[
        { id: 'coverflow', label: 'Cover', Icon: LayoutGrid },
        { id: 'list', label: 'Liste', Icon: List },
      ].map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`relative px-4 py-2 rounded-[var(--radius-md)] transition-all duration-200 ${
            view === id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {view === id && (
            <motion.div
              layoutId="activeView"
              className="absolute inset-0 bg-mint rounded-[var(--radius-md)]"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 inline-flex items-center gap-2">
            <Icon className="size-4" />
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
