import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://onrender.com'; // We will name your backend service this in Step 3

/* ==========================================
   1. SIGN UP COMPONENT
   ========================================== */
function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (res.ok) {
        alert("Registration complete! Welcome aboard.")
        navigate('/login')
      } else {
        alert(data.error || "A registration bottleneck occurred.")
      }
    } catch (err) {
      alert("Backend runtime pipeline offline.")
    }
  }

  return (
    <div style={styles.authBox}>
      <h2>Join AI Resume Builder</h2>
      <form onSubmit={handleRegister}>
        <div style={styles.group}><label>Username</label><input style={styles.field} type="text" autoComplete="username" onChange={e => setUsername(e.target.value)} required /></div>
        <div style={styles.group}><label>Email</label><input style={styles.field} type="email" onChange={e => setEmail(e.target.value)} /></div>
        <div style={styles.group}><label>Password</label><input style={styles.field} type="password" autoComplete="new-password" onChange={e => setPassword(e.target.value)} required /></div>
        <button type="submit" style={styles.btnPrimary}>Create Account</button>
      </form>
      <p style={styles.footerText}>Existing user? <Link to="/login">Sign In</Link></p>
    </div>
  )
}

/* ==========================================
   2. LOGIN COMPONENT
   ========================================== */
function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('access_token', data.access)
        setToken(data.access)
        navigate('/dashboard')
      } else {
        alert("Invalid login credentials verified.")
      }
    } catch (err) {
      alert("Authentication payload transmission failed.")
    }
  }

  return (
    <div style={styles.authBox}>
      <h2>Access Workspace</h2>
      <form onSubmit={handleLogin}>
        <div style={styles.group}><label>Username</label><input style={styles.field} type="text" onChange={e => setUsername(e.target.value)} required /></div>
        <div style={styles.group}><label>Password</label><input style={styles.field} type="password" autoComplete="new-password" onChange={e => setPassword(e.target.value)} required /></div>
        <button type="submit" style={styles.btnPrimary}>Log In</button>
      </form>
      <p style={styles.footerText}>New profile requirement? <Link to="/signup">Register Account</Link></p>
    </div>
  )
}

/* ==========================================
   3. SECURED DASHBOARD CANVAS
   ========================================== */
function Dashboard({ token, handleLogout }) {
  const [inputs, setInputs] = useState({ full_name: '', target_role: '', skills: '', experience_summary: '' })
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inputs)
      })
      const data = await res.json()
      if (res.ok) {
        setAiResult(data)
      } else if (res.status === 401) {
        alert("Access key token expired.")
        handleLogout()
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert("Network communication failure processing prompt request.")
    } finally {
      setLoading(false)
    }
  }

  // Pure HTML-to-PDF Client Generation Engine
  const downloadPDF = () => {
    const element = document.getElementById('resume-pdf-canvas')
    const options = {
      margin:       15, // Safe printing layout bounds (15mm)
      filename:     `${inputs.full_name.replace(/\s+/g, '_')}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(options).from(element).save()
  }

  return (
    <div style={styles.dashboardLayout}>
      <header style={styles.navBar}>
        <h2>AI Resume Suite Dashboard</h2>
        <button onClick={handleLogout} style={styles.btnLogout}>Disconnect Session</button>
      </header>

      <div style={styles.workspaceGrid}>
        {/* User Configuration Form Block */}
        <form onSubmit={handleGenerate} style={styles.editorPanel}>
          <h3>Target Framework Inputs</h3>
          <input type="text" placeholder="Full Professional Name" style={styles.blockField} onChange={e => setInputs({...inputs, full_name: e.target.value})} required />
          <input type="text" placeholder="Target Role Architecture" style={styles.blockField} onChange={e => setInputs({...inputs, target_role: e.target.value})} required />
          <input type="text" placeholder="Technical Skills (Comma separated)" style={styles.blockField} onChange={e => setInputs({...inputs, skills: e.target.value})} required />
          <textarea placeholder="Unstructured career highlights or milestone metrics..." rows="6" style={styles.blockField} onChange={e => setInputs({...inputs, experience_summary: e.target.value})} required />
          <button type="submit" disabled={loading} style={styles.btnGenerate}>
            {loading ? "Injecting AI Optimizations..." : "Execute Summary Refactor"}
          </button>
        </form>

        {/* Live Canvas View + Action Area */}
        <div style={styles.previewContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Live Document Output</h3>
            {aiResult && (
              <button onClick={downloadPDF} style={styles.btnDownload}>
                📥 Export to PDF Document
              </button>
            )}
          </div>
          
          {aiResult ? (
            /* Target Printing Canvas ID captured by html2pdf */
            <div id="resume-pdf-canvas" style={styles.resumeSheet}>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '26px', color: '#111' }}>{aiResult.full_name}</h1>
              <h3 style={{ color: '#007bff', fontWeight: '500', fontSize: '18px', margin: '0 0 25px 0' }}>{aiResult.target_role}</h3>
              
              <h4 style={styles.sectionHeader}>Executive Summary</h4>
              <p style={styles.aiText}>{aiResult.ai_generated_summary}</p>
              
              <h4 style={styles.sectionHeader}>Core Capabilities</h4>
              <p style={{ color: '#333', lineHeight: '1.5', margin: 0 }}>
                {aiResult.skills.split(',').map(s => s.trim()).join('  •  ')}
              </p>
            </div>
          ) : (
            <p style={{ color: '#666' }}>Fill out the configuration manifest to synthesize your profile.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================
   4. RUNTIME ROUTING LOGIC
   ========================================== */
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || '')

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setToken('')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!token ? <SignUp /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

/* Styling Configuration Matrix */
const styles = {
  authBox: { maxWidth: '360px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'system-ui' },
  group: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
  field: { padding: '10px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '4px' },
  blockField: { width: '100%', padding: '10px', fontSize: '14px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  footerText: { textAlign: 'center', fontSize: '14px', marginTop: '15px' },
  dashboardLayout: { fontFamily: 'system-ui', minHeight: '100vh', background: '#f8f9fa' },
  navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 30px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  btnLogout: { background: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  workspaceGrid: { display: 'flex', gap: '30px', padding: '30px', alignItems: 'flex-start' },
  editorPanel: { flex: '0 0 400px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  btnGenerate: { width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' },
  btnDownload: { background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  previewContainer: { flex: 1, background: '#e9ecef', padding: '25px', borderRadius: '8px', minHeight: '600px' },
  resumeSheet: { background: '#fff', padding: '30px', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }
}
