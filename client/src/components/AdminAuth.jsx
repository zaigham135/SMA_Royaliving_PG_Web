import React, { useState } from 'react'
import AlertModal from './AlertModal'

const AdminAuth = ({ onLogin }) => {
  const [password, setPassword] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Simple password check - in production, this should be server-side
    if (password === 'admin123') {
      onLogin()
    } else {
      setAlertMessage('Invalid password. Please try again.')
      setShowAlert(true)
      setPassword('')
    }
  }

  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Admin Access</h2>
          <p>Please enter the admin password to view student list</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button type="submit" className="primary">
              Login
            </button>
          </form>
        </div>
      </div>

      <AlertModal
        isOpen={showAlert}
        type="error"
        title="Access Denied"
        message={alertMessage}
        onConfirm={() => setShowAlert(false)}
      />
    </div>
  )
}

export default AdminAuth 