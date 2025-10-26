import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../../images/logo.png'
import GoogleLoginButton from '../../components/GoogleLoginButton'


function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/customer/login', { email, password });
      const { token, customerId } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('customerId', customerId); // Store customer ID
      

      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        {/* Logo */}
        <div className="flex">
        <img src={Logo} alt="Logo" className="w-52 mb-4" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4 space-y-1">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-6 space-y-1">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button type="submit" className="w-full py-2 px-4 text-white bg-black rounded-lg hover:bg-gray-800 transition">
          Login
        </button>
        <GoogleLoginButton onSuccess={(data)=>{
          const { token, userId, fullName, email } = data;
          if (token) {
            localStorage.setItem('token', token);
            if (userId) localStorage.setItem('customerId', userId);
            navigate('/customer/dashboard');
          } else {
            const params = new URLSearchParams();
            if (fullName) params.set('name', fullName);
            if (email) params.set('email', email);
            params.set('from', 'google');
            navigate(`/customer/register?${params.toString()}`);
          }
        }} onError={(e)=> setError(e.response?.data?.error || 'Google login failed')} />
      </form>
    </div>
  );
}

export default LoginForm;
