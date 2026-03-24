import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axios'

export default function GSTModule() {
  const [year] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [data, setData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [gstin, setGstin] = useState('')
  const [gstinResult, setGstinResult] = useState(null)

  const fetchGSTR1 = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/gst/gstr1/${year}/${month}`)
      setData(res.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchGSTR1()
    api.get('/gst/summary').then(r => setSummary(r.data.quarters)).catch(console.error)
  }, [month])

  const validateGSTIN = async () => {
    try {
      const res = await api.post('/gst/validate-gstin', { gstin })
      setGstinResult(res.data)
    } catch(e) { setGstinResult({ valid: false }) }
  }

  const exportCSV = () => {
    if (!data?.invoices?.length) return
    const rows = data.invoices.map(inv => [
      inv.invoiceNumber, new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
      inv.customer?.name, inv.customer?.gstin || '',
      inv.totalTaxableAmount, inv.totalCgst, inv.totalSgst, inv.totalIgst, inv.grandTotal
    ])
    const csv = ['Invoice No,Date,Customer,GSTIN,Taxable,CGST,SGST,IGST,Total', ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `GSTR1_${year}_${month}.csv`; a.click()
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const cardStyle = { background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }

  return (
    <div style={{ padding:32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--ink)' }}>GST Filing</h1>
          <p style={{ fontSize:13, color:'var(--ink3)', marginTop:3 }}>GSTR-1 preparation and GST management</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            style={{ padding:'8px 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, background:'var(--white)', color:'var(--ink)', outline:'none' }}>
            {months.map((m,i) => <option key={m} value={i+1}>{m} {year}</option>)}
          </select>
          <button onClick={exportCSV} style={{ padding:'8px 16px', background:'var(--sage)', border:'none', borderRadius:8, color:'white', fontSize:13, fontWeight:500, cursor:'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Total Invoices', value: data?.summary?.totalInvoices || 0, icon:'📋' },
          { label:'Taxable Value', value: `₹${((data?.summary?.totalTaxableValue||0)/1000).toFixed(1)}K`, icon:'💳' },
          { label:'Total CGST', value: `₹${((data?.summary?.totalCgst||0)/1000).toFixed(1)}K`, icon:'🏛' },
          { label:'Total Tax', value: `₹${((data?.summary?.totalTax||0)/1000).toFixed(1)}K`, icon:'📊' },
        ].map(c => (
          <div key={c.label} style={cardStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:11, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.4px', fontWeight:500 }}>{c.label}</span>
              <span style={{ fontSize:18 }}>{c.icon}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:600, fontFamily:'var(--font-mono)', color:'var(--ink)' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
        {/* GSTR-1 Table */}
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16 }}>GSTR-1 — {months[month-1]} {year}</h3>
          {loading ? (
            <div style={{ textAlign:'center', padding:32, color:'var(--ink3)' }}>Loading...</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ background:'var(--off)' }}>
                    {['Inv #','Customer','GSTIN','Taxable','CGST','SGST','IGST','Total'].map(h => (
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:500, color:'var(--ink3)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!data?.invoices?.length ? (
                    <tr><td colSpan={8} style={{ padding:24, textAlign:'center', color:'var(--ink3)' }}>No invoices for this month</td></tr>
                  ) : data.invoices.map(inv => (
                    <tr key={inv._id} style={{ borderTop:'1px solid var(--border)' }}>
                      <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', color:'var(--sage-dark)', fontSize:11 }}>{inv.invoiceNumber}</td>
                      <td style={{ padding:'8px 10px', color:'var(--ink)', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.customer?.name}</td>
                      <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink3)' }}>{inv.customer?.gstin || '—'}</td>
                      <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)' }}>₹{(inv.totalTaxableAmount||0).toFixed(0)}</td>
                      <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>₹{(inv.totalCgst||0).toFixed(0)}</td>
                      <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', color:'var(--blue)' }}>₹{(inv.totalSgst||0).toFixed(0)}</td>
                      <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', color:'var(--gold)' }}>₹{(inv.totalIgst||0).toFixed(0)}</td>
                      <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', fontWeight:600 }}>₹{(inv.grandTotal||0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Quarterly chart */}
          {summary && (
            <div style={cardStyle}>
              <h3 style={{ fontSize:13, fontWeight:500, color:'var(--ink)', marginBottom:14 }}>Quarterly Tax Summary</h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={summary} margin={{ top:0, right:0, left:-10, bottom:0 }}>
                  <XAxis dataKey="quarter" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
                  <Tooltip formatter={v => `₹${v?.toLocaleString('en-IN')}`} contentStyle={{ borderRadius:8, fontSize:12 }} />
                  <Bar dataKey="tax" fill="#1D9E75" radius={[4,4,0,0]} name="Tax" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* GSTIN Validator */}
          <div style={cardStyle}>
            <h3 style={{ fontSize:13, fontWeight:500, color:'var(--ink)', marginBottom:12 }}>GSTIN Validator</h3>
            <input value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} placeholder="29AABCA1234A1Z5"
              style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:12, outline:'none', marginBottom:8, fontFamily:'var(--font-mono)' }} />
            <button onClick={validateGSTIN} style={{ width:'100%', padding:'8px', background:'var(--sage)', border:'none', borderRadius:8, color:'white', fontSize:12, fontWeight:500, cursor:'pointer' }}>
              Validate
            </button>
            {gstinResult && (
              <div style={{ marginTop:10, padding:'10px 12px', borderRadius:8, background: gstinResult.valid ? 'var(--sage-light)' : 'var(--red-light)', border: `1px solid ${gstinResult.valid ? 'var(--sage)' : 'rgba(226,75,74,0.4)'}`, fontSize:12, color: gstinResult.valid ? 'var(--sage-dark)' : 'var(--red)', fontWeight:500, textAlign:'center' }}>
                {gstinResult.valid ? '✓ Valid GSTIN' : '✗ Invalid GSTIN'}
              </div>
            )}
          </div>

          {/* B2B vs B2C */}
          <div style={cardStyle}>
            <h3 style={{ fontSize:13, fontWeight:500, color:'var(--ink)', marginBottom:12 }}>Supply Type</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div style={{ background:'var(--blue-light)', borderRadius:8, padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:700, color:'var(--blue)', fontFamily:'var(--font-mono)' }}>{data?.b2b?.length || 0}</div>
                <div style={{ fontSize:11, color:'var(--blue)', marginTop:2, fontWeight:500 }}>B2B (Registered)</div>
              </div>
              <div style={{ background:'var(--gold-light)', borderRadius:8, padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:700, color:'var(--gold)', fontFamily:'var(--font-mono)' }}>{data?.b2c?.length || 0}</div>
                <div style={{ fontSize:11, color:'var(--gold)', marginTop:2, fontWeight:500 }}>B2C (Unregistered)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Due dates */}
      <div style={cardStyle}>
        <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:14 }}>GST Due Dates — {months[month-1]} {year}</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { form:'GSTR-1', due:`11th ${months[month % 12]} ${year}`, desc:'Outward supply details', status:'upcoming' },
            { form:'GSTR-3B', due:`20th ${months[month % 12]} ${year}`, desc:'Monthly return with tax payment', status:'upcoming' },
            { form:'GSTR-9', due:'31st Dec (Annual)', desc:'Annual GST return', status:'annual' },
          ].map(d => (
            <div key={d.form} style={{ background:'var(--off)', borderRadius:10, padding:'14px 16px', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600, color:'var(--ink)' }}>{d.form}</span>
                <span style={{ fontSize:11, background:'var(--sage-light)', color:'var(--sage-dark)', padding:'2px 8px', borderRadius:20, fontWeight:500 }}>
                  {d.status === 'annual' ? 'Annual' : 'Monthly'}
                </span>
              </div>
              <div style={{ fontSize:12, color:'var(--blue)', fontWeight:500, marginBottom:4 }}>Due: {d.due}</div>
              <div style={{ fontSize:11, color:'var(--ink3)' }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
