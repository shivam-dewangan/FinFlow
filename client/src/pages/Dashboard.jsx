import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`

const KPICard = ({ label, value, sub, color='var(--sage)', icon }) => (
  <div style={{ background:'var(--white)', borderRadius:14, padding:'20px 22px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
      <span style={{ fontSize:12, color:'var(--ink3)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.4px' }}>{label}</span>
      <span style={{ fontSize:20 }}>{icon}</span>
    </div>
    <div style={{ fontSize:26, fontWeight:600, color:'var(--ink)', fontFamily:'var(--font-mono)', marginBottom:4 }}>{value}</div>
    <div style={{ fontSize:12, color: sub?.startsWith('+') ? 'var(--sage)' : sub?.startsWith('!') ? 'var(--red)' : 'var(--ink3)' }}>{sub}</div>
  </div>
)

const statusStyle = { draft:{bg:'#f1f5f9',c:'#64748b'}, sent:{bg:'#E6F1FB',c:'#185FA5'}, paid:{bg:'#E1F5EE',c:'#0F6E56'}, overdue:{bg:'#FCEBEB',c:'#991b1b'}, viewed:{bg:'#FAEEDA',c:'#92400e'}, cancelled:{bg:'#f1f5f9',c:'#94a3b8'} }

export default function Dashboard() {
  const { activeBusiness } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/invoices/stats/dashboard')
      .then(r => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeBusiness])

  const mockMonthly = [
    { month:'Oct', revenue:340000 },{ month:'Nov', revenue:520000 },{ month:'Dec', revenue:410000 },
    { month:'Jan', revenue:680000 },{ month:'Feb', revenue:590000 },{ month:'Mar', revenue:840000 },
  ]

  const chartData = stats?.monthlyChart?.map(m => ({ ...m, revenue: m.revenue || 0 })) || mockMonthly

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ width:36, height:36, border:'3px solid var(--sage-light)', borderTop:'3px solid var(--sage)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding:32, maxWidth:1280 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'var(--ink)', marginBottom:4 }}>
            Good morning 👋
          </h1>
          <p style={{ color:'var(--ink3)', fontSize:14 }}>{activeBusiness?.name || 'Your Business'} · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <Link to="/invoices/new" style={{
          display:'flex', alignItems:'center', gap:8,
          background:'var(--sage)', color:'white', padding:'10px 20px',
          borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none'
        }}>
          <span style={{ fontSize:18 }}>+</span> New Invoice
        </Link>
      </div>

      {/* KPI Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:24 }}>
        <KPICard label="Total Revenue" value={fmt(stats?.totalRevenue || 840000)} sub={`+12% this month`} icon="💰" />
        <KPICard label="Outstanding" value={fmt(stats?.outstandingAmount || 120000)} sub="3 invoices pending" color="var(--gold)" icon="⏳" />
        <KPICard label="Overdue" value={`${stats?.overdueCount || 0} inv`} sub={stats?.overdueCount > 0 ? '! Action needed' : 'All clear'} color="var(--red)" icon="⚠️" />
        <KPICard label="This Month" value={fmt(stats?.monthRevenue || 840000)} sub="+18% vs last month" icon="📈" />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>
        {/* Revenue chart */}
        <div style={{ background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>Revenue Trend</h3>
              <p style={{ fontSize:12, color:'var(--ink3)', marginTop:2 }}>Last 6 months</p>
            </div>
            <div style={{ fontSize:12, color:'var(--sage)', background:'var(--sage-light)', padding:'4px 12px', borderRadius:20, fontWeight:500 }}>
              +12% avg
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top:5, right:10, left:10, bottom:0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--ink3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--ink3)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius:8, border:'1px solid var(--border)', fontSize:12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#1D9E75" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div style={{ background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontSize:15, fontWeight:500, color:'var(--ink)', marginBottom:16 }}>Quick Actions</h3>
          {[
            { label:'Create Invoice', icon:'📄', to:'/invoices/new', color:'var(--sage)' },
            { label:'File GST', icon:'🏛️', to:'/gst', color:'var(--blue)' },
            { label:'Bank Reconcile', icon:'🏦', to:'/reconcile', color:'var(--gold)' },
            { label:'View Cash Flow', icon:'📊', to:'/cashflow', color:'#7c3aed' },
            { label:'Invite CA', icon:'🤝', to:'/collaboration', color:'#db2777' },
          ].map(a => (
            <Link key={a.label} to={a.to} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              borderRadius:8, marginBottom:6, textDecoration:'none',
              background:'var(--off)', color:'var(--ink)',
              fontSize:13, fontWeight:400, transition:'all 0.15s',
              border:'1px solid transparent'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.color = a.color }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--ink)' }}>
              <span>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent invoices */}
      <div style={{ background:'var(--white)', borderRadius:14, border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>Recent Invoices</h3>
          <Link to="/invoices" style={{ fontSize:12, color:'var(--sage)', textDecoration:'none', fontWeight:500 }}>View all →</Link>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--off)' }}>
              {['Invoice #','Customer','Date','Amount','Status',''].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:500, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(stats?.recentInvoices || []).length === 0 ? (
              <tr><td colSpan={6} style={{ padding:'32px', textAlign:'center', color:'var(--ink3)', fontSize:13 }}>No invoices yet. <Link to="/invoices/new" style={{ color:'var(--sage)' }}>Create your first invoice →</Link></td></tr>
            ) : stats.recentInvoices.map((inv, i) => {
              const st = statusStyle[inv.status] || statusStyle.draft
              return (
                <tr key={inv._id} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{ padding:'12px 16px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--sage-dark)', fontWeight:500 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--ink)' }}>{inv.customer?.name}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'var(--ink3)' }}>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding:'12px 16px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:500 }}>₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ background:st.bg, color:st.c, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500 }}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <Link to={`/invoices`} style={{ fontSize:12, color:'var(--sage)', fontWeight:500 }}>View</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
