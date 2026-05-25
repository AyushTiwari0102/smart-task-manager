import { useState } from 'react'
import Sidebar from './Sidebar'
import CommandPalette from '../features/CommandPalette'
import XpToast from '../features/XpToast'
import PomodoroWidget from '../features/PomodoroWidget'
import useKeyboard from '../../hooks/useKeyboard'

export default function AppShell({ children }) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useKeyboard({
    'k': (e) => { if (e.metaKey || e.ctrlKey) { e.preventDefault(); setCmdOpen(o => !o) } },
    'Escape': () => setCmdOpen(false),
  })

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <main className={`main-area${sidebarOpen ? '' : ' no-sidebar'}`}>
        {children}
      </main>
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
      <XpToast />
      <PomodoroWidget />
    </div>
  )
}
