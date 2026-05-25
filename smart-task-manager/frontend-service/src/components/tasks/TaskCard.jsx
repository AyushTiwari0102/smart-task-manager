import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, CheckCircle, Timer } from 'lucide-react'
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'
import { useDeleteTask, useUpdateTask } from '../../hooks/useTasks'
import { usePomodoroStore } from '../features/PomodoroWidget'
import styles from './TaskCard.module.css'

const STATUS_DOT = { TODO: 'var(--todo)', IN_PROGRESS: 'var(--progress)', DONE: 'var(--done)' }
const PRIORITY_LEFT = { HIGH: 'var(--danger)', MEDIUM: 'var(--todo)', LOW: 'var(--done)' }

function DueLabel({ dueDate }) {
  if (!dueDate) return null
  const d = new Date(dueDate)
  const overdue = isPast(d) && !isToday(d)
  const label = overdue
    ? `Overdue ${formatDistanceToNow(d, { addSuffix: true })}`
    : isToday(d) ? 'Due today'
    : isTomorrow(d) ? 'Due tomorrow'
    : formatDistanceToNow(d, { addSuffix: true })
  return <span className={`badge ${overdue ? 'badge-overdue' : 'badge-medium'}`}>📅 {label}</span>
}

export default function TaskCard({ task, onEdit, selected, onSelect }) {
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()
  const startPomodoro = usePomodoroStore ? usePomodoroStore(s=>s.start) : null
  const [confirm, setConfirm] = useState(false)

  const toggleDone = (e) => {
    e.stopPropagation()
    updateTask.mutate({ id: task.id, title: task.title, priority: task.priority, status: task.status === 'DONE' ? 'TODO' : 'DONE', dueDate: task.dueDate, description: task.description })
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm) { deleteTask.mutate(task.id); setConfirm(false) }
    else { setConfirm(true); setTimeout(() => setConfirm(false), 2500) }
  }

  return (
    <div
      className={`${styles.card} glass ${selected ? styles.selected : ''}`}
      style={{ '--priority-color': PRIORITY_LEFT[task.priority] }}
      onClick={() => onEdit(task)}
    >
      <div className={styles.left} />

      {/* Checkbox */}
      <div onClick={e => { e.stopPropagation(); onSelect() }} className={styles.checkbox}>
        <div className={`${styles.check} ${selected ? styles.checkSelected : ''}`} />
      </div>

      {/* Status dot */}
      <div className={styles.dot}
        style={{ background: STATUS_DOT[task.status], boxShadow: `0 0 ${task.status==='IN_PROGRESS'?'12px':'6px'} ${STATUS_DOT[task.status]}` }}
      />

      {/* Body */}
      <div className={styles.body}>
        <div className={`${styles.title} ${task.status==='DONE'?styles.done:''}`}>{task.title}</div>
        <div className={styles.meta}>
          {task.description && <span className={styles.desc}>{task.description}</span>}
          <span className={`badge badge-${task.status==='TODO'?'todo':task.status==='IN_PROGRESS'?'progress':'done'}`}>
            {task.status==='TODO'?'To Do':task.status==='IN_PROGRESS'?'In Progress':'Done'}
          </span>
          <span className={`badge badge-${task.priority.toLowerCase()}`}>
            {task.priority==='HIGH'?'🔥':task.priority==='MEDIUM'?'⚡':'🟢'} {task.priority}
          </span>
          <DueLabel dueDate={task.dueDate} />
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions} onClick={e => e.stopPropagation()}>
        {startPomodoro && (
          <button className="btn-icon" title="Start Pomodoro" onClick={() => startPomodoro(task)}>
            <Timer size={13} />
          </button>
        )}
        <button className="btn-icon" title={task.status==='DONE'?'Mark incomplete':'Mark done'} onClick={toggleDone}>
          <CheckCircle size={13} style={{ color: task.status==='DONE'?'var(--done)':undefined }} />
        </button>
        <button className="btn-icon" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(task) }}>
          <Edit2 size={13} />
        </button>
        <button className={`btn-icon ${confirm ? styles.confirmDelete : ''}`} title={confirm?'Click again to confirm':'Delete'} onClick={handleDelete}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
