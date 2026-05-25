import { AnimatePresence, motion } from 'framer-motion'
import TaskCard from './TaskCard'
import styles from './TaskList.module.css'

export default function TaskList({ tasks, loading, onEdit, selected, onSelect }) {
  if (loading) return (
    <div className={styles.center}>
      <div className="spinner" style={{ width:32,height:32,borderWidth:3 }} />
      <p style={{ color:'var(--text-2)',marginTop:12 }}>Loading tasks…</p>
    </div>
  )
  if (!tasks.length) return (
    <div className={styles.center}>
      <div className={styles.emptyIcon}>✨</div>
      <p style={{ color:'var(--text-2)',fontWeight:600 }}>No tasks here yet</p>
      <p style={{ color:'var(--text-3)',fontSize:13 }}>Click "New Task" or press <kbd style={{padding:'2px 6px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:4,fontFamily:'var(--mono)',fontSize:11}}>N</kbd></p>
    </div>
  )

  const toggle = (id) => onSelect(prev => prev.includes(id) ? prev.filter(i=>i!==id) : [...prev, id])

  return (
    <div className={styles.list}>
      <AnimatePresence initial={false}>
        {tasks.map((task, i) => (
          <motion.div key={task.id}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
            transition={{ delay: i * 0.03, type:'spring', stiffness:300, damping:30 }}
          >
            <TaskCard task={task} onEdit={onEdit} selected={selected.includes(task.id)} onSelect={() => toggle(task.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
