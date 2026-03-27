import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import axios from 'axios';

const LanguageSwitcher = ({ currentLanguage, onLanguageChange, certificateId }) => {
  const [languages, setLanguages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupportedLanguages();
  }, []);

  const fetchSupportedLanguages = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/multilingual-certificates/languages`);
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const handleLanguageSelect = async (language) => {
    if (language.code === currentLanguage) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch certificate in new language
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/multilingual-certificates/${certificateId}/${language.code}`
      );
      
      onLanguageChange(language.code, response.data.certificate);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch language:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">
          {loading ? 'Loading...' : (currentLang?.nativeName || 'English')}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
              Select Language
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                  language.code === currentLanguage ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {language.code === currentLanguage && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;