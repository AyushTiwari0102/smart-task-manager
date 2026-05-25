import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, getStats, createTask, updateTask, deleteTask } from '../api/tasks'
import { useGamification } from '../context/GamificationContext'
import toast from 'react-hot-toast'

export const TASKS_KEY = 'tasks'
export const STATS_KEY = 'stats'

export function useTasks(filter) {
  return useQuery({
    queryKey: [TASKS_KEY, filter],
    queryFn: () => getTasks(filter?.status),
    refetchInterval: 30_000,
  })
}

export function useStats() {
  return useQuery({
    queryKey: [STATS_KEY],
    queryFn: getStats,
    refetchInterval: 30_000,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  const { award } = useGamification()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] })
      qc.invalidateQueries({ queryKey: [STATS_KEY] })
      award('CREATE')
      toast.success('Task created!')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to create task'),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  const { award } = useGamification()
  return useMutation({
    mutationFn: updateTask,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] })
      qc.invalidateQueries({ queryKey: [STATS_KEY] })
      if (vars.status === 'DONE') award('COMPLETE', vars.dueDate)
      else award('UPDATE')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Update failed'),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  const { award } = useGamification()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] })
      qc.invalidateQueries({ queryKey: [STATS_KEY] })
      award('DELETE')
      toast.success('Task deleted')
    },
    onError: () => toast.error('Delete failed'),
  })
}
