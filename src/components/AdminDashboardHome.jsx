import React, { useState, useEffect } from 'react';
import { tokenManager } from '../utils/tokenManager';
import './AdminDashboardHome.css';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalMembers: 1248,
    activeMemberships: 986,
    checkInsThisWeek: 1789,
    ptSessionsThisWeek: 256,
    revenueThisWeek: 248750,
    pendingPayments: 86430,
    loading: false,
    error: null
  });

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
      console.error('Error fetching live stats:', err);
    }
  };

  useEffect(() => {
    fetchMemberStats();
  }, []);

  const formatCurrency = (val) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  const formatNum = (val) => {
    return new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="dash-container fade-in">
      {/* Top Controls Header Bar */}
      <div className="dash-top-bar">
        <div className="dash-title-wrap">
          <h1 className="dash-page-title">Dashboard</h1>
        </div>

        <div className="dash-search-box">
          <i className="fas fa-search dash-search-icon"></i>
          <input
            type="text"
            placeholder="Search members, invoices, reports..."
            className="dash-search-input"
          />
          <span className="dash-search-kbd">Ctrl + K</span>
        </div>

        <div className="dash-top-actions">
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

      {/* Row 1: 6 Top KPI Metrics Cards */}
      <div className="dash-kpi-row">
        {/* KPI 1 */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-header">
            <div className="dash-kpi-icon bg-blue">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <div className="dash-kpi-label">Total Members</div>
              <div className="dash-kpi-val">{formatNum(stats.totalMembers)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> 5.6% <span className="trend-lbl">vs last week</span>
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
              <div className="dash-kpi-val">{formatNum(stats.activeMemberships)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> 4.3% <span className="trend-lbl">vs last week</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-header">
            <div className="dash-kpi-icon bg-purple">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <div className="dash-kpi-label">Check-ins (This Week)</div>
              <div className="dash-kpi-val">{formatNum(stats.checkInsThisWeek)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> 8.2% <span className="trend-lbl">vs last week</span>
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
              <div className="dash-kpi-val">{formatCurrency(stats.revenueThisWeek)}</div>
            </div>
          </div>
          <div className="dash-kpi-trend trend-up">
            <i className="fas fa-arrow-up"></i> 15.7% <span className="trend-lbl">vs last week</span>
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

      {/* Row 2: 3 Cards (Revenue Chart, Membership Donut, Today's Schedule) */}
      <div className="dash-grid-3col">
        {/* Card 1: Revenue Overview */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Revenue Overview</h3>
            <select className="dash-small-select" defaultValue="This Week">
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* SVG Line Chart */}
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
              <text x="30" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">₹80K</text>
              <text x="30" y="64" fontSize="10" fill="#94a3b8" textAnchor="end">₹60K</text>
              <text x="30" y="104" fontSize="10" fill="#94a3b8" textAnchor="end">₹40K</text>
              <text x="30" y="144" fontSize="10" fill="#94a3b8" textAnchor="end">₹0</text>

              {/* Last Week Line (Dashed) */}
              <path d="M 60,110 Q 130,85 200,95 T 340,90 T 470,75" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />

              {/* This Week Line (Solid Blue) */}
              <path d="M 60,105 Q 130,95 200,60 T 340,80 T 470,35" fill="none" stroke="#2563eb" strokeWidth="2.5" />

              {/* Data Dots */}
              <circle cx="60" cy="105" r="4" fill="#2563eb" />
              <circle cx="130" cy="95" r="4" fill="#2563eb" />
              <circle cx="200" cy="60" r="4" fill="#2563eb" />
              <circle cx="270" cy="80" r="4" fill="#2563eb" />
              <circle cx="340" cy="75" r="4" fill="#2563eb" />
              <circle cx="410" cy="65" r="4" fill="#2563eb" />
              <circle cx="470" cy="35" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />

              {/* X Axis Labels */}
              <text x="60" y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">Sat</text>
              <text x="130" y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">Sun</text>
              <text x="200" y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">Mon</text>
              <text x="270" y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">Tue</text>
              <text x="340" y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">Wed</text>
              <text x="410" y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">Thu</text>
              <text x="470" y="156" fontSize="10" fill="#94a3b8" textAnchor="middle">Fri</text>
            </svg>
          </div>

          <div className="dash-revenue-grid">
            <div className="rev-box">
              <span className="rev-lbl">Total Revenue</span>
              <span className="rev-val text-emerald">₹2,48,750</span>
            </div>
            <div className="rev-box">
              <span className="rev-lbl">Membership Revenue</span>
              <span className="rev-val text-blue">₹1,85,400</span>
            </div>
            <div className="rev-box">
              <span className="rev-lbl">PT Revenue</span>
              <span className="rev-val text-amber">₹50,750</span>
            </div>
            <div className="rev-box">
              <span className="rev-lbl">Other Revenue</span>
              <span className="rev-val text-purple">₹12,600</span>
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
              {/* Donut Segments */}
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#e2e8f0" strokeWidth="18" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#22c55e" strokeWidth="18" strokeDasharray="297 377" strokeDashoffset="0" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray="45 377" strokeDashoffset="-297" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f97316" strokeWidth="18" strokeDasharray="20 377" strokeDashoffset="-342" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#94a3b8" strokeWidth="18" strokeDasharray="15 377" strokeDashoffset="-362" transform="rotate(-90 80 80)" />
            </svg>
            <div className="dash-donut-center">
              <span className="donut-num">1,248</span>
              <span className="donut-lbl">Total Members</span>
            </div>
          </div>

          <div className="dash-donut-legend">
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-green"></span> Active</span>
              <span className="leg-val">986 <span className="leg-pct">(79.0%)</span></span>
            </div>
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-blue"></span> Expiring Soon</span>
              <span className="leg-val">152 <span className="leg-pct">(12.2%)</span></span>
            </div>
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-orange"></span> Expired</span>
              <span className="leg-val">68 <span className="leg-pct">(5.4%)</span></span>
            </div>
            <div className="legend-row">
              <span className="leg-name"><span className="dot bg-grey"></span> Frozen</span>
              <span className="leg-val">42 <span className="leg-pct">(3.4%)</span></span>
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
      </div>

      {/* Row 3: 3 Cards (Check-ins, Top Trainers, Alerts) */}
      <div className="dash-grid-3col">
        {/* Card 1: Member Check-ins (Today) */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Member Check-ins (Today)</h3>
            <a href="/admin-dashboard/attendance" className="header-link">View All <i className="fas fa-arrow-right"></i></a>
          </div>

          <div className="dash-checkin-list">
            <div className="checkin-item">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80" alt="Rahul" className="user-avatar" />
              <div className="user-info">
                <span className="user-name">Rahul Sharma</span>
                <span className="user-id">MEM10045</span>
              </div>
              <span className="checkin-time">06:15 AM</span>
              <span className="badge-checked">Checked In</span>
            </div>

            <div className="checkin-item">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" alt="Priya" className="user-avatar" />
              <div className="user-info">
                <span className="user-name">Priya Patel</span>
                <span className="user-id">MEM10046</span>
              </div>
              <span className="checkin-time">06:18 AM</span>
              <span className="badge-checked">Checked In</span>
            </div>

            <div className="checkin-item">
              <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&q=80" alt="Amit" className="user-avatar" />
              <div className="user-info">
                <span className="user-name">Amit Verma</span>
                <span className="user-id">MEM10047</span>
              </div>
              <span className="checkin-time">06:20 AM</span>
              <span className="badge-checked">Checked In</span>
            </div>

            <div className="checkin-item">
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80" alt="Neha" className="user-avatar" />
              <div className="user-info">
                <span className="user-name">Neha Gupta</span>
                <span className="user-id">MEM10048</span>
              </div>
              <span className="checkin-time">06:25 AM</span>
              <span className="badge-checked">Checked In</span>
            </div>

            <div className="checkin-item">
              <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&q=80" alt="Vikram" className="user-avatar" />
              <div className="user-info">
                <span className="user-name">Vikram Singh</span>
                <span className="user-id">MEM10049</span>
              </div>
              <span className="checkin-time">06:30 AM</span>
              <span className="badge-checked">Checked In</span>
            </div>
          </div>

          <a href="/admin-dashboard/attendance" className="dash-card-footer-link">
            View All Check-ins <i className="fas fa-arrow-right"></i>
          </a>
        </div>

        {/* Card 2: Top Trainers (This Month) */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Top Trainers (This Month)</h3>
            <a href="/admin-dashboard/staff" className="header-link">View All <i className="fas fa-arrow-right"></i></a>
          </div>

          <div className="dash-trainer-list">
            <div className="trainer-rank-item">
              <span className="rank-badge rank-1">1</span>
              <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&q=80" alt="Rahul" className="trainer-img" />
              <div className="trainer-info">
                <span className="trainer-name">Rahul Verma</span>
                <span className="trainer-sub">32 Sessions</span>
              </div>
              <span className="rating-pill">4.9 <i className="fas fa-star"></i></span>
            </div>

            <div className="trainer-rank-item">
              <span className="rank-badge rank-2">2</span>
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" alt="Amit" className="trainer-img" />
              <div className="trainer-info">
                <span className="trainer-name">Amit Sharma</span>
                <span className="trainer-sub">28 Sessions</span>
              </div>
              <span className="rating-pill">4.8 <i className="fas fa-star"></i></span>
            </div>

            <div className="trainer-rank-item">
              <span className="rank-badge rank-3">3</span>
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80" alt="Pooja" className="trainer-img" />
              <div className="trainer-info">
                <span className="trainer-name">Pooja Mehta</span>
                <span className="trainer-sub">24 Sessions</span>
              </div>
              <span className="rating-pill">4.7 <i className="fas fa-star"></i></span>
            </div>

            <div className="trainer-rank-item">
              <span className="rank-badge rank-4">4</span>
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" alt="John" className="trainer-img" />
              <div className="trainer-info">
                <span className="trainer-name">John Doe</span>
                <span className="trainer-sub">22 Sessions</span>
              </div>
              <span className="rating-pill">4.6 <i className="fas fa-star"></i></span>
            </div>

            <div className="trainer-rank-item">
              <span className="rank-badge rank-5">5</span>
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=80" alt="Vikram" className="trainer-img" />
              <div className="trainer-info">
                <span className="trainer-name">Vikram Singh</span>
                <span className="trainer-sub">20 Sessions</span>
              </div>
              <span className="rating-pill">4.5 <i className="fas fa-star"></i></span>
            </div>
          </div>
        </div>

        {/* Card 3: Alerts & Notifications */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Alerts & Notifications</h3>
            <a href="/admin-dashboard/dashboard" className="header-link">View All <i className="fas fa-arrow-right"></i></a>
          </div>

          <div className="dash-alerts-list">
            <div className="alert-box alert-red">
              <i className="fas fa-exclamation-triangle alert-icon"></i>
              <div className="alert-content">
                <span className="alert-title">68 Memberships expired</span>
                <span className="alert-desc">Please renew them to avoid service interruption.</span>
              </div>
              <a href="/admin-dashboard/subscriptions" className="alert-action">View</a>
            </div>

            <div className="alert-box alert-orange">
              <i className="fas fa-exclamation-circle alert-icon"></i>
              <div className="alert-content">
                <span className="alert-title">152 Memberships expiring soon</span>
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
              <i className="fas fa-check-shield alert-icon"></i>
              <div className="alert-content">
                <span className="alert-title">5 Assessment due</span>
                <span className="alert-desc">Members have pending fitness assessments.</span>
              </div>
              <a href="/admin-dashboard/pt-management?tab=assessments" className="alert-action">View</a>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Quick Insights */}
      <div className="dash-quick-insights">
        <div className="insights-header">
          <h3 className="dash-card-title">Quick Insights</h3>
          <a href="/admin-dashboard/dashboard" className="header-link">View Detailed Report <i className="fas fa-arrow-right"></i></a>
        </div>

        <div className="insights-grid">
          <div className="insight-pill">
            <div className="insight-icon icon-blue"><i className="far fa-user"></i></div>
            <div>
              <span className="insight-lbl">New Members (This Week)</span>
              <div className="insight-val-flex">
                <span className="insight-num">24</span>
                <span className="trend-up"><i className="fas fa-arrow-up"></i> 20%</span>
              </div>
            </div>
          </div>

          <div className="insight-pill">
            <div className="insight-icon icon-purple"><i className="far fa-user-circle"></i></div>
            <div>
              <span className="insight-lbl">Trial Members</span>
              <div className="insight-val-flex">
                <span className="insight-num">18</span>
                <span className="trend-down"><i className="fas fa-arrow-down"></i> 10%</span>
              </div>
            </div>
          </div>

          <div className="insight-pill">
            <div className="insight-icon icon-green"><i className="fas fa-boxes-stacked"></i></div>
            <div>
              <span className="insight-lbl">PT Packages Sold</span>
              <div className="insight-val-flex">
                <span className="insight-num">14</span>
                <span className="trend-up"><i className="fas fa-arrow-up"></i> 27%</span>
              </div>
            </div>
          </div>

          <div className="insight-pill">
            <div className="insight-icon icon-purple"><i className="fas fa-calendar-check"></i></div>
            <div>
              <span className="insight-lbl">Classes Conducted</span>
              <div className="insight-val-flex">
                <span className="insight-num">32</span>
                <span className="trend-up"><i className="fas fa-arrow-up"></i> 14%</span>
              </div>
            </div>
          </div>

          <div className="insight-pill">
            <div className="insight-icon icon-amber"><i className="far fa-lightbulb"></i></div>
            <div>
              <span className="insight-lbl">Avg. Member Retention</span>
              <div className="insight-val-flex">
                <span className="insight-num">82%</span>
                <span className="trend-up"><i className="fas fa-arrow-up"></i> 6%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;