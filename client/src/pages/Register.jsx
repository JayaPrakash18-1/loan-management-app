import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setSuccess(`Registered! Your unique App ID is ${data.app_id}`);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem' }}>
          Join LendOS
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Create your account to start lending or borrowing.
        </p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', background: 'var(--danger-bg)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', background: 'var(--success-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>{success}<br/><small>Redirecting to login...</small></div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem' }}>
            <div>
               <label>Full Name</label>
               <input name="name" onChange={handleChange} required />
            </div>
            <div>
               <label>Phone</label>
               <input name="phone" onChange={handleChange} />
            </div>
          </div>
          
          <div>
            <label>Email Address</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
          
          <div>
            <label>Password</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>
          
          <div>
            <label>Address</label>
            <textarea name="address" onChange={handleChange} rows="2"></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={!!success}>
            Register Account
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
