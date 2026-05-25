import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, BarChart3, Calendar, LogOut, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import styles from './CommandPalette.module.css'

const COMMANDS = [
  { id:'new',       label:'New Task',          shortcut:'N',   icon: Plus,      action:'new' },
  { id:'dashboard', label:'Go to Dashboard',   shortcut:'',    icon: Search,    action:'nav', to:'/' },
  { id:'analytics', label:'Go to Analytics',   shortcut:'',    icon: BarChart3, action:'nav', to:'/analytics' },
  { id:'calendar',  label:'Go to Calendar',    shortcut:'',    icon: Calendar,  action:'nav', to:'/calendar' },
  { id:'theme',     label:'Toggle Theme',       shortcut:'T',   icon: Sun,       action:'theme' },
  { id:'logout',    label:'Logout',             shortcut:'',    icon: LogOut,    action:'logout' },
]

export default function CommandPalette({ onClose, onNewTask }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { cycleTheme } = useTheme()
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))

  const run = (cmd) => {
    onClose()
    if (cmd.action === 'nav')    navigate(cmd.to)
    if (cmd.action === 'theme')  cycleTheme()
    if (cmd.action === 'logout') { logout(); navigate('/') }
    if (cmd.action === 'new')    onNewTask?.()
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a+1, filtered.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a-1, 0)) }
    if (e.key === 'Enter')     { if (filtered[active]) run(filtered[active]) }
    if (e.key === 'Escape')    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div className={`${styles.palette} glass`}
        onClick={e=>e.stopPropagation()}
        initial={{ opacity:0, scale:0.92, y:-20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ type:'spring', stiffness:350, damping:28 }}
      >
        <div className={styles.searchBar}>
          <Search size={16} style={{ color:'var(--text-2)', flexShrink:0 }} />
          <input ref={inputRef} className={styles.input}
            placeholder="Type a command…" value={query}
            onChange={e => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={handleKey}
          />
          <kbd className={styles.escKey}>Esc</kbd>
        </div>
        <div className={styles.list}>
          {filtered.map((cmd, i) => (
            <button key={cmd.id}
              className={`${styles.item} ${i===active ? styles.activeItem : ''}`}
              onClick={() => run(cmd)}
              onMouseEnter={() => setActive(i)}
            >
              <cmd.icon size={15} />
              <span>{cmd.label}</span>
              {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
            </button>
          ))}
          {!filtered.length && <div className={styles.empty}>No commands found</div>}
        </div>
      </motion.div>
    </div>
  )
}
