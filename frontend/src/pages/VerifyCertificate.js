import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, AlertTriangle, User, Building, Calendar, Award, ExternalLink } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [blockchainVerification, setBlockchainVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { contract } = useWeb3();

  useEffect(() => {
    verifyCertificate();
  }, [certificateId, contract]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Verify certificate exists in database
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/certificates/${certificateId}/verify`);
      const certData = response.data;
      setCertificate(certData);

      if (!certData.exists) {
        setVerificationStatus('invalid');
        setError('Certificate not found in our records');
        return;
      }

      // Step 2: Verify on blockchain if available
      if (contract && certData.certificate.blockchainId) {
        try {
          const isValidOnBlockchain = await contract.verifyCertificate(certData.certificate.blockchainId);
          const blockchainCert = await contract.getCertificateById(certData.certificate.blockchainId);

          setBlockchainVerification({
            isValid: isValidOnBlockchain,
            data: blockchainCert
          });

          if (isValidOnBlockchain) {
            setVerificationStatus('valid');
          } else {
            setVerificationStatus('invalid');
            setError('Certificate verification failed on blockchain');
          }
        } catch (blockchainError) {
          console.error('Blockchain verification failed:', blockchainError);
          setVerificationStatus('warning');
          setError('Blockchain verification unavailable, but certificate exists in database');
        }
      } else {
        // If certificate is verified in database, show as valid even without blockchain
        if (certData.certificate.isVerified) {
          setVerificationStatus('valid');
        } else {
          setVerificationStatus('warning');
          setError('Certificate pending verification');
        }
      }

      // Log verification attempt
      await axios.post(`${process.env.REACT_APP_API_URL}/certificates/${certificateId}/log-verification`);

    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('invalid');
      setError(error.response?.data?.message || 'Certificate verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'valid':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-16 w-16 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-16 w-16 text-yellow-600" />;
      default:
        return <Shield className="h-16 w-16 text-gray-400 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'invalid':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'valid':
        return 'Certificate Verified ✓';
      case 'invalid':
        return 'Certificate Invalid ✗';
      case 'warning':
        return 'Certificate Pending ⏳';
      default:
        return 'Verifying Certificate...';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Verification Status Header */}
        <div className={`card border-2 ${getStatusColor()} mb-8`}>
          <div className="text-center">
            {getStatusIcon()}
            <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
              {getStatusTitle()}
            </h1>
            {error && (
              <p className="text-lg text-gray-600 mb-4">{error}</p>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Certificate ID: {certificateId}
            </p>

            {/* Action Buttons for Invalid/Warning State */}
            {(verificationStatus === 'invalid' || verificationStatus === 'warning') && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.href = '/scan-qr'}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Scan Another
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Home
                </button>
              </div>
            )}
          </div>
        </div>

        {certificate?.certificate && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Certificate Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Award className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {certificate.certificate.certificateType}
                    </h2>
                    <p className="text-lg text-gray-600">
                      {certificate.certificate.courseName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Student Name</p>
                        <p className="text-lg text-gray-900">{certificate.certificate.studentName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Institution</p>
                        <p className="text-lg text-gray-900">{certificate.certificate.institutionName}</p>
                      </div>
                    </div>

                    {certificate.certificate.grade && (
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Grade/Score</p>
                          <p className="text-lg text-gray-900">{certificate.certificate.grade}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Issue Date</p>
                        <p className="text-lg text-gray-900">
                          {formatDate(certificate.certificate.issueDate)}
                        </p>
                      </div>
                    </div>

                    {certificate.certificate.expiryDate && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                          <p className="text-lg text-gray-900">
                            {formatDate(certificate.certificate.expiryDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Verification Status</p>
                        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${verificationStatus === 'valid'
                            ? 'bg-green-100 text-green-800'
                            : verificationStatus === 'invalid'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {verificationStatus === 'valid' ? 'Verified' :
                            verificationStatus === 'invalid' ? 'Invalid' : 'Partial'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {certificate.certificate.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                    <p className="text-gray-900">{certificate.certificate.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Details */}
            <div className="space-y-6">
              {/* Verification Checklist */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Checklist</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Record</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">IPFS Storage</span>
                    {certificate.certificate.ipfsHash ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Blockchain Record</span>
                    {blockchainVerification?.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : blockchainVerification === null ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Blockchain Information */}
              {blockchainVerification?.data && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Details</h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Certificate ID</p>
                      <p className="font-mono text-gray-900 break-all">
                        {certificate.certificate.blockchainId}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Issuer Address</p>
                      <p className="font-mono text-gray-900 break-all">
                        {blockchainVerification.data.issuer}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Issue Timestamp</p>
                      <p className="text-gray-900">
                        {formatTimestamp(blockchainVerification.data.issueDate)}
                      </p>
                    </div>

                    {certificate.certificate.transactionHash && (
                      <div>
                        <p className="text-gray-500">Transaction Hash</p>
                        <a
                          href={`https://polygonscan.com/tx/${certificate.certificate.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-primary-600 hover:text-primary-700 break-all flex items-center"
                        >
                          {certificate.certificate.transactionHash}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* IPFS Information */}
              {certificate.certificate.ipfsHash && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">IPFS Storage</h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">IPFS Hash</p>
                      <p className="font-mono text-gray-900 break-all">
                        {certificate.certificate.ipfsHash}
                      </p>
                    </div>

                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${certificate.certificate.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                      View Original Document
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
              )}

              {/* Verification Timestamp */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Info</h3>

                <div className="text-sm text-gray-600">
                  <p>Verified on: {new Date().toLocaleString()}</p>
                  <p className="mt-2">
                    This verification was performed using blockchain technology
                    and cryptographic hashing to ensure authenticity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by blockchain technology for secure certificate verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;