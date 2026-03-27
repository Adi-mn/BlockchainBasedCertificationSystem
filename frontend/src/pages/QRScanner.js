import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import QrScanner from 'qr-scanner';
import toast from 'react-hot-toast';

const QRScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
        },
        {
          onDecodeError: (error) => {
            console.log('QR decode error:', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error('Failed to start scanner:', error);
      setError('Failed to access camera. Please check permissions.');
      setScanning(false);
      toast.error('Camera access denied or not available');
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanResult = (data) => {
    console.log('QR scan result:', data);

    // Strict validation: Must contain certificate or verification path
    // AND must have a valid looking MongoID (24 hex chars)
    const hasValidPath = data.includes('/certificate/') || data.includes('/verify/');
    const idMatch = data.match(/[a-fA-F0-9]{24}/);

    if (hasValidPath && idMatch) {
      stopScanning();
      const certificateId = idMatch[0];
      toast.success('Certificate QR detected');
      navigate(`/verify/${certificateId}`);
    } else {
      // If it's a completely different URL or text, show error
      console.warn('Invalid QR detected:', data);

      // Don't stop scanning immediately, just show error so user can try another
      if (!error) {
        setError('Invalid QR Code: Not a valid certificate');
        toast.error('This QR code is not from our system');
        // Clear error after 3 seconds to allow retrying
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      handleScanResult(result);
    } catch (error) {
      console.error('Failed to scan image:', error);
      toast.error('No QR code found in the image');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    // Handle both old verification URLs and new certificate URLs
    if (manualUrl.includes('/verify/')) {
      const certificateId = manualUrl.split('/verify/')[1];
      navigate(`/verify/${certificateId}`);
    } else if (manualUrl.includes('/certificate/')) {
      const certificateId = manualUrl.split('/certificate/')[1];
      navigate(`/certificate/${certificateId}`);
    } else {
      toast.error('Invalid URL format. Please use a certificate or verification URL.');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    setManualUrl('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="mt-2 text-gray-600">
          Scan QR codes to verify certificates instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Camera Scanner</h2>

          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              {scanning ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Camera preview will appear here</p>
                  </div>
                </div>
              )}

              {scanning && (
                <div className="absolute inset-0 border-2 border-primary-500 rounded-lg">
                  <div className="absolute top-4 left-4 right-4 text-center">
                    <p className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex space-x-3">
              {!scanning ? (
                <button
                  onClick={startScanning}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <Camera className="h-5 w-5" />
                  <span>Start Scanning</span>
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Stop Scanning</span>
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alternative Methods */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload QR Image</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-4">
                  Upload an image containing a QR code
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                >
                  Choose Image
                </button>
              </div>
            </div>
          </div>

          {/* Manual URL Entry */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Verification</h2>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="manualUrl" className="block text-sm font-medium text-gray-700">
                  Verification URL
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="manualUrl"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="input-field pl-10"
                    placeholder="https://example.com/verify/certificate-id"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary"
                disabled={!manualUrl.trim()}
              >
                Verify Certificate
              </button>
            </form>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Result</h2>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">QR Code Scanned</p>
                    <p className="text-sm text-green-700 mt-1 break-all">{scanResult}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={resetScanner}
                className="mt-4 w-full btn-secondary"
              >
                Scan Another Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Camera className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Camera Scanning</h3>
            <p className="text-sm text-gray-600">
              Click "Start Scanning" and point your camera at the QR code
            </p>
          </div>

          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Upload className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Image Upload</h3>
            <p className="text-sm text-gray-600">
              Upload a saved image containing a QR code from your device
            </p>
          </div>

          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Manual Entry</h3>
            <p className="text-sm text-gray-600">
              Enter the verification URL directly if you have it
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;