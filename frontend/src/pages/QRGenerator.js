import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QrCode, Download, Share2, Copy, Check } from 'lucide-react';
import QRCodeLib from 'qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';

const QRGenerator = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchCertificateAndGenerateQR();
  }, [id]);

  const fetchCertificateAndGenerateQR = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      } : {};

      console.log('Fetching certificate for QR generation with ID:', id);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/certificates/${id}`, config);
      console.log('QR Generator certificate response:', response.data);

      const certificateData = response.data.certificate || response.data;
      setCertificate(certificateData);

      // Generate certificate URL (mobile-friendly)
      const certificateUrl = `${window.location.origin}/certificate/${id}`;
      setVerificationUrl(certificateUrl);

      // Generate QR code
      await generateQRCode(certificateUrl, certificateData);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (url, certificateData) => {
    // Construct Rich Payload to match PDF
    const issueDateStr = new Date(certificateData.issueDate).toLocaleDateString();
    const gradeStr = certificateData.grade ? `Grade: ${certificateData.grade}\n` : "";
    const qrPayload = `Student: ${certificateData.studentName}\nCourse: ${certificateData.courseName}\nCertificate ID: ${certificateData._id}\nIssue Date: ${issueDateStr}\n${gradeStr}Verify: ${url}`;

    try {
      const canvas = canvasRef.current;

      if (!canvas) {
        console.error('Canvas ref not available, using fallback');
        // Don't show error to user, just use fallback method
        const qrDataUrl = await QRCodeLib.toDataURL(qrPayload, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeUrl(qrDataUrl);
        return;
      }

      console.log('Generating QR code for Payload:', qrPayload);

      await QRCodeLib.toCanvas(canvas, qrPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      // Convert canvas to data URL for download
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeUrl(dataUrl);

      console.log('QR code generated successfully');
    } catch (error) {
      console.error('Failed to generate QR code:', error);

      // Fallback: Generate QR code as data URL directly
      try {
        console.log('Trying fallback QR generation...');
        // Use constructed payload for fallback too
        const qrDataUrl = await QRCodeLib.toDataURL(qrPayload, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });

        setQrCodeUrl(qrDataUrl);

        // Create an image and draw it on canvas
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 300;
            ctx.drawImage(img, 0, 0, 300, 300);
          }
        };
        img.src = qrDataUrl;

        console.log('Fallback QR code generated successfully');
      } catch (fallbackError) {
        console.error('Fallback QR generation also failed:', fallbackError);
        toast.error('Failed to generate QR code');
      }
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `certificate-qr-${certificate?.studentName?.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('QR code downloaded successfully');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast.success('Verification URL copied to clipboard');

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy URL');
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate Verification - ${certificate?.studentName}`,
          text: `Verify certificate for ${certificate?.studentName}`,
          url: verificationUrl
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      copyToClipboard();
    }
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
        <QrCode className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Certificate not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to generate QR code for this certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="mt-2 text-gray-600">
          Generate and share QR code for certificate verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification QR Code</h2>

          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadQRCode}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download QR Code</span>
            </button>

            <button
              onClick={shareQRCode}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Share2 className="h-5 w-5" />
              <span>Share QR Code</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>How to use:</strong> Anyone can scan this QR code with their phone camera
              or QR scanner app to instantly verify the certificate's authenticity.
            </p>
          </div>
        </div>

        {/* Certificate Information */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Certificate Details</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Student Name</p>
                <p className="text-lg text-gray-900">{certificate.studentName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Certificate Type</p>
                <p className="text-lg text-gray-900">{certificate.certificateType}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Course/Program</p>
                <p className="text-lg text-gray-900">{certificate.courseName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Institution</p>
                <p className="text-lg text-gray-900">{certificate.institutionName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Verification URL */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification URL</h2>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={verificationUrl}
                readOnly
                className="flex-1 input-field font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="btn-secondary p-2"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              This URL can be shared directly or embedded in the QR code above.
            </p>
          </div>

          {/* Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <Link
                to={`/certificate/${id}`}
                className="w-full btn-secondary text-center block"
              >
                View Certificate Details
              </Link>

              <Link
                to={`/verify/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-secondary text-center block"
              >
                Test Verification Page
              </Link>

              <Link
                to="/qr-scan"
                className="w-full btn-secondary text-center block"
              >
                Test QR Scanner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Instructions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Generate QR Code</h3>
            <p className="text-sm text-gray-600">
              Download or share the QR code containing the verification URL
            </p>
          </div>

          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Share with Verifiers</h3>
            <p className="text-sm text-gray-600">
              Provide the QR code to employers, institutions, or other verifiers
            </p>
          </div>

          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Instant Verification</h3>
            <p className="text-sm text-gray-600">
              Verifiers scan the code to instantly check certificate authenticity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;