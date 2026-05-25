import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Zap, Brain } from 'lucide-react'
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks'
import { scoreTask } from '../../api/tasks'
import styles from './TaskModal.module.css'

export default function TaskModal({ task, onClose }) {
  const isEdit = !!task?.id
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const [title,    setTitle]    = useState(task?.title || '')
  const [desc,     setDesc]     = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM')
  const [status,   setStatus]   = useState(task?.status || 'TODO')
  const [dueDate,  setDueDate]  = useState(task?.dueDate ? task.dueDate.slice(0,16) : '')
  const [aiResult, setAiResult] = useState(null)
  const [scoring,  setScoring]  = useState(false)
  const [error,    setError]    = useState('')

  // keyboard: Escape to close, N to open (handled in parent)
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleAI = async () => {
    if (!title) return
    setScoring(true); setAiResult(null)
    try {
      const res = await scoreTask({ title, description: desc, dueDate: dueDate || undefined })
      setAiResult(res)
      setPriority(res.priority)
    } catch { } finally { setScoring(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    const payload = { title: title.trim(), description: desc.trim(), priority, status, dueDate: dueDate || null }
    try {
      if (isEdit) await updateTask.mutateAsync({ id: task.id, ...payload })
      else        await createTask.mutateAsync(payload)
      onClose()
    } catch (err) { setError(err.response?.data?.error || 'Failed to save task') }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className={`${styles.modal} glass`}
        initial={{ opacity:0, scale:0.88, y:24 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.92, y:12 }}
        transition={{ type:'spring', stiffness:280, damping:25 }}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.icon}><Zap size={15} strokeWidth={2.5} /></div>
            <h3>{isEdit ? 'Edit Task' : 'New Task'}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom:14 }}>
            <label>Title <span style={{ color:'var(--danger)' }}>*</span></label>
            <input className="input" placeholder="What needs to be done?" required maxLength={200}
              value={title} onChange={e=>setTitle(e.target.value)} autoFocus />
          </div>
          <div className="field" style={{ marginBottom:14 }}>
            <label>Description</label>
            <textarea className="input" placeholder="Add context, links…" rows={3} maxLength={1000}
              value={desc} onChange={e=>setDesc(e.target.value)} />
          </div>
          <div className={styles.row}>
            <div className="field">
              <label>Priority</label>
              <select className="input" value={priority} onChange={e=>setPriority(e.target.value)}>
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">⚡ Medium</option>
                <option value="HIGH">🔥 High</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
          <div className="field" style={{ marginBottom:14 }}>
            <label>Due Date</label>
            <input className="input" type="datetime-local" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
          </div>

          {/* AI Score */}
          <div className={styles.aiSection}>
            <button type="button" className={`btn btn-ghost ${styles.aiBtn}`} onClick={handleAI} disabled={!title||scoring}>
              {scoring ? <span className="spinner" style={{width:14,height:14,borderWidth:2}} /> : <Brain size={14} />}
              {scoring ? 'Scoring…' : '⚡ AI Score Priority'}
            </button>
            {aiResult && (
              <motion.div className={styles.aiResult}
                initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}>
                <strong>{aiResult.urgencyLabel}</strong>
                <span>Score: {aiResult.score}/100</span>
                <span style={{ color:'var(--text-2)',fontSize:12 }}>{aiResult.suggestion}</span>
              </motion.div>
            )}
          </div>

          {error && <div className="form-error" style={{ marginBottom:12 }}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"
              disabled={createTask.isPending || updateTask.isPending}>
              {(createTask.isPending || updateTask.isPending) ? <span className="spinner" /> : (isEdit ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
