import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
              <Link 
                to="/complaints/new" 
                className={`nav-link ${isActive('/complaints/new') ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="nav-icon">➕</span>
                Raise Complaint
              </Link>
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
                </>
              )}
            </div>

            <div className="nav-actions">
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
              
              <div className="user-dropdown">
                <button 
                  className="user-dropdown-btn" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase()}
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
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      👤 Profile Settings
                    </Link>
                    <Link to="/complaints/new" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      ➕ Raise New Complaint
                    </Link>
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
    </nav>
  );
};

export default Navbar;
