import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--ink)' }}>
      {/* Left panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 80px', background:'var(--ink)' }}>
        <div style={{ maxWidth:400 }}>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:32, color:'white', marginBottom:8 }}>
            Fin<span style={{ color:'var(--sage-mid)' }}>Flow</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:48, lineHeight:1.6 }}>
            Finance autopilot for Indian SMBs
          </p>

          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'white', marginBottom:8, fontWeight:400 }}>
            Welcome back
          </h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:32 }}>Sign in to your account</p>

          {error && (
            <div style={{ background:'rgba(226,75,74,0.15)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#fca5a5', fontSize:13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:6, fontWeight:500 }}>EMAIL</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="you@company.com"
                style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'white', fontSize:14, outline:'none' }}
              />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:6, fontWeight:500 }}>PASSWORD</label>
              <input
                type="password" required value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'white', fontSize:14, outline:'none' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px', background:'var(--sage)', border:'none',
              borderRadius:8, color:'white', fontSize:15, fontWeight:500,
              opacity: loading ? 0.7 : 1, transition:'all 0.2s'
            }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, marginTop:12, textAlign:'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--sage-mid)' }}>Create one free</Link>
          </p>
          
          {/* Guest Login Button */}
          <button onClick={async () => {
            setLoading(true)
            try {
              await login('rahul@demo.com', 'demo123')
              navigate('/dashboard')
            } catch(e) {
              setError('Guest login failed. Try register first.')
            } finally {
              setLoading(false)
            }
          }} disabled={loading} style={{
            width:'100%', marginTop:12, padding:'13px', background:'var(--sage-light)', 
            border:'1px solid var(--sage)', borderRadius:8, color:'var(--sage-dark)', 
            fontSize:15, fontWeight:500, cursor:'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            👋 Login as Guest (Demo User)
          </button>
          <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, textAlign:'center', marginTop:8 }}>
            Rahul Sharma | Acme Trading Co. | GST: 29AABCA1234A1Z5
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, background:'linear-gradient(135deg, #0f2d1e 0%, #0F6E56 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'rgba(29,158,117,0.15)' }} />
        <div style={{ position:'absolute', bottom:-50, left:-50, width:250, height:250, borderRadius:'50%', background:'rgba(29,158,117,0.1)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'28px', marginBottom:24 }}>
            <div style={{ display:'flex', gap:16, marginBottom:16 }}>
              {[['₹8.4L', 'Revenue'], ['₹1.2L', 'Outstanding'], ['42,800', 'GST Due']].map(([val, label]) => (
                <div key={label} style={{ flex:1, background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'14px 12px' }}>
                  <div style={{ color:'white', fontSize:16, fontWeight:600, fontFamily:'var(--font-mono)' }}>₹{val}</div>
                  <div style={{ color:'rgba(255,255,255,0.45)', fontSize:11, marginTop:4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'12px' }}>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginBottom:8 }}>Monthly Cash Flow</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:48 }}>
                {[35,50,42,68,55,80,72].map((h, i) => (
                  <div key={i} style={{ flex:1, height:`${h}%`, background: i===5 ? 'var(--sage-mid)' : 'rgba(93,202,165,0.3)', borderRadius:'2px 2px 0 0', transition:'all 0.3s' }} />
                ))}
              </div>
            </div>
          </div>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'white', lineHeight:1.3, marginBottom:12 }}>
            Your finance ops,<br /><em>finally sorted.</em>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.7 }}>
            Automate invoicing, GST filing, bank reconciliation and cash flow forecasting — all in one place.
          </p>
        </div>
      </div>
    </div>
  )
}
