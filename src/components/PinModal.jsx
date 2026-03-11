import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { useStore } from '../contexts/store'

/**
 * PinModal — numeric PIN entry for parental gate
 * mode: 'enter' | 'change'
 */
export default function PinModal({ onSuccess, onCancel, mode = 'enter' }) {
  const adminPin = useStore((s) => s.adminPin)
  const setAdminPin = useStore((s) => s.setAdminPin)
  const masterPin = import.meta.env.VITE_MASTER_PIN

  const [step, setStep] = useState(mode === 'change' ? 'new' : 'enter')
  const [input, setInput] = useState('')
  const [confirmInput, setConfirmInput] = useState('')
  const [error, setError] = useState('')

  const isDefaultPin = adminPin === '1234'
  const currentInput = step === 'confirm' ? confirmInput : input

  const addDigit = (d) => {
    if (step === 'confirm') {
      if (confirmInput.length < 4) setConfirmInput((p) => p + d)
    } else {
      if (input.length < 4) setInput((p) => p + d)
    }
  }

  const removeDigit = () => {
    if (step === 'confirm') setConfirmInput((p) => p.slice(0, -1))
    else setInput((p) => p.slice(0, -1))
  }

  // Auto-submit when 4 digits reached
  useEffect(() => {
    if (step === 'enter' && input.length === 4) {
      if (input === adminPin || (masterPin && input === masterPin)) {
        onSuccess()
      } else {
        setError('Falsche PIN')
        setTimeout(() => { setInput(''); setError('') }, 600)
      }
    }
  }, [input, step, adminPin, masterPin, onSuccess])

  useEffect(() => {
    if (step === 'new' && input.length === 4) {
      setStep('confirm')
    }
  }, [input, step])

  useEffect(() => {
    if (step === 'confirm' && confirmInput.length === 4) {
      if (confirmInput === input) {
        setAdminPin(input)
        onSuccess()
      } else {
        setError('PINs stimmen nicht überein')
        setTimeout(() => { setConfirmInput(''); setError('') }, 600)
      }
    }
  }, [confirmInput, step, input, setAdminPin, onSuccess])

  const titles = {
    enter: '🔐 PIN eingeben',
    new: '🔑 Neue PIN erstellen',
    confirm: '🔑 PIN bestätigen',
  }

  const subtitles = {
    enter: isDefaultPin ? 'Standard-PIN: 1234' : 'Eltern-PIN eingeben',
    new: 'Wähle eine neue 4-stellige PIN',
    confirm: 'PIN zur Bestätigung wiederholen',
  }

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del']

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="md3-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      >
        <h2 className="text-2xl font-extrabold text-violet-950 text-center mb-1">
          {titles[step]}
        </h2>
        <p className="text-sm text-violet-700 text-center mb-6">{subtitles[step]}</p>

        {/* PIN dots */}
        <div className="flex gap-5 justify-center mb-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={i < currentInput.length ? { scale: [1.3, 1] } : {}}
              transition={{ duration: 0.15 }}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                i < currentInput.length
                  ? 'bg-violet-600 border-violet-600'
                  : 'bg-transparent border-violet-300'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        <div className="h-6 mb-2 text-center">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-600 text-sm font-bold"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {keys.map((key, i) => {
            if (key === null) return <div key={i} />
            if (key === 'del') {
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.88 }}
                  onClick={removeDigit}
                  className="flex items-center justify-center py-4 rounded-2xl bg-violet-100 hover:bg-violet-200 md3-motion md3-focus-ring md3-touch-target"
                >
                  <Delete size={20} className="text-violet-900" />
                </motion.button>
              )
            }
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.88 }}
                onClick={() => addDigit(String(key))}
                className="py-4 rounded-2xl bg-violet-100 hover:bg-violet-200 text-violet-950 font-extrabold text-xl md3-motion md3-focus-ring md3-touch-target"
              >
                {key}
              </motion.button>
            )
          })}
        </div>

        {/* Actions */}
        <button
          onClick={onCancel}
          className="w-full py-2 text-violet-700 hover:text-violet-900 md3-motion md3-focus-ring font-bold text-sm"
        >
          Abbrechen
        </button>

        {step === 'enter' && isDefaultPin && mode === 'enter' && (
          <button
            onClick={() => { setInput(''); setError(''); setStep('new') }}
            className="w-full mt-2 py-2 text-violet-700 hover:text-violet-900 md3-motion md3-focus-ring font-bold text-sm"
          >
            🔑 PIN jetzt festlegen
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
