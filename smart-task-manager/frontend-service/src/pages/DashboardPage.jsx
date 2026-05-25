import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Mic, Download, Search } from 'lucide-react'
import Fuse from 'fuse.js'
import { useTasks, useStats } from '../hooks/useTasks'
import useSocket from '../hooks/useSocket'
import useNotifications from '../hooks/useNotifications'
import StatsGrid from '../components/dashboard/StatsGrid'
import ProgressBar from '../components/dashboard/ProgressBar'
import TaskList from '../components/tasks/TaskList'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TaskModal from '../components/tasks/TaskModal'
import BulkActions from '../components/tasks/BulkActions'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  useSocket()
  const [filter,    setFilter]    = useState(null)
  const [view,      setView]      = useState('list')
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState('createdAt')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask,  setEditTask]  = useState(null)
  const [selected,  setSelected]  = useState([])

  const { data: tasks = [], isLoading } = useTasks(filter ? { status: filter } : undefined)
  const { data: stats } = useStats()
  useNotifications(tasks)

  // Fuzzy search with Fuse.js
  const displayed = useMemo(() => {
    let list = tasks
    if (search.trim()) {
      const fuse = new Fuse(list, { keys: ['title','description'], threshold: 0.4 })
      list = fuse.search(search).map(r => r.item)
    }
    return [...list].sort((a, b) => {
      if (sort === 'priority') { const order = { HIGH:0,MEDIUM:1,LOW:2 }; return order[a.priority] - order[b.priority] }
      if (sort === 'dueDate')  { return new Date(a.dueDate||'9999') - new Date(b.dueDate||'9999') }
      if (sort === 'title')    { return a.title.localeCompare(b.title) }
      return new Date(b.id) - new Date(a.id) // createdAt fallback (id is auto-increment)
    })
  }, [tasks, search, sort])

  const openEdit   = (task) => { setEditTask(task); setModalOpen(true) }
  const openNew    = () => { setEditTask(null); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTask(null) }

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser'); return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = false
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setEditTask({ _voice: transcript, title: transcript })
      setModalOpen(true)
    }
    r.start()
  }

  const exportCSV = () => {
    const header = 'ID,Title,Status,Priority,Due Date'
    const rows = tasks.map(t =>
      `${t.id},"${t.title.replace(/"/g,'""')}",${t.status},${t.priority},${t.dueDate||''}`
    )
    const blob = new Blob([[header,...rows].join('\n')], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='tasks.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const NAV_FILTERS = [
    { label:'All', value:null },
    { label:'To Do', value:'TODO' },
    { label:'In Progress', value:'IN_PROGRESS' },
    { label:'Done', value:'DONE' },
  ]

  return (
    <div className="page">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{filter ? NAV_FILTERS.find(f=>f.value===filter)?.label : 'All Tasks'}</h2>
          <p className={styles.sub}>{displayed.length} task{displayed.length!==1?'s':''}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchWrap}>
            <Search size={14} style={{ color:'var(--text-3)',flexShrink:0 }} />
            <input className={styles.searchInput} placeholder="Search… (Cmd+K)" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width:'auto',padding:'8px 12px',fontSize:13 }} value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">A–Z</option>
          </select>
          <button className="btn btn-ghost" onClick={handleVoice} title="Voice input">
            <Mic size={14} />
          </button>
          <button className="btn btn-ghost" onClick={exportCSV} title="Export CSV">
            <Download size={14} />
          </button>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        {NAV_FILTERS.map(f => (
          <button key={String(f.value)} className={`${styles.filterTab} ${filter===f.value?styles.active:''}`} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
        <div className={styles.viewToggle}>
          {['list','board'].map(v => (
            <button key={v} className={`${styles.viewBtn} ${view===v?styles.viewActive:''}`} onClick={()=>setView(v)}>
              {v==='list' ? '☰ List' : '▦ Board'}
            </button>
          ))}
        </div>
      </div>

      <StatsGrid stats={stats} />
      <ProgressBar stats={stats} />

      {selected.length > 0 && <BulkActions selected={selected} onClear={() => setSelected([])} />}

      {view === 'list'
        ? <TaskList tasks={displayed} loading={isLoading} onEdit={openEdit} selected={selected} onSelect={setSelected} />
        : <KanbanBoard tasks={displayed} onEdit={openEdit} />
      }

      {modalOpen && <TaskModal task={editTask} onClose={closeModal} />}
    </div>
  )
}
