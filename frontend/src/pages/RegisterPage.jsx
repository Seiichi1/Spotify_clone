import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>Spoti<em style={{ color: '#1db954', fontStyle:'normal' }}>fy</em></span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start listening for free</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input id="username" className="form-input" placeholder="cooluser123"
              value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="reg-email" className="form-input" type="email" placeholder="email@example.com"
              value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" className="form-input" type="password" placeholder="At least 8 characters"
              value={form.password} onChange={set('password')} minLength={6} required />
          </div>
          <button id="register-btn" className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
