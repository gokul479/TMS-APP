import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../services/api';
import './MasterScreen.css';

const getRoleDetails = (role, username) => {
  const r = (role || '').toLowerCase().trim();
  if (r.includes('super') || r.includes('admin')) {
    return { code: 'SA', icon: '👑', label: 'SuperAdmin', color: '#c084fc', bg: '#7c3aed' };
  }
  if (r.includes('plumb')) {
    return { code: 'PL', icon: '🔧', label: 'Plumber', color: '#38bdf8', bg: '#0284c7' };
  }
  if (r.includes('elect')) {
    return { code: 'EL', icon: '⚡', label: 'Electrician', color: '#facc15', bg: '#d97706' };
  }
  if (r.includes('network')) {
    return { code: 'NS', icon: '🌐', label: 'Network Staff', color: '#a5b4fc', bg: '#4f46e5' };
  }
  if (r.includes('hardware')) {
    return { code: 'HW', icon: '💻', label: 'PC Hardware', color: '#5eead4', bg: '#0d9488' };
  }
  if (r.includes('software') || r.includes('dev')) {
    return { code: 'SD', icon: '👨‍💻', label: 'Software Dev', color: '#d8b4fe', bg: '#9333ea' };
  }
  if (r === 'user' || r.includes('student') || r.includes('faculty')) {
    return { code: 'US', icon: '👤', label: 'User', color: '#38bdf8', bg: '#0ea5e9' };
  }
  const words = (role || 'User').split(' ');
  const code = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : (role || 'US').substring(0, 2).toUpperCase();
  return { code, icon: '🛡️', label: role || 'Member', color: '#94a3b8', bg: '#334155' };
};

