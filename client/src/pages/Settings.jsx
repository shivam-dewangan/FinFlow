import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, activeBusiness } = useAuth()
  const [tab, setTab] = useState('business')
  const [biz, setBiz] = useState({ name:'', gstin:'', pan:'', phone:'', email:'', invoicePrefix:'INV', address:{ line1:'', city:'', state:'', pincode:'' }, bankDetails:{ bankName:'', accountNo:'', ifsc:'', upiId:'' } })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (activeBusiness) {
      setBiz(prev => ({ ...prev, ...activeBusiness,
        address: activeBusiness.address || prev.address,
        bankDetails: activeBusiness.bankDetails || prev.bankDetails
      }))
    }
  }, [activeBusiness])

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      await api.put(`/businesses/${activeBusiness._id}`, biz)
      setMsg('✓ Settings saved successfully')
    } catch(e) {
      setMsg('✗ Save failed: ' + (e.response?.data?.message || e.message))
    } finally { setSaving(false) }
  }

  const inp = (label, val, onChange, type='text', placeholder='') => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--ink3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.3px' }}>{label}</label>
      <input type={type} value={val || ''} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, outline:'none', background:'var(--white)', color:'var(--ink)' }} />
    </div>
  )

  const cardStyle = { background:'var(--white)', borderRadius:14, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }
  const tabs = ['business', 'bank', 'invoice', 'profile']

  return (
    <div style={{ padding:32 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--ink)' }}>Settings</h1>
        <p style={{ fontSize:13, color:'var(--ink3)', marginTop:3 }}>Manage your business and account settings</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 18px', border:'none', background:'transparent', cursor:'pointer',
            fontSize:13, fontWeight: tab===t ? 500 : 400,
            color: tab===t ? 'var(--sage)' : 'var(--ink3)',
            borderBottom: tab===t ? '2px solid var(--sage)' : '2px solid transparent',
            textTransform:'capitalize', marginBottom:-1
          }}>
            {t === 'bank' ? 'Bank Details' : t === 'invoice' ? 'Invoice Settings' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Business tab */}
      {tab === 'business' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, marginBottom:18, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Business Information</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
            <div style={{ gridColumn:'1/-1' }}>{inp('Business Name *', biz.name, e => setBiz({...biz, name:e.target.value}), 'text', 'Acme Pvt Ltd')}</div>
            {inp('GSTIN', biz.gstin, e => setBiz({...biz, gstin:e.target.value.toUpperCase()}), 'text', '29AABCA1234A1Z5')}
            {inp('PAN', biz.pan, e => setBiz({...biz, pan:e.target.value.toUpperCase()}), 'text', 'AABCA1234A')}
            {inp('Phone', biz.phone, e => setBiz({...biz, phone:e.target.value}), 'tel', '+91 98765 43210')}
            {inp('Email', biz.email, e => setBiz({...biz, email:e.target.value}), 'email', 'business@email.com')}
            <div style={{ gridColumn:'1/-1' }}>{inp('Address Line 1', biz.address?.line1, e => setBiz({...biz, address:{...biz.address, line1:e.target.value}}), 'text', 'Shop 12, MG Road')}</div>
            {inp('City', biz.address?.city, e => setBiz({...biz, address:{...biz.address, city:e.target.value}}), 'text', 'Bangalore')}
            {inp('State', biz.address?.state, e => setBiz({...biz, address:{...biz.address, state:e.target.value}}), 'text', 'Karnataka')}
            {inp('Pincode', biz.address?.pincode, e => setBiz({...biz, address:{...biz.address, pincode:e.target.value}}), 'text', '560001')}
          </div>
        </div>
      )}

      {/* Bank tab */}
      {tab === 'bank' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, marginBottom:18, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Bank Account Details</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
            {inp('Bank Name', biz.bankDetails?.bankName, e => setBiz({...biz, bankDetails:{...biz.bankDetails, bankName:e.target.value}}), 'text', 'HDFC Bank')}
            {inp('Account Number', biz.bankDetails?.accountNo, e => setBiz({...biz, bankDetails:{...biz.bankDetails, accountNo:e.target.value}}), 'text', '1234567890')}
            {inp('IFSC Code', biz.bankDetails?.ifsc, e => setBiz({...biz, bankDetails:{...biz.bankDetails, ifsc:e.target.value.toUpperCase()}}), 'text', 'HDFC0001234')}
            {inp('Branch', biz.bankDetails?.branch, e => setBiz({...biz, bankDetails:{...biz.bankDetails, branch:e.target.value}}), 'text', 'MG Road, Bangalore')}
            <div style={{ gridColumn:'1/-1' }}>{inp('UPI ID', biz.bankDetails?.upiId, e => setBiz({...biz, bankDetails:{...biz.bankDetails, upiId:e.target.value}}), 'text', 'business@ybl')}</div>
          </div>
          <div style={{ background:'var(--blue-light)', border:'1px solid rgba(24,95,165,0.2)', borderRadius:8, padding:'12px 14px', marginTop:4 }}>
            <p style={{ fontSize:12, color:'var(--blue)', lineHeight:1.6 }}>
              💡 Bank details are printed on your invoices and shared with customers for payment. Make sure your details are accurate.
            </p>
          </div>
        </div>
      )}

      {/* Invoice tab */}
      {tab === 'invoice' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, marginBottom:18, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Invoice Configuration</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
            {inp('Invoice Prefix', biz.invoicePrefix, e => setBiz({...biz, invoicePrefix:e.target.value.toUpperCase()}), 'text', 'INV')}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--ink3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.3px' }}>Default GST Rate</label>
              <select value={biz.defaultGstRate || 18} onChange={e => setBiz({...biz, defaultGstRate:parseInt(e.target.value)})}
                style={{ width:'100%', padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, outline:'none' }}>
                {[0,5,12,18,28].map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>
          <div style={{ padding:'16px', background:'var(--off)', borderRadius:8 }}>
            <div style={{ fontSize:12, color:'var(--ink3)', marginBottom:6 }}>Invoice number preview:</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:15, fontWeight:600, color:'var(--sage)' }}>
              {biz.invoicePrefix || 'INV'}/0001
            </div>
          </div>
        </div>
      )}

      {/* Profile tab */}
      {tab === 'profile' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize:14, fontWeight:500, marginBottom:18, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>Your Profile</h3>
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px', background:'var(--off)', borderRadius:10, marginBottom:18 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:20, fontWeight:600 }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{user?.name}</div>
              <div style={{ fontSize:13, color:'var(--ink3)' }}>{user?.email}</div>
              <div style={{ fontSize:11, color:'var(--sage)', marginTop:2, fontWeight:500 }}>
                {user?.businesses?.length || 1} business{(user?.businesses?.length || 1) > 1 ? 'es' : ''}
              </div>
            </div>
          </div>
          <div style={{ background:'var(--gold-light)', border:'1px solid rgba(186,117,23,0.3)', borderRadius:8, padding:'12px 14px' }}>
            <p style={{ fontSize:12, color:'var(--gold)', lineHeight:1.6 }}>
              🔒 Profile editing coming soon. Contact support to change your email or password.
            </p>
          </div>
        </div>
      )}

      {/* Save button */}
      {tab !== 'profile' && (
        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:16, marginTop:16 }}>
          {msg && <span style={{ fontSize:13, color: msg.startsWith('✓') ? 'var(--sage)' : 'var(--red)', fontWeight:500 }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ padding:'10px 24px', background:'var(--sage)', border:'none', borderRadius:10, color:'white', fontSize:13, fontWeight:500, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
