import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Key, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // 🔒 LOCK SCROLL + ESCAPE NAVBAR
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Redirect safety
  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  // OTP timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/verify-otp',
        { email, otp }
      );
      navigate('/reset-password', {
        state: { resetToken: res.data.resetToken },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await axios.post(
        'http://localhost:5000/api/auth/forgot-password',
        { email }
      );
      setTimer(60);
      toast.success('OTP resent successfully');
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (t) =>
    `00:${t.toString().padStart(2, '0')}`;

  return (
    /* 🔥 FORCE FULLSCREEN */
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 overflow-hidden"
    >
      {/* Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Verify OTP
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Code sent to
            </p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
              {email}
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code
              </label>
              <div className="relative max-w-xs mx-auto">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Verifying…' : 'Verify & Proceed'}
            </button>

            <div className="flex justify-between items-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Email
              </Link>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={timer > 0 || resending}
                className={`text-sm font-medium ${
                  timer > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {resending ? (
                  <Loader2 className="inline h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="inline h-3 w-3 mr-1" />
                )}
                {timer > 0
                  ? `Resend in ${formatTime(timer)}`
                  : 'Resend Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
