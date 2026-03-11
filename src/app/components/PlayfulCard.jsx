import { motion } from 'framer-motion'

export function PlayfulCard({ children, className = '', onClick, hoverable = false }) {
  const base =
    'bg-card rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] p-[var(--spacing-3)] transition-all duration-200'
  const hoverStyle = hoverable ? 'cursor-pointer hover:shadow-[var(--shadow-lg)] hover:-translate-y-1' : ''

  const Wrapper = hoverable ? motion.div : 'div'
  const motionProps = hoverable ? { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } } : {}

  return (
    <Wrapper onClick={onClick} className={`${base} ${hoverStyle} ${className}`} {...motionProps}>
      {children}
    </Wrapper>
  )
}
