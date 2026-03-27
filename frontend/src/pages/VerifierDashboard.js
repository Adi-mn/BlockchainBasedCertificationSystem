import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Eye, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

const VerifierDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    validCertificates: 0,
    invalidCertificates: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, verificationsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/verifier/stats`),
        axios.get(`${process.env.REACT_APP_API_URL}/verifier/recent-verifications`)
      ]);

      setStats(statsRes.data);
      setRecentVerifications(verificationsRes.data.verifications || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/certificates/search?q=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(response.data.certificates || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const verifyCertificate = async (certificateId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/certificates/${certificateId}/verify`);

      // Update the search results with verification status
      setSearchResults(prev =>
        prev.map(cert =>
          cert._id === certificateId
            ? { ...cert, verificationStatus: response.data.isValid ? 'valid' : 'invalid' }
            : cert
        )
      );

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Helper for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700';
      case 'invalid': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <>
      <style>{`
        /* Prevent horizontal scroll globally caused by 100vw breakout */
        html, body {
          overflow-x: hidden;
          width: 100%;
        }

        @keyframes liquidFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .gradient-bg {
          background: linear-gradient(-45deg, #4c1d95, #1e40af, #0f766e, #312e81);
          background-size: 400% 400%;
          animation: liquidFlow 15s ease infinite;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .dashboard-container {
          min-height: 100vh;
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          padding-left: max(env(safe-area-inset-left), 1rem); 
          padding-right: max(env(safe-area-inset-right), 1rem);
          margin-top: -2rem;
          padding-top: 3rem;
          padding-bottom: 2rem;
          overflow-x: hidden;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }
      `}</style>

      <div>
        <div className="dashboard-container gradient-bg">
          <div className="space-y-8 p-6 max-w-7xl mx-auto pt-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in-up">
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">Verifier Dashboard</h1>
                <p className="text-blue-100 mt-1 font-medium">Verify credentials and manage verification history</p>
              </div>
              <Link
                to="/qr-scan"
                className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white font-semibold flex items-center gap-2 hover:bg-white/30 transition-all hover:-translate-y-0.5"
              >
                <QrCode className="h-5 w-5" />
                <span>Scan QR Code</span>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Verifications', value: stats.totalVerifications, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Valid Certificates', value: stats.validCertificates, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Invalid Certificates', value: stats.invalidCertificates, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="glass-panel rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-700 font-medium mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search Section */}
            <div className="glass-panel rounded-2xl p-8 shadow-lg fade-in-up" style={{ animationDelay: '450ms' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Search & Verify Certificates</h2>

              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by certificate ID, student name, or email..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Search Results</h3>
                  <div className="space-y-4">
                    {searchResults.map((certificate) => (
                      <div key={certificate._id} className="bg-white/50 rounded-xl p-5 border border-indigo-100 hover:border-indigo-300 transition-colors shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {certificate.certificateType}
                              </h4>
                              {getStatusIcon(certificate.verificationStatus)}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-8 text-sm text-gray-600">
                              <p><span className="font-semibold text-gray-500">Student:</span> {certificate.studentName}</p>
                              <p><span className="font-semibold text-gray-500">Email:</span> {certificate.studentEmail}</p>
                              <p><span className="font-semibold text-gray-500">Institution:</span> {certificate.institutionName}</p>
                              <p><span className="font-semibold text-gray-500">Issued:</span> {formatDate(certificate.issueDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(certificate.verificationStatus)
                              }`}>
                              {certificate.verificationStatus || 'Unverified'}
                            </span>
                            <Link
                              to={`/certificate/${certificate._id}`}
                              className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-all"
                              title="View"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => verifyCertificate(certificate._id)}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Verifications */}
            <div className="glass-panel rounded-2xl p-8 shadow-lg fade-in-up" style={{ animationDelay: '600ms' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

              {recentVerifications.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400 opacity-50" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No verifications yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    History of your verified certificates will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVerifications.map((verification, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/60 hover:bg-white/80 rounded-xl transition-colors border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          {getStatusIcon(verification.status)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {verification.certificateType}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {verification.studentName} • {formatDate(verification.verifiedAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(verification.status).replace('bg-', 'bg-opacity-10 border-')
                        }`}>
                        {verification.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default VerifierDashboard;