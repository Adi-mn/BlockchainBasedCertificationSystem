import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Eye, Download, Globe, Palette, User, Calendar, Award, Loader, CheckCircle, Smartphone, Columns } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeacherCertificateGenerator = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    courseName: '',
    teacherName: '',
    instituteName: '',
    certificateId: '',
    issuedDate: new Date().toISOString().split('T')[0],
    grade: '',
    description: '',
    language: 'english',
    template: 'classic',
    certificateType: 'Course Completion'
  });

  const [templates, setTemplates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [templatePreviews, setTemplatePreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplatesAndLanguages();
    generateCertificateId();
  }, []);

  // Update preview when language or template changes (if decent amount of data is present)
  useEffect(() => {
    if (preview && formData.studentName && formData.courseName) {
      const timeoutId = setTimeout(() => {
        generatePreview(true); // Silent update
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.language, formData.template]);

  const fetchTemplatesAndLanguages = async () => {
    try {
      const [templatesRes, languagesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/auto-certificates/templates`),
        axios.get(`${process.env.REACT_APP_API_URL}/auto-certificates/languages`)
      ]);

      setTemplates(templatesRes.data.templates);
      setLanguages(languagesRes.data.languages);
    } catch (error) {
      console.error('Failed to fetch templates and languages:', error);
      toast.error('Failed to load templates and languages');
    }
  };

  const generateCertificateId = () => {
    const id = `CERT-${Date.now()}`;
    setFormData(prev => ({ ...prev, certificateId: id }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generatePreview = async (silent = false) => {
    if (!formData.studentName || !formData.courseName) {
      if (!silent) toast.error('Please fill in student name and course name for preview');
      return;
    }

    try {
      if (!silent) setPreviewLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auto-certificates/preview`,
        formData
      );

      setPreview(response.data.preview_image);
      if (!silent) toast.success(`Preview updated: ${selectedTemplate?.name}`);
    } catch (error) {
      console.error('Preview generation failed:', error);
      if (!silent) toast.error('Failed to generate preview');
    } finally {
      if (!silent) setPreviewLoading(false);
    }
  };

  const generateCertificate = async () => {
    try {
      setLoading(true);
      toast.loading('Finalizing certificate...');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auto-certificates/generate`,
        formData
      );

      toast.dismiss();

      const result = response.data;

      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">✨ Certificate Generated Successfully!</p>
          <p className="text-sm">📧 Sent to {formData.studentEmail}</p>
        </div>,
        { duration: 5000 }
      );

      setStep(4);
      setPreview(result.preview_image);

    } catch (error) {
      console.error('Certificate generation failed:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === formData.template);
  const selectedLanguage = languages.find(l => l.code === formData.language);

  const getTemplateIcon = (id) => {
    switch (id) {
      case 'multilingual_split': return <Columns className="h-5 w-5" />;
      case 'compact': return <Smartphone className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Award className="h-8 w-8 mr-3 text-indigo-600" />
          Certificate Generator Studio
        </h1>
        <p className="mt-2 text-gray-600">
          Create professional, verifiable blockchain certificates in minutes.
        </p>
      </div>

      {/* Progress */}
      <nav aria-label="Progress" className="mb-10">
        <ol role="list" className="flex items-center">
          {[
            { id: 1, name: 'Student Details' },
            { id: 2, name: 'Template & Design' },
            { id: 3, name: 'Preview & Issue' },
            { id: 4, name: 'Done' }
          ].map((s, stepIdx) => (
            <li key={s.name} className={`relative ${stepIdx !== 3 ? 'pr-8 sm:pr-20' : ''}`}>
              <div className="flex items-center">
                <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${step >= s.id ? 'bg-indigo-600 hover:bg-indigo-900' : 'bg-gray-200'} transition-colors`}>
                  {step > s.id ? <CheckCircle className="h-5 w-5 text-white" /> : <span className={`text-sm font-bold ${step >= s.id ? 'text-white' : 'text-gray-500'}`}>{s.id}</span>}
                </div>
                <span className={`ml-4 text-sm font-medium ${step >= s.id ? 'text-indigo-600' : 'text-gray-500'}`}>{s.name}</span>
              </div>
              {stepIdx !== 3 && (
                <div className={`absolute top-4 left-0 -right-4 h-0.5 w-[calc(100%-2rem)] ${step > s.id ? 'bg-indigo-600' : 'bg-gray-200'} ml-12`} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Student Details */}
          {step === 1 && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Student Information</h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Student Name</label>
                  <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Jane Doe" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Student Email</label>
                  <input type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="jane@example.com" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Course / Program Name</label>
                  <input type="text" name="courseName" value={formData.courseName} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Advanced Blockchain Development" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Issue Date</label>
                  <input type="date" name="issuedDate" value={formData.issuedDate} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Grade (Optional)</label>
                  <input type="text" name="grade" value={formData.grade} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="A+" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setStep(2)} disabled={!formData.studentName || !formData.courseName} className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50">
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Design */}
          {step === 2 && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Select Template & Language</h2>

              {/* Language */}
              <div className="mb-6">
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Certificate Language</label>
                <select name="language" value={formData.language} onChange={handleChange} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
                  ))}
                </select>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setFormData({ ...formData, template: t.id })}
                    className={`cursor-pointer relative flex items-center space-x-3 rounded-lg border px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400 ${formData.template === t.id ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50' : 'border-gray-300'}`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${formData.template === t.id ? 'bg-white text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                        {getTemplateIcon(t.id)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <a href="#" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">{t.name}</p>
                        <p className="truncate text-xs text-gray-500">{t.id === 'multilingual_split' ? 'Professional Split Layout' : 'Standard Certificate Layout'}</p>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-sm font-semibold leading-6 text-gray-900">Back</button>
                <button onClick={() => { generatePreview(); setStep(3); }} className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                  Generate Preview
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Generate</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please review the preview on the right. Ensure all details, especially non-English text, are correct before final generation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 justify-end">
                <button onClick={() => setStep(2)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Back to Edit</button>
                <button onClick={generateCertificate} disabled={loading} className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-70">
                  {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Confirm & Issue Certificate'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-10 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Certificate Issued!</h2>
              <p className="mt-2 text-lg text-gray-500">The certificate has been permanently recorded and emailed to the student.</p>
              <div className="mt-10 flex justify-center gap-x-6">
                <button onClick={() => setStep(1)} className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Issue Another</button>
                <a href={preview} download className="text-sm font-semibold leading-6 text-gray-900 flex items-center hover:text-indigo-600">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </a>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden ring-1 ring-white/10">
              <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <span className="text-white font-medium flex items-center"><Eye className="h-4 w-4 mr-2 text-gray-400" /> Live Preview</span>
                {previewLoading && <Loader className="h-4 w-4 text-indigo-400 animate-spin" />}
              </div>
              <div className="aspect-[1.414/1] bg-gray-200 relative">
                {preview ? (
                  <iframe src={preview} className="w-full h-full border-none" title="Preview" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col">
                    <Wand2 className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-xs">Preview will appear here</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-800 text-xs text-gray-400 text-center border-t border-gray-700">
                {selectedTemplate?.name} • {selectedLanguage?.name}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherCertificateGenerator;