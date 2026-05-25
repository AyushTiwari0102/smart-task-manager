import { createContext, useContext, useState, useCallback } from 'react'
import { awardXP } from '../api/tasks'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const GamCtx = createContext(null)

export function GamificationProvider({ children }) {
  const { user } = useAuth()
  const [xpData, setXpData] = useState({ xp: 0, streak: 0, rank: '🌱 Beginner', badges: [] })
  const [xpAnim, setXpAnim] = useState(null)

  const award = useCallback(async (action, taskDueDate) => {
    if (!user) return
    try {
      const data = await awardXP({ userId: user.id, action, taskDueDate })
      setXpData(data)
      setXpAnim(`+${data.earned} XP`)
      setTimeout(() => setXpAnim(null), 2000)
      if (action === 'COMPLETE') {
        toast(`🏆 ${data.earned} XP earned! Rank: ${data.rank}`, { icon: '⚡' })
      }
    } catch {}
  }, [user])

  return <GamCtx.Provider value={{ xpData, xpAnim, award }}>{children}</GamCtx.Provider>
}

export const useGamification = () => useContext(GamCtx)
