import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import styles from './CalendarPage.module.css'

const PRIORITY_COLOR = { HIGH:'var(--danger)', MEDIUM:'var(--todo)', LOW:'var(--done)' }

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const { data: tasks = [] } = useTasks()

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const firstDayOfWeek = startOfMonth(current).getDay()

  const tasksOnDay = (day) => tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day))
  const selectedTasks = selected ? tasksOnDay(selected) : []

  return (
    <div className="page">
      <div className={styles.header}>
        <h2 className={styles.title}>📅 Calendar</h2>
        <div className={styles.nav}>
          <button className="btn-icon" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}><ChevronLeft size={16}/></button>
          <span className={styles.month}>{format(current, 'MMMM yyyy')}</span>
          <button className="btn-icon" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}><ChevronRight size={16}/></button>
        </div>
      </div>

      <div className={styles.weekdays}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className={styles.weekday}>{d}</div>)}
      </div>

      <div className={styles.grid}>
        {Array(firstDayOfWeek).fill(null).map((_,i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const dayTasks = tasksOnDay(day)
          const isSelected = selected && isSameDay(day, selected)
          return (
            <motion.div key={day.toISOString()}
              className={`${styles.day} ${!isSameMonth(day, current)?styles.muted:''} ${isToday(day)?styles.today:''} ${isSelected?styles.selected:''}`}
              onClick={() => setSelected(isSameDay(day, selected||new Date(0)) ? null : day)}
              whileHover={{ scale: 1.04 }} transition={{ type:'spring', stiffness:400, damping:25 }}
            >
              <span className={styles.dayNum}>{format(day,'d')}</span>
              <div className={styles.dots}>
                {dayTasks.slice(0,3).map(t => <div key={t.id} className={styles.dot} style={{ background: PRIORITY_COLOR[t.priority] }} />)}
                {dayTasks.length > 3 && <span className={styles.more}>+{dayTasks.length-3}</span>}
              </div>
            </motion.div>
          )
        })}
      </div>

      {selected && (
        <div className={styles.dayDetail}>
          <h4 className={styles.detailTitle}>{format(selected,'MMMM d, yyyy')}</h4>
          {selectedTasks.length === 0
            ? <p style={{ color:'var(--text-3)',fontSize:13 }}>No tasks due this day.</p>
            : selectedTasks.map(t => (
              <div key={t.id} className={`${styles.detailTask} glass`}>
                <div className={styles.detailDot} style={{ background: PRIORITY_COLOR[t.priority] }} />
                <div>
                  <div style={{ fontWeight:600,fontSize:13 }}>{t.title}</div>
                  <div style={{ color:'var(--text-2)',fontSize:11 }}>{t.status} · {t.priority}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
