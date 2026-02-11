import React from 'react'
import { useAuth } from '../hooks/useAuth'
import '../styles/dashboard.css'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-graduation-cap" />
            <span>StudentHub</span>
          </div>
          <div className="user-menu">
            <span>Welcome, {user?.user_metadata?.fullName || user?.email}</span>
            <button onClick={handleSignOut} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-section">
          <h1>Teacher Dashboard</h1>
          <p>Manage your students and track their progress efficiently.</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-users" />
            </div>
            <h3>Students</h3>
            <p>View and manage your student roster</p>
            <button className="btn btn-primary">Manage Students</button>
          </div>
          
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-tasks" />
            </div>
            <h3>Homework</h3>
            <p>Create and track homework assignments</p>
            <button className="btn btn-primary">Manage Homework</button>
          </div>
          
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-chart-line" />
            </div>
            <h3>Analytics</h3>
            <p>View student performance and progress</p>
            <button className="btn btn-primary">View Analytics</button>
          </div>
        </div>
      </main>
    </div>
  )
}
