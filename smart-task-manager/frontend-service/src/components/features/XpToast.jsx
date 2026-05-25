import { useGamification } from '../../context/GamificationContext'
import { AnimatePresence, motion } from 'framer-motion'

export default function XpToast() {
  const { xpAnim } = useGamification()
  return (
    <AnimatePresence>
      {xpAnim && (
        <motion.div
          style={{ position:'fixed',top:20,right:20,zIndex:999,background:'linear-gradient(135deg,var(--accent),var(--accent-2))',color:'#fff',padding:'8px 16px',borderRadius:99,fontWeight:800,fontSize:14,boxShadow:'0 8px 24px var(--accent-glow)' }}
          initial={{ opacity:0, y:-20, scale:0.8 }}
          animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:-20, scale:0.8 }}
          transition={{ type:'spring', stiffness:400, damping:20 }}
        >
          {xpAnim}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
