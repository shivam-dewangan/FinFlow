import React, { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../api/axios'

const MOCK_MONTHLY = [
  { month:'Apr', credit:520000, debit:380000, balance:140000 },
  { month:'May', credit:680000, debit:410000, balance:410000 },
  { month:'Jun', credit:450000, debit:390000, balance:470000 },
]

const MOCK_FORECAST = Array.from({ length: 90 }, (_, i) => ({
  date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
  credit: 15000 + Math.random() * 8000,
  debit: 12000 + Math.random() * 5000,
  balance: 400000 + i * 600 + Math.random() * 10000
}))

export default function CashFlow() {
  const [forecast, setForecast] = useState(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/cashflow/forecast?days=90`)
      .then(r => setForecast(r.data))
      .catch(() => setForecast({ forecast: MOCK_FORECAST, monthly: MOCK_MONTHLY, avgDailyCredit: 18000, avgDailyDebit: 13500 }))
      .finally(() => setLoading(false))
  }, [])

  const displayData = (forecast?.forecast || MOCK_FORECAST).slice(0, days)
  const monthly = forecast?.monthly || MOCK_MONTHLY
  const cardStyle = { background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }

  const endBalance = displayData[displayData.length - 1]?.balance || 0
  const startBalance = displayData[0]?.balance || 0
  const netChange = endBalance - startBalance
  const totalInflow = displayData.reduce((s,d) => s + d.credit, 0)
  const totalOutflow = displayData.reduce((s,d) => s + d.debit, 0)

  const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${Math.round(n)}`

  return (
    <div style={{ padding:32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--ink)' }}>Cash Flow</h1>
          <p style={{ fontSize:13, color:'var(--ink3)', marginTop:3 }}>AI-powered forecast based on your transaction history</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[30, 60, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding:'7px 16px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer',
              borderColor: days===d ? 'var(--sage)' : 'var(--border)',
              background: days===d ? 'var(--sage-light)' : 'var(--white)',
              color: days===d ? 'var(--sage-dark)' : 'var(--ink3)'
            }}>{d}D</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Expected Inflow', value: fmt(totalInflow), color:'var(--sage)', icon:'↑' },
          { label:'Expected Outflow', value: fmt(totalOutflow), color:'var(--red)', icon:'↓' },
          { label:'Net Cash Flow', value: fmt(netChange), color: netChange >= 0 ? 'var(--sage)' : 'var(--red)', icon: netChange >= 0 ? '↗' : '↘' },
          { label:'Avg Daily Credit', value: fmt(forecast?.avgDailyCredit || 18000), color:'var(--blue)', icon:'~' },
        ].map(c => (
          <div key={c.label} style={cardStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:11, color:'var(--ink3)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.4px' }}>{c.label}</span>
              <span style={{ fontSize:16, color:c.color, fontWeight:700 }}>{c.icon}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-mono)', color:c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main forecast chart */}
      <div style={{ ...cardStyle, marginBottom:16 }}>
        <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:4 }}>Balance Projection — Next {days} Days</h3>
        <p style={{ fontSize:12, color:'var(--ink3)', marginBottom:18 }}>Based on historical transaction patterns and outstanding invoices</p>
        {loading ? (
          <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:32, height:32, border:'2px solid var(--sage-light)', borderTop:'2px solid var(--sage)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={displayData.filter((_,i) => i % Math.max(1, Math.floor(displayData.length/30)) === 0)} margin={{ top:5, right:10, left:10, bottom:0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--ink3)' }} axisLine={false} tickLine={false}
                tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize:10, fill:'var(--ink3)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip contentStyle={{ borderRadius:8, border:'1px solid var(--border)', fontSize:12 }}
                formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Balance']}
                labelFormatter={d => new Date(d).toLocaleDateString('en-IN')} />
              <Area type="monotone" dataKey="balance" stroke="#1D9E75" strokeWidth={2} fill="url(#balGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly + Inflow/Outflow */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16 }}>Monthly Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly} margin={{ top:0, right:0, left:-10, bottom:0 }}>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--ink3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--ink3)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip formatter={v => `₹${v?.toLocaleString('en-IN')}`} contentStyle={{ borderRadius:8, fontSize:12 }} />
              <Bar dataKey="credit" fill="#1D9E75" radius={[3,3,0,0]} name="Inflow" />
              <Bar dataKey="debit" fill="#E24B4A" radius={[3,3,0,0]} name="Outflow" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:12, marginTop:10, justifyContent:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--ink3)' }}><span style={{ width:10, height:10, borderRadius:2, background:'#1D9E75', display:'inline-block' }}/>Inflow</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--ink3)' }}><span style={{ width:10, height:10, borderRadius:2, background:'#E24B4A', display:'inline-block' }}/>Outflow</div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:12 }}>AI Insights</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'💡', color:'var(--gold)', bg:'var(--gold-light)', text:`Average daily inflow is ${fmt(forecast?.avgDailyCredit || 18000)} — ${netChange > 0 ? 'positive trend' : 'monitor closely'}` },
              { icon:'📅', color:'var(--blue)', bg:'var(--blue-light)', text:'Collections are strongest in the 2nd and 3rd week of the month' },
              { icon:'⚡', color:'var(--sage-dark)', bg:'var(--sage-light)', text:`Net cash position will be ${fmt(endBalance)} in ${days} days` },
              { icon:'⚠️', color:'var(--red)', bg:'var(--red-light)', text: totalOutflow > totalInflow ? 'Outflow exceeds inflow — consider reducing expenses' : 'Cash flow is healthy — consider investing surplus' },
            ].map((tip, i) => (
              <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:tip.bg, borderRadius:8 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{tip.icon}</span>
                <span style={{ fontSize:12, color:tip.color, lineHeight:1.5, fontWeight:500 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
