import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { LogOut, Wallet, User, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}`;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">CertVerify</span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to={getDashboardLink()} 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Dashboard
              </Link>
              
              {user.role === 'institution' && (
                <Link 
                  to="/upload" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Upload Certificate
                </Link>
              )}
              
              <Link 
                to="/qr-scan" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Scan QR
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Web3 Connection */}
                {isConnected ? (
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      {formatAddress(account)}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm">Connect Wallet</span>
                  </button>
                )}

                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;