import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, QrCode, Download, Calendar, Award, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    verifiedCertificates: 0,
    pendingCertificates: 0
  });
  const [loading, setLoading] = useState(true);
  const [showRevocationAlert, setShowRevocationAlert] = useState(false);
  const [revokedCertificates, setRevokedCertificates] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      console.log('Fetching student dashboard data with token:', token ? 'Present' : 'Missing');

      const [certificatesRes, statsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/certificates/student`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/certificates/student/stats`, config)
      ]);

      console.log('Student certificates response:', certificatesRes.data);
      console.log('Student stats response:', statsRes.data);

      const allCerts = certificatesRes.data.certificates || [];

      // Extra safety: Filter out revoked certificates on client side too
      const activeCerts = allCerts.filter(cert => !cert.isRevoked);
      setCertificates(activeCerts);
      setStats(statsRes.data);

      // Check for revoked certificates and show one-time notification
      const revokedCerts = allCerts.filter(cert => cert.isRevoked);
      const userEmail = localStorage.getItem('userEmail') || 'user';
      const revocationKey = `revocationNotified_${userEmail}`;

      if (revokedCerts.length > 0 && !localStorage.getItem(revocationKey)) {
        setRevokedCertificates(revokedCerts);
        setShowRevocationAlert(true);
        localStorage.setItem(revocationKey, 'true');

        // Show toast notification as well
        toast.error(`${revokedCerts.length} certificate(s) have been revoked. Please contact your institution.`, {
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadCertificate = async (certificateId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/certificates/${certificateId}/download`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download certificate:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Color configuration
  const colorConfig = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-50', iconText: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-50', iconText: 'text-yellow-600' }
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

            {/* Revocation Alert */}
            {showRevocationAlert && (
              <div className="glass-panel border-l-4 border-red-500 p-4 mb-6 rounded-r-xl animate-bounce-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-bold text-red-800">Certificate Revocation Notice</h3>
                    <div className="mt-2 text-sm text-red-700 font-medium">
                      <p>
                        {revokedCertificates.length === 1
                          ? 'Your certificate has been removed by the institution.'
                          : `${revokedCertificates.length} of your certificates have been removed by the institutions.`
                        }
                      </p>
                      <button
                        onClick={() => setShowRevocationAlert(false)}
                        className="mt-2 text-xs uppercase tracking-wide text-red-600 hover:text-red-800 font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in-up">
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">My Certificates</h1>
                <p className="text-blue-100 mt-1 font-medium">View and manage your verified credentials</p>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white font-medium flex items-center gap-2">
                <Award className="h-5 w-5" />
                Student Dashboard
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Certificates', value: stats.totalCertificates, icon: FileText, color: 'blue' },
                { label: 'Verified', value: stats.verifiedCertificates, icon: Award, color: 'green' },
                { label: 'Pending', value: stats.pendingCertificates, icon: Calendar, color: 'yellow' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="glass-panel rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorConfig[stat.color].bg}`}>
                      <stat.icon className={`h-6 w-6 ${colorConfig[stat.color].text}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-700 font-medium mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certificates Grid */}
            <div className="fade-in-up" style={{ animationDelay: '450ms' }}>
              <h2 className="text-xl font-bold text-white mb-6 drop-shadow-sm">Your Certificates</h2>

              {certificates.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 opacity-50" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No certificates found</h3>
                  <p className="mt-2 text-gray-600 font-medium">
                    Your certificates will appear here once they are issued.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate, index) => (
                    <div
                      key={certificate._id}
                      className="glass-panel rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 fade-in-up"
                      style={{ animationDelay: `${index * 100 + 500}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Award className="h-6 w-6 text-indigo-600" />
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${certificate.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {certificate.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                        {certificate.certificateType}
                      </h3>
                      <p className="text-sm text-gray-700 font-medium mb-3">{certificate.courseName}</p>

                      <div className="py-3 border-t border-gray-200/50 border-b mb-4 space-y-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Issued By</p>
                        <p className="text-sm text-gray-800 font-semibold">{certificate.institutionName}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(certificate.issueDate)}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          to={`/certificate/${certificate._id}`}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center text-sm font-semibold py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> View
                        </Link>
                        <Link
                          to={`/qr-generate/${certificate._id}`}
                          className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="QR Code"
                        >
                          <QrCode className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => downloadCertificate(certificate._id, `${certificate.certificateType}.pdf`)}
                          className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
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

export default StudentDashboard;