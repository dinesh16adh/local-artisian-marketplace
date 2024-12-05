import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/auth/log-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      // Check for valid JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response from server');
      }
  
      // Check for successful response
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
  
      const data = await response.json();
      const { user } = data;
       // Construct fullName from firstName, middleName, and lastName
       const fullName = [
         user.firstName,
         user.middleName || '', // Handle middleName being optional
         user.lastName,
       ]
         .filter(Boolean) // Remove any empty strings
         .join(' '); // Join non-empty parts with a space
      // Save user details and role in localStorage
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: user.id,
          fullName: fullName || user.username, // Fallback to username if no names are provided
          email: user.email,
          role: user.role, // Save the role ('user' or 'seller')
        })
      );
  
      setIsLoggedIn(true);
  
      // Redirect based on role
      if (user.role === 'seller') {
        localStorage.setItem('isSeller', 'true'); // Mark as seller
        navigate('/'); // Redirect to seller dashboard
        window.location.reload(); // Refresh the page to apply changes
      } else {
        localStorage.removeItem('isSeller'); // Ensure non-sellers don't have seller flag
        const redirectTo = location.state?.redirectTo || '/';
        navigate(redirectTo); // Redirect buyers to intended page or home
        window.location.reload();
        window.scrollTo(0, 0); // Scroll to top of the page        
      }
  
      window.scrollTo(0, 0); // Scroll to top of the page
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-600 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your email"
            required
          />

          <label className="block text-gray-600 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your password"
            required
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
          >
            Log In
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
