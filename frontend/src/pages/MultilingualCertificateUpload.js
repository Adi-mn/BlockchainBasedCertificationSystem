import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, User, Calendar, Award, Loader, Globe, Eye, Check, Languages } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';
import toast from 'react-hot-toast';

// Static list of 90+ languages with Grouping
const languageGroups = {
  "Indian Languages": [
    "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Gujarati", "Punjabi", "Urdu",
    "Assamese", "Odia", "Sanskrit", "Nepali", "Konkani", "Maithili", "Manipuri", "Dogri", "Bodo", "Santali",
    "Kashmiri", "Sindhi", "Bhojpuri", "Magahi", "Awadhi", "Rajasthani", "Haryanvi", "Tulu", "Kodava", "Mizo",
    "Khasi", "Garo", "Tripuri", "Nagamese", "Bhili", "Ladakhi", "Garhwali", "Kumaoni", "Chhattisgarhi",
    "Surjapuri", "Angika", "Ho", "Kurukh", "Mundari", "Nicobarese", "Lepcha", "Bhutia", "Sherpa", "Toda",
    "Irula", "Kurumba"
  ],
  "International Languages": [
    "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Ukrainian", "Polish", "Czech",
    "Slovak", "Hungarian", "Greek", "Swedish", "Norwegian", "Danish", "Finnish", "Icelandic", "Irish", "Welsh",
    "Scottish Gaelic", "Romanian", "Bulgarian", "Serbian", "Croatian", "Slovenian", "Bosnian", "Albanian",
    "Lithuanian", "Latvian", "Chinese", "Japanese", "Korean", "Thai", "Vietnamese", "Indonesian", "Malay",
    "Filipino", "Burmese", "Khmer", "Lao", "Sinhala", "Arabic", "Hebrew", "Persian", "Turkish", "Pashto",
    "Kurdish", "Swahili", "Esperanto"
  ]
};

