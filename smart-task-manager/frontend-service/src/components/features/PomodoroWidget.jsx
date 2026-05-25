import { create } from 'zustand'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw } from 'lucide-react'
import styles from './PomodoroWidget.module.css'

// Zustand store so any component can call start(task)
export const usePomodoroStore = create((set) => ({
  task: null,
  start: (task) => set({ task }),
  stop:  () => set({ task: null }),
}))

const WORK = 25 * 60
const BREAK = 5 * 60

export default function PomodoroWidget() {
  const { task, stop } = usePomodoroStore()
  const [seconds, setSeconds] = useState(WORK)
  const [running, setRunning] = useState(false)
  const [phase,   setPhase]   = useState('work')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (task) { setSeconds(WORK); setRunning(false); setPhase('work') }
  }, [task])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            const next = phase === 'work' ? 'break' : 'work'
            if (Notification.permission === 'granted') {
              new Notification(phase === 'work' ? '\u23f0 Break time!' : '\ud83d\ude80 Back to work!', {
                body: phase === 'work' ? 'Great job! Take a 5-minute break.' : `Resume: ${task?.title}`
              })
            }
            setPhase(next); setRunning(false)
            return next === 'break' ? BREAK : WORK
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, phase, task])

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const total = phase === 'work' ? WORK : BREAK
  const pct   = ((total - seconds) / total) * 100
  const r = 15
  const circ = 2 * Math.PI * r

  if (!task) return null

  return (
    <AnimatePresence>
      <motion.div className={styles.widget}
        initial={{ opacity:0, y:80 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:80 }}
        transition={{ type:'spring', stiffness:280, damping:25 }}
      >
        <div className={styles.top}>
          <span className={styles.label}>{phase === 'work' ? '\ud83d\udcaa Focus' : '\u2615 Break'}</span>
          <button className="btn-icon" style={{ width:22,height:22 }} onClick={stop}><X size={11}/></button>
        </div>
        <div className={styles.title}>{task.title}</div>
        <div className={styles.timerWrap}>
          <svg viewBox="0 0 36 36" className={styles.ring}>
            <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
            <motion.circle cx="18" cy="18" r={r} fill="none"
              stroke={phase==='work' ? 'var(--accent)' : 'var(--done)'}
              strokeWidth="2.5" strokeLinecap="round"
              transform="rotate(-90 18 18)"
              animate={{ strokeDasharray: `${(pct/100)*circ} ${circ}` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <span className={styles.time}>{fmt(seconds)}</span>
        </div>
        <div className={styles.btns}>
          <button className="btn-icon" title="Reset" onClick={() => { setSeconds(WORK); setRunning(false); setPhase('work') }}><RotateCcw size={13}/></button>
          <button className="btn btn-primary" style={{ padding:'7px 18px', fontSize:12 }} onClick={() => setRunning(r=>!r)}>
            {running ? <><Pause size={13}/> Pause</> : <><Play size={13}/> {seconds < total ? 'Resume' : 'Start'}</>}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
