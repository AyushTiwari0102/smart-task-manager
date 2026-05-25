import { motion } from 'framer-motion'
import styles from './ProgressBar.module.css'

export default function ProgressBar({ stats }) {
  const total = stats?.total ?? 0
  const done  = stats?.byStatus?.DONE ?? 0
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        <span>Overall Completion</span>
        <span className={styles.pct}>{pct}%</span>
      </div>
      <div className={styles.track}>
        <motion.div className={styles.bar}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.4,0,0.2,1] }}
        />
      </div>
    </div>
  )
}
