import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import styles from './KanbanColumn.module.css'

export default function KanbanColumn({ col, tasks, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  return (
    <div ref={setNodeRef} className={`${styles.col} ${isOver ? styles.over : ''}`}
      style={{ '--col-color': col.color }}>
      <div className={styles.header}>
        <span className={styles.dot} style={{ background: col.color, boxShadow:`0 0 8px ${col.color}` }} />
        <span className={styles.title}>{col.label}</span>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map(t=>t.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.cards}>
          {tasks.map(task => <KanbanCard key={task.id} task={task} onEdit={onEdit} />)}
          {!tasks.length && <div className={styles.empty}>Drop tasks here</div>}
        </div>
      </SortableContext>
    </div>
  )
}
