import { useState, useEffect } from 'react';
import { TrendingUp, Layers, BadgeDollarSign, HeartHandshake } from 'lucide-react';

export default function Dashboard({ token }) {
  const [summary, setSummary] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setSummary(data))
    .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/qr`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (data.qr) setQrCode(data.qr); })
    .catch(console.error);
  }, [token]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ qr_base64: reader.result })
      })
      .then(() => setQrCode(reader.result))
      .catch(console.error);
    };
    reader.readAsDataURL(file);
  };

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Financial Overview</h1>

      <div style={{ display: 'grid', gap: '1.5rem' }} className="grid-cols-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '12px' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Given</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹{summary.total_given}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Across {summary.active_loans_given} active loans
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '12px' }}>
              <Layers size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Taken</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹{summary.total_taken}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Across {summary.active_loans_taken} active loans
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', borderRadius: '12px' }}>
              <BadgeDollarSign size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Projected Interest Earned</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹{summary.expected_interest_to_earn}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Actual achieved: ₹{summary.actual_interest_earned}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px' }}>
              <HeartHandshake size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Projected Interest to Pay</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹{summary.expected_interest_to_pay}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Based on current outstanding balance
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>Lender Settings</h2>
      <div className="card">
        <h3 style={{ marginBottom: '0.5rem' }}>PhonePe Scanner (QR Code)</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload your PhonePe QR code. Borrowers will scan this to make payments to you.</p>
        
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '1rem' }} />
        
        {qrCode && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>✓ QR Code Active</p>
            <img src={qrCode} alt="Your PhonePe QR" style={{ maxHeight: '250px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
