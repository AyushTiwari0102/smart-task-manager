import { Trash2, CheckSquare, X } from 'lucide-react'
import { useDeleteTask, useUpdateTask } from '../../hooks/useTasks'
import { motion } from 'framer-motion'
import styles from './BulkActions.module.css'

export default function BulkActions({ selected, onClear }) {
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()

  const bulkDelete = async () => {
    for (const id of selected) await deleteTask.mutateAsync(id)
    onClear()
  }

  return (
    <motion.div className={styles.bar}
      initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}>
      <span className={styles.count}>{selected.length} selected</span>
      <button className="btn btn-danger" onClick={bulkDelete}>
        <Trash2 size={13} /> Delete All
      </button>
      <button className="btn btn-ghost" onClick={onClear}>
        <X size={13} /> Clear
      </button>
    </motion.div>
  )
}
