/**
 * PageTransition.tsx
 *
 * Wrapper de animación de entrada para páginas con Framer Motion.
 * Soporta distintas direcciones de entrada.
 */
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  from?: 'up' | 'left' | 'fade'
}

const variants = {
  up: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: -18 },
    animate: { opacity: 1, x: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
}

export const PageTransition = ({ children, from = 'up' }: Props) => {
  const v = variants[from]
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
