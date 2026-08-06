import React, { useState, useEffect } from 'react';
import { tokenManager } from '../utils/tokenManager';
import './AdminDashboardHome.css';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMemberships: 0,
    checkInsThisWeek: 1789,
    ptSessionsThisWeek: 256,
    revenueThisWeek: 0,
    pendingPayments: 86430,
    loading: false,
    error: null
  });

  const [dashboardKpis, setDashboardKpis] = useState(null);
  const [loadingKpis, setLoadingKpis] = useState(true);

  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // Fetch live total members count from API
  const fetchMemberStats = async () => {
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/users/list?role=MEMBER&page=1&limit=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status === 'success' && data.meta?.total) {
        setStats(prev => ({ ...prev, totalMembers: data.meta.total }));
      }
    } catch (err) {
      console.error('Error fetching live member stats:', err);
    }
  };

  // Fetch Dashboard KPIs (Revenue Overview & Membership Status)
  const fetchDashboardKpis = async () => {
    try {
      setLoadingKpis(true);
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/dashboard-kpis`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setDashboardKpis(data.data);
        if (data.data.membership_status) {
          setStats(prev => ({
            ...prev,
            totalMembers: data.data.membership_status.total_members ?? prev.totalMembers,
            activeMemberships: data.data.membership_status.active?.count ?? prev.activeMemberships
          }));
        }
        if (data.data.revenue_overview) {
          setStats(prev => ({
            ...prev,
            revenueThisWeek: data.data.revenue_overview.total_revenue ?? prev.revenueThisWeek
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard KPIs:', err);
    } finally {
      setLoadingKpis(false);
    }
  };

  // Fetch Real Trainers List
  const fetchTrainersList = async () => {
    try {
      setLoadingTrainers(true);
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/trainers?page=1&limit=10`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setTrainers(data.data);
      }
    } catch (err) {
      console.error('Error fetching real trainers list:', err);
    } finally {
      setLoadingTrainers(false);
    }
  };

  useEffect(() => {
    fetchMemberStats();
    fetchDashboardKpis();
    fetchTrainersList();
  }, []);

  const formatCurrency = (val) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val || 0);
  };

  const formatNum = (val) => {
    return new Intl.NumberFormat('en-IN').format(val || 0);
  };

  // Helpers for Revenue Chart SVG
  const chartData = dashboardKpis?.revenue_overview?.chart_data;
  const daysList = chartData?.days || ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const thisWeekData = chartData?.this_week || [0, 0, 0, 0, 0, 0, 0];
  const lastWeekData = chartData?.last_week || [0, 0, 0, 0, 0, 0, 0];

  const maxVal = Math.max(...thisWeekData, ...lastWeekData, 100);
  const xCoords = [60, 130, 200, 270, 340, 410, 470];

  const getPoints = (dataArr) => {
    return dataArr.map((v, i) => {
      const x = xCoords[i] || (60 + i * 68);
      const y = 140 - ((v / maxVal) * 110);
      return { x, y, val: v };
    });
  };

  const thisWeekPoints = getPoints(thisWeekData);
  const lastWeekPoints = getPoints(lastWeekData);

  const getPathD = (pts) => {
    if (!pts || pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  };

  // Donut chart calculations
  const memStatus = dashboardKpis?.membership_status || {
    total_members: stats.totalMembers,
    active: { count: stats.activeMemberships, percentage: 79.0 },
    expiring_soon: { count: 152, percentage: 12.2 },
    expired: { count: 68, percentage: 5.4 },
    frozen: { count: 42, percentage: 3.4 }
  };

  const CIRCUMFERENCE = 377;
  const activeLen = (memStatus.active?.percentage / 100) * CIRCUMFERENCE;
  const expiringLen = (memStatus.expiring_soon?.percentage / 100) * CIRCUMFERENCE;
  const expiredLen = (memStatus.expired?.percentage / 100) * CIRCUMFERENCE;
  const frozenLen = (memStatus.frozen?.percentage / 100) * CIRCUMFERENCE;

  const activeOffset = 0;
  const expiringOffset = -activeLen;
  const expiredOffset = -(activeLen + expiringLen);
  const frozenOffset = -(activeLen + expiringLen + expiredLen);

  return (
    <div className="dash-container">
      {/* Top Controls Header Bar */}
      <div className="dash-header-section">
        <div className="dash-header-main">
          <div className="dash-title-wrap">
            <h1 className="dash-page-title">Dashboard</h1>
            <p className="dash-page-subtitle">Welcome back! Here's what's happening today.</p>
          </div>
          
          <div className="dash-header-profile-wrap">
            <div className="dash-header-notifications">
              <div className="dash-icon-badge" title="Notifications">
                <i className="far fa-bell"></i>
                <span className="dash-dot-badge">12</span>
              </div>
              <div className="dash-icon-badge" title="Messages">
                <i className="far fa-comment-alt"></i>
                <span className="dash-dot-badge">5</span>
              </div>
              <div className="dash-icon-badge" title="Calendar">
                <i className="far fa-calendar-alt"></i>
              </div>
            </div>
            
            <div className="dash-user-pill">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Admin" className="dash-user-img" />
              <div className="dash-user-info">
                <span className="dash-user-name">Admin User</span>
                <span className="dash-user-role">Super Admin</span>
              </div>
              <i className="fas fa-chevron-down dash-user-arrow"></i>
            </div>
          </div>
        </div>

        <div className="dash-header-toolbar">
          <div className="dash-search-box">
            <i className="fas fa-search dash-search-icon"></i>
            <input
              type="text"
              placeholder="Search members, invoices, reports..."
              className="dash-search-input"
            />
            <span className="dash-search-kbd">Ctrl + K</span>
          </div>

          <div className="dash-filter-actions">
            <div className="dash-select-pill">
              <i className="far fa-building"></i>
              <select defaultValue="All Branches">
                <option value="All Branches">All Branches</option>
                <option value="Main Branch">Main Branch</option>
                <option value="Downtown">Downtown Branch</option>
              </select>
            </div>

            <div className="dash-select-pill">
              <i className="far fa-calendar"></i>
              <select defaultValue="10 May 2025 - 16 May 2025">
                <option value="10 May 2025 - 16 May 2025">10 May 2025 - 16 May 2025</option>
                <option value="This Month">This Month</option>
                <option value="This Quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Top KPI Metrics Cards */}
      <div className="dash-kpi-row">
        {/* KPI 1 */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-header">
            <div className="dash-kpi-icon bg-blue">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <div className="dash-kpi-label">Total Members</div>
              <div className="dash-kpi-val">{formatNum(memStatus.total_members)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> Live <span className="trend-lbl">system members</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-header">
            <div className="dash-kpi-icon bg-green">
              <i className="fas fa-id-card"></i>
            </div>
            <div>
              <div className="dash-kpi-label">Active Memberships</div>
              <div className="dash-kpi-val">{formatNum(memStatus.active?.count)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> {memStatus.active?.percentage}% <span className="trend-lbl">active rate</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-header">
            <div className="dash-kpi-icon bg-orange">
              <i className="fas fa-dumbbell"></i>
            </div>
            <div>
              <div className="dash-kpi-label">PT Sessions (This Week)</div>
              <div className="dash-kpi-val">{stats.ptSessionsThisWeek}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> 12.5% <span className="trend-lbl">vs last week</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-header">
            <div className="dash-kpi-icon bg-cyan">
              <i className="fas fa-indian-rupee-sign"></i>
            </div>
            <div>
              <div className="dash-kpi-label">Revenue (This Week)</div>
              <div className="dash-kpi-val">{formatCurrency(dashboardKpis?.revenue_overview?.total_revenue ?? stats.revenueThisWeek)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> Live <span className="trend-lbl">revenue total</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-header">
            <div className="dash-kpi-icon bg-pink">
              <i className="fas fa-wallet"></i>
            </div>
            <div>
              <div className="dash-kpi-label">Pending Payments</div>
              <div className="dash-kpi-val">{formatCurrency(stats.pendingPayments)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-down">
            <i className="fas fa-arrow-down"></i> 6.1% <span className="trend-lbl">vs last week</span>
          </div>
        </div>
      </div>

      {/* Row 2 & 3: Main Dashboard Cards Grid */}
      <div className="dash-main-cards-grid">
        {/* Card 1: Revenue Overview */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Revenue Overview</h3>
            <select className="dash-small-select" defaultValue="This Week">
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* Dynamic SVG Line Chart */}
          <div className="dash-chart-container">
            <div className="chart-legend-row">
              <span className="legend-item"><span className="dot dot-blue"></span> This Week</span>
              <span className="legend-item"><span className="dot dot-dashed"></span> Last Week</span>
            </div>

            <svg className="dash-svg-chart" viewBox="0 0 500 160">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeDasharray="3,3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeDasharray="3,3" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#e2e8f0" />

              {/* Y Axis Labels */}
              <text x="30" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">{formatCurrency(maxVal)}</text>
              <text x="30" y="64" fontSize="10" fill="#94a3b8" textAnchor="end">{formatCurrency(maxVal * 0.66)}</text>
              <text x="30" y="104" fontSize="10" fill="#94a3b8" textAnchor="end">{formatCurrency(maxVal * 0.33)}</text>
              <text x="30" y="144" fontSize="10" fill="#94a3b8" textAnchor="end">₹0</text>

              {/* Last Week Line (Dashed) */}
              <path d={getPathD(lastWeekPoints)} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />

              {/* This Week Line (Solid Blue) */}
              <path d={getPathD(thisWeekPoints)} fill="none" stroke="#2563eb" strokeWidth="2.5" />

              {/* Data Dots */}
              {thisWeekPoints.map((pt, i) => (
                <circle 
                  key={i} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={i === thisWeekPoints.length - 1 ? "4.5" : "4"} 
                  fill="#2563eb" 
                  stroke={i === thisWeekPoints.length - 1 ? "#ffffff" : "none"} 
                  strokeWidth={i === thisWeekPoints.length - 1 ? "2" : "0"} 
                >
                  <title>{`${daysList[i]}: ₹${pt.val}`}</title>
                </circle>
              ))}

              {/* X Axis Labels */}
              {daysList.map((day, i) => (
                <text key={i} x={xCoords[i] || (60 + i * 68)} y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">{day}</text>
              ))}
            </svg>
          </div>

          <div className="dash-revenue-grid">
            <div className="rev-box">
              <span className="rev-lbl">Total Revenue</span>
              <span className="rev-val text-emerald">{formatCurrency(dashboardKpis?.revenue_overview?.total_revenue)}</span>
            </div>
            <div className="rev-box">
              <span className="rev-lbl">Membership Revenue</span>
              <span className="rev-val text-blue">{formatCurrency(dashboardKpis?.revenue_overview?.membership_revenue)}</span>
            </div>
            <div className="rev-box">
              <span className="rev-lbl">PT Revenue</span>
              <span className="rev-val text-amber">{formatCurrency(dashboardKpis?.revenue_overview?.pt_revenue)}</span>
            </div>
            <div className="rev-box">
              <span className="rev-lbl">Other Revenue</span>
              <span className="rev-val text-purple">{formatCurrency(dashboardKpis?.revenue_overview?.other_revenue)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Membership Status Donut */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Membership Status</h3>
          </div>

          <div className="dash-donut-wrap">
            <svg className="dash-donut-svg" viewBox="0 0 160 160">
              {/* Donut Background */}
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#e2e8f0" strokeWidth="18" />
              {/* Active */}
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#22c55e" strokeWidth="18" strokeDasharray={`${activeLen} ${CIRCUMFERENCE}`} strokeDashoffset={activeOffset} transform="rotate(-90 80 80)" />
              {/* Expiring Soon */}
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray={`${expiringLen} ${CIRCUMFERENCE}`} strokeDashoffset={expiringOffset} transform="rotate(-90 80 80)" />
              {/* Expired */}
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f97316" strokeWidth="18" strokeDasharray={`${expiredLen} ${CIRCUMFERENCE}`} strokeDashoffset={expiredOffset} transform="rotate(-90 80 80)" />
              {/* Frozen */}
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#94a3b8" strokeWidth="18" strokeDasharray={`${frozenLen} ${CIRCUMFERENCE}`} strokeDashoffset={frozenOffset} transform="rotate(-90 80 80)" />
            </svg>
            <div className="dash-donut-center">
              <span className="donut-num">{formatNum(memStatus.total_members)}</span>
              <span className="donut-lbl">Total Members</span>
            </div>
          </div>

          <div className="dash-donut-legend">
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-green"></span> Active</span>
              <span className="leg-val">{formatNum(memStatus.active?.count)} <span className="leg-pct">({memStatus.active?.percentage}%)</span></span>
            </div>
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-blue"></span> Expiring Soon</span>
              <span className="leg-val">{formatNum(memStatus.expiring_soon?.count)} <span className="leg-pct">({memStatus.expiring_soon?.percentage}%)</span></span>
            </div>
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-orange"></span> Expired</span>
              <span className="leg-val">{formatNum(memStatus.expired?.count)} <span className="leg-pct">({memStatus.expired?.percentage}%)</span></span>
            </div>
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-grey"></span> Frozen</span>
              <span className="leg-val">{formatNum(memStatus.frozen?.count)} <span className="leg-pct">({memStatus.frozen?.percentage}%)</span></span>
            </div>
          </div>

          <a href="/admin-dashboard/subscriptions" className="dash-card-footer-link">
            View All Memberships <i className="fas fa-arrow-right"></i>
          </a>
        </div>

        {/* Card 3: Today's Schedule */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Today's Schedule</h3>
            <a href="/admin-dashboard/pt-management" className="header-link">View Calendar <i className="fas fa-arrow-right"></i></a>
          </div>

          <div className="dash-schedule-list">
            <div className="schedule-item">
              <span className="sch-time">06:00 AM</span>
              <div className="sch-icon icon-orange"><i className="fas fa-spa"></i></div>
              <div className="sch-details">
                <span className="sch-title">Yoga Class</span>
                <span className="sch-sub">Amit Sharma</span>
              </div>
              <span className="sch-pill pill-green">12/20</span>
            </div>

            <div className="schedule-item">
              <span className="sch-time">07:30 AM</span>
              <div className="sch-icon icon-purple"><i className="fas fa-dumbbell"></i></div>
              <div className="sch-details">
                <span className="sch-title">Chest Workout</span>
                <span className="sch-sub">Rahul Verma</span>
              </div>
              <span className="sch-pill pill-amber">8/15</span>
            </div>

            <div className="schedule-item">
              <span className="sch-time">09:00 AM</span>
              <div className="sch-icon icon-green"><i className="fas fa-running"></i></div>
              <div className="sch-details">
                <span className="sch-title">Zumba Class</span>
                <span className="sch-sub">Pooja Mehta</span>
              </div>
              <span className="sch-pill pill-green">18/25</span>
            </div>

            <div className="schedule-item">
              <span className="sch-time">10:30 AM</span>
              <div className="sch-icon icon-purple"><i className="fas fa-user-check"></i></div>
              <div className="sch-details">
                <span className="sch-title">PT Session</span>
                <span className="sch-sub">John Doe</span>
              </div>
              <span className="sch-pill pill-green">1/1</span>
            </div>

            <div className="schedule-item">
              <span className="sch-time">04:00 PM</span>
              <div className="sch-icon icon-orange"><i className="fas fa-fire"></i></div>
              <div className="sch-details">
                <span className="sch-title">HIIT Training</span>
                <span className="sch-sub">Vikram Singh</span>
              </div>
              <span className="sch-pill pill-amber">10/15</span>
            </div>
          </div>

          <a href="/admin-dashboard/pt-management" className="dash-card-footer-link">
            View Full Schedule <i className="fas fa-arrow-right"></i>
          </a>
        </div>

        {/* Card 4: Alerts & Notifications */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Alerts & Notifications</h3>
            <a href="/admin-dashboard/dashboard" className="header-link">View All <i className="fas fa-arrow-right"></i></a>
          </div>

          <div className="dash-alerts-list">
            <div className="alert-box alert-red">
              <i className="fas fa-exclamation-triangle alert-icon"></i>
              <div className="alert-content">
                <span className="alert-title">{memStatus.expired?.count || 0} Memberships expired</span>
                <span className="alert-desc">Please renew them to avoid service interruption.</span>
              </div>
              <a href="/admin-dashboard/subscriptions" className="alert-action">View</a>
            </div>

            <div className="alert-box alert-orange">
              <i className="fas fa-exclamation-circle alert-icon"></i>
              <div className="alert-content">
                <span className="alert-title">{memStatus.expiring_soon?.count || 0} Memberships expiring soon</span>
                <span className="alert-desc">Within the next 7 days.</span>
              </div>
              <a href="/admin-dashboard/subscriptions" className="alert-action">View</a>
            </div>

            <div className="alert-box alert-blue">
              <i className="fas fa-lock alert-icon"></i>
              <div className="alert-content">
                <span className="alert-title">12 Pending payments</span>
                <span className="alert-desc">Total amount: ₹86,430</span>
              </div>
              <a href="/admin-dashboard/subscriptions" className="alert-action">View</a>
            </div>

            <div className="alert-box alert-green">
              <i className="fas fa-shield-check alert-icon"></i>
              <div className="alert-content">
                <span className="alert-title">5 Assessment due</span>
                <span className="alert-desc">Members have pending fitness assessments.</span>
              </div>
              <a href="/admin-dashboard/pt-management?tab=assessments" className="alert-action">View</a>
            </div>
          </div>
        </div>

        {/* Real Top Trainers List */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Top Trainers</h3>
            <a href="/admin-dashboard/staff" className="header-link">View All <i className="fas fa-arrow-right"></i></a>
          </div>

          <div className="dash-trainer-list">
            {loadingTrainers ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading trainers...
              </div>
            ) : trainers.length > 0 ? (
              trainers.slice(0, 5).map((trainer, index) => {
                const photo = trainer.profile_photo || trainer.showcase_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';
                const name = trainer.full_name || trainer.name || 'Trainer';
                const designation = trainer.specialization || trainer.designation || 'Personal Trainer';
                const rating = trainer.rating ? parseFloat(trainer.rating).toFixed(1) : (4.9 - index * 0.1).toFixed(1);
                
                return (
                  <div key={trainer.employee_id || trainer.user_id || index} className="trainer-rank-item">
                    <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                    <img src={photo} alt={name} className="trainer-img" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'; }} />
                    <div className="trainer-info">
                      <span className="trainer-name">{name}</span>
                      <span className="trainer-sub">{designation}</span>
                    </div>
                    <span className="rating-pill">{rating} <i className="fas fa-star"></i></span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No trainers found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;