
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser } from '../app/services/login';
import type { User } from '../app/services/login';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const id = userId.trim();
    if (!id) {
      setError('Please enter a User ID');
      return;
    }

    setLoading(true);
    try {
      const user: User = await fetchUser(id);
      console.log('[Login] fetched user:', user);

      // Save session BEFORE navigating
      localStorage.setItem('loggedInUser', JSON.stringify(user));

      // Use 'userRole' from backend and normalize casing
      const role = user.userRole?.toUpperCase();
      console.log('[Login] role normalized:', role);

      const target = role === 'ADMIN' ? '/admin' : '/user';
      console.log('[Login] navigating to:', target);

      navigate(target, { replace: true });
    } catch (err: any) {
      console.error('[Login] error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="userId">User ID</label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your User ID"
          style={{ width: '100%', padding: '8px', marginTop: 8, marginBottom: 12 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Checking…' : 'Continue'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
    </div>
  );
}
