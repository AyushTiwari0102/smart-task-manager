import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { getXP } from '../api/tasks'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('stm_user')  || 'null'))
  const [token, setToken] = useState(() => localStorage.getItem('stm_token') || null)

  const persist = (data) => {
    const u = { id: data.userId, name: data.name, email: data.email }
    setToken(data.token)
    setUser(u)
    localStorage.setItem('stm_token', data.token)
    localStorage.setItem('stm_user',  JSON.stringify(u))
  }

  // Validate token on mount
  useEffect(() => {
    if (!token) return
    getXP(user?.id || 'anon').catch(() => {})
  }, [])

  const login    = async (creds) => { const d = await apiLogin(creds);    persist(d); return d }
  const register = async (creds) => { const d = await apiRegister(creds); persist(d); return d }
  const logout   = () => {
    setUser(null); setToken(null)
    localStorage.removeItem('stm_token')
    localStorage.removeItem('stm_user')
  }

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
