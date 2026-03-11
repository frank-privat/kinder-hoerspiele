import { motion } from 'framer-motion'

export function PlayfulButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  disabled = false,
  type = 'button',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-xl)] transition-all duration-200 cursor-pointer select-none font-[var(--font-weight-semibold)]'

  const variants = {
    primary: 'bg-mint text-primary-foreground hover:bg-mint-dark shadow-[var(--shadow-sm)]',
    secondary: 'bg-lavender text-secondary-foreground hover:bg-lavender-dark shadow-[var(--shadow-sm)]',
    accent: 'bg-peach text-accent-foreground hover:bg-peach-dark shadow-[var(--shadow-sm)]',
    outline: 'border-2 border-mint text-mint-dark hover:bg-mint-light',
    ghost: 'text-foreground hover:bg-muted',
  }

  const sizes = {
    sm: 'px-4 py-2 text-[var(--text-sm)]',
    md: 'px-6 py-3 text-[var(--text-base)]',
    lg: 'px-8 py-4 text-[var(--text-lg)]',
  }

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </motion.button>
  )
}
