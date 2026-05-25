import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login({ email, password }) }
    catch (err) { setError(err.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="field">
        <label>Email</label>
        <div style={{ position:'relative' }}>
          <Mail size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',pointerEvents:'none' }} />
          <input className="input" type="email" placeholder="you@example.com" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ paddingLeft:38 }}
          />
        </div>
      </div>
      <div className="field">
        <label>Password</label>
        <div style={{ position:'relative' }}>
          <Lock size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',pointerEvents:'none' }} />
          <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={{ paddingLeft:38, paddingRight:38 }}
          />
          <button type="button" onClick={() => setShowPass(p => !p)}
            style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-2)',cursor:'pointer',display:'flex' }}>
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%' }}>
        {loading ? <span className="spinner" /> : 'Sign In'}
      </button>
    </form>
  )
}
