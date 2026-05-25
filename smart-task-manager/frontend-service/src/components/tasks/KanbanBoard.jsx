import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { useUpdateTask } from '../../hooks/useTasks'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import styles from './KanbanBoard.module.css'

const COLS = [
  { id:'TODO',        label:'To Do',      color:'var(--todo)' },
  { id:'IN_PROGRESS', label:'In Progress', color:'var(--progress)' },
  { id:'DONE',        label:'Done',        color:'var(--done)' },
]

export default function KanbanBoard({ tasks, onEdit }) {
  const updateTask = useUpdateTask()
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const byCol = (status) => tasks.filter(t => t.status === status)
  const activeTask = tasks.find(t => t.id === activeId)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const col = COLS.find(c => c.id === over.id)
    if (!col) return
    const task = tasks.find(t => t.id === active.id)
    if (task && task.status !== col.id) {
      updateTask.mutate({ ...task, id: task.id, status: col.id })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={({active}) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.grid}>
        {COLS.map(col => (
          <KanbanColumn key={col.id} col={col} tasks={byCol(col.id)} onEdit={onEdit} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
