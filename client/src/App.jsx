import React, { useState, useCallback, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import logo from './image/logo.jpg'
import StudentForm from './components/StudentForm'
import StudentList from './components/StudentList'
import AdminAuth from './components/AdminAuth'
import AlertModal from './components/AlertModal'
import { useStudents } from './hooks/useStudents'
import { useAlert } from './hooks/useAlert'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>Something went wrong!</h2>
          <p>Please refresh the page or check the console for errors.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ background: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

const RegistrationForm = () => {
  const [editing, setEditing] = useState(null)
  const { loading, addStudent, updateStudent } = useStudents()
  const { alertState, showSuccess, showError, hideAlert } = useAlert()

  const handleStudentSave = async (studentData) => {
    try {
      if (editing?.id) {
        await updateStudent(editing.id, studentData)
        showSuccess('Success!', 'Your information updated successfully!')
      } else {
        await addStudent(studentData)
        showSuccess('Success!', 'Registration completed successfully! Welcome to our PG!')
      }
      setEditing(null)
    } catch (err) {
      showError('Error', err?.response?.data?.error || 'Error saving your information')
    }
  }

  return (
    <div className="container">
      {/* Welcome Message */}
      <div className="welcome-message">
        <h2>Welcome to Our PG!</h2>
        <p>Please fill out the form below to register for accommodation. All fields marked with * are required.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Processing...</div>
        </div>
      )}

      {/* Student Form */}
      <StudentForm
        onSaved={handleStudentSave}
        editing={editing}
        setEditing={setEditing}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onConfirm={() => {
          if (alertState.onConfirm) alertState.onConfirm()
          hideAlert()
        }}
        onCancel={hideAlert}
      />
    </div>
  )
}

const ProtectedStudentList = ({ isAuthenticated, onLogin }) => {
  if (!isAuthenticated) {
    return <AdminAuth onLogin={onLogin} />
  }
  return <StudentList />
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time and check for any initialization errors
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleAdminLogin = () => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #091946 0%, #3b82f6 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          <h2>Loading SMA Royal Living PG...</h2>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          {/* Header */}
          <div className="header">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
            </div>
            <h1>SMA ROYAL LIVING PG</h1>
            <nav className="nav-links">
              <Link to="/" className="nav-link">Registration</Link>
              <Link to="/studentList" className="nav-link">Student List</Link>
            </nav>
          </div>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route 
              path="/studentList" 
              element={
                <ProtectedStudentList 
                  isAuthenticated={isAuthenticated} 
                  onLogin={handleAdminLogin} 
                />
              } 
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
