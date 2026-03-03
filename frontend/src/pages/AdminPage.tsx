import React, { useState, useEffect } from 'react';
import { getAllCompanies } from '../services/api';
import type { Company } from '../types';

export const AdminPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'COMPLETED'>('ALL');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    if (isAuthorized) {
      getAllCompanies()
        .then(setCompanies)
        .finally(() => setLoading(false));
    }
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthorized(true);
    } else {
      alert('Invalid password');
    }
  };

  const filtered = companies.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: companies.length,
    draft: companies.filter(c => c.status === 'DRAFT').length,
    completed: companies.filter(c => c.status === 'COMPLETED').length,
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (!isAuthorized) {
    return (
      <div className="login-gate">
        <form className="login-card" onSubmit={handleLogin}>
          <h2>Admin Access</h2>
          <div className="form-field" style={{ marginBottom: '20px' }}>
            <input 
              type="password" 
              placeholder=" " 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <label>Password</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Login
          </button>
          <div style={{ marginTop: '20px' }}>
            <a href="/" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Back to form</a>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="brand-name">FounderDesk</span>
          <span className="admin-badge">Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/" className="btn btn-secondary btn-sm">Home</a>
          <button onClick={() => setIsAuthorized(false)} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-title-section">
          <h1>Applications</h1>
          <p className="admin-subtitle">Monitoring all incorporation requests</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-num accent-draft">{stats.draft}</span>
            <span className="stat-label">Drafts</span>
          </div>
          <div className="stat-card">
            <span className="stat-num accent-completed">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="table-controls">
          <div className="search-wrap">
            <input
              type="search"
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '14px' }}
            />
          </div>
          <div className="filter-tabs">
            {(['ALL', 'DRAFT', 'COMPLETED'] as const).map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Fetching data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>{companies.length === 0 ? 'No applications yet.' : 'No matches found.'}</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Capital</th>
                  <th>Equity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(company => (
                  <tr key={company.id}>
                    <td>
                      <div className="company-cell">
                        <span className="company-name">{company.name}</span>
                        <span className="company-email">{company.company_type} • {company.email}</span>
                      </div>
                    </td>
                    <td>
                      <span>{formatCurrency(company.total_capital)}</span>
                    </td>
                    <td>
                      <div style={{ width: '100px' }}>
                        <div className="shares-bar">
                          <div className="shares-fill" style={{ width: `${(company.shareholders.length / company.num_shareholders) * 100}%` }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {company.shareholders.length} / {company.num_shareholders} profiles
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${company.status.toLowerCase()}`}>
                        {company.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
