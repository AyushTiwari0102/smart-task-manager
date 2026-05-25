import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './KanbanCard.module.css'

export default function KanbanCard({ task, onEdit, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onClick={() => onEdit?.(task)}
    >
      <div className={styles.title}>{task.title}</div>
      <div className={styles.footer}>
        <span className={`badge badge-${task.priority.toLowerCase()}`}>
          {task.priority==='HIGH'?'🔥':task.priority==='MEDIUM'?'⚡':'🟢'} {task.priority}
        </span>
      </div>
    </div>
  )
}
