import { useEffect } from 'react'

export default function useKeyboard(handlers) {
  useEffect(() => {
    const handler = (e) => {
      const fn = handlers[e.key]
      if (fn) fn(e)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handlers])
}
