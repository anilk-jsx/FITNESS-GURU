import React, { useState } from 'react';
import './TrainerDashboard.css';

const TrainerClients = () => {
  // Mock client directory list
  const [clients, setClients] = useState([
    { id: 1001, name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com', phone: '9876543210', status: 'Active', plan: 'Gold Annual', joinDate: '2024-01-15', workoutPlan: 'Hypertrophy Split', dietPlan: 'Lean Bulk 2600kcal' },
    { id: 1002, name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '9876543211', status: 'Active', plan: 'Silver Monthly', joinDate: '2024-02-10', workoutPlan: 'Cardio Core Blast', dietPlan: 'Weight Loss 1500kcal' },
    { id: 1003, name: 'Amit Verma', email: 'amit.verma@email.com', phone: '9876543212', status: 'Expired', plan: 'Quarterly Basic', joinDate: '2024-03-01', workoutPlan: 'Strength Starter', dietPlan: 'None' },
    { id: 1004, name: 'Sneha Patel', email: 'sneha.patel@email.com', phone: '9876543213', status: 'Active', plan: 'Gold Annual', joinDate: '2024-08-01', workoutPlan: 'Rehab & Mobility', dietPlan: 'Maintenance 1800kcal' },
    { id: 1005, name: 'Rahul Mehta', email: 'rahul.mehta@email.com', phone: '9876543214', status: 'Active', plan: 'Gold Premium', joinDate: '2024-09-15', workoutPlan: 'Push-Pull-Legs', dietPlan: 'High Protein 2800kcal' },
    { id: 1006, name: 'Kavita Singh', email: 'kavita.singh@email.com', phone: '9876543215', status: 'Pending', plan: 'Bronze Trial', joinDate: '2024-05-01', workoutPlan: 'None', dietPlan: 'None' },
    { id: 1007, name: 'Ananya Roy', email: 'ananya.roy@email.com', phone: '9876543218', status: 'Active', plan: 'Gold Premium', joinDate: '2024-05-12', workoutPlan: 'Advanced Pilates & Core', dietPlan: 'Lean Tone 1600kcal' }
  ]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null); // Side Drawer
  const [editNotesModal, setEditNotesModal] = useState(false);
  const [clientNotes, setClientNotes] = useState('');

  const itemsPerPage = 5;

  // Sorting
  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'joinDate') return new Date(a.joinDate) - new Date(b.joinDate);
    return 0;
  });

  // Filtering
  const filteredClients = sortedClients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status) => {
    if (status === 'Active') return <span className="m-badge success">Active</span>;
    if (status === 'Pending') return <span className="m-badge warning">Pending</span>;
    return <span className="m-badge danger">Expired</span>;
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    alert(`Instructions for ${selectedClient.name} updated: "${clientNotes}"`);
    setEditNotesModal(false);
  };

  return (
    <div className="trainer-page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Clients</h1>
          <p>Search, filter, and view physical progression records of gym members.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="m-card filter-bar">
        <div className="filter-bar-left">
          <div className="table-search-input-wrapper">
            <i className="fas fa-search table-search-icon"></i>
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="table-search-input"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select 
            className="table-filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
          </select>
          <select 
            className="table-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="joinDate">Sort by Joining Date</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="m-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <table className="m-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Membership</th>
                <th>Active Plans</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="profile-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                          {c.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.joinDate}</td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🏋️ {c.workoutPlan}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🥗 {c.dietPlan}</span>
                      </div>
                    </td>
                    <td>
                      <div className="m-table-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => setSelectedClient(c)}
                          title="View Profile Overview"
                        >
                          <i className="far fa-eye"></i>
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => { setSelectedClient(c); setClientNotes(''); setEditNotesModal(true); }}
                          title="Write Instructions"
                        >
                          <i className="far fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="table-pagination-bar" style={{ padding: '20px' }}>
            <span className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClients.length)} of {filteredClients.length} clients
            </span>
            <div className="pagination-controls">
              <button 
                className="btn-pagination" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <button 
                className="btn-pagination"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PROFILE OVERVIEW DRAWERS / SIDE DIALOGS */}
      {selectedClient && !editNotesModal && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)} style={{ zIndex: 999 }}>
          <div className="modal-container" style={{ position: 'fixed', right: 0, top: 0, bottom: 0, height: '100vh', borderRadius: 0, width: '100%', maxWidth: '420px', zIndex: 1000 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Client Profile Overview</h3>
              <button className="modal-close-btn" onClick={() => setSelectedClient(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div className="profile-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 12px' }}>
                  {selectedClient.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <h2>{selectedClient.name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>ID: FG-{selectedClient.id}</p>
                <div style={{ marginTop: '8px' }}>{getStatusBadge(selectedClient.status)}</div>
              </div>

              <div className="m-card" style={{ marginBottom: '20px', padding: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>Contact Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <div><strong>Email:</strong> {selectedClient.email}</div>
                  <div><strong>Phone:</strong> {selectedClient.phone}</div>
                  <div><strong>Join Date:</strong> {selectedClient.joinDate}</div>
                  <div><strong>Membership:</strong> {selectedClient.plan}</div>
                </div>
              </div>

              <div className="m-card" style={{ padding: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>Assigned Plans</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Workout Split</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedClient.workoutPlan}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--secondary-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dietary Guide</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedClient.dietPlan}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <button className="btn-secondary" onClick={() => setSelectedClient(null)}>Close Panel</button>
              <button className="btn-primary" onClick={() => { setClientNotes(''); setEditNotesModal(true); }}>Edit Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT NOTES DIALOG */}
      {editNotesModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Workout Notes - {selectedClient.name}</h3>
              <button className="modal-close-btn" onClick={() => setEditNotesModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveNotes}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Active Workout Split Instructions</label>
                  <textarea 
                    rows="5"
                    className="form-textarea"
                    placeholder="Write active exercise sets, target repetition limits, weights or general safety precautions..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditNotesModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Instructions</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerClients;
