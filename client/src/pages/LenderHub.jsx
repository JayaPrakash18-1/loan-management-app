import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

export default function LenderHub({ token }) {
  const [loans, setLoans] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(null);
  const [showManualModal, setShowManualModal] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [manualType, setManualType] = useState('INTEREST');
  const [approveType, setApproveType] = useState('INTEREST');
  
  const [formData, setFormData] = useState({
    borrower_app_id: '',
    principal: '',
    interest_rate: '',
    interest_type: 'SI',
    start_date: ''
  });

  const fetchLoans = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/loans/given', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setLoans);
  };

  const fetchPending = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payments/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setPendingPayments);
  };

  useEffect(() => {
    fetchLoans();
    fetchPending();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      setShowModal(false);
      fetchLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payments/${showVerifyModal.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ payment_type: approveType })
      });
      setShowVerifyModal(null);
      fetchPending();
      fetchLoans();
    } catch (err) {
      alert('Approval failed');
    }
  };

  
  const handleManualPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payments/${showManualModal.id}/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: manualAmount, payment_type: manualType })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || d.message || "Unknown error");
      }
      setShowManualModal(null);
      setManualAmount('');
      setManualType('INTEREST');
      fetchLoans();
    } catch (err) {
      alert('Manual payment failed: ' + err.message);
    }
  };

  const handleReject = async (paymentId) => {
    if(!window.confirm("Reject this payment claim?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      fetchPending();
    } catch (err) {
      alert('Reject failed');
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        
        {pendingPayments.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--warning)', marginBottom: '1rem' }}>Pending Payments</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingPayments.map(p => (
                <div key={p.id} className="card" style={{ border: '1px solid var(--warning)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex-between">
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>₹{p.amount} from {p.borrower_name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>App ID: {p.borrower_id} | Date: {new Date(p.payment_date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" onClick={() => handleReject(p.id)} style={{ color: 'var(--danger)' }}>
                         Reject
                      </button>
                      <button className="btn btn-primary" onClick={() => setShowVerifyModal(p)}>
                        <CheckCircle size={18} /> Verify
                      </button>
                    </div>
                  </div>
                  {p.message && (
                    <div style={{
                      backgroundColor: '#dcf8c6',
                      color: '#000',
                      padding: '0.75rem 1rem',
                      borderRadius: '0px 12px 12px 12px',
                      alignSelf: 'flex-start',
                      maxWidth: '80%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#075e54', fontWeight: 'bold', marginBottom: '0.25rem' }}>Message from {p.borrower_name}</div>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4', fontSize: '0.95rem' }}>{p.message}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <h2>Loans I Have Given</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add New Loan
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }} className="grid-cols-2">
          {loans.map(loan => (
            <div key={loan.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex-between">
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{loan.borrower_name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{loan.borrower_app_id} | 📧 {loan.borrower_email} | 📞 {loan.borrower_phone || 'None'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {loan.status === 'ACTIVE' && (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setShowManualModal(loan)}>
                      Log Payment
                    </button>
                  )}
                  <span className={`badge ${loan.status === 'ACTIVE' ? 'badge-warning' : 'badge-success'}`}>
                    {loan.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Principal</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>₹{loan.principal}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Interest Accrued</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>₹{loan.accumulated_interest}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Interest Paid</div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--success)' }}>₹{loan.interest_paid}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Outstanding Total</div>
                  <div style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--danger)' }}>₹{loan.total_payable}</div>
                </div>
              </div>
            </div>
          ))}
          {loans.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You haven't given any loans yet.</p>}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Loan</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Borrower App ID</label>
                <input placeholder="Ex: APP123" required onChange={e => setFormData({...formData, borrower_app_id: e.target.value})} />
              </div>
              <div>
                <label>Principal Amount (₹)</label>
                <input type="number" required onChange={e => setFormData({...formData, principal: e.target.value})} />
              </div>
              <div className="flex-between" style={{ gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Interest Rate (%)</label>
                  <input type="number" step="0.1" required onChange={e => setFormData({...formData, interest_rate: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Type</label>
                  <select required onChange={e => setFormData({...formData, interest_type: e.target.value})}>
                    <option value="SI">Simple</option>
                    <option value="CI">Compound</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Start Date</label>
                <input type="date" required onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="flex-between" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVerifyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Verify Payment</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Borrower {showVerifyModal.borrower_name} claims they sent you ₹{showVerifyModal.amount} on PhonePe. Please verify this in your banking app.
            </p>
            <form onSubmit={handleApprove} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>How would you like to apply this ₹{showVerifyModal.amount}?</label>
                <select value={approveType} onChange={e => setApproveType(e.target.value)} style={{ marginTop: '0.5rem' }}>
                  <option value="INTEREST">Apply as Interest Payment</option>
                  <option value="FULL">Settle & Close Full Loan</option>
                </select>
                {approveType === 'FULL' && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
                    WARNING: This will permanently close the entire loan, marking all dues as fully settled regardless of the amount.
                  </p>
                )}
              </div>
              <div className="flex-between" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVerifyModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>Confirm & Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManualModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Update Loan</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Log an offline payment directly for {showManualModal.borrower_name}.
            </p>
            <form onSubmit={handleManualPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Amount Recieved (₹)</label>
                <input type="number" step="0.01" required value={manualAmount} onChange={e => setManualAmount(e.target.value)} />
              </div>
              <div>
                <label>Action</label>
                <select value={manualType} onChange={e => setManualType(e.target.value)}>
                  <option value="INTEREST">Reduce Partial Interest</option>
                  <option value="FULL">Settle & Close Full Loan</option>
                </select>
              </div>
              <div className="flex-between" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowManualModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-primary)' }}>Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
