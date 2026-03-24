import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const statusStyle = { draft:{bg:'#f1f5f9',c:'#64748b'}, sent:{bg:'#E6F1FB',c:'#185FA5'}, paid:{bg:'#E1F5EE',c:'#0F6E56'}, overdue:{bg:'#FCEBEB',c:'#991b1b'}, viewed:{bg:'#FAEEDA',c:'#92400e'}, cancelled:{bg:'#f1f5f9',c:'#94a3b8'} }

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState(null)

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/invoices?status=${filter}&search=${search}`)
      setInvoices(res.data.invoices)
      setTotal(res.data.total)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchInvoices() }, [filter, search])

  const markPaid = async (id) => {
    setUpdating(id)
    try {
      await api.put(`/invoices/${id}/status`, { status:'paid', paymentDate: new Date() })
      fetchInvoices()
    } catch(e) { console.error(e) }
    finally { setUpdating(null) }
  }

  const sendInvoice = async (id) => {
    try {
      await api.post(`/invoices/${id}/send`)
      fetchInvoices()
    } catch(e) { alert('Send failed') }
  }

  const TABS = ['all','draft','sent','viewed','paid','overdue']

  return (
    <div style={{ padding:32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--ink)' }}>Invoices</h1>
          <p style={{ fontSize:13, color:'var(--ink3)', marginTop:3 }}>{total} total invoices</p>
        </div>
        <Link to="/invoices/new" style={{ background:'var(--sage)', color:'white', padding:'10px 20px', borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
          <span>+</span> New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding:'6px 14px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer',
            borderColor: filter===t ? 'var(--sage)' : 'var(--border)',
            background: filter===t ? 'var(--sage-light)' : 'var(--white)',
            color: filter===t ? 'var(--sage-dark)' : 'var(--ink3)'
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer..." style={{
          marginLeft:'auto', padding:'6px 14px', border:'1px solid var(--border)', borderRadius:20,
          fontSize:12, outline:'none', background:'var(--white)', width:200
        }} />
      </div>

      {/* Table */}
      <div style={{ background:'var(--white)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--off)' }}>
              {['Invoice #','Customer','Date','Due Date','Amount','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:11, fontWeight:500, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:'center' }}>
                <div style={{ width:28, height:28, border:'2px solid var(--sage-light)', borderTop:'2px solid var(--sage)', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={7} style={{ padding:48, textAlign:'center', color:'var(--ink3)', fontSize:14 }}>
                No invoices found. <Link to="/invoices/new" style={{ color:'var(--sage)' }}>Create your first invoice →</Link>
              </td></tr>
            ) : invoices.map((inv) => {
              const st = statusStyle[inv.status] || statusStyle.draft
              const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== 'paid'
              return (
                <tr key={inv._id} style={{ borderTop:'1px solid var(--border)', transition:'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fafaf9'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'13px 16px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--sage-dark)', fontWeight:500 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{inv.customer?.name}</div>
                    {inv.customer?.gstin && <div style={{ fontSize:11, color:'var(--ink3)', fontFamily:'var(--font-mono)' }}>{inv.customer.gstin}</div>}
                  </td>
                  <td style={{ padding:'13px 16px', fontSize:12, color:'var(--ink3)', whiteSpace:'nowrap' }}>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding:'13px 16px', fontSize:12, color: isOverdue ? 'var(--red)' : 'var(--ink3)', whiteSpace:'nowrap', fontWeight: isOverdue ? 500 : 400 }}>
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding:'13px 16px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600, color:'var(--ink)' }}>₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                  <td style={{ padding:'13px 16px' }}>
                    <span style={{ background:st.bg, color:st.c, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500 }}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      {inv.pdfPath && (
                        <a href={`http://localhost:5000${inv.pdfPath}`} target="_blank" rel="noreferrer"
                          style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', fontSize:11, color:'var(--ink3)', background:'var(--white)', textDecoration:'none' }}>
                          PDF
                        </a>
                      )}
                      {inv.status === 'draft' && (
                        <button onClick={() => sendInvoice(inv._id)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--blue)', fontSize:11, color:'var(--blue)', background:'var(--blue-light)', cursor:'pointer' }}>
                          Send
                        </button>
                      )}
                      {['sent','viewed'].includes(inv.status) && (
                        <button onClick={() => markPaid(inv._id)} disabled={updating === inv._id} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid var(--sage)', fontSize:11, color:'var(--sage-dark)', background:'var(--sage-light)', cursor:'pointer', opacity: updating===inv._id ? 0.6 : 1 }}>
                          {updating === inv._id ? '...' : 'Mark Paid'}
                        </button>
                      )}
                    </div>
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
