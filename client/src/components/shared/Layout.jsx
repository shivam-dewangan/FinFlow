import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/dashboard', icon: '▦', label: 'Dashboard' },
  { path: '/invoices', icon: '◧', label: 'Invoices' },
  { path: '/gst', icon: '◉', label: 'GST Filing' },
  { path: '/reconcile', icon: '⇌', label: 'Reconcile' },
  { path: '/cashflow', icon: '◈', label: 'Cash Flow' },
  { path: '/collaboration', icon: '◎', label: 'CA Collab' },
  { path: '/settings', icon: '◌', label: 'Settings' },
]

export default function Layout() {
  const { user, logout, activeBusiness, switchBusiness } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [showBizMenu, setShowBizMenu] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--off)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: 'var(--ink)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        transition: 'width 0.25s ease',
        flexShrink: 0, zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 0' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {collapsed ? (
            <div style={{ textAlign:'center', fontFamily:'var(--font-serif)', fontSize:22, color:'var(--sage-mid)' }}>F</div>
          ) : (
            <div style={{ fontFamily:'var(--font-serif)', fontSize:22, color:'white', letterSpacing:'-0.5px' }}>
              Fin<span style={{ color:'var(--sage-mid)' }}>Flow</span>
            </div>
          )}
        </div>

        {/* Business Switcher */}
        {!collapsed && (
          <div style={{ padding:'12px 12px 0', position:'relative' }}>
            <button onClick={() => setShowBizMenu(!showBizMenu)} style={{
              width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)',
              border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'white',
              fontSize:12, textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between'
            }}>
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {activeBusiness?.name || 'Select Business'}
              </span>
              <span style={{ opacity:0.5, fontSize:10 }}>▾</span>
            </button>
            {showBizMenu && user?.businesses?.length > 1 && (
              <div style={{
                position:'absolute', top:'100%', left:12, right:12, background:'#1a2b1f',
                border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, zIndex:200,
                marginTop:4, overflow:'hidden'
              }}>
                {user.businesses.map(biz => (
                  <button key={biz._id} onClick={() => { switchBusiness(biz._id); setShowBizMenu(false) }}
                    style={{
                      width:'100%', padding:'10px 12px', background:'transparent',
                      border:'none', color: biz._id === activeBusiness?._id ? 'var(--sage-mid)' : 'rgba(255,255,255,0.7)',
                      fontSize:12, textAlign:'left', cursor:'pointer'
                    }}>
                    {biz.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '12px 0' : '10px 12px',
                borderRadius: 8, marginBottom: 2,
                color: isActive ? 'var(--sage-mid)' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(29,158,117,0.12)' : 'transparent',
                fontSize: 14, fontWeight: isActive ? 500 : 400,
                transition: 'all 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textDecoration: 'none'
              })}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          {!collapsed && (
            <div style={{ padding:'10px 12px', marginBottom:4 }}>
              <div style={{ fontSize:12, color:'white', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width:'100%', padding: collapsed ? '10px 0' : '8px 12px',
            background:'rgba(226,75,74,0.1)', border:'1px solid rgba(226,75,74,0.2)',
            borderRadius:8, color:'#f87171', fontSize:12, display:'flex',
            alignItems:'center', gap:8, justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            <span>⏻</span>{!collapsed && 'Logout'}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width:'100%', padding:'8px', marginTop:4,
            background:'transparent', border:'none', color:'rgba(255,255,255,0.3)',
            fontSize:12, cursor:'pointer'
          }}>
            {collapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, overflow:'auto', minWidth:0 }}>
        <Outlet />
      </main>
    </div>
  )
}
