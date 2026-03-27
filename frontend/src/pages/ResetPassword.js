import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, CheckCircle, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [strength, setStrength] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();
    const resetToken = location.state?.resetToken;

    // 🔒 LOCK SCROLL + ESCAPE NAVBAR
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (!resetToken) {
            navigate('/login');
        }
    }, [resetToken, navigate]);

    const calculateStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 6) score += 1;
        if (pass.length > 10) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return Math.min(score, 4);
    };

    useEffect(() => {
        setStrength(calculateStrength(formData.password));
    }, [formData.password]);

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-gray-200';
        if (strength <= 2) return 'bg-red-500';
        if (strength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (strength === 0) return '';
        if (strength <= 2) return 'Weak';
        if (strength === 3) return 'Medium';
        return 'Strong';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', {
                resetToken,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            /* 🔥 FULLSCREEN FIXED SUCCESS STATE */
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
                className="flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 overflow-hidden"
            >
                {/* Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 w-full max-w-md px-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 text-center animate-scale-up">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce-slow">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Password Reset!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your password has been successfully updated. You can now login with your new credentials.
                        </p>
                        <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                            <Loader2 className="animate-spin h-4 w-4" />
                            <span>Redirecting to login...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        /* 🔥 FULLSCREEN FIXED LAYOUT */
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
            className="flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 overflow-hidden"
        >
            {/* Blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute top-20 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* COMPACT CARD: p-6 instead of p-8 */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg mb-4">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Set New Password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Create a strong password for your account
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-3 rounded-r-lg animate-fade-in-down">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all sm:text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                {/* Compact Strength Meter */}
                                {formData.password && (
                                    <div className="mt-2 transition-all duration-300">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] uppercase tracking-wide text-gray-500">Strength</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide ${strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-yellow-600' : 'text-green-600'
                                                }`}>
                                                {getStrengthText()}
                                            </span>
                                        </div>
                                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`}
                                                style={{ width: `${(strength / 4) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all sm:text-sm"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />

                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-10 flex items-center cursor-pointer outline-none"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>

                                    {formData.password && formData.confirmPassword && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            {formData.password === formData.confirmPassword ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
