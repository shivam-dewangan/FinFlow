import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const GST_RATES = [0, 5, 12, 18, 28]
const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal']

const emptyItem = { description:'', hsn:'', quantity:1, unit:'Nos', rate:0, discount:0, gstRate:18 }

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState({ name:'', gstin:'', email:'', phone:'', address:{ line1:'', city:'', state:'', pincode:'' } })
  const [items, setItems] = useState([{ ...emptyItem }])
  const [meta, setMeta] = useState({ invoiceDate: new Date().toISOString().split('T')[0], dueDate:'', notes:'', terms:'Payment due within 30 days.', placeOfSupply:'' })
  const [isInterState, setIsInterState] = useState(false)

  const calcItem = (item) => {
    const taxable = (item.rate * item.quantity) - (item.discount || 0)
    const gst = (taxable * item.gstRate) / 100
    return { ...item, taxableAmount: taxable, totalAmount: taxable + gst, cgst: isInterState ? 0 : gst/2, sgst: isInterState ? 0 : gst/2, igst: isInterState ? gst : 0 }
  }

  const calcedItems = items.map(calcItem)
  const subtotal = calcedItems.reduce((s,i) => s + i.rate * i.quantity, 0)
  const totalDiscount = calcedItems.reduce((s,i) => s + (i.discount||0), 0)
  const totalTaxable = calcedItems.reduce((s,i) => s + i.taxableAmount, 0)
  const totalCgst = calcedItems.reduce((s,i) => s + (i.cgst||0), 0)
  const totalSgst = calcedItems.reduce((s,i) => s + (i.sgst||0), 0)
  const totalIgst = calcedItems.reduce((s,i) => s + (i.igst||0), 0)
  const totalTax = totalCgst + totalSgst + totalIgst
  const grand = Math.round(totalTaxable + totalTax)

  const addItem = () => setItems([...items, { ...emptyItem }])
  const removeItem = (i) => setItems(items.filter((_,idx) => idx !== i))
  const updateItem = (i, field, value) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: field === 'description' || field === 'unit' || field === 'hsn' ? value : parseFloat(value) || 0 }
    setItems(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await api.post('/invoices', { customer, lineItems: calcedItems, ...meta, isInterState })
      navigate('/invoices')
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to create invoice')
    } finally { setSaving(false) }
  }

  const inputStyle = { width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, outline:'none', background:'var(--white)', color:'var(--ink)' }
  const labelStyle = { display:'block', fontSize:11, fontWeight:500, color:'var(--ink3)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.3px' }
  const cardStyle = { background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', marginBottom:16, boxShadow:'var(--shadow-sm)' }

  return (
    <div style={{ padding:32, maxWidth:1100 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--ink)' }}>New Invoice</h1>
          <p style={{ fontSize:13, color:'var(--ink3)', marginTop:3 }}>Create GST-compliant invoice</p>
        </div>
        <button onClick={() => navigate('/invoices')} style={{ padding:'8px 16px', border:'1px solid var(--border)', borderRadius:8, background:'var(--white)', color:'var(--ink3)', fontSize:13, cursor:'pointer' }}>
          ← Back
        </button>
      </div>

      {error && <div style={{ background:'var(--red-light)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:8, padding:'12px 16px', marginBottom:16, color:'var(--red)', fontSize:13 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Customer Details */}
          <div style={cardStyle}>
            <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Customer Details</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Customer Name *</label>
                <input style={inputStyle} required value={customer.name} onChange={e => setCustomer({...customer, name:e.target.value})} placeholder="Rajesh Enterprises" />
              </div>
              <div>
                <label style={labelStyle}>GSTIN</label>
                <input style={inputStyle} value={customer.gstin} onChange={e => setCustomer({...customer, gstin:e.target.value.toUpperCase()})} placeholder="29AABCA1234A1Z5" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={customer.email} onChange={e => setCustomer({...customer, email:e.target.value})} placeholder="raj@company.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={customer.phone} onChange={e => setCustomer({...customer, phone:e.target.value})} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={customer.address.city} onChange={e => setCustomer({...customer, address:{...customer.address, city:e.target.value}})} placeholder="Mumbai" />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select style={inputStyle} value={customer.address.state} onChange={e => { setCustomer({...customer, address:{...customer.address, state:e.target.value}}); setMeta({...meta, placeOfSupply:e.target.value}) }}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={customer.address.line1} onChange={e => setCustomer({...customer, address:{...customer.address, line1:e.target.value}})} placeholder="Shop No. 12, MG Road" />
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div style={cardStyle}>
            <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:16, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Invoice Details</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={labelStyle}>Invoice Date *</label>
                <input style={inputStyle} type="date" value={meta.invoiceDate} onChange={e => setMeta({...meta, invoiceDate:e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input style={inputStyle} type="date" value={meta.dueDate} onChange={e => setMeta({...meta, dueDate:e.target.value})} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Place of Supply</label>
                <select style={inputStyle} value={meta.placeOfSupply} onChange={e => { setMeta({...meta, placeOfSupply:e.target.value}); setIsInterState(e.target.value !== customer.address.state) }}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--ink2)' }}>
                  <input type="checkbox" checked={isInterState} onChange={e => setIsInterState(e.target.checked)} />
                  Inter-state supply (IGST applicable)
                </label>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, height:60, resize:'vertical' }} value={meta.notes} onChange={e => setMeta({...meta, notes:e.target.value})} placeholder="Thank you for your business" />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={labelStyle}>Terms & Conditions</label>
                <textarea style={{ ...inputStyle, height:56, resize:'vertical' }} value={meta.terms} onChange={e => setMeta({...meta, terms:e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div style={cardStyle}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
            <h3 style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>Line Items</h3>
            <button type="button" onClick={addItem} style={{ padding:'6px 14px', background:'var(--sage-light)', border:'1px solid var(--sage)', borderRadius:8, color:'var(--sage-dark)', fontSize:12, fontWeight:500, cursor:'pointer' }}>
              + Add Item
            </button>
          </div>

          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.5fr', gap:8, marginBottom:8 }}>
            {['Description','HSN','Qty','Unit','Rate (₹)','Disc (₹)',`GST%`,''].map(h => (
              <div key={h} style={{ fontSize:10, fontWeight:500, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.3px' }}>{h}</div>
            ))}
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.5fr', gap:8, marginBottom:8, alignItems:'center' }}>
              <input style={inputStyle} required value={item.description} onChange={e => updateItem(i,'description',e.target.value)} placeholder="Item description" />
              <input style={inputStyle} value={item.hsn} onChange={e => updateItem(i,'hsn',e.target.value)} placeholder="1234" />
              <input style={inputStyle} type="number" min="1" value={item.quantity} onChange={e => updateItem(i,'quantity',e.target.value)} />
              <select style={inputStyle} value={item.unit} onChange={e => updateItem(i,'unit',e.target.value)}>
                {['Nos','Kg','Ltr','Mtr','Box','Set','Hrs','Days'].map(u => <option key={u}>{u}</option>)}
              </select>
              <input style={inputStyle} type="number" min="0" value={item.rate} onChange={e => updateItem(i,'rate',e.target.value)} />
              <input style={inputStyle} type="number" min="0" value={item.discount} onChange={e => updateItem(i,'discount',e.target.value)} />
              <select style={inputStyle} value={item.gstRate} onChange={e => updateItem(i,'gstRate',e.target.value)}>
                {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
              <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                style={{ padding:'8px', background:'var(--red-light)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:6, color:'var(--red)', cursor:'pointer', opacity: items.length===1 ? 0.4 : 1, fontSize:12 }}>
                ×
              </button>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
            <div style={{ width:300 }}>
              {[
                ['Subtotal', `₹${subtotal.toFixed(2)}`],
                totalDiscount > 0 ? ['Discount', `-₹${totalDiscount.toFixed(2)}`] : null,
                ['Taxable Amount', `₹${totalTaxable.toFixed(2)}`],
                !isInterState && totalCgst > 0 ? ['CGST', `₹${totalCgst.toFixed(2)}`] : null,
                !isInterState && totalSgst > 0 ? ['SGST', `₹${totalSgst.toFixed(2)}`] : null,
                isInterState && totalIgst > 0 ? ['IGST', `₹${totalIgst.toFixed(2)}`] : null,
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--border)', fontSize:13, color:'var(--ink2)' }}>
                  <span>{label}</span><span style={{ fontFamily:'var(--font-mono)' }}>{val}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', marginTop:8, background:'var(--sage)', borderRadius:10, color:'white', fontWeight:600, fontSize:15 }}>
                <span>Grand Total</span>
                <span style={{ fontFamily:'var(--font-mono)' }}>₹{grand.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
          <button type="button" onClick={() => navigate('/invoices')} style={{ padding:'11px 24px', border:'1px solid var(--border)', borderRadius:10, background:'var(--white)', color:'var(--ink2)', fontSize:14, cursor:'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={{ padding:'11px 28px', background:'var(--sage)', border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:500, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creating...' : 'Create Invoice + Generate PDF'}
          </button>
        </div>
      </form>
    </div>
  )
}
