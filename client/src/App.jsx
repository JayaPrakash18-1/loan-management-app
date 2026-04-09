import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LenderHub from './pages/LenderHub';
import BorrowerHub from './pages/BorrowerHub';
import History from './pages/History';
import Layout from './components/Layout';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <Login onLogin={login} /> : <Navigate to="/" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={token ? <Layout user={user} onLogout={logout} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/lender" element={<LenderHub token={token} />} />
          <Route path="/borrower" element={<BorrowerHub token={token} />} />
          <Route path="/history" element={<History token={token} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
