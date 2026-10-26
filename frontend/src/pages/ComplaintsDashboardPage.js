import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { complaintService, userService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

const ComplaintsDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('status') || 'All';
  const [statusFilter, setStatusFilter] = useState(initialFilter);

  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignTarget, setAssignTarget] = useState({ complaintId: null, assignee: '' });
  const [statusTarget, setStatusTarget] = useState({ complaintId: null, status: '' });

  // Sync state if URL search param changes
  useEffect(() => {
    const urlStatus = searchParams.get('status') || 'All';
    setStatusFilter(urlStatus);
  }, [searchParams]);

  const fetchStats = async () => {
    try {
      const s = await complaintService.getStats();
      setStats(s.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
    } catch (e) {}
  };

  const loadComplaints = async (filter) => {
    try {
      setListLoading(true);
      const params = {};
      if (filter && filter !== 'All') {
        params.status = filter;
      }
      const res = await complaintService.getAll(params);
      setComplaints(res.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints(statusFilter);
    fetchStats();
  }, [statusFilter]);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      userService.getAll().then((res) => setUsers(res.data || [])).catch(() => {});
    }
  }, [user]);

  const refresh = async () => {
    await loadComplaints(statusFilter);
    await fetchStats();
  };

  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    if (newStatus === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ status: newStatus });
    }
  };

  const handleAssignClick = (id) => setAssignTarget({ complaintId: id, assignee: '' });
  const handleAssignSubmit = async () => {
    if (!assignTarget.assignee) return setError('Select an assignee');
    try {
      await complaintService.assign(assignTarget.complaintId, assignTarget.assignee);
      setAssignTarget({ complaintId: null, assignee: '' });
      refresh();
    } catch (err) { setError('Failed to assign'); }
  };

  const handleStatusClick = (id) => setStatusTarget({ complaintId: id, status: '' });
  const handleStatusSubmit = async () => {
    if (!statusTarget.status) return setError('Select a status');
    try {
      await complaintService.updateStatus(statusTarget.complaintId, statusTarget.status);
      setStatusTarget({ complaintId: null, status: '' });
      refresh();
    } catch (err) { setError('Failed to update status'); }
  };

  const handleClose = async (id) => {
    try {
      await complaintService.updateStatus(id, 'Closed');
      refresh();
    } catch (err) { setError('Failed to close'); }
  };

  // Client-side filtering ensures precise matching even with subtle variations
  const displayedComplaints = statusFilter === 'All'
    ? complaints
    : complaints.filter((c) => {
        if (statusFilter === 'In-Progress') return c.status === 'In-Progress' || c.status === 'In Progress';
        if (statusFilter === 'Closed') return c.status === 'Closed' || c.status === 'Resolved';
        return c.status?.toLowerCase() === statusFilter?.toLowerCase();
      });

  return (
    <div className="master-screen">
      <div className="screen-header">
        <h1>Complaints Dashboard</h1>
      </div>
      {error && <div className="error-message">{error}</div>}

      <div style={{ marginTop: 12 }}>
        {/* Clickable Stat Summary Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div
            className="stat-card"
            style={{
              flex: '1 1 200px',
              minWidth: 160,
              cursor: 'pointer',
              border: statusFilter === 'All' ? '2px solid #38bdf8' : '1px solid #334155',
              transform: statusFilter === 'All' ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleFilterChange('All')}
            title="Click to view all complaints"
          >
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Complaints {statusFilter === 'All' && '●'}</div>
          </div>

          <div
            className="stat-card"
            style={{
              flex: '1 1 200px',
              minWidth: 160,
              cursor: 'pointer',
              border: statusFilter === 'Pending' ? '2px solid #f59e0b' : '1px solid #334155',
              transform: statusFilter === 'Pending' ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleFilterChange('Pending')}
            title="Click to view Pending complaints"
          >
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
            <div className="stat-label">Pending {statusFilter === 'Pending' && '●'}</div>
          </div>

          <div
            className="stat-card"
            style={{
              flex: '1 1 200px',
              minWidth: 160,
              cursor: 'pointer',
              border: statusFilter === 'Assigned' ? '2px solid #8b5cf6' : '1px solid #334155',
              transform: statusFilter === 'Assigned' ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleFilterChange('Assigned')}
            title="Click to view Assigned complaints"
          >
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.assigned}</div>
            <div className="stat-label">Assigned {statusFilter === 'Assigned' && '●'}</div>
          </div>

          <div
            className="stat-card"
            style={{
              flex: '1 1 200px',
              minWidth: 160,
              cursor: 'pointer',
              border: statusFilter === 'Closed' ? '2px solid #10b981' : '1px solid #334155',
              transform: statusFilter === 'Closed' ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleFilterChange('Closed')}
            title="Click to view Closed / Resolved complaints"
          >
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.closed}</div>
            <div className="stat-label">Closed {statusFilter === 'Closed' && '●'}</div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Assigned', 'In-Progress', 'Closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: statusFilter === tab ? '2px solid #38bdf8' : '1px solid #334155',
                  backgroundColor: statusFilter === tab ? '#0284c7' : '#1e293b',
                  color: statusFilter === tab ? '#ffffff' : '#94a3b8',
                  fontWeight: statusFilter === tab ? '700' : '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab === 'All' ? '📋 All' : tab === 'Pending' ? '⏳ Pending' : tab === 'Assigned' ? '⚡ Assigned' : tab === 'In-Progress' ? '⚙️ In-Progress' : '✅ Closed'}
              </button>
            ))}
          </div>

          {statusFilter !== 'All' && (
            <button
              onClick={() => handleFilterChange('All')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #475569',
                color: '#38bdf8',
                borderRadius: '14px',
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              ✕ Clear Filter ({statusFilter})
            </button>
          )}
        </div>

        {listLoading ? <p>Loading...</p> : (
          <div className="table-container">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Block</th>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontSize: '15px' }}>
                      📋 No {statusFilter !== 'All' ? `"${statusFilter}"` : ''} complaints found.
                    </td>
                  </tr>
                ) : (
                  displayedComplaints.map((c) => {
                    const isAssignee = c.assignedTo && String(c.assignedTo._id || c.assignedTo) === String(user?.id || user?._id);
                    return (
                      <tr key={c._id}>
                        <td>{new Date(c.createdAt).toLocaleString()}</td>
                        <td>{c.blockName}</td>
                        <td>{c.roomNumber}</td>
                        <td>{c.complaintType}</td>
                        <td>{c.remarks || '-'}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor:
                              c.status === 'Pending' ? '#f59e0b20' :
                              c.status === 'Assigned' ? '#8b5cf620' :
                              c.status === 'In-Progress' || c.status === 'In Progress' ? '#3b82f620' :
                              c.status === 'Closed' || c.status === 'Resolved' ? '#10b98120' : '#64748b20',
                            color:
                              c.status === 'Pending' ? '#f59e0b' :
                              c.status === 'Assigned' ? '#a78bfa' :
                              c.status === 'In-Progress' || c.status === 'In Progress' ? '#60a5fa' :
                              c.status === 'Closed' || c.status === 'Resolved' ? '#34d399' : '#94a3b8',
                            border: `1px solid ${
                              c.status === 'Pending' ? '#f59e0b' :
                              c.status === 'Assigned' ? '#8b5cf6' :
                              c.status === 'In-Progress' || c.status === 'In Progress' ? '#3b82f6' :
                              c.status === 'Closed' || c.status === 'Resolved' ? '#10b981' : '#64748b'
                            }`,
                          }}>
                            ● {c.status}
                          </span>
                        </td>
                        <td>{c.createdBy?.username || c.createdBy?.email || '-'}</td>
                        <td>{c.attachment ? (<a href={`http://localhost:5000${c.attachment}`} target="_blank" rel="noreferrer">View</a>) : '-'}</td>
                        <td>
                          <div className="actions-cell">
                            {(isAssignee || user?.role === 'SuperAdmin') && c.status !== 'Closed' && (
                              <button onClick={() => handleClose(c._id)} className="btn-primary" style={{ padding: '8px 12px' }}>Mark Completed</button>
                            )}

                            {user?.role === 'SuperAdmin' && c.status !== 'Closed' && (
                              assignTarget.complaintId === c._id ? (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <select value={assignTarget.assignee} onChange={(e) => setAssignTarget({ ...assignTarget, assignee: e.target.value })} style={{ minWidth: 140 }}>
                                    <option value="">Select user</option>
                                    {users.filter(u => u.role !== 'SuperAdmin').map(u => (
                                      <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                                    ))}
                                  </select>
                                  <button onClick={handleAssignSubmit} className="btn-primary">Assign</button>
                                  <button onClick={() => setAssignTarget({ complaintId: null, assignee: '' })} className="btn-secondary">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => handleAssignClick(c._id)} className="btn-primary">Assign</button>
                              )
                            )}

                            {(isAssignee || user?.role === 'SuperAdmin') && c.status !== 'Closed' && (
                              statusTarget.complaintId === c._id ? (
                                <div className={`status-action open`}>
                                  <select className="status-select" value={statusTarget.status} onChange={(e) => setStatusTarget({ ...statusTarget, status: e.target.value })}>
                                    <option value="">Select status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In-Progress">In-Progress</option>
                                    <option value="Onhold">Onhold</option>
                                    <option value="Closed">Closed</option>
                                  </select>
                                  <div className={`status-buttons show`}>
                                    <button onClick={handleStatusSubmit} className="status-save">Save</button>
                                    <button onClick={() => setStatusTarget({ complaintId: null, status: '' })} className="status-cancel">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => handleStatusClick(c._id)} className="btn-primary">Update Status</button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsDashboardPage;
