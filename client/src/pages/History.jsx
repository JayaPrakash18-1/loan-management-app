import { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function History({ token }) {
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch('http://localhost:3000/payments/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setHistory);
  }, [token]);

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem' }}>Transaction History</h2>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Transaction Type</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Amount</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map(tx => {
              const isCredit = tx.lender_app_id === user.app_id; // Payment coming to me from borrower
              const dateObj = new Date(tx.payment_date);
              
              return (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{dateObj.toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateObj.toLocaleTimeString()}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCredit ? <ArrowDownLeft color="var(--success)" size={18} /> : <ArrowUpRight color="var(--danger)" size={18} />}
                      {isCredit ? `Received (${tx.payment_type}) from ${tx.payer_app_id}` : `Paid (${tx.payment_type}) to ${tx.lender_app_id}`}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: isCredit ? 'var(--success)' : 'var(--text-primary)' }}>
                    {isCredit ? '+' : '-'}₹{tx.amount}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <span className="badge badge-success">Completed</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {history.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</p>}
      </div>
    </div>
  );
}
