import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Database, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEntries } from '../api';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';

export default function Records() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, total_pages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    getEntries({ search: search || undefined, page, page_size: 15 })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const truncate = (s, n = 42) => s?.length > n ? s.slice(0, n) + '…' : s;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Cloud Records</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data.total.toLocaleString()} validated records in the database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="field-input"
              style={{ width: 260, paddingRight: 32 }}
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, display: 'flex'
              }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="glass" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
          <table className="dp-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Content</th>
                <th style={{ width: 120 }}>Date</th>
                <th style={{ width: 100 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(12).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)
                : data.items.length === 0
                ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 0' }}>
                      <EmptyState
                        icon={Database}
                        title={search ? 'No matches found' : 'No records yet'}
                        description={search ? 'Try a different search term.' : 'Submit your first entry to see it here.'}
                      />
                    </td>
                  </tr>
                )
                : data.items.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="mono" style={{ color: 'var(--text-tertiary)' }}>
                      {(page - 1) * 15 + idx + 1}
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.email}</td>
                    <td className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.phone}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{truncate(r.content)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
                        <Calendar size={14} />
                        {fmt(r.created_at)}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                        Valid
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {data.total_pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-app)', flexShrink: 0
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of {data.total_pages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn-icon" disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
