import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

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

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const roleDetails = getRoleDetails(user?.role, user?.username);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎫</span>
          <span className="brand-text">Ticket Management System</span>
        </Link>

        {isAuthenticated && (
          <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <span className="hamburger"></span>
          </button>
        )}
        
        {isAuthenticated ? (
          <>
            <div className={`nav-links ${showMobileMenu ? 'mobile-open' : ''}`}>
              {user?.role !== 'SuperAdmin' && (
                <Link 
                  to="/complaints/new" 
                  className={`nav-link ${isActive('/complaints/new') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="nav-icon">➕</span>
                  Raise Complaint
                </Link>
              )}
              {user?.role !== 'SuperAdmin' && (
                <Link 
                  to="/my-complaints" 
                  className={`nav-link ${isActive('/my-complaints') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="nav-icon">📋</span>
                  My Complaints
                </Link>
              )}
              {user?.role === 'SuperAdmin' && (
                <>
                  <Link 
                    to="/departments" 
                    className={`nav-link ${isActive('/departments') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    🏢 Departments
                  </Link>
                  <Link 
                    to="/programmes" 
                    className={`nav-link ${isActive('/programmes') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    📚 Programmes
                  </Link>
                  <Link 
                    to="/blocks" 
                    className={`nav-link ${isActive('/blocks') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    🏗️ Blocks
                  </Link>
                  <Link 
                    to="/rooms" 
                    className={`nav-link ${isActive('/rooms') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    🚪 Rooms
                  </Link>
                  <Link 
                    to="/roles" 
                    className={`nav-link ${isActive('/roles') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    👥 Roles
                  </Link>
                  <Link 
                    to="/users" 
                    className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    👤 Users
                  </Link>
                  <Link 
                    to="/complaints" 
                    className={`nav-link ${isActive('/complaints') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    📝 All Complaints
                  </Link>
                  <Link 
                    to="/reports" 
                    className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    📈 Analytics & Reports
                  </Link>
                </>
              )}
            </div>

            <div className="nav-actions">
              <button 
                className="profile-nav-btn" 
                onClick={() => setShowProfileModal(true)}
                title="View Profile"
              >
                👤 Profile
              </button>

              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
              
              <div className="user-dropdown">
                <button 
                  className="user-dropdown-btn" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-avatar" style={{ background: roleDetails.bg, color: '#ffffff', position: 'relative', fontWeight: '800' }}>
                    {roleDetails.code}
                    <span style={{ position: 'absolute', bottom: -3, right: -4, fontSize: '10px' }} title={roleDetails.label}>
                      {roleDetails.icon}
                    </span>
                  </span>
                  <span className="user-name">{user?.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <span className="dropdown-email">{user?.email}</span>
                      <span className="dropdown-role">{user?.role}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setShowDropdown(false);
                        setShowProfileModal(true);
                      }}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                    >
                      👤 View Profile Details
                    </button>
                    {user?.role !== 'SuperAdmin' && (
                      <Link to="/complaints/new" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        ➕ Raise New Complaint
                      </Link>
                    )}
                    {user?.role !== 'SuperAdmin' && (
                      <Link to="/my-complaints" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                        📋 My Complaints
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="nav-links">
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
              🔐 Login
            </Link>
          </div>
        )}
      </div>

      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-modal-title">
                <span className="profile-modal-icon">👤</span>
                <h3>User Profile Details</h3>
              </div>
              <button 
                className="profile-modal-close" 
                onClick={() => setShowProfileModal(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="profile-modal-hero">
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                <div className="profile-modal-avatar" style={{ background: roleDetails.bg, color: '#ffffff', fontWeight: '800' }}>
                  {roleDetails.code}
                </div>
                <span style={{ position: 'absolute', bottom: 0, right: -4, background: '#090d16', border: '2px solid #24344d', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }} title={roleDetails.label}>
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
              <button className="profile-modal-exit-btn" onClick={handleLogout}>
                🚪 Exit / Sign Out
              </button>
              <button className="profile-modal-dismiss-btn" onClick={() => setShowProfileModal(false)}>
                ✕ Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
