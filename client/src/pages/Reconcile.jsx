import React, { useState, useEffect } from 'react'
import api from '../api/axios'

const SAMPLE_CSV = `date,description,amount,ref
2024-03-01,NEFT-RAJESH ENTERPRISES,38000,REF001
2024-03-03,HDFC UPI PAYMENT,12500,REF002
2024-03-05,AMAZON PAY,-5200,REF003
2024-03-08,NEFT-ACME PVT LTD,85000,REF004
2024-03-10,SALARY DEBIT,-45000,REF005
2024-03-15,VENDOR PAYMENT,-18000,REF006`

export default function Reconcile() {
  const [status, setStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/reconcile/status').then(r => setStatus(r.data)).catch(console.error)
  }, [])

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').slice(1)
    return lines.map(line => {
      const [date, description, amount, ref] = line.split(',')
      return { date: date?.trim(), description: description?.trim(), amount: parseFloat(amount?.trim()) || 0, ref: ref?.trim() }
    }).filter(r => r.date && r.description)
  }

  const handleUpload = async () => {
    const transactions = parseCSV(csvText || SAMPLE_CSV)
    if (!transactions.length) { setError('No valid transactions found'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/reconcile/upload', { transactions })
      setResults(res.data)
      api.get('/reconcile/status').then(r => setStatus(r.data))
    } catch(e) {
      setError(e.response?.data?.message || 'Upload failed')
    } finally { setLoading(false) }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCsvText(ev.target.result)
    reader.readAsText(file)
  }

  const cardStyle = { background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }

  return (
    <div style={{ padding:32 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--ink)' }}>Bank Reconciliation</h1>
        <p style={{ fontSize:13, color:'var(--ink3)', marginTop:3 }}>Upload bank statement to auto-match with invoices</p>
      </div>

      {/* Status Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Total Transactions', value: status?.total || 0, color:'var(--ink)', bg:'var(--off)' },
          { label:'Reconciled', value: status?.reconciled || 0, color:'var(--sage-dark)', bg:'var(--sage-light)' },
          { label:'Unmatched', value: status?.unreconciled || 0, color:'var(--red)', bg:'var(--red-light)' },
        ].map(c => (
          <div key={c.label} style={{ ...cardStyle, background:c.bg }}>
            <div style={{ fontSize:11, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.4px', fontWeight:500, marginBottom:8 }}>{c.label}</div>
            <div style={{ fontSize:28, fontWeight:700, fontFamily:'var(--font-mono)', color:c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Upload */}
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Upload Bank Statement</h3>

          {/* File upload */}
          <label style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'20px', border:'2px dashed var(--border)', borderRadius:10, cursor:'pointer', marginBottom:14, background:'var(--off)' }}>
            <span style={{ fontSize:24, marginBottom:6 }}>📂</span>
            <span style={{ fontSize:13, color:'var(--ink2)', fontWeight:500 }}>Click to upload CSV file</span>
            <span style={{ fontSize:11, color:'var(--ink3)', marginTop:3 }}>or paste CSV data below</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display:'none' }} />
          </label>

          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--ink3)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.3px' }}>CSV Data (date, description, amount, ref)</div>
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
              placeholder={SAMPLE_CSV} rows={8}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:11, fontFamily:'var(--font-mono)', outline:'none', resize:'vertical', color:'var(--ink)', background:'var(--white)' }} />
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <button onClick={() => setCsvText(SAMPLE_CSV)} style={{ flex:1, padding:'8px', border:'1px solid var(--border)', borderRadius:8, background:'var(--off)', color:'var(--ink3)', fontSize:12, cursor:'pointer' }}>
              Load Sample Data
            </button>
            <button onClick={handleUpload} disabled={loading} style={{ flex:2, padding:'8px', background:'var(--sage)', border:'none', borderRadius:8, color:'white', fontSize:13, fontWeight:500, cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : 'Auto-Reconcile'}
            </button>
          </div>

          {error && <div style={{ padding:'10px 12px', background:'var(--red-light)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:8, color:'var(--red)', fontSize:12 }}>{error}</div>}

          {/* CSV format guide */}
          <div style={{ marginTop:14, padding:'12px', background:'var(--off)', borderRadius:8, fontSize:11, color:'var(--ink3)' }}>
            <div style={{ fontWeight:500, marginBottom:4, color:'var(--ink2)' }}>Expected CSV format:</div>
            <div style={{ fontFamily:'var(--font-mono)', lineHeight:1.8 }}>
              date, description, amount, ref<br/>
              2024-03-01, NEFT Payment, 38000, REF001<br/>
              2024-03-02, Expense, -5000, REF002
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
            Reconciliation Results
            {results && (
              <span style={{ marginLeft:8, fontSize:12, color:'var(--sage)', fontWeight:400 }}>
                {results.matched}/{results.total} matched
              </span>
            )}
          </h3>

          {!results ? (
            <div style={{ textAlign:'center', padding:48, color:'var(--ink3)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🏦</div>
              <div style={{ fontSize:13, fontWeight:500 }}>Upload bank statement to see results</div>
              <div style={{ fontSize:12, marginTop:4 }}>Transactions will auto-match with your invoices</div>
            </div>
          ) : (
            <div style={{ maxHeight:380, overflowY:'auto' }}>
              <div style={{ display:'flex', gap:10, marginBottom:12, padding:'10px 12px', background:'var(--sage-light)', borderRadius:8 }}>
                <div style={{ flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--sage-dark)', fontFamily:'var(--font-mono)' }}>{results.matched}</div>
                  <div style={{ fontSize:10, color:'var(--sage-dark)', fontWeight:500 }}>MATCHED</div>
                </div>
                <div style={{ flex:1, textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--red)', fontFamily:'var(--font-mono)' }}>{results.unmatched}</div>
                  <div style={{ fontSize:10, color:'var(--red)', fontWeight:500 }}>UNMATCHED</div>
                </div>
              </div>
              {results.results?.map((txn, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, marginBottom:6, background: txn.reconciled ? 'var(--sage-light)' : 'var(--off)', border:`1px solid ${txn.reconciled ? 'rgba(29,158,117,0.3)' : 'var(--border)'}` }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--ink)' }}>{txn.description}</div>
                    <div style={{ fontSize:11, color:'var(--ink3)', marginTop:2 }}>{new Date(txn.date).toLocaleDateString('en-IN')}</div>
                    {txn.matchedInvoice && <div style={{ fontSize:10, color:'var(--sage-dark)', marginTop:2, fontFamily:'var(--font-mono)' }}>→ {txn.matchedInvoice}</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-mono)', color: txn.type === 'credit' ? 'var(--sage-dark)' : 'var(--red)' }}>
                      {txn.type === 'credit' ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize:10, marginTop:3, fontWeight:500, color: txn.reconciled ? 'var(--sage-dark)' : 'var(--ink3)' }}>
                      {txn.reconciled ? '✓ Matched' : 'Unmatched'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
