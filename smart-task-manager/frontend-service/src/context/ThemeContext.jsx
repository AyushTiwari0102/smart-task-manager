import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const THEMES = ['dark', 'light', 'hacker']

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('stm_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('stm_theme', theme)
  }, [theme])

  const cycleTheme = () => setTheme(t => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length])

  return <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, THEMES }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
