import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ user, onLogout }) {
  return (
    <div className="layout-container">
      <Navbar user={user} onLogout={onLogout} />
      <main className="container" style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
