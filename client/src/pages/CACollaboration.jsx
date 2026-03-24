import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function CACollaboration() {
  const { activeBusiness } = useAuth()
  const [business, setBusiness] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('ca')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (activeBusiness?._id) {
      api.get(`/businesses/${activeBusiness._id}`).then(r => setBusiness(r.data.business)).catch(console.error)
    }
  }, [activeBusiness])

  const invite = async () => {
    if (!inviteEmail) return
    setLoading(true); setMsg('')
    try {
      const res = await api.post(`/businesses/${activeBusiness._id}/invite`, {
        email: inviteEmail, role: inviteRole,
        permissions: inviteRole === 'ca'
          ? { viewInvoices:true, viewReports:true, createInvoices:false, manageSettings:false }
          : { viewInvoices:true, viewReports:true, createInvoices:true, manageSettings:false }
      })
      setMsg(`✓ Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setBusiness(res.data.business)
    } catch(e) {
      setMsg('✗ ' + (e.response?.data?.message || 'Failed to send invite'))
    } finally { setLoading(false) }
  }

  const removeMember = async (memberId) => {
    try {
      const res = await api.delete(`/businesses/${activeBusiness._id}/members/${memberId}`)
      setBusiness(res.data.business)
    } catch(e) { console.error(e) }
  }

  const cardStyle = { background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }
  const roleColors = { owner:{ bg:'#EEEDFE',c:'#3C3489' }, ca:{ bg:'var(--sage-light)',c:'var(--sage-dark)' }, staff:{ bg:'var(--blue-light)',c:'var(--blue)' } }

  return (
    <div style={{ padding:32 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--ink)' }}>CA Collaboration</h1>
        <p style={{ fontSize:13, color:'var(--ink3)', marginTop:3 }}>Invite your CA or team members to collaborate</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Invite panel */}
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Invite Member</h3>

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--ink3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.3px' }}>Email Address</label>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="ca@chartered.com"
              style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, outline:'none' }} />
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--ink3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.3px' }}>Role</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[{ value:'ca', label:'Chartered Accountant', desc:'Read-only, reports access' }, { value:'staff', label:'Staff Member', desc:'Create invoices, view reports' }].map(r => (
                <label key={r.value} style={{ cursor:'pointer', padding:'12px', border:`1.5px solid ${inviteRole===r.value ? 'var(--sage)' : 'var(--border)'}`, borderRadius:8, background: inviteRole===r.value ? 'var(--sage-light)' : 'var(--white)' }}>
                  <input type="radio" name="role" value={r.value} checked={inviteRole===r.value} onChange={e => setInviteRole(e.target.value)} style={{ marginRight:6 }} />
                  <span style={{ fontSize:12, fontWeight:500, color: inviteRole===r.value ? 'var(--sage-dark)' : 'var(--ink)' }}>{r.label}</span>
                  <div style={{ fontSize:10, color:'var(--ink3)', marginTop:3 }}>{r.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Permissions preview */}
          <div style={{ background:'var(--off)', borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--ink2)', marginBottom:8 }}>Permissions for this role:</div>
            {[
              { label:'View Invoices', granted: true },
              { label:'View Reports', granted: true },
              { label:'Create Invoices', granted: inviteRole === 'staff' },
              { label:'Manage Settings', granted: false },
            ].map(p => (
              <div key={p.label} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0' }}>
                <span style={{ color:'var(--ink2)' }}>{p.label}</span>
                <span style={{ color: p.granted ? 'var(--sage)' : 'var(--ink3)', fontWeight:500 }}>{p.granted ? '✓ Yes' : '— No'}</span>
              </div>
            ))}
          </div>

          <button onClick={invite} disabled={loading || !inviteEmail} style={{
            width:'100%', padding:'11px', background:'var(--sage)', border:'none', borderRadius:8,
            color:'white', fontSize:13, fontWeight:500, cursor:'pointer', opacity: loading || !inviteEmail ? 0.6 : 1
          }}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>

          {msg && (
            <div style={{ marginTop:10, padding:'10px 12px', borderRadius:8, fontSize:12, fontWeight:500, textAlign:'center',
              background: msg.startsWith('✓') ? 'var(--sage-light)' : 'var(--red-light)',
              color: msg.startsWith('✓') ? 'var(--sage-dark)' : 'var(--red)'
            }}>{msg}</div>
          )}
        </div>

        {/* Members list */}
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
            Team Members
            <span style={{ marginLeft:8, fontSize:12, color:'var(--ink3)', fontWeight:400 }}>
              {(business?.members?.length || 0) + 1} members
            </span>
          </h3>

          {/* Owner */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'var(--off)', borderRadius:8, marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:600 }}>
                {activeBusiness?.name?.[0] || 'O'}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>You (Owner)</div>
                <div style={{ fontSize:11, color:'var(--ink3)' }}>Full access</div>
              </div>
            </div>
            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#EEEDFE', color:'#3C3489', fontWeight:500 }}>Owner</span>
          </div>

          {(!business?.members || business.members.length === 0) ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--ink3)' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🤝</div>
              <div style={{ fontSize:13, fontWeight:500 }}>No members yet</div>
              <div style={{ fontSize:12, marginTop:4 }}>Invite your CA or team members to collaborate</div>
            </div>
          ) : (
            business.members.map(member => {
              const rc = roleColors[member.role] || roleColors.staff
              return (
                <div key={member._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', borderRadius:8, marginBottom:6, border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background: rc.bg, display:'flex', alignItems:'center', justifyContent:'center', color:rc.c, fontSize:13, fontWeight:600 }}>
                      {member.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{member.email}</div>
                      <div style={{ fontSize:11, color: member.status === 'active' ? 'var(--sage-dark)' : 'var(--ink3)' }}>
                        {member.status === 'active' ? '● Active' : '○ Pending invitation'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:rc.bg, color:rc.c, fontWeight:500 }}>
                      {member.role.toUpperCase()}
                    </span>
                    <button onClick={() => removeMember(member._id)} style={{ padding:'4px 8px', background:'var(--red-light)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:6, color:'var(--red)', fontSize:11, cursor:'pointer' }}>
                      Remove
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, marginTop:16 }}>
        {[
          { icon:'🔒', title:'Secure Access', desc:'Role-based permissions ensure your CA sees only what they need — no sensitive financial data exposure.' },
          { icon:'📊', title:'Shared Reports', desc:'CAs get instant access to P&L, balance sheet, and GST reports without any manual PDF sharing.' },
          { icon:'🔔', title:'Audit Trail', desc:'Every action is logged. Know exactly what your team members viewed or changed and when.' },
        ].map(c => (
          <div key={c.title} style={{ background:'var(--white)', borderRadius:12, padding:'18px 20px', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:24, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)', marginBottom:5 }}>{c.title}</div>
            <div style={{ fontSize:12, color:'var(--ink3)', lineHeight:1.6 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
