import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';

export default function BorrowerHub({ token }) {
  const [loans, setLoans] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(null); // loan object
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('INTEREST');
  const [paymentMessage, setPaymentMessage] = useState('');

  const fetchLoans = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/loans/taken`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setLoans);
  };

  useEffect(fetchLoans, [token]);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payments/${showPaymentModal.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: paymentAmount, message: paymentMessage })
      });
      alert('Payment submitted! Waiting for Lender to verify your PhonePe transaction.');
      setShowPaymentModal(null);
      fetchLoans();
      setPaymentAmount('');
      setPaymentMessage('');
    } catch (err) {
      alert('Payment submission failed');
    }
  };

  return (
    <>
      <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Loans I Have Taken</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage and pay off your debts efficiently.</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {loans.map(loan => (
          <div key={loan.id} className="card flex-between" style={{ padding: '1.5rem 2rem' }}>
             <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lender: {loan.lender_name} ({loan.lender_app_id})</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>📧 {loan.lender_email} | 📞 {loan.lender_phone || 'None'}</div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0.5rem 0' }}>Total Owed: ₹{loan.total_payable}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Principal: ₹{loan.principal}</span>
                  <span>Unpaid Interest: ₹{loan.outstanding_interest}</span>
                  <span className={`badge ${loan.status === 'ACTIVE' ? 'badge-warning' : 'badge-success'}`}>{loan.status}</span>
                </div>
             </div>
             
             {loan.status === 'ACTIVE' && (
               <button className="btn btn-primary" onClick={() => { setShowPaymentModal(loan); setPaymentAmount(loan.outstanding_interest); }}>
                 <CreditCard size={18} /> Make Payment
               </button>
             )}
          </div>
        ))}
        {loans.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You haven't taken any loans yet.</p>}
      </div>
      </div>

      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Make Payment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Lender: {showPaymentModal.lender_name}
            </p>
            
            {showPaymentModal.lender_phonepe_qr ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img src={showPaymentModal.lender_phonepe_qr} alt="Lender PhonePe" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Scan this code using PhonePe</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--danger-bg)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>⚠️ Lender has not uploaded a PhonePe scanner. Please ask them to upload it from their dashboard!</p>
              </div>
            )}

            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Payment Type</label>
                <select value={paymentType} onChange={e => {
                  setPaymentType(e.target.value);
                  if (e.target.value === 'FULL') setPaymentAmount(showPaymentModal.total_payable);
                  else setPaymentAmount(showPaymentModal.outstanding_interest);
                }}>
                  <option value="INTEREST">Partial/Interest Payment</option>
                  <option value="FULL">Full Payment (Close Loan)</option>
                </select>
              </div>
              <div>
                <label>Amount (₹)</label>
                <input type="number" step="0.01" required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} disabled={!showPaymentModal.lender_phonepe_qr} />
                <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                  {paymentType === 'FULL' ? `Exact total needed: ₹${showPaymentModal.total_payable}` : `Outstanding interest: ₹${showPaymentModal.outstanding_interest}`}
                </small>
              </div>
              <div>
                <label>Message to Lender</label>
                <textarea 
                  placeholder="e.g. I have paid ₹100 via PhonePe. UTR: 123456789" 
                  value={paymentMessage} 
                  onChange={e => setPaymentMessage(e.target.value)}
                  disabled={!showPaymentModal.lender_phonepe_qr}
                  style={{ width: '100%', minHeight: '60px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
              <div className="flex-between" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!showPaymentModal.lender_phonepe_qr}>
                  {showPaymentModal.lender_phonepe_qr ? 'Complete Payment via PhonePe' : 'Action Disabled'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
