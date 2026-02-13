import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { StudentService, AnalyticsService } from '../services/api'
import '../styles/dashboard.css'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalHomework: 0,
    attendanceRate: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await AnalyticsService.getDashboardStats(user.id)
        setStats({
          ...dashboardStats,
          loading: false
        })
      } catch (error) {
        setStats(prev => ({ ...prev, loading: false, error: error.message }))
      }
    }

    loadDashboardData()
  }, [user])

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
        
        {stats.error ? (
          <div className="error-section">
            <p>Failed to load dashboard data. Please try again.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : stats.loading ? (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-users" />
              </div>
              <h3>Students</h3>
              <p>Total enrolled: {stats.totalStudents}</p>
              <button className="btn btn-primary">Manage Students</button>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-tasks" />
              </div>
              <h3>Homework</h3>
              <p>Pending assignments: {stats.totalHomework}</p>
              <button className="btn btn-primary">Manage Homework</button>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-chart-line" />
              </div>
              <h3>Attendance</h3>
              <p>Average rate: {stats.attendanceRate}%</p>
              <button className="btn btn-primary">View Reports</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
