import LogoutButton from '../components/LogoutButton';

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  return (
    <div style={{ padding: 24 }}>
      <h2>User Dashboard</h2>
      <p>Welcome, {user?.name ?? 'User'} (ID: {user?.userId})</p>
      <LogoutButton />
    </div>
  );
}
