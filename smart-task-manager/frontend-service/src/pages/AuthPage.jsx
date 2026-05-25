import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [tab, setTab] = useState('login')

  return (
    <div className={styles.screen}>
      {/* animated orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <motion.div
        className={`${styles.card} glass`}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Zap size={20} strokeWidth={2.5} /></div>
          <h1 className={styles.brandName}>Smart<span className={styles.accent}>Task</span></h1>
        </div>
        <p className={styles.tagline}>Full MERN · AI-powered · Real-time</p>

        <div className={styles.tabs}>
          {['login','register'].map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.active : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => {}} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
