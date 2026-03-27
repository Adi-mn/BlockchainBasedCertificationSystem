import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, QrCode, Shield, Calendar, User, Building, Award, ExternalLink, Globe, Share2, Copy, MessageCircle, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';
import toast from 'react-hot-toast';

const CertificateViewer = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  const { contract } = useWeb3();

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};

      console.log('Fetching certificate with ID:', id);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/certificates/${id}`, config);
      console.log('Certificate response:', response.data);
      
      setCertificate(response.data.certificate || response.data);
      
      // Fetch blockchain data if contract is available
      if (contract && (response.data.certificate?.blockchainId || response.data.blockchainId)) {
        const blockchainId = response.data.certificate?.blockchainId || response.data.blockchainId;
        const blockchainCert = await contract.getCertificateById(blockchainId);
        setBlockchainData(blockchainCert);
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  const verifyOnBlockchain = async () => {
    if (!contract || !certificate.blockchainId) {
      toast.error('Blockchain verification not available');
      return;
    }

    try {
      setVerifying(true);
      const isValid = await contract.verifyCertificate(certificate.blockchainId);
      
      if (isValid) {
        toast.success('Certificate verified on blockchain!');
      } else {
        toast.error('Certificate verification failed');
      }
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        responseType: 'blob'
      };
      
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`
        };
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/certificates/${id}/download`,
        config
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificate.certificateType}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate');
    }
  };

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/public/certificate/${id}`;
    setShareUrl(publicUrl);
    return publicUrl;
  };

  const handleShare = () => {
    const url = generateShareUrl();
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Check out my certificate: ${certificate.courseName} from ${certificate.institutionName}\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Certificate: ${certificate.courseName}`;
    const body = `I'd like to share my certificate with you:\n\nCourse: ${certificate.courseName}\nInstitution: ${certificate.institutionName}\nStudent: ${certificate.studentName}\n\nView Certificate: ${shareUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  const shareViaSocial = (platform) => {
    const text = `Check out my certificate: ${certificate.courseName} from ${certificate.institutionName}`;
    let socialUrl = '';
    
    switch (platform) {
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(socialUrl, '_blank', 'width=600,height=400');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Certificate not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The certificate you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Details</h1>
          <p className="mt-2 text-gray-600">View and verify certificate information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/qr-generate/${id}`}
            className="btn-secondary flex items-center space-x-2"
          >
            <QrCode className="h-5 w-5" />
            <span>Generate QR</span>
          </Link>
          <button
            onClick={downloadCertificate}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Download</span>
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
          <button
            onClick={verifyOnBlockchain}
            disabled={verifying}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Shield className="h-5 w-5" />
            <span>{verifying ? 'Verifying...' : 'Verify'}</span>
          </button>
        </div>
      </div>

      {/* Certificate Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Certificate Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">{certificate.certificateType}</h2>
                <p className="text-lg text-gray-600">{certificate.courseName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Student Name</p>
                    <p className="text-lg text-gray-900">{certificate.studentName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Institution</p>
                    <p className="text-lg text-gray-900">{certificate.institutionName}</p>
                  </div>
                </div>

                {certificate.grade && (
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Grade/Score</p>
                      <p className="text-lg text-gray-900">{certificate.grade}</p>
                    </div>
                  </div>
                )}

                {certificate.language && certificate.language !== 'english' && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Language</p>
                      <p className="text-lg text-gray-900 capitalize">{certificate.language}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issue Date</p>
                    <p className="text-lg text-gray-900">{formatDate(certificate.issueDate)}</p>
                  </div>
                </div>

                {certificate.expiryDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                      <p className="text-lg text-gray-900">{formatDate(certificate.expiryDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      certificate.isRevoked
                        ? 'bg-red-100 text-red-800'
                        : certificate.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {certificate.isRevoked 
                        ? 'Revoked' 
                        : certificate.isVerified 
                        ? 'Verified' 
                        : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {certificate.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <p className="text-gray-900">{certificate.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Verification & Blockchain Info */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Record</span>
                <span className="text-green-600">✓ Valid</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">IPFS Storage</span>
                <span className={certificate.ipfsHash && certificate.ipfsHash !== 'pending' ? "text-green-600" : "text-yellow-600"}>
                  {certificate.ipfsHash && certificate.ipfsHash !== 'pending' ? "✓ Stored" : "⏳ Processing"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blockchain Record</span>
                <span className={certificate.blockchainId ? "text-green-600" : "text-blue-600"}>
                  {certificate.blockchainId ? "✓ Recorded" : "📝 Ready for Blockchain"}
                </span>
              </div>
              
              {certificate.isRevoked && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Certificate Status</span>
                  <span className="text-red-600">❌ Revoked</span>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Information */}
          {blockchainData && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Details</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Certificate ID</p>
                  <p className="font-mono text-gray-900 break-all">{certificate.blockchainId}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">Issuer Address</p>
                  <p className="font-mono text-gray-900 break-all">{blockchainData.issuer}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">Issue Timestamp</p>
                  <p className="text-gray-900">{formatTimestamp(blockchainData.issueDate)}</p>
                </div>
                
                {certificate.transactionHash && (
                  <div>
                    <p className="text-gray-500">Transaction Hash</p>
                    <a
                      href={`https://polygonscan.com/tx/${certificate.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary-600 hover:text-primary-700 break-all flex items-center"
                    >
                      {certificate.transactionHash}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IPFS Information */}
          {certificate.ipfsHash && certificate.ipfsHash !== 'pending' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">IPFS Storage</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">IPFS Hash</p>
                  <p className="font-mono text-gray-900 break-all">{certificate.ipfsHash}</p>
                </div>
                
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700"
                >
                  View on IPFS
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}
          
          {certificate.ipfsHash === 'pending' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">IPFS Storage</h3>
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Processing file upload to IPFS...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Certificate</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This link can be viewed by anyone without login
                </p>
              </div>

              {/* Quick Share Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Share
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={shareViaEmail}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Email</span>
                  </button>
                  
                  <button
                    onClick={() => shareViaSocial('facebook')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                    <span>Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => shareViaSocial('twitter')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                    <span>Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => shareViaSocial('linkedin')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors col-span-2"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* Certificate Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Certificate Preview</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Course:</strong> {certificate.courseName}</p>
                  <p><strong>Student:</strong> {certificate.studentName}</p>
                  <p><strong>Institution:</strong> {certificate.institutionName}</p>
                  <p><strong>Issue Date:</strong> {formatDate(certificate.issueDate)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateViewer;