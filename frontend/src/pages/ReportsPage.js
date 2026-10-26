import React, { useContext, useEffect, useState, useMemo } from 'react';
import { complaintService, departmentService, programmeService, userService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

// SVG Donut/Pie Chart Component
const SvgPieChart = ({ data, size = 260, innerRadius = 70 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const center = size / 2;
  const radius = size / 2 - 16;

  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: size }}>
        <svg width={size} height={size}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#24344d" strokeWidth={24} />
          <circle cx={center} cy={center} r={innerRadius} fill="#141e33" />
          <text x={center} y={center + 5} textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="600">
            No Data
          </text>
        </svg>
      </div>
    );
  }

  let accumulatedAngle = -Math.PI / 2;

  const slices = data.map((item, idx) => {
    const angle = (item.value / total) * 2 * Math.PI;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const isFull = item.value === total;
    const isHovered = hoveredIdx === idx;
    const currentRadius = isHovered ? radius + 6 : radius;

    const x1 = center + currentRadius * Math.cos(startAngle);
    const y1 = center + currentRadius * Math.sin(startAngle);
    const x2 = center + currentRadius * Math.cos(endAngle);
    const y2 = center + currentRadius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const pathData = isFull
      ? `M ${center} ${center - currentRadius} A ${currentRadius} ${currentRadius} 0 1 1 ${center} ${center + currentRadius} A ${currentRadius} ${currentRadius} 0 1 1 ${center} ${center - currentRadius}`
      : `M ${center} ${center} L ${x1} ${y1} A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const percent = Math.round((item.value / total) * 100);

    return {
      ...item,
      pathData,
      percent,
      isHovered,
      index: idx,
    };
  });

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {slices.map((slice) => (
          <path
            key={slice.label}
            d={slice.pathData}
            fill={slice.color}
            filter={slice.isHovered ? 'url(#pieGlow)' : 'none'}
            style={{
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              opacity: hoveredIdx === null || slice.isHovered ? 1 : 0.6,
            }}
            onMouseEnter={() => setHoveredIdx(slice.index)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}

        {/* Inner Donut Hole */}
        <circle cx={center} cy={center} r={innerRadius} fill="#141e33" stroke="#24344d" strokeWidth={2} />

        {/* Center Text */}
        <text
          x={center}
          y={activeItem ? center - 8 : center - 4}
          textAnchor="middle"
          fill="#f8fafc"
          fontSize={activeItem ? '22' : '20'}
          fontWeight="800"
        >
          {activeItem ? activeItem.value : total}
        </text>
        <text
          x={center}
          y={activeItem ? center + 14 : center + 14}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontWeight="600"
          textTransform="uppercase"
        >
          {activeItem ? `${activeItem.label} (${activeItem.percent}%)` : 'Total Tickets'}
        </text>
      </svg>
    </div>
  );
};

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ department: '', programme: '', complaintType: '', status: '', assignee: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' | 'table'

  useEffect(() => {
    if (user?.role !== 'SuperAdmin') return;
    loadMasterData();
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadMasterData = async () => {
    try {
      const [deptRes, progRes, userRes] = await Promise.all([
        departmentService.getAll().catch(() => ({ data: [] })),
        programmeService.getAll().catch(() => ({ data: [] })),
        userService.getAll().catch(() => ({ data: [] })),
      ]);
      setDepartments(deptRes.data || []);
      setProgrammes(progRes.data || []);
      setUsers(userRes.data || []);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchReport = async () => {
    setError('');
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k];
      });
      const res = await complaintService.report(params);
      const list = res.data || [];
      setResults(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ department: '', programme: '', complaintType: '', status: '', assignee: '' });
    complaintService.report({}).then((res) => {
      setResults(res.data || []);
    });
  };

  // Metric Computations
  const totalCount = results.length;
  const pendingCount = results.filter((c) => c.status === 'Pending').length;
  const assignedCount = results.filter((c) => c.status === 'Assigned').length;
  const inProgressCount = results.filter((c) => c.status === 'In-Progress' || c.status === 'In Progress').length;
  const resolvedCount = results.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length;

  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  const pendingRate = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;

  // Status Pie Chart Data
  const statusPieData = useMemo(() => [
    { label: 'Pending', value: pendingCount, color: '#f59e0b' },
    { label: 'Assigned', value: assignedCount, color: '#8b5cf6' },
    { label: 'In Progress', value: inProgressCount, color: '#38bdf8' },
    { label: 'Closed / Resolved', value: resolvedCount, color: '#10b981' },
  ].filter((item) => item.value > 0), [pendingCount, assignedCount, inProgressCount, resolvedCount]);

  // Category Breakdown Data
  const categoryData = useMemo(() => {
    const counts = {};
    results.forEach((c) => {
      const type = c.complaintType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });

    const categoryColors = {
      'PC Hardware': '#38bdf8',
      'PC Software': '#6366f1',
      'Network': '#a855f7',
      'Network & Wi-Fi': '#a855f7',
      'Electronics': '#f59e0b',
      'Electrical': '#f59e0b',
      'Plumbing': '#06b6d4',
      'Application Issues': '#ec4899',
      'Other': '#64748b',
    };

    return Object.keys(counts).map((cat) => ({
      label: cat,
      value: counts[cat],
      color: categoryColors[cat] || '#8b5cf6',
      percent: totalCount > 0 ? Math.round((counts[cat] / totalCount) * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  }, [results, totalCount]);

  // Department Breakdown Data
  const departmentData = useMemo(() => {
    const counts = {};
    results.forEach((c) => {
      const dept = c.departmentName || c.createdBy?.department?.name || 'General';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.keys(counts).map((dept) => ({
      name: dept,
      count: counts[dept],
      percent: totalCount > 0 ? Math.round((counts[dept] / totalCount) * 100) : 0,
    })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [results, totalCount]);

  const exportCSV = () => {
    if (!results.length) return;
    const headers = ['Date', 'Department', 'Programme', 'Block', 'Room', 'Issue Category', 'Status', 'Created By', 'Assigned To', 'Remarks'];
    const rows = results.map((r) => [
      new Date(r.createdAt).toLocaleString(),
      r.departmentName || r.createdBy?.department?.name || '',
      r.programmeName || r.createdBy?.programme || '',
      r.blockName || '',
      r.roomNumber || '',
      r.complaintType || '',
      r.status || '',
      r.createdBy?.username || r.createdBy?.email || '',
      r.assignedTo?.username || r.assignedTo?.email || '',
      (r.remarks || '').replace(/\n/g, ' '),
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${('' + cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tms_complaints_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="master-screen">
        <div className="card">
          <h2>Reports & Analytics</h2>
          <div className="error-message">Only SuperAdmin can view reports and system analytics.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="master-screen reports-dashboard">
      {/* Header Banner */}
      <div className="reports-hero">
        <div className="reports-hero-left">
          <div className="hero-icon-pill">📈 Executive Suite</div>
          <h1 className="reports-title">Analytics & Complaint Reports</h1>
          <p className="reports-subtitle">
            Comprehensive system metrics, visual status breakdown, category insights and exportable logs.
          </p>
        </div>
        <div className="reports-hero-actions">
          <button onClick={exportCSV} className="export-btn" title="Download Excel/CSV Report">
            📥 Export CSV
          </button>
          <button onClick={handlePrint} className="print-btn" title="Print Report">
            🖨️ Print
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* KPI Stat Cards */}
      <div className="kpi-grid">
        <div className="kpi-card total">
          <div className="kpi-icon">📋</div>
          <div className="kpi-content">
            <span className="kpi-label">Total Tickets</span>
            <span className="kpi-value">{totalCount}</span>
            <span className="kpi-sub">Across all departments</span>
          </div>
        </div>

        <div className="kpi-card pending">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <span className="kpi-label">Pending Attention</span>
            <span className="kpi-value">{pendingCount}</span>
            <span className="kpi-sub">{pendingRate}% backlog load</span>
          </div>
        </div>

        <div className="kpi-card active">
          <div className="kpi-icon">⚙️</div>
          <div className="kpi-content">
            <span className="kpi-label">In-Progress / Assigned</span>
            <span className="kpi-value">{assignedCount + inProgressCount}</span>
            <span className="kpi-sub">Currently being handled</span>
          </div>
        </div>

        <div className="kpi-card resolved">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <span className="kpi-label">Resolution Rate</span>
            <span className="kpi-value">{resolutionRate}%</span>
            <span className="kpi-sub">{resolvedCount} tickets completed</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card filter-bar-card">
        <div className="filter-header">
          <span className="filter-title">🔍 Interactive Filters</span>
          <button onClick={resetFilters} className="filter-reset-link">
            Reset Filters
          </button>
        </div>
        <div className="filter-inputs-grid">
          <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
            <option value="">🏢 All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <select value={filters.programme} onChange={(e) => setFilters({ ...filters, programme: e.target.value })}>
            <option value="">🎓 All Programmes</option>
            {programmes.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select value={filters.complaintType} onChange={(e) => setFilters({ ...filters, complaintType: e.target.value })}>
            <option value="">⚡ All Issue Categories</option>
            <option value="PC Hardware">💻 PC Hardware</option>
            <option value="PC Software">📀 PC Software</option>
            <option value="Network">🌐 Network & Wi-Fi</option>
            <option value="Electronics">⚡ Electrical / Electronics</option>
            <option value="Plumbing">🚰 Plumbing</option>
            <option value="Application Issues">⚙️ Application Issues</option>
            <option value="Other">📌 Other</option>
          </select>

          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">📊 All Statuses</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Assigned">👤 Assigned</option>
            <option value="In-Progress">⚙️ In-Progress</option>
            <option value="Closed">✅ Closed / Resolved</option>
          </select>

          <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}>
            <option value="">👨‍🔧 Any Assignee</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username} ({u.role})
              </option>
            ))}
          </select>

          <button onClick={fetchReport} className="btn-primary filter-apply-btn" disabled={loading}>
            {loading ? 'Filtering...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="view-switch-tabs">
        <button
          className={`view-tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          📊 Charts & Visual Insights
        </button>
        <button
          className={`view-tab ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          📋 Detailed Records Table ({results.length})
        </button>
      </div>

      {/* Visual Charts Section */}
      {activeTab === 'charts' && (
        <div className="charts-container">
          {/* Chart 1: Status Donut / Pie Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>🥧 Ticket Status Distribution</h3>
              <span className="chart-sub">Real-time breakdown of open vs completed work</span>
            </div>
            <div className="pie-chart-wrapper">
              <SvgPieChart data={statusPieData} size={250} innerRadius={68} />
              <div className="chart-legend">
                <div className="legend-row">
                  <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                  <span className="legend-name">Pending</span>
                  <span className="legend-count">{pendingCount}</span>
                  <span className="legend-percent">{totalCount ? Math.round((pendingCount / totalCount) * 100) : 0}%</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                  <span className="legend-name">Assigned</span>
                  <span className="legend-count">{assignedCount}</span>
                  <span className="legend-percent">{totalCount ? Math.round((assignedCount / totalCount) * 100) : 0}%</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ backgroundColor: '#38bdf8' }}></span>
                  <span className="legend-name">In Progress</span>
                  <span className="legend-count">{inProgressCount}</span>
                  <span className="legend-percent">{totalCount ? Math.round((inProgressCount / totalCount) * 100) : 0}%</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                  <span className="legend-name">Closed</span>
                  <span className="legend-count">{resolvedCount}</span>
                  <span className="legend-percent">{resolutionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Category Breakdown */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>💻 Issue Category Breakdown</h3>
              <span className="chart-sub">Complaints classified by technical domain</span>
            </div>
            <div className="category-bars-list">
              {categoryData.length === 0 ? (
                <p className="no-data-text">No category data available</p>
              ) : (
                categoryData.map((cat) => (
                  <div key={cat.label} className="cat-bar-item">
                    <div className="cat-bar-header">
                      <span className="cat-bar-label">{cat.label}</span>
                      <span className="cat-bar-val">
                        <strong>{cat.value}</strong> tickets ({cat.percent}%)
                      </span>
                    </div>
                    <div className="cat-bar-track">
                      <div
                        className="cat-bar-fill"
                        style={{
                          width: `${cat.percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chart 3: Department Workload Breakdown */}
          <div className="chart-card full-width">
            <div className="chart-card-header">
              <h3>🏢 Department Workload & Ticket Density</h3>
              <span className="chart-sub">Volume of tickets submitted by departments</span>
            </div>
            <div className="dept-grid">
              {departmentData.length === 0 ? (
                <p className="no-data-text">No department records found</p>
              ) : (
                departmentData.map((d, index) => (
                  <div key={d.name} className="dept-stat-card">
                    <div className="dept-stat-top">
                      <span className="dept-rank">#{index + 1}</span>
                      <span className="dept-name">{d.name}</span>
                    </div>
                    <div className="dept-stat-main">
                      <span className="dept-count">{d.count}</span>
                      <span className="dept-unit">tickets</span>
                    </div>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill" style={{ width: `${d.percent}%`, backgroundColor: '#38bdf8' }} />
                    </div>
                    <span className="dept-share">{d.percent}% of total institute complaints</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Records Table */}
      {activeTab === 'table' && (
        <div className="card table-card">
          <div className="table-card-header">
            <h3>📑 Filtered Records ({results.length})</h3>
            <span className="table-subtitle">Showing all complaint entries matching filter criteria</span>
          </div>

          {loading ? (
            <div className="loading-box">Loading report data...</div>
          ) : results.length === 0 ? (
            <div className="no-data-box">No complaints found matching the selected filters.</div>
          ) : (
            <div className="table-container">
              <table className="master-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Department</th>
                    <th>Programme</th>
                    <th>Location</th>
                    <th>Issue Type</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Assigned Staff</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString()}{' '}
                        <small style={{ color: '#64748b' }}>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td>
                        <strong>{r.departmentName || r.createdBy?.department?.name || '-'}</strong>
                      </td>
                      <td>{r.programmeName || r.createdBy?.programme || '-'}</td>
                      <td>
                        <span className="location-pill">
                          {r.blockName} • Room {r.roomNumber}
                        </span>
                      </td>
                      <td>
                        <span className="type-badge">{r.complaintType}</span>
                      </td>
                      <td>
                        <span className={`status-pill status-${(r.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                          ● {r.status}
                        </span>
                      </td>
                      <td>{r.createdBy?.username || r.createdBy?.email || '-'}</td>
                      <td>
                        {r.assignedTo ? (
                          <span className="staff-pill">👨‍🔧 {r.assignedTo.username || r.assignedTo.email}</span>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.remarks}>
                        {r.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Scoped CSS Styles for Visual Dashboard */}
      <style>{`
        .reports-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .reports-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #090d16 0%, #141e33 100%);
          border: 1px solid #24344d;
          border-radius: 20px;
          padding: 26px 30px;
          margin-bottom: 24px;
        }

        .hero-icon-pill {
          display: inline-block;
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .reports-title {
          font-size: 26px;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 6px;
        }

        .reports-subtitle {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
          max-width: 600px;
        }

        .reports-hero-actions {
          display: flex;
          gap: 12px;
        }

        .export-btn, .print-btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .export-btn {
          background: #10b981;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .export-btn:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .print-btn {
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
        }
        .print-btn:hover {
          background: #334155;
          color: white;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .kpi-card {
          background: #141e33;
          border: 1px solid #24344d;
          border-radius: 18px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }

        .kpi-card.total { border-top: 4px solid #38bdf8; }
        .kpi-card.pending { border-top: 4px solid #f59e0b; }
        .kpi-card.active { border-top: 4px solid #8b5cf6; }
        .kpi-card.resolved { border-top: 4px solid #10b981; }

        .kpi-icon {
          font-size: 32px;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #090d16;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #24344d;
        }

        .kpi-content {
          display: flex;
          flex-direction: column;
        }

        .kpi-label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 600;
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
          margin: 2px 0;
        }

        .kpi-sub {
          font-size: 11px;
          color: #64748b;
        }

        /* Filter Toolbar */
        .filter-bar-card {
          margin-bottom: 24px;
          background: #141e33;
          border: 1px solid #24344d;
          padding: 18px 22px;
          border-radius: 18px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .filter-title {
          font-weight: 700;
          font-size: 15px;
          color: #f8fafc;
        }

        .filter-reset-link {
          background: none;
          border: none;
          color: #38bdf8;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .filter-reset-link:hover {
          text-decoration: underline;
        }

        .filter-inputs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
        }

        .filter-inputs-grid select,
        .filter-inputs-grid input {
          background: #090d16;
          border: 1px solid #24344d;
          color: #f8fafc;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          outline: none;
        }

        .filter-apply-btn {
          background: #0284c7;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          color: white;
          border: none;
          padding: 10px;
          transition: background 0.2s;
        }
        .filter-apply-btn:hover {
          background: #0369a1;
        }

        /* View Switcher */
        .view-switch-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .view-tab {
          background: #141e33;
          border: 1px solid #24344d;
          color: #94a3b8;
          padding: 12px 22px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-tab.active {
          background: #0284c7;
          border-color: #38bdf8;
          color: white;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        /* Charts Container */
        .charts-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .chart-card {
          background: #141e33;
          border: 1px solid #24344d;
          border-radius: 20px;
          padding: 24px;
        }

        .chart-card.full-width {
          grid-column: 1 / -1;
        }

        .chart-card-header {
          margin-bottom: 20px;
        }

        .chart-card-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 4px;
        }

        .chart-sub {
          font-size: 12px;
          color: #64748b;
        }

        .pie-chart-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 20px;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 180px;
        }

        .legend-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 4px;
        }

        .legend-name {
          color: #cbd5e1;
          font-weight: 600;
          flex: 1;
        }

        .legend-count {
          color: #f8fafc;
          font-weight: 800;
        }

        .legend-percent {
          color: #64748b;
          font-size: 11px;
          min-width: 34px;
          text-align: right;
        }

        /* Category Bars */
        .category-bars-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .cat-bar-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cat-bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .cat-bar-label {
          color: #e2e8f0;
          font-weight: 600;
        }

        .cat-bar-val {
          color: #94a3b8;
          font-size: 12px;
        }

        .cat-bar-track {
          width: 100%;
          height: 8px;
          background: #090d16;
          border-radius: 4px;
          overflow: hidden;
        }

        .cat-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Department Grid */
        .dept-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .dept-stat-card {
          background: #090d16;
          border: 1px solid #24344d;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dept-stat-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dept-rank {
          background: #1e293b;
          color: #38bdf8;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .dept-name {
          color: #f8fafc;
          font-weight: 700;
          font-size: 14px;
        }

        .dept-stat-main {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .dept-count {
          font-size: 24px;
          font-weight: 800;
          color: #38bdf8;
        }

        .dept-unit {
          color: #64748b;
          font-size: 12px;
        }

        .dept-share {
          color: #64748b;
          font-size: 11px;
          margin-top: 2px;
        }

        /* Table Card */
        .table-card {
          background: #141e33;
          border: 1px solid #24344d;
          border-radius: 20px;
          padding: 22px;
        }

        .table-card-header {
          margin-bottom: 16px;
        }

        .table-card-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 4px;
        }

        .table-subtitle {
          color: #94a3b8;
          font-size: 12px;
        }

        .location-pill {
          background: #090d16;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          border: 1px solid #24344d;
          color: #cbd5e1;
        }

        .type-badge {
          background: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .status-assigned { background: rgba(139, 92, 246, 0.15); color: #c084fc; }
        .status-in-progress { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
        .status-closed, .status-resolved { background: rgba(16, 185, 129, 0.15); color: #10b981; }

        .staff-pill {
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 600;
        }

        .no-data-box {
          text-align: center;
          padding: 40px;
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 800px) {
          .charts-container {
            grid-template-columns: 1fr;
          }
          .reports-hero {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
