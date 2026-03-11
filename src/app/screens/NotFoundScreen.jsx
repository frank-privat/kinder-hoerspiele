import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { PlayfulButton } from '../components/PlayfulButton'
import { Home } from 'lucide-react'

export function NotFoundScreen() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-mint-light via-lavender-light to-peach-light text-center p-6">
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
        className="text-7xl"
      >
        🔍
      </motion.div>
      <h2>Seite nicht gefunden</h2>
      <p className="text-muted-foreground">Diese Seite gibt es leider nicht.</p>
      <PlayfulButton variant="primary" onClick={() => navigate('/')} icon={<Home className="size-5" />}>
        Zur Startseite
      </PlayfulButton>
    </div>
  )
}
