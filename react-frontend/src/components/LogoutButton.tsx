
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        localStorage.removeItem('loggedInUser');
        navigate('/login', { replace: true });
      }}
    >
      Logout
    </button>
  );
}
