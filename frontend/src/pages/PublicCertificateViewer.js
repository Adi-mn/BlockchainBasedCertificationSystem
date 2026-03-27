import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Shield, Award, Share2, Copy, MessageCircle, Mail, Facebook, Twitter, Linkedin, CheckCircle, XCircle, AlertCircle, Download, User, Building, Calendar, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../utils/apiConfig';

const PublicCertificateViewer = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetchPublicCertificate();
  }, [id]);

  const fetchPublicCertificate = async () => {
    try {
      console.log('🔍 Fetching public certificate with ID:', id);
      console.log('🌐 Using API URL:', API_URL);

      const fullUrl = `${API_URL}/certificates/public/${id}`;
      console.log('📡 Full request URL:', fullUrl);

      const response = await axios.get(fullUrl, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Public certificate response:', response.data);
      setCertificate(response.data.certificate);

    } catch (error) {
      console.error('❌ Failed to fetch public certificate:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });

      // More specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
        toast.error('Cannot connect to server. Please check your network connection.');
      } else if (error.response?.status === 404) {
        toast.error('Certificate not found');
      } else {
        toast.error('Certificate not found or not available for public viewing');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateShareUrl = () => {
    const currentUrl = window.location.href;
    setShareUrl(currentUrl);
    return currentUrl;
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
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard!');
      } catch (execError) {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Check out this certificate: ${certificate.courseName} from ${certificate.institutionName}\\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Certificate: ${certificate.courseName}`;
    const body = `I'd like to share this certificate with you:\\n\\nCourse: ${certificate.courseName}\\nInstitution: ${certificate.institutionName}\\nStudent: ${certificate.studentName}\\n\\nView Certificate: ${shareUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  const shareViaSocial = (platform) => {
    const text = `Check out this certificate: ${certificate.courseName} from ${certificate.institutionName}`;
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

  const downloadCertificate = async () => {
    try {
      console.log('📥 Starting certificate download...');
      console.log('🌐 Download URL:', `${API_URL}/certificates/${id}/public-download`);

      const response = await axios.get(`${API_URL}/certificates/${id}/public-download`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout for download
        headers: {
          'Accept': 'application/pdf'
        }
      });

      console.log('✅ Download response received:', response.data.size, 'bytes');

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.studentName}_${certificate.courseName}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('❌ Download failed:', error);
      console.error('🔍 Download error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });

      if (error.response?.status === 403) {
        toast.error('Certificate must be verified before download');
      } else if (error.code === 'ECONNREFUSED') {
        toast.error('Cannot connect to server for download');
      } else {
        toast.error('Failed to download certificate. Please try again.');
      }
    }
  };

  const getStatusIcon = () => {
    if (certificate.isRevoked) {
      return <XCircle className="h-6 w-6 text-red-500" />;
    } else if (certificate.isVerified) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else {
      return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (certificate.isRevoked) {
      return 'Revoked';
    } else if (certificate.isVerified) {
      return 'Verified';
    } else {
      return 'Pending Verification';
    }
  };

  const getStatusColor = () => {
    if (certificate.isRevoked) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (certificate.isVerified) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-2xl font-medium text-gray-900">Certificate not found</h3>
          <p className="mt-2 text-gray-500">
            The certificate you're looking for doesn't exist or is not available for public viewing.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Certificate Verification</h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">Public certificate view</p>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={downloadCertificate}
                className="flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
              >
                <Download className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>Download</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
              >
                <Share2 className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>Share</span>
              </button>
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm lg:text-base"
              >
                <span>Platform</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Only Certificate Card */}
      <div className="lg:hidden px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Badge - Mobile Only */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-center">
              <div className={`inline-flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm sm:text-base">{getStatusText()}</span>
              </div>
            </div>
          </div>

          {/* Mobile Certificate Content */}
          <div className="p-4 sm:p-6">
            {/* Certificate Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{certificate.certificateType}</h2>
              <p className="text-base sm:text-lg text-blue-600 font-semibold px-2">{certificate.courseName}</p>
            </div>

            {/* Student Name - Mobile */}
            <div className="text-center mb-6">
              <p className="text-sm sm:text-base text-gray-600 mb-2">This is to certify that</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-3 px-2 break-words">{certificate.studentName}</h3>
              <p className="text-sm sm:text-base text-gray-600">has successfully completed the course</p>
            </div>

            {/* Mobile Certificate Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Student:</span>
                  <span className="font-semibold text-gray-900 text-right flex-1 ml-2 break-words">{certificate.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Institution:</span>
                  <span className="font-semibold text-gray-900 text-right flex-1 ml-2 break-words">{certificate.institutionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Issue Date:</span>
                  <span className="font-semibold text-gray-900">{formatDate(certificate.issueDate)}</span>
                </div>
                {certificate.grade && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Grade:</span>
                    <span className="font-semibold text-gray-900">{certificate.grade}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium mb-1">Certificate ID:</span>
                  <span className="font-mono text-xs text-gray-700 break-all bg-white p-2 rounded border">{certificate._id}</span>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={downloadCertificate}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Download Certificate</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Certificate</span>
              </button>
              <Link
                to="/"
                className="block text-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Go to Platform
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original Design */}
      <div className="hidden lg:block max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Certificate Details - Desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Certificate Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{certificate.certificateType}</h2>
                <p className="text-xl text-gray-600">{certificate.courseName}</p>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-6">
                <div>
                  <p className="text-lg text-gray-600 mb-2">This is to certify that</p>
                  <h3 className="text-4xl font-bold text-blue-600 mb-4">{certificate.studentName}</h3>
                  <p className="text-lg text-gray-600">has successfully completed the course</p>
                </div>

                <div className="py-6">
                  <h4 className="text-2xl font-semibold text-green-600">{certificate.courseName}</h4>
                  {certificate.grade && (
                    <p className="text-lg text-gray-700 mt-2">
                      <span className="font-semibold">Grade:</span> {certificate.grade}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Issued by:</span> {certificate.institutionName}
                  </p>
                  <p className="text-gray-600 mt-2">
                    <span className="font-semibold">Date of Issue:</span> {formatDate(certificate.issueDate)}
                  </p>
                  {certificate.expiryDate && (
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Valid Until:</span> {formatDate(certificate.expiryDate)}
                    </p>
                  )}
                </div>

                {/* Newly Added - Structured Verified Details Table */}
                <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100 text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    Verified Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Student Name</p>
                      <p className="font-semibold text-gray-900">{certificate.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">University / Institute</p>
                      <p className="font-semibold text-gray-900">{certificate.institutionName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Course Name</p>
                      <p className="font-semibold text-gray-900">{certificate.courseName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Certificate ID</p>
                      <p className="font-mono text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded border inline-block break-all">
                        {certificate._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                      <p className="font-medium text-gray-900">{formatDate(certificate.issueDate)}</p>
                    </div>
                    {certificate.grade && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Grade</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {certificate.grade}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Verification Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${certificate.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {certificate.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>


                {certificate.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-700">{certificate.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Sidebar - Desktop */}
          <div className="space-y-6">
            {/* Verification Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Verification Status
              </h3>

              <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getStatusColor()}`}>
                {getStatusIcon()}
                <div>
                  <p className="font-semibold">{getStatusText()}</p>
                  <p className="text-sm opacity-75">
                    {certificate.isRevoked
                      ? 'This certificate has been revoked and is no longer valid'
                      : certificate.isVerified
                        ? 'This certificate has been verified and is authentic'
                        : 'This certificate is pending verification'
                    }
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database Record</span>
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valid
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">IPFS Storage</span>
                  <span className={certificate.ipfsHash && certificate.ipfsHash !== 'pending' ? "text-green-600" : "text-yellow-600"}>
                    {certificate.ipfsHash && certificate.ipfsHash !== 'pending' ? (
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Stored
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Processing
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Blockchain</span>
                  <span className={certificate.blockchainId && certificate.blockchainId !== 'pending' ? "text-green-600" : "text-yellow-600"}>
                    {certificate.blockchainId && certificate.blockchainId !== 'pending' ? (
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Processing
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Details - Desktop Sidebar */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Student</p>
                    <p className="text-gray-600">{certificate.studentName}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Institution</p>
                    <p className="text-gray-600">{certificate.institutionName}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Issue Date</p>
                    <p className="text-gray-600">{formatDate(certificate.issueDate)}</p>
                  </div>
                </div>

                {certificate.language && certificate.language !== 'english' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Language</p>
                      <p className="text-gray-600 capitalize">{certificate.language}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Certificate ID</p>
                    <p className="text-gray-600 font-mono text-xs break-all">{certificate._id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics - Desktop */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{certificate.viewCount || 0}</p>
                  <p className="text-sm text-blue-600">Views</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{certificate.verificationCount || 0}</p>
                  <p className="text-sm text-green-600">Verifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Mobile-Optimized Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Share Certificate</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Shareable Link
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This link can be viewed by anyone
                </p>
              </div>

              {/* Quick Share Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Share Options
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex items-center justify-center space-x-3 px-4 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Share via WhatsApp</span>
                  </button>

                  <button
                    onClick={shareViaEmail}
                    className="flex items-center justify-center space-x-3 px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">Share via Email</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => shareViaSocial('facebook')}
                      className="flex flex-col items-center justify-center space-y-2 px-3 py-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="text-xs font-medium">Facebook</span>
                    </button>

                    <button
                      onClick={() => shareViaSocial('twitter')}
                      className="flex flex-col items-center justify-center space-y-2 px-3 py-4 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-xs font-medium">Twitter</span>
                    </button>

                    <button
                      onClick={() => shareViaSocial('linkedin')}
                      className="flex flex-col items-center justify-center space-y-2 px-3 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-xs font-medium">LinkedIn</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Certificate Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3 text-center">Certificate Preview</h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Course:</span>
                    <span className="text-gray-900 font-semibold text-right flex-1 ml-2">{certificate.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Student:</span>
                    <span className="text-gray-900 font-semibold text-right flex-1 ml-2">{certificate.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Institution:</span>
                    <span className="text-gray-900 font-semibold text-right flex-1 ml-2">{certificate.institutionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="text-gray-900 font-semibold">{formatDate(certificate.issueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 sm:px-6 rounded-b-xl">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
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

export default PublicCertificateViewer;