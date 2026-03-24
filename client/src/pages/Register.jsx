import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', businessName:'', gstin:'', phone:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const inp = (field, label, type='text', placeholder='') => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:12, marginBottom:5, fontWeight:500 }}>{label}</label>
      <input type={type} value={form[field]} placeholder={placeholder}
        onChange={e => setForm({...form, [field]: e.target.value})}
        style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'white', fontSize:13, outline:'none' }}
      />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--ink)', padding:24 }}>
      <div style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'white', marginBottom:8 }}>
            Fin<span style={{ color:'var(--sage-mid)' }}>Flow</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Create your free account</p>
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:32 }}>
          {error && (
            <div style={{ background:'rgba(226,75,74,0.15)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#fca5a5', fontSize:13 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
              <div style={{ gridColumn:'1/-1' }}>{inp('name','YOUR NAME','text','Rahul Sharma')}</div>
              <div style={{ gridColumn:'1/-1' }}>{inp('email','EMAIL','email','rahul@company.com')}</div>
              <div style={{ gridColumn:'1/-1' }}>{inp('password','PASSWORD','password','Min 6 characters')}</div>
              <div style={{ gridColumn:'1/-1', margin:'8px 0 4px', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:16 }}>
                <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Business Details</p>
              </div>
              <div style={{ gridColumn:'1/-1' }}>{inp('businessName','BUSINESS NAME','text','Acme Pvt Ltd')}</div>
              {inp('gstin','GSTIN (Optional)','text','29AABCA1234A1Z5')}
              {inp('phone','PHONE','tel','+91 98765 43210')}
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px', background:'var(--sage)', border:'none',
              borderRadius:8, color:'white', fontSize:15, fontWeight:500, marginTop:8,
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, marginTop:16, textAlign:'center' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--sage-mid)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
