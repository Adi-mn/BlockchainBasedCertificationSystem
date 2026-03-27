import React, { useState, useEffect } from 'react';
import { Users, Building, FileText, Shield, TrendingUp, Activity, Check, X, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstitutions: 0,
    totalCertificates: 0,
    totalVerifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const [statsRes, activityRes, usersRes, certificatesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/recent-activity`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/certificates?limit=20`, config)
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data.activities || []);
      setUsers(usersRes.data.users || []);
      setCertificates(certificatesRes.data.certificates || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.REACT_APP_API_URL}/admin/users/${userId}/status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const verifyCertificate = async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/certificates/${certificateId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Certificate verified successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      toast.error('Failed to verify certificate');
    }
  };

  const revokeCertificate = async (certificateId) => {
    const reason = prompt('Please enter the reason for revoking this certificate:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/certificates/${certificateId}/revoke`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Certificate revoked successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      toast.error('Failed to revoke certificate');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-white drop-shadow-md">Admin Dashboard</h1>
                <div className="flex items-center space-x-2 text-blue-100 mt-1 font-medium">
                  <Activity className="h-4 w-4" />
                  <span>System Status: Active</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Institutions', value: stats.totalInstitutions, icon: Building, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Certificates', value: stats.totalCertificates, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Verifications', value: stats.totalVerifications, icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="glass-panel rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="glass-panel rounded-2xl p-6 shadow-lg fade-in-up" style={{ animationDelay: '400ms' }}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-white/60 hover:bg-white/80 rounded-xl transition-colors border border-gray-100">
                      <div className="p-2 bg-indigo-50 rounded-full">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Management */}
              <div className="glass-panel rounded-2xl p-6 shadow-lg fade-in-up" style={{ animationDelay: '500ms' }}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-white/60 hover:bg-white/80 rounded-xl transition-colors border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize font-medium">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUserStatusToggle(user._id, user.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${user.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certificate Management */}
            <div className="glass-panel rounded-2xl p-6 shadow-lg mt-6 fade-in-up" style={{ animationDelay: '600ms' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Certificate Management</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200/50">
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/40 divide-y divide-gray-200/50">
                    {certificates.map((certificate) => (
                      <tr key={certificate._id} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{certificate.studentName}</div>
                          <div className="text-sm text-gray-500">{certificate.studentEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{certificate.courseName}</div>
                          <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">{certificate.certificateType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {certificate.institutionName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${certificate.isVerified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {certificate.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(`/certificate/${certificate._id}`, '_blank')}
                              className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {!certificate.isVerified ? (
                              <button
                                onClick={() => verifyCertificate(certificate._id)}
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                                title="Verify"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => revokeCertificate(certificate._id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;