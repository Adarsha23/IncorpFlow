import React, { useState, useEffect } from 'react';
import { getAllCompanies } from '../services/api';
import type { Company } from '../types';

export const AdminPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'COMPLETED'>('ALL');

  useEffect(() => {
    getAllCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">FounderDesk</span>
          <span className="admin-badge">Admin</span>
        </div>
        <a href="/" className="btn btn-secondary btn-sm">+ New Incorporation</a>
      </header>

      <main className="admin-main">
        <div className="admin-title-section">
          <h1>Companies</h1>
          <p className="admin-subtitle">All incorporation applications</p>
        </div>

        {/* Stats Cards */}
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

        {/* Controls */}
        <div className="table-controls">
          <div className="search-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="search"
              placeholder="Search companies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
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

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading companies…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span>🏢</span>
            <p>{companies.length === 0 ? 'No companies yet.' : 'No results match your search.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Jurisdiction</th>
                  <th>Shareholders</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(company => (
                  <tr key={company.id}>
                    <td>
                      <div className="company-cell">
                        <span className="company-name">{company.name}</span>
                        <span className="company-email">{company.email}</span>
                      </div>
                    </td>
                    <td><span className="type-badge">{company.company_type}</span></td>
                    <td className="jurisdiction-cell">{company.jurisdiction}</td>
                    <td>
                      <span className="shareholder-count">{company.shareholders.length}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${company.status.toLowerCase()}`}>
                        {company.status === 'COMPLETED' ? '✓ ' : '◐ '}
                        {company.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(company.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
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
