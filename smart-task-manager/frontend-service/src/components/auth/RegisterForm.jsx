import { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function RegisterForm() {
  const { register } = useAuth()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register({ name, email, password }) }
    catch (err) { setError(err.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  const iconStyle = { position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',pointerEvents:'none' }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="field">
        <label>Full Name</label>
        <div style={{ position:'relative' }}>
          <User size={15} style={iconStyle} />
          <input className="input" type="text" placeholder="Ayush Tiwari" required minLength={2}
            value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft:38 }} />
        </div>
      </div>
      <div className="field">
        <label>Email</label>
        <div style={{ position:'relative' }}>
          <Mail size={15} style={iconStyle} />
          <input className="input" type="email" placeholder="you@example.com" required
            value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft:38 }} />
        </div>
      </div>
      <div className="field">
        <label>Password</label>
        <div style={{ position:'relative' }}>
          <Lock size={15} style={iconStyle} />
          <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min 6 chars" required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft:38, paddingRight:38 }} />
          <button type="button" onClick={() => setShowPass(p => !p)}
            style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-2)',cursor:'pointer',display:'flex' }}>
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%' }}>
        {loading ? <span className="spinner" /> : 'Create Account'}
      </button>
    </form>
  )
}
