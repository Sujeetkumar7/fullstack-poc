import LogoutButton from '../components/LogoutButton'
export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user?.name ?? 'Admin'} (ID: {user?.userId})</p>
      <LogoutButton />
    </div>
  );
}
