import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  /* 🔒 LOCK SCROLL */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  /* 🔁 Redirect if logged in */
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate(`/${result.user.role}`);
    }

    setLoading(false);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 overflow-hidden"
    >
      {/* 🔮 Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000 -translate-x-1/2 -translate-y-1/2"></div>

      {/* 🪟 GLASS CARD */}
      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 transition-all duration-500 hover:scale-[1.01]">

          {/* 🔰 Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 shadow-lg mb-3">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              🔐 Sign in to verify certificates
            </p>
          </div>

          {/* 📋 FORM */}
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* 📧 Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white/60 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            {/* 🔑 Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 bg-white/60 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  🔑 Forgot your password?
                </Link>
              </div>
            </div>

            {/* 🔵 Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* 🆕 Signup */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>

          {/* 🧪 DEMO ACCOUNTS */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
              🧪 DEMO ACCESS
            </h3>

            <div className="bg-indigo-50/60 rounded-lg p-3 border border-indigo-100">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                {[
                  ['Admin', 'admin@demo.com'],
                  ['Institution', 'institution@demo.com'],
                  ['Student', 'student@demo.com'],
                  ['Verifier', 'verifier@demo.com']
                ].map(([role, email]) => (
                  <div key={role} className="bg-white p-1.5 rounded border shadow-sm text-center">
                    <span className="block font-semibold text-indigo-700">{role}</span>
                    <span className="text-[10px]">{email}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-indigo-400 text-center mt-2 font-medium">
                Pass: password123
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