const HomePage = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const roleDetails = getRoleDetails(user?.role, user?.username);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'SuperAdmin') {
      fetchStats();
      fetchRecentComplaints();
    }
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      const response = await complaintService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentComplaints = async () => {
    try {
      const response = await complaintService.getAll({ limit: 5 });
      setRecentComplaints(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch recent complaints:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#fbbf24';
      case 'resolved': return '#34d399';
      case 'rejected': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="home-page">
      <div className="home-inner">
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-bg"></div>
          <div className="welcome-content">
            <div className="welcome-left">
              <h1 className="welcome-heading">Hello, {user?.username || 'User'}! 👋</h1>
              <p className="welcome-text">
                {isAuthenticated 
                  ? (user?.role === 'SuperAdmin' ? 'Welcome back to your dashboard' : 'Track and manage your complaints')
                  : 'Login to access the complaint system'}
              </p>
              <div className="welcome-meta">
                <span className="meta-item">
                  <span className="meta-icon">📅</span>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="welcome-right">
              <div 
                className="avatar-container" 
                onClick={() => setShowProfile(true)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Click to view profile details"
              >
                <div className="user-avatar" style={{ background: roleDetails.bg, color: '#ffffff', fontWeight: '800' }}>
                  {roleDetails.code}
                </div>
                <div className="avatar-emblem-badge" title={roleDetails.label}>
                  {roleDetails.icon}
                </div>
                <div className="avatar-ring"></div>
              </div>
              <div className="user-info">
                <span className="user-role" style={{ color: roleDetails.color, fontWeight: '700' }}>
                  {roleDetails.icon} {user?.role || roleDetails.label}
                </span>
                {isAuthenticated && (
                  <button 
                    onClick={() => setShowProfile(true)} 
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      marginTop: '4px',
                      display: 'inline-block'
                    }}
                  >
                    👤 View Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isAuthenticated && user?.role === 'SuperAdmin' && stats && (
          <div className="stats-section">
            <h2 className="section-title">Overview</h2>
            <div className="stats-grid">
              <Link to="/complaints" className="stat-card total" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.total || 0}</span>
                  <span className="stat-text">Total Complaints</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-progress" style={{ width: '100%' }}></div>
                </div>
              </Link>
              <Link to="/complaints?status=Pending" className="stat-card pending" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.pending || 0}</span>
                  <span className="stat-text">Pending</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-progress" style={{ width: `${stats.total ? (stats.pending / stats.total * 100) : 0}%` }}></div>
                </div>
              </Link>
              <Link to="/complaints?status=Closed" className="stat-card resolved" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.resolved || 0}</span>
                  <span className="stat-text">Resolved</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-progress" style={{ width: `${stats.total ? (stats.resolved / stats.total * 100) : 0}%` }}></div>
                </div>
              </Link>
              <Link to="/complaints?status=Closed" className="stat-card rejected" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <span className="stat-num">{stats.rejected || 0}</span>
                  <span className="stat-text">Rejected / Closed</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-progress" style={{ width: `${stats.total ? (stats.rejected / stats.total * 100) : 0}%` }}></div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Complaints for Admin */}
        {isAuthenticated && user?.role === 'SuperAdmin' && recentComplaints.length > 0 && (
          <div className="recent-section">
            <div className="recent-header">
              <h2 className="section-title">Recent Complaints</h2>
              <Link to="/complaints" className="view-all-link">View All →</Link>
            </div>
            <div className="recent-list">
              {recentComplaints.map((complaint, index) => (
                <div key={index} className="recent-item">
                  <div className="recent-icon">
                    {complaint.complaintType === 'PC Hardware' ? '💻' :
                     complaint.complaintType === 'PC Software' ? '📀' :
                     complaint.complaintType === 'Network' ? '🌐' :
                     complaint.complaintType === 'Plumbing' ? '🔧' : '📝'}
                  </div>
                  <div className="recent-info">
                    <span className="recent-title">{complaint.complaintType || 'Complaint'}</span>
                    <span className="recent-meta">
                      {complaint.departmentName} • {complaint.roomNumber}
                    </span>
                  </div>
                  <div className="recent-status">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(complaint.status) + '20', color: getStatusColor(complaint.status) }}>
                      {complaint.status || 'Pending'}
                    </span>
                    <span className="recent-time">{getTimeAgo(complaint.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions for SuperAdmin */}
        {isAuthenticated && user?.role === 'SuperAdmin' && (
          <div className="user-section">
            <h2 className="section-title">Admin Quick Actions</h2>
            <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <Link to="/complaints" className="action-btn primary" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                <span className="action-icon">📋</span>
                <span>View All Tickets</span>
              </Link>
              <Link to="/departments" className="action-btn secondary" style={{ borderColor: '#f59e0b' }}>
                <span className="action-icon">⚙️</span>
                <span>Admin Master</span>
              </Link>
              <Link to="/reports" className="action-btn secondary" style={{ borderColor: '#10b981' }}>
                <span className="action-icon">📈</span>
                <span>Analytics & Reports</span>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions for Regular Users */}
        {isAuthenticated && user?.role !== 'SuperAdmin' && (
          <div className="user-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/complaints/new" className="action-btn primary">
                <span className="action-icon">➕</span>
                <span>Raise Complaint</span>
              </Link>
              <Link to="/my-complaints" className="action-btn secondary">
                <span className="action-icon">📋</span>
                <span>My Complaints</span>
              </Link>
            </div>
          </div>
        )}

        {/* Guest */}
        {!isAuthenticated && (
          <div className="login-card">
            <div className="login-icon">🎫</div>
            <h2>Ticket Management System</h2>
            <p>Please login to access the system</p>
            <Link to="/login" className="login-btn">Login Now</Link>
          </div>
        )}
      </div>

      <style>{`
        .home-page {
          min-height: 100vh;
          background: #0f172a;
          padding: 2rem;
        }

        .home-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        /* Welcome Card */
        .welcome-card {
          position: relative;
          background: linear-gradient(135deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .welcome-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .welcome-content {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-heading {
          color: white;
          font-size: 1.75rem;
          margin: 0;
          font-weight: 700;
        }

        .welcome-text {
          color: #c7d2fe;
          margin: 0.5rem 0 1rem;
          font-size: 0.95rem;
        }

        .welcome-meta {
          display: flex;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #a5b4fc;
          font-size: 0.85rem;
        }

        .avatar-container {
          position: relative;
        }

        .user-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: white;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }

        .avatar-emblem-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #090d16;
          border: 2px solid #24344d;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          z-index: 3;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }

        .profile-modal-avatar-badge {
          position: absolute;
          bottom: 0px;
          right: -4px;
          background: #090d16;
          border: 2px solid #24344d;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }

        .avatar-ring {
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 0.5rem;
        }

        .user-role {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-status {
          color: #34d399;
          font-size: 0.75rem;
        }

        /* Section Title */
        .section-title {
          color: white;
          font-size: 1.1rem;
          margin: 0 0 1rem;
          font-weight: 600;
        }

        /* Stats */
        .stats-section {
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .stat-card {
          background: #1e293b;
          padding: 1.25rem;
          border-radius: 14px;
          border: 1px solid #334155;
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .stat-num {
          display: block;
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
        }

        .stat-text {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .stat-bar {
          height: 4px;
          background: #334155;
          border-radius: 2px;
          margin-top: 0.75rem;
          overflow: hidden;
        }

        .stat-progress {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .stat-card.total .stat-progress { background: #60a5fa; }
        .stat-card.pending .stat-progress { background: #fbbf24; }
        .stat-card.resolved .stat-progress { background: #34d399; }
        .stat-card.rejected .stat-progress { background: #f87171; }

        /* Recent */
        .recent-section {
          margin-bottom: 1.5rem;
        }

        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .view-all-link {
          color: #60a5fa;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .recent-list {
          background: #1e293b;
          border-radius: 14px;
          border: 1px solid #334155;
          overflow: hidden;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #334155;
        }

        .recent-item:last-child {
          border-bottom: none;
        }

        .recent-icon {
          font-size: 1.25rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #334155;
          border-radius: 10px;
        }

        .recent-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .recent-title {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .recent-meta {
          color: #64748b;
          font-size: 0.8rem;
        }

        .recent-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .recent-time {
          color: #64748b;
          font-size: 0.75rem;
        }

        /* User Section */
        .user-section {
          margin-bottom: 1.5rem;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
        }

        .action-btn.secondary {
          background: #1e293b;
          color: white;
          border: 1px solid #334155;
        }

        .action-icon {
          font-size: 1.25rem;
        }

        /* Login Card */
        .login-card {
          background: #1e293b;
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          border: 1px solid #334155;
        }

        .login-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .login-card h2 {
          color: white;
          margin: 0 0 0.5rem;
        }

        .login-card p {
          color: #94a3b8;
          margin: 0 0 1.5rem;
        }

        .login-btn {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .welcome-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .quick-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
      `}</style>

      {/* Profile Details Modal in HomePage */}
      {showProfile && (
        <div className="profile-modal-backdrop" onClick={() => setShowProfile(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-modal-title">
                <span className="profile-modal-icon">👤</span>
                <h3>User Profile Details</h3>
              </div>
              <button 
                className="profile-modal-close" 
                onClick={() => setShowProfile(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="profile-modal-hero">
              <div className="profile-modal-avatar-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <div className="profile-modal-avatar" style={{ background: roleDetails.bg, color: '#ffffff', fontWeight: '800' }}>
                  {roleDetails.code}
                </div>
                <span className="profile-modal-avatar-badge" title={roleDetails.label}>
                  {roleDetails.icon}
                </span>
              </div>
              <h2 className="profile-modal-username">{user?.username || 'User'}</h2>
              <span className="profile-modal-role-badge" style={{ background: roleDetails.bg + '25', borderColor: roleDetails.bg, color: roleDetails.color }}>
                {roleDetails.icon} {user?.role || roleDetails.label}
              </span>
            </div>

            <div className="profile-modal-table">
              <div className="profile-table-row">
                <span className="table-label">📧 Email Address</span>
                <span className="table-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="profile-table-row">
                <span className="table-label">📱 Phone Number</span>
                <span className="table-value">{user?.phone || 'N/A'}</span>
              </div>
              <div className="profile-table-row">
                <span className="table-label">🏢 Department</span>
                <span className="table-value">
                  {typeof user?.department === 'object' ? (user?.department?.name || 'Admin Dept') : (user?.department || 'General')}
                </span>
              </div>
              <div className="profile-table-row">
                <span className="table-label">🟢 Account Status</span>
                <span className="table-value status-active">● Active</span>
              </div>
            </div>

            <div className="profile-modal-actions">
              <button className="profile-modal-exit-btn" onClick={logout}>
                🚪 Exit / Sign Out
              </button>
              <button className="profile-modal-dismiss-btn" onClick={() => setShowProfile(false)}>
                ✕ Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