const MultilingualCertificateUpload = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    certificateType: '',
    courseName: '',
    issueDate: '',
    expiryDate: '',
    grade: '',
    description: '',
    language: ''
  });
  const [languages, setLanguages] = useState([]); // Kept for compatibility but unused for options
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Wagmi hooks
  const { account, isConnected } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    // Animation trigger
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchSupportedLanguages = async () => {
    // Static list used
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generatePreview = async () => {
    if (!formData.studentName || !formData.courseName) {
      toast.error('Please fill in student name and course name for preview');
      return;
    }

    try {
      setPreviewLoading(true);
      const certificateId = `CERT-${Date.now()}`;

      const token = localStorage.getItem('token');

      console.log('🌍 Generating preview for language:', formData.language);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/multilingual-certificates/preview`,
        {
          ...formData,
          certificateId: `${certificateId}-${Date.now()}`,
          issuedDate: formData.issueDate || new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      console.log('📋 Preview response:', response.data);
      console.log('🔤 Language used:', response.data.language_used);

      if (response.data.preview_image) {
        const previewWithTimestamp = response.data.preview_image + `#${Date.now()}`;
        setPreview(previewWithTimestamp);
        toast.success(`Preview generated in ${response.data.language_used}!`);
      } else {
        setPreview(null);
        toast.success(`Preview data prepared for ${response.data.language_used}. Certificate can be generated.`);
        if (response.data.note) {
          toast(response.data.note, {
            duration: 4000,
            icon: 'ℹ️'
          });
        }
      }

    } catch (error) {
      console.error('Preview generation failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate preview';
      toast.error(errorMessage);

      if (error.response?.status !== 400) {
        toast('Preview unavailable, but you can still generate the certificate', {
          duration: 3000,
          icon: '💡'
        });
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const certificateId = `CERT-${Date.now()}`;

      toast.loading('Generating multilingual certificate...');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/multilingual-certificates/generate`,
        {
          ...formData,
          certificateId,
          issuedDate: formData.issueDate || new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      toast.dismiss();
      toast.success(`Certificate generated and emailed to student successfully in ${response.data.language_used}!`);

      const result = response.data;
      toast.success(
        <div>
          <p>✅ Certificate Generated!</p>
          <p>🌐 Language: {result.language_used}</p>
          <p>📄 IPFS: {result.ipfs_hash ? 'Uploaded' : 'Pending'}</p>
          <p>🔗 Blockchain: {result.blockchain_transaction !== 'pending' ? 'Recorded' : 'Pending'}</p>
        </div>,
        { duration: 5000 }
      );

      navigate('/institution');

    } catch (error) {
      console.error('Certificate generation failed:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* CSS Styles */}
      <style>{`
        @keyframes gradientBackground {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #e0f2fe 100%);
          background-size: 200% 200%;
          animation: gradientBackground 15s ease infinite;
          min-height: 100vh;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .form-container {
          max-width: 80rem;
          margin: 0 auto;
          padding: 1.5rem;
        }
      `}</style>

      <div className="gradient-bg">
        <div className="form-container">
          {/* Header */}
          <div className={`mb-10 transition-all duration-700 ${isAnimating ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <div className="relative">
                <Globe className="h-9 w-9 mr-4 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl blur-sm -z-10"></div>
              </div>
              Multilingual Certificate Generator
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Generate certificates in multiple Indian languages with blockchain verification
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <div className={`fade-in-up ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Language Selection */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                        <Languages className="h-5 w-5 text-indigo-600" />
                      </div>
                      Language Selection
                    </h2>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Language *
                      </label>
                      <select
                        id="language"
                        name="language"
                        required
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      >
                        <option value="">Select a language</option>
                        {Object.entries(languageGroups).map(([group, langs]) => (
                          <optgroup key={group} label={group}>
                            {langs.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </optgroup>
                        ))}

                      </select>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      Student Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                          Student Name *
                        </label>
                        <input
                          type="text"
                          id="studentName"
                          name="studentName"
                          required
                          value={formData.studentName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder="Enter student's full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          Student Email *
                        </label>
                        <input
                          type="email"
                          id="studentEmail"
                          name="studentEmail"
                          required
                          value={formData.studentEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder="Enter student's email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <div className="p-2 bg-purple-50 rounded-lg mr-3">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      Certificate Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="certificateType" className="block text-sm font-medium text-gray-700 mb-2">
                          Certificate Type *
                        </label>
                        <select
                          id="certificateType"
                          name="certificateType"
                          required
                          value={formData.certificateType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        >
                          <option value="">Select certificate type</option>
                          <option value="Degree">Degree</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Certificate">Certificate</option>
                          <option value="Course Completion">Course Completion</option>
                          <option value="Professional Certification">Professional Certification</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                          Course/Program Name *
                        </label>
                        <input
                          type="text"
                          id="courseName"
                          name="courseName"
                          required
                          value={formData.courseName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder="Enter course or program name"
                        />
                      </div>

                      <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Date *
                        </label>
                        <input
                          type="date"
                          id="issueDate"
                          name="issueDate"
                          required
                          value={formData.issueDate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                          Grade/Score (Optional)
                        </label>
                        <input
                          type="text"
                          id="grade"
                          name="grade"
                          value={formData.grade}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder="e.g., A+, 95%, First Class"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Additional details about the certificate"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between space-x-4">
                    <button
                      type="button"
                      onClick={generatePreview}
                      disabled={previewLoading}
                      className="px-6 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {previewLoading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                      <span>{previewLoading ? 'Generating...' : 'Preview'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !isConnected}
                      className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                      <span>{loading ? 'Generating...' : 'Generate Certificate'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              {/* Preview Card */}
              <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '200ms' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  Certificate Preview
                </h2>

                {preview ? (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                      <iframe
                        src={preview}
                        className="w-full h-96 border-0 rounded-lg"
                        title="Certificate Preview"
                      />
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-indigo-700 text-center">
                        Preview in {selectedLanguage?.nativeName || 'Selected Language'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Yet</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Fill in the form details and click "Preview" to generate a certificate preview
                    </p>
                    <div className="mt-6 text-xs text-gray-500">
                      <Check className="h-4 w-4 inline mr-1" />
                      Real-time preview • Multiple languages • Blockchain-ready
                    </div>
                  </div>
                )}
              </div>

              {/* Supported Languages */}
              <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '400ms' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-amber-50 rounded-lg mr-3">
                    <Globe className="h-5 w-5 text-amber-600" />
                  </div>
                  Supported Languages (90+)
                </h3>
                <div className="text-sm text-gray-600">
                  <p>Select from over 90 Indian and International languages in the dropdown above.</p>
                </div>
              </div>
            </div>
          </div>
        </div >
      </div >
    </>
  );
};

export default MultilingualCertificateUpload;