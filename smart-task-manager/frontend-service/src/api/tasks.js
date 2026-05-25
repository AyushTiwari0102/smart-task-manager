import api from './axios'
import axios from 'axios'

export const getTasks  = async (status) => {
  const url = status ? `/tasks?status=${status}` : '/tasks'
  const { data } = await api.get(url)
  return data
}

export const getStats  = async () => { const { data } = await api.get('/tasks/stats'); return data }
export const createTask = async (payload) => { const { data } = await api.post('/tasks', payload); return data }
export const updateTask = async ({ id, ...payload }) => { const { data } = await api.put(`/tasks/${id}`, payload); return data }
export const deleteTask = async (id) => { await api.delete(`/tasks/${id}`) }

export const scoreTask = async (payload) => {
  const { data } = await axios.post('/ai/score', payload)
  return data
}

export const getXP = async (userId) => {
  const { data } = await axios.get(`/xp/${userId}`)
  return data
}

export const awardXP = async (payload) => {
  const { data } = await axios.post('/xp/award', payload)
  return data
}
