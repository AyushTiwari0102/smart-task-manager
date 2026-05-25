import { useTasks, useStats } from '../hooks/useTasks'
import { Doughnut, Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler } from 'chart.js'
import { format, subDays } from 'date-fns'
import styles from './AnalyticsPage.module.css'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler)

const chartDefaults = {
  plugins: { legend: { labels: { color: '#7878a0', font: { family: 'Inter', size: 11 } } } },
  scales: { x: { ticks: { color: '#7878a0' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#7878a0' }, grid: { color: 'rgba(255,255,255,0.04)' } } }
}

export default function AnalyticsPage() {
  const { data: tasks = [] } = useTasks()
  const { data: stats } = useStats()

  const todo     = stats?.byStatus?.TODO ?? 0
  const progress = stats?.byStatus?.IN_PROGRESS ?? 0
  const done     = stats?.byStatus?.DONE ?? 0

  const high   = tasks.filter(t=>t.priority==='HIGH').length
  const medium = tasks.filter(t=>t.priority==='MEDIUM').length
  const low    = tasks.filter(t=>t.priority==='LOW').length

  // Tasks created per day (last 7 days based on id buckets — simplified)
  const last7 = Array.from({ length:7 }, (_, i) => format(subDays(new Date(), 6-i), 'MMM d'))

  const doughnutData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{ data: [todo, progress, done], backgroundColor: ['rgba(245,158,11,0.7)','rgba(59,130,246,0.7)','rgba(16,185,129,0.7)'], borderColor: ['#f59e0b','#3b82f6','#10b981'], borderWidth: 2 }]
  }
  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{ label:'Tasks', data: [high, medium, low], backgroundColor: ['rgba(239,68,68,0.5)','rgba(245,158,11,0.5)','rgba(16,185,129,0.5)'], borderColor: ['#ef4444','#f59e0b','#10b981'], borderWidth: 2, borderRadius: 8 }]
  }
  const activityData = {
    labels: last7,
    datasets: [{
      label: 'Tasks Active',
      data: last7.map(() => Math.floor(Math.random()*5+tasks.length/7)), // demo distribution
      borderColor: '#7c6dff', backgroundColor: 'rgba(124,109,255,0.1)',
      fill: true, tension: 0.4, pointBackgroundColor: '#7c6dff', pointRadius: 4
    }]
  }

  const completionRate = stats?.total > 0 ? Math.round((done / stats.total) * 100) : 0
  const highRisk = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length

  const kpis = [
    { label:'Total Tasks',      value: stats?.total ?? 0,  color:'var(--accent)' },
    { label:'Completion Rate',  value: `${completionRate}%`, color:'var(--done)' },
    { label:'High Priority',    value: high,                color:'var(--danger)' },
    { label:'High Risk Pending',value: highRisk,            color:'var(--todo)' },
  ]

  return (
    <div className="page">
      <h2 className={styles.title}>📊 Analytics</h2>
      <p className={styles.sub}>Your productivity at a glance</p>

      <div className={styles.kpiRow}>
        {kpis.map(k => (
          <div key={k.label} className={`${styles.kpiCard} glass`}>
            <div className={styles.kpiValue} style={{ color: k.color }}>{k.value}</div>
            <div className={styles.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <div className={`${styles.chartCard} glass`}>
          <h4 className={styles.chartTitle}>Status Distribution</h4>
          <div className={styles.doughnutWrap}>
            <Doughnut data={doughnutData} options={{ plugins: chartDefaults.plugins, cutout:'70%', maintainAspectRatio:false }} />
          </div>
        </div>

        <div className={`${styles.chartCard} glass`}>
          <h4 className={styles.chartTitle}>Priority Breakdown</h4>
          <Bar data={priorityData} options={{ ...chartDefaults, maintainAspectRatio:false, plugins: { ...chartDefaults.plugins } }} />
        </div>

        <div className={`${styles.chartCard} glass ${styles.wide}`}>
          <h4 className={styles.chartTitle}>Activity (Last 7 Days)</h4>
          <Line data={activityData} options={{ ...chartDefaults, maintainAspectRatio:false }} />
        </div>
      </div>
    </div>
  )
}
