import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { TASKS_KEY, STATS_KEY } from './useTasks'

let socket = null

function getSocket() {
  if (!socket) {
    socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] })
  }
  return socket
}

export default function useSocket() {
  const qc = useQueryClient()

  useEffect(() => {
    const s = getSocket()
    const refresh = () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] })
      qc.invalidateQueries({ queryKey: [STATS_KEY] })
    }
    s.on('task:created', refresh)
    s.on('task:updated', refresh)
    s.on('task:deleted', refresh)
    return () => {
      s.off('task:created', refresh)
      s.off('task:updated', refresh)
      s.off('task:deleted', refresh)
    }
  }, [qc])
}
