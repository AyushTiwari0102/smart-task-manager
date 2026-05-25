import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, BarChart3, Calendar, Zap, LogOut, Menu, X, Sun, Moon, Terminal, Flame, Zap as ZapIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGamification } from '../../context/GamificationContext'
import { useStats } from '../../hooks/useTasks'
import styles from './Sidebar.module.css'

const THEME_ICONS = { dark: Sun, light: Moon, hacker: Terminal }

export default function Sidebar({ open, onToggle }) {
  const { user, logout } = useAuth()
  const { theme, cycleTheme } = useTheme()
  const { xpData, xpAnim } = useGamification()
  const { data: stats } = useStats()
  const navigate = useNavigate()
  const ThemeIcon = THEME_ICONS[theme] || Sun

  const maxXp = 2000
  const xpPct = Math.min(100, (xpData.xp / maxXp) * 100)

  const navItems = [
    { to: '/',          label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics',  Icon: BarChart3 },
    { to: '/calendar',  label: 'Calendar',   Icon: Calendar },
  ]

  return (
    <>
      {/* Toggle btn when closed */}
      {!open && (
        <button className={styles.openBtn} onClick={onToggle}>
          <Menu size={18} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.aside
            className={`${styles.sidebar} glass`}
            initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Brand */}
            <div className={styles.brand}>
              <div className={styles.brandIcon}><Zap size={16} strokeWidth={2.5} /></div>
              <span>Smart<span className={styles.accent}>Task</span></span>
              <button className={`btn-icon ${styles.closeBtn}`} onClick={onToggle}><X size={14} /></button>
            </div>

            {/* XP Bar */}
            <div className={styles.xpSection}>
              <div className={styles.xpTop}>
                <span className={styles.rank}>{xpData.rank}</span>
                <span className={styles.xpNum}>{xpData.xp} XP</span>
              </div>
              <div className={styles.xpTrack}>
                <motion.div className={styles.xpBar} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.8 }} />
              </div>
              <div className={styles.xpMeta}>
                <span><Flame size={11} /> {xpData.streak}d streak</span>
                {xpAnim && <motion.span className={styles.xpPop} initial={{ opacity:0,y:5 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-5 }}>{xpAnim}</motion.span>}
              </div>
            </div>

            {/* Nav */}
            <nav className={styles.nav}>
              <p className={styles.navLabel}>Navigation</p>
              {navItems.map(({ to, label, Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
              <p className={styles.navLabel} style={{ marginTop:12 }}>Stats</p>
              <div className={styles.miniStats}>
                <span className={styles.miniStat} style={{ color:'var(--todo)' }}>{stats?.byStatus?.TODO ?? 0} todo</span>
                <span className={styles.miniStat} style={{ color:'var(--progress)' }}>{stats?.byStatus?.IN_PROGRESS ?? 0} doing</span>
                <span className={styles.miniStat} style={{ color:'var(--done)' }}>{stats?.byStatus?.DONE ?? 0} done</span>
              </div>
            </nav>

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.userRow}>
                <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
                <div className={styles.userInfo}>
                  <span>{user?.name}</span>
                  <small>{user?.email}</small>
                </div>
              </div>
              <div className={styles.footerActions}>
                <button className="btn-icon" onClick={cycleTheme} title={`Switch theme (${theme})`}><ThemeIcon size={14} /></button>
                <button className="btn-icon" onClick={() => { logout(); navigate('/') }} title="Logout"><LogOut size={14} /></button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
