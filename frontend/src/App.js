import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VerifierDashboard from './pages/VerifierDashboard';
import CertificateUpload from './pages/CertificateUpload';
import TeacherCertificateGenerator from './pages/TeacherCertificateGenerator';
import CertificateViewer from './pages/CertificateViewer';
import PublicCertificateViewer from './pages/PublicCertificateViewer';
import QRGenerator from './pages/QRGenerator';
import QRScanner from './pages/QRScanner';
import VerifyCertificate from './pages/VerifyCertificate';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
              <Route path="/qr-scan" element={<QRScanner />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/institution" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              } />

              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />

              <Route path="/verifier" element={
                <ProtectedRoute allowedRoles={['verifier']}>
                  <VerifierDashboard />
                </ProtectedRoute>
              } />

              <Route path="/upload" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <CertificateUpload />
                </ProtectedRoute>
              } />

              <Route path="/multilingual-upload" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <TeacherCertificateGenerator />
                </ProtectedRoute>
              } />

              <Route path="/certificate/:id" element={<PublicCertificateViewer />} />
              <Route path="/private/certificate/:id" element={<CertificateViewer />} />
              <Route path="/public/certificate/:id" element={<PublicCertificateViewer />} />
              <Route path="/qr-generate/:id" element={<QRGenerator />} />

              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;