import { motion } from 'framer-motion'
import { FileText, Clock, Loader, CheckCircle } from 'lucide-react'
import styles from './StatsGrid.module.css'

function StatCard({ label, value, color, icon: Icon, pct, delay }) {
  const circumference = 2 * Math.PI * 15
  const dashArray = `${(pct / 100) * circumference} ${circumference}`

  return (
    <motion.div className={`${styles.card} glass`}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, type:'spring', stiffness:200, damping:20 }}
      whileHover={{ y: -4, boxShadow: `0 16px 48px rgba(0,0,0,0.5)` }}
      style={{ '--card-color': color }}
    >
      <div className={styles.inner}>
        <div>
          <div className={styles.value}>{value ?? '—'}</div>
          <div className={styles.label}>{label}</div>
        </div>
        <div className={styles.ringWrap}>
          <svg className={styles.ring} viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
              strokeLinecap="round" transform="rotate(-90 18 18)"
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: dashArray }}
              transition={{ duration: 1, delay: delay + 0.2 }}
            />
          </svg>
          <Icon size={14} style={{ position:'absolute', color: 'var(--text-2)' }} />
        </div>
      </div>
      <div className={styles.stripe} style={{ background: color }} />
    </motion.div>
  )
}

export default function StatsGrid({ stats }) {
  const total    = stats?.total ?? 0
  const todo     = stats?.byStatus?.TODO ?? 0
  const progress = stats?.byStatus?.IN_PROGRESS ?? 0
  const done     = stats?.byStatus?.DONE ?? 0

  const pct = (v) => total > 0 ? Math.round((v / total) * 100) : 0

  return (
    <div className={styles.grid}>
      <StatCard label="Total" value={total} color="#7c6dff" icon={FileText} pct={100} delay={0} />
      <StatCard label="To Do" value={todo} color="#f59e0b" icon={Clock} pct={pct(todo)} delay={0.05} />
      <StatCard label="In Progress" value={progress} color="#3b82f6" icon={Loader} pct={pct(progress)} delay={0.1} />
      <StatCard label="Done" value={done} color="#10b981" icon={CheckCircle} pct={pct(done)} delay={0.15} />
    </div>
  )
}
