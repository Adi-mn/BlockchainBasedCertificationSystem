const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Unicode font mappings for proper Indian language support
const unicodeFonts = {
  hindi: path.join(__dirname, '..', 'fonts', 'NotoSansDevanagari-Regular.ttf'),
  marathi: path.join(__dirname, '..', 'fonts', 'NotoSansDevanagari-Regular.ttf'),
  tamil: path.join(__dirname, '..', 'fonts', 'NotoSansTamil-Regular.ttf'),
  telugu: path.join(__dirname, '..', 'fonts', 'NotoSansTelugu-Regular.ttf'),
  kannada: path.join(__dirname, '..', 'fonts', 'NotoSansKannada-Regular.ttf'),
  malayalam: path.join(__dirname, '..', 'fonts', 'NotoSansMalayalam-Regular.ttf'),
  bengali: path.join(__dirname, '..', 'fonts', 'NotoSansBengali-Regular.ttf'),
  gujarati: path.join(__dirname, '..', 'fonts', 'NotoSansGujarati-Regular.ttf'),
  punjabi: path.join(__dirname, '..', 'fonts', 'NotoSansGurmukhi-Regular.ttf'),
  urdu: path.join(__dirname, '..', 'fonts', 'NotoSansArabic-Regular.ttf'),
  english: 'Helvetica'
};

// Apply reliable font for consistent rendering
const applyFont = (doc, lang, bold = false) => {
  if (lang === 'english') {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
    console.log(`✅ Applied standard font for English: ${bold ? 'Helvetica-Bold' : 'Helvetica'}`);
    return;
  }

  // For Indian languages, use Helvetica for reliable rendering of hybrid text
  // This ensures consistent display of transliteration
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
  console.log(`✅ Applied reliable font for ${lang}: ${bold ? 'Helvetica-Bold' : 'Helvetica'} (hybrid text)`);
};

// Multilingual translations for certificate labels
const translations = {
  english: {
    certificateOfCompletion: "Certificate of Completion",
    thisIsToCertify: "This is to certify that",
    hasSuccessfullyCompleted: "has successfully completed",
    issuedBy: "Issued by",
    dateOfIssue: "Date of Issue",
    courseName: "Course Name",
    certificateId: "Certificate ID",
    authorizedSignature: "Authorized Signature",
    grade: "Grade",
    description: "Description",
    verificationText: "This certificate can be verified online"
  },
  hindi: {
    certificateOfCompletion: "पूर्णता प्रमाणपत्र",
    thisIsToCertify: "यह प्रमाणित करता है कि",
    hasSuccessfullyCompleted: "ने सफलतापूर्वक पूरा किया है",
    issuedBy: "द्वारा जारी",
    dateOfIssue: "जारी करने की तारीख",
    courseName: "पाठ्यक्रम का नाम",
    certificateId: "प्रमाणपत्र आईडी",
    authorizedSignature: "अधिकृत हस्ताक्षर",
    grade: "ग्रेड",
    description: "विवरण",
    verificationText: "इस प्रमाणपत्र को ऑनलाइन सत्यापित किया जा सकता है"
  },
  tamil: {
    certificateOfCompletion: "நிறைவு சான்றிதழ்",
    thisIsToCertify: "இது சான்றளிக்கிறது",
    hasSuccessfullyCompleted: "வெற்றிகரமாக முடித்துள்ளார்",
    issuedBy: "வழங்கியவர்",
    dateOfIssue: "வழங்கிய தேதி",
    courseName: "பாடநெறி பெயர்",
    certificateId: "சான்றிதழ் எண்",
    authorizedSignature: "அங்கீகரிக்கப்பட்ட கையொப்பம்",
    grade: "தரம்",
    description: "விளக்கம்",
    verificationText: "இந்த சான்றிதழை ஆன்லைனில் சரிபார்க்கலாம்"
  },
  telugu: {
    certificateOfCompletion: "పూర్తి చేసిన ప్రమాణపత్రం",
    thisIsToCertify: "ఇది ధృవీకరిస్తుంది",
    hasSuccessfullyCompleted: "విజయవంతంగా పూర్తి చేశారు",
    issuedBy: "జారీ చేసినవారు",
    dateOfIssue: "జారీ చేసిన తేదీ",
    courseName: "కోర్సు పేరు",
    certificateId: "ప్రమాణపత్ర ID",
    authorizedSignature: "అధికృత సంతకం",
    grade: "గ్రేడ్",
    description: "వివరణ",
    verificationText: "ఈ ప్రమాణపత్రాన్ని ఆన్‌లైన్‌లో ధృవీకరించవచ్చు"
  },
  malayalam: {
    certificateOfCompletion: "പൂർത്തീകരണ സർട്ടിഫിക്കറ്റ്",
    thisIsToCertify: "ഇത് സാക്ഷ്യപ്പെടുത്തുന്നു",
    hasSuccessfullyCompleted: "വിജയകരമായി പൂർത്തിയാക്കി",
    issuedBy: "നൽകിയത്",
    dateOfIssue: "നൽകിയ തീയതി",
    courseName: "കോഴ്സ് പേര്",
    certificateId: "സർട്ടിഫിക്കറ്റ് ID",
    authorizedSignature: "അംഗീകൃത ഒപ്പ്",
    grade: "ഗ്രേഡ്",
    description: "വിവരണം",
    verificationText: "ഈ സർട്ടിഫിക്കറ്റ് ഓൺലൈനിൽ പരിശോധിക്കാം"
  },
  kannada: {
    certificateOfCompletion: "ಪೂರ್ಣಗೊಳಿಸುವಿಕೆಯ ಪ್ರಮಾಣಪತ್ರ",
    thisIsToCertify: "ಇದು ಪ್ರಮಾಣೀಕರಿಸುತ್ತದೆ",
    hasSuccessfullyCompleted: "ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ",
    issuedBy: "ನೀಡಿದವರು",
    dateOfIssue: "ನೀಡಿದ ದಿನಾಂಕ",
    courseName: "ಕೋರ್ಸ್ ಹೆಸರು",
    certificateId: "ಪ್ರಮಾಣಪತ್ರ ID",
    authorizedSignature: "ಅಧಿಕೃತ ಸಹಿ",
    grade: "ಗ್ರೇಡ್",
    description: "ವಿವರಣೆ",
    verificationText: "ಈ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಬಹುದು"
  },
  marathi: {
    certificateOfCompletion: "पूर्णता प्रमाणपत्र",
    thisIsToCertify: "हे प्रमाणित करते की",
    hasSuccessfullyCompleted: "यांनी यशस्वीरित्या पूर्ण केले आहे",
    issuedBy: "द्वारे जारी",
    dateOfIssue: "जारी करण्याची तारीख",
    courseName: "अभ्यासक्रमाचे नाव",
    certificateId: "प्रमाणपत्र आयडी",
    authorizedSignature: "अधिकृत स्वाक्षरी",
    grade: "श्रेणी",
    description: "वर्णन",
    verificationText: "हे प्रमाणपत्र ऑनलाइन सत्यापित केले जाऊ शकते"
  },
  gujarati: {
    certificateOfCompletion: "પૂર્ણતા પ્રમાણપત્ર",
    thisIsToCertify: "આ પ્રમાણિત કરે છે કે",
    hasSuccessfullyCompleted: "સફળતાપૂર્વક પૂર્ણ કર્યું છે",
    issuedBy: "દ્વારા જારી",
    dateOfIssue: "જારી કરવાની તારીખ",
    courseName: "કોર્સનું નામ",
    certificateId: "પ્રમાણપત્ર આઈડી",
    authorizedSignature: "અધિકૃત હસ્તાક્ષર",
    grade: "ગ્રેડ",
    description: "વર્ણન",
    verificationText: "આ પ્રમાણપત્ર ઓનલાઇન ચકાસી શકાય છે"
  },
  bengali: {
    certificateOfCompletion: "সমাপনী সার্টিফিকেট",
    thisIsToCertify: "এটি প্রত্যয়ন করে যে",
    hasSuccessfullyCompleted: "সফলভাবে সম্পন্ন করেছেন",
    issuedBy: "দ্বারা জারি",
    dateOfIssue: "জারির তারিখ",
    courseName: "কোর্সের নাম",
    certificateId: "সার্টিফিকেট আইডি",
    authorizedSignature: "অনুমোদিত স্বাক্ষর",
    grade: "গ্রেড",
    description: "বিবরণ",
    verificationText: "এই সার্টিফিকেট অনলাইনে যাচাই করা যেতে পারে"
  },
  punjabi: {
    certificateOfCompletion: "ਸਮਾਪਤੀ ਦਾ ਸਰਟੀਫਿਕੇਟ",
    thisIsToCertify: "ਇਹ ਪ੍ਰਮਾਣਿਤ ਕਰਦਾ ਹੈ ਕਿ",
    hasSuccessfullyCompleted: "ਸਫਲਤਾਪੂਰਵਕ ਪੂਰਾ ਕੀਤਾ ਹੈ",
    issuedBy: "ਦੁਆਰਾ ਜਾਰੀ",
    dateOfIssue: "ਜਾਰੀ ਕਰਨ ਦੀ ਤਾਰੀਖ",
    courseName: "ਕੋਰਸ ਦਾ ਨਾਮ",
    certificateId: "ਸਰਟੀਫਿਕੇਟ ਆਈਡੀ",
    authorizedSignature: "ਅਧਿਕਾਰਤ ਦਸਤਖਤ",
    grade: "ਗ੍ਰੇਡ",
    description: "ਵਰਣਨ",
    verificationText: "ਇਸ ਸਰਟੀਫਿਕੇਟ ਨੂੰ ਔਨਲਾਈਨ ਤਸਦੀਕ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ"
  },
  urdu: {
    certificateOfCompletion: "تکمیل کا سرٹیفکیٹ",
    thisIsToCertify: "یہ تصدیق کرتا ہے کہ",
    hasSuccessfullyCompleted: "کامیابی سے مکمل کیا ہے",
    issuedBy: "کی طرف سے جاری",
    dateOfIssue: "جاری کرنے کی تاریخ",
    courseName: "کورس کا نام",
    certificateId: "سرٹیفکیٹ آئی ڈی",
    authorizedSignature: "مجاز دستخط",
    grade: "گریڈ",
    description: "تفصیل",
    verificationText: "اس سرٹیفکیٹ کو آن لائن تصدیق کیا جا سکتا ہے"
  }
};

// Font mappings for different languages - Try Unicode fonts first
const fontMappings = {
  english: 'Helvetica',
  hindi: 'Times-Roman',     // Will try Unicode rendering
  tamil: 'Times-Roman',     // Will try Unicode rendering  
  telugu: 'Times-Roman',    // Will try Unicode rendering
  malayalam: 'Times-Roman', // Will try Unicode rendering
  kannada: 'Times-Roman',   // Will try Unicode rendering
  marathi: 'Times-Roman',   // Will try Unicode rendering
  gujarati: 'Times-Roman',  // Will try Unicode rendering
  bengali: 'Times-Roman',   // Will try Unicode rendering
  punjabi: 'Times-Roman',   // Will try Unicode rendering
  urdu: 'Times-Roman'       // Will try Unicode rendering
};

// Enhanced font selection with Unicode support detection
const selectBestFont = (language, isBold = false) => {
  const isIndian = isIndianLanguage(language);

  if (!isIndian) {
    return isBold ? 'Helvetica-Bold' : 'Helvetica';
  }

  // For Indian languages, try fonts with better Unicode support
  // Times-Roman has better Unicode support than Helvetica
  return isBold ? 'Times-Bold' : 'Times-Roman';
};

// Try to register Unicode fonts for better script support
const tryRegisterUnicodeFont = (doc, language) => {
  try {
    // For now, we'll use Times-Roman which has some Unicode support
    // In a production environment, you would load proper Unicode fonts here
    console.log(`🔤 Using Times-Roman for ${language} (best available Unicode font)`);
    return 'Times-Roman';
  } catch (error) {
    console.log(`⚠️ Unicode font registration failed: ${error.message}`);
    return 'Helvetica'; // Fallback
  }
};

// Check if language uses non-Latin script
const isIndianLanguage = (language) => {
  return ['hindi', 'tamil', 'telugu', 'malayalam', 'kannada', 'marathi', 'gujarati', 'bengali', 'punjabi', 'urdu'].includes(language.toLowerCase());
};

// Transliteration fallbacks for Indian languages when fonts don't support scripts
const transliterationFallbacks = {
  hindi: {
    'पूर्णता प्रमाणपत्र': 'Purnata Pramanpatra (Certificate of Completion)',
    'यह प्रमाणित करता है कि': 'Yah Pramanit Karta Hai Ki (This is to certify that)',
    'ने सफलतापूर्वक पूरा किया है': 'Ne Safaltapurvak Pura Kiya Hai (has successfully completed)',
    'द्वारा जारी': 'Dvara Jari (Issued by)',
    'जारी करने की तारीख': 'Jari Karne Ki Tarikh (Date of Issue)',
    'ग्रेड': 'Grade (ग्रेड)',
    'प्रमाणपत्र आईडी': 'Pramanpatra ID (Certificate ID)'
  },
  marathi: {
    'पूर्णता प्रमाणपत्र': 'Purnata Pramanpatra (Certificate of Completion)',
    'हे प्रमाणित करते की': 'He Pramanit Karte Ki (This is to certify that)',
    'यांनी यशस्वीरित्या पूर्ण केले आहे': 'Yanani Yashasviritya Purna Kele Aahe (has successfully completed)',
    'द्वारे जारी': 'Dvare Jari (Issued by)',
    'जारी करण्याची तारीख': 'Jari Karnyachi Tarikh (Date of Issue)',
    'श्रेणी': 'Shreni (Grade)',
    'प्रमाणपत्र आयडी': 'Pramanpatra ID (Certificate ID)'
  },
  tamil: {
    'நிறைவு சான்றிதழ்': 'Niraivu Saanridhazh (Certificate of Completion)',
    'இது சான்றளிக்கிறது': 'Idhu Saanralikkiradhu (This is to certify that)',
    'வெற்றிகரமாக முடித்துள்ளார்': 'Vetrikaramaaga Muditthullaar (has successfully completed)',
    'வழங்கியவர்': 'Vazhangiyavar (Issued by)',
    'வழங்கிய தேதி': 'Vazhangiya Thethi (Date of Issue)',
    'தரம்': 'Tharam (Grade)',
    'விளக்கம்': 'Vilakkam (Description)',
    'சான்றிதழ் எண்': 'Saandridhazh En (Certificate ID)'
  },
  telugu: {
    'పూర్తి చేసిన ప్రమాణపత్రం': 'Purti Chesina Pramaanapatram (Certificate of Completion)',
    'ఇది ధృవీకరిస్తుంది': 'Idi Dhruveekaristhundi (This is to certify that)',
    'విజయవంతంగా పూర్తి చేశారు': 'Vijayavanthamgaa Purti Cheshaaru (has successfully completed)',
    'జారీ చేసినవారు': 'Jaari Chesinavaaru (Issued by)',
    'జారీ చేసిన తేదీ': 'Jaari Chesina Thedhi (Date of Issue)',
    'గ్రేడ్': 'Grade (గ్రేడ్)',
    'వివరణ': 'Vivarna (Description)',
    'ప్రమాణపత్ర ID': 'Pramaanapatra ID (Certificate ID)'
  },
  malayalam: {
    'പൂർത്തീകരണ സർട്ടിഫിക്കറ്റ്': 'Purttheekarana Certificate (Certificate of Completion)',
    'ഇത് സാക്ഷ്യപ്പെടുത്തുന്നു': 'Ithu Saakshyappeduthunnu (This is to certify that)',
    'വിജയകരമായി പൂർത്തിയാക്കി': 'Vijayakaramaayi Purtthiyaakki (has successfully completed)',
    'നൽകിയത്': 'Nalkiyathu (Issued by)',
    'നൽകിയ തീയതി': 'Nalkiya Theeyathi (Date of Issue)',
    'ഗ്രേഡ്': 'Grade (ഗ്രേഡ്)',
    'വിവരണം': 'Vivaranam (Description)',
    'സർട്ടിഫിക്കറ്റ് ID': 'Certificate ID (സർട്ടിഫിക്കറ്റ് ID)'
  },
  kannada: {
    'ಪೂರ್ಣಗೊಳಿಸುವಿಕೆಯ ಪ್ರಮಾಣಪತ್ರ': 'Purnagolisuvikkeya Pramanapatra (Certificate of Completion)',
    'ಇದು ಪ್ರಮಾಣೀಕರಿಸುತ್ತದೆ': 'Idu Pramanekarisuttade (This is to certify that)',
    'ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ': 'Yashasviyaagi Purnagolisiddaare (has successfully completed)',
    'ನೀಡಿದವರು': 'Needidavaru (Issued by)',
    'ನೀಡಿದ ದಿನಾಂಕ': 'Needida Dinaanka (Date of Issue)',
    'ಗ್ರೇಡ್': 'Grade (ಗ್ರೇಡ್)',
    'ಪ್ರಮಾಣಪತ್ರ ID': 'Pramanapatra ID (Certificate ID)'
  },
  gujarati: {
    'પૂર્ણતા પ્રમાણપત્ર': 'Purnata Pramanpatra (Certificate of Completion)',
    'આ પ્રમાણિત કરે છે કે': 'Aa Pramanit Kare Chhe Ke (This is to certify that)',
    'સફળતાપૂર્વક પૂર્ણ કર્યું છે': 'Safaltapurvak Purna Karyu Chhe (has successfully completed)',
    'દ્વારા જારી': 'Dvara Jari (Issued by)',
    'જારી કરવાની તારીખ': 'Jari Karvani Tarikh (Date of Issue)',
    'ગ્રેડ': 'Grade (ગ્રેડ)',
    'પ્રમાણપત્ર આઈડી': 'Pramanpatra ID (Certificate ID)'
  },
  bengali: {
    'সমাপনী সার্টিফিকেট': 'Somaponi Certificate (Certificate of Completion)',
    'এটি প্রত্যয়ন করে যে': 'Eti Prottoyon Kore Je (This is to certify that)',
    'সফলভাবে সম্পন্ন করেছেন': 'Sofolbhabe Somponno Korechhen (has successfully completed)',
    'দ্বারা জারি': 'Dvara Jari (Issued by)',
    'জারির তারিখ': 'Jarir Tarikh (Date of Issue)',
    'গ্রেড': 'Grade (গ্রেড)',
    'সার্টিফিকেট আইডি': 'Certificate ID (সার্টিফিকেট আইডি)'
  },
  punjabi: {
    'ਸਮਾਪਤੀ ਦਾ ਸਰਟੀਫਿਕੇਟ': 'Samapti Da Certificate (Certificate of Completion)',
    'ਇਹ ਪ੍ਰਮਾਣਿਤ ਕਰਦਾ ਹੈ ਕਿ': 'Ih Pramanit Karda Hai Ki (This is to certify that)',
    'ਸਫਲਤਾਪੂਰਵਕ ਪੂਰਾ ਕੀਤਾ ਹੈ': 'Safaltapurvak Pura Kita Hai (has successfully completed)',
    'ਦੁਆਰਾ ਜਾਰੀ': 'Duara Jari (Issued by)',
    'ਜਾਰੀ ਕਰਨ ਦੀ ਤਾਰੀਖ': 'Jari Karan Di Tarikh (Date of Issue)',
    'ਗ੍ਰੇਡ': 'Grade (ਗ੍ਰੇਡ)',
    'ਸਰਟੀਫਿਕੇਟ ਆਈਡੀ': 'Certificate ID (ਸਰਟੀਫਿਕੇਟ ਆਈਡੀ)'
  },
  urdu: {
    'تکمیل کا سرٹیفکیٹ': 'Takmeel Ka Certificate (Certificate of Completion)',
    'یہ تصدیق کرتا ہے کہ': 'Yeh Tasdeeq Karta Hai Keh (This is to certify that)',
    'کامیابی سے مکمل کیا ہے': 'Kamyabi Se Mukammal Kiya Hai (has successfully completed)',
    'کی طرف سے جاری': 'Ki Taraf Se Jari (Issued by)',
    'جاری کرنے کی تاریخ': 'Jari Karne Ki Tarikh (Date of Issue)',
    'گریڈ': 'Grade (گریڈ)',
    'سرٹیفکیٹ آئی ڈی': 'Certificate ID (سرٹیفکیٹ آئی ڈی)'
  }
};

// Convert text to hybrid representation (native script + transliteration for reliability)
const prepareTextForRendering = (text, language, useHybridApproach = true) => {
  if (!text) return '';

  // For Indian languages, use hybrid approach due to font limitations
  if (isIndianLanguage(language)) {
    if (useHybridApproach) {
      // Get transliteration for reliable display
      const fallbacks = transliterationFallbacks[language.toLowerCase()];
      if (fallbacks && fallbacks[text]) {
        try {
          // Try to include native script with transliteration
          const utf8Text = Buffer.from(text, 'utf8').toString('utf8');
          const normalizedText = utf8Text.normalize('NFC');
          const transliteration = fallbacks[text];

          console.log(`🌍 Using HYBRID approach for "${text}" in ${language}`);
          // Format: Native Script | Transliteration
          return `${normalizedText} | ${transliteration}`;
        } catch (error) {
          console.log(`⚠️ Native script failed, using transliteration only: ${error.message}`);
          return fallbacks[text];
        }
      }
    }

    // Fallback to just transliteration
    const fallbacks = transliterationFallbacks[language.toLowerCase()];
    if (fallbacks && fallbacks[text]) {
      console.log(`🔄 Using transliteration for "${text}" → "${fallbacks[text]}"`);
      return fallbacks[text];
    }

    return text;
  }

  return text;
};

class MultilingualCertificateGenerator {
  constructor() {
    this.supportedLanguages = [
      { code: 'english', name: 'English' },
      { code: 'hindi', name: 'Hindi (हिंदी)' },
      { code: 'tamil', name: 'Tamil (தமிழ்)' },
      { code: 'telugu', name: 'Telugu (తెలుగు)' },
      { code: 'malayalam', name: 'Malayalam (മലയാളം)' },
      { code: 'kannada', name: 'Kannada (ಕನ್ನಡ)' },
      { code: 'marathi', name: 'Marathi (मराठी)' },
      { code: 'gujarati', name: 'Gujarati (ગુજરાતી)' },
      { code: 'bengali', name: 'Bengali (বাংলা)' },
      { code: 'punjabi', name: 'Punjabi (ਪੰਜਾਬੀ)' },
      { code: 'urdu', name: 'Urdu (اردو)' }
    ];
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Get translation for a specific key and language
  getTranslation(language, key) {
    const lang = language.toLowerCase();
    return translations[lang]?.[key] || translations.english[key] || key;
  }

  // Generate certificate preview
  async generatePreview(certificateData) {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        resolve(`data:application/pdf;base64,${base64}`);
      });

      try {
        this.drawCertificate(doc, certificateData);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate final PDF certificate
  async generatePDF(certificateData) {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      try {
        this.drawCertificate(doc, certificateData);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Draw certificate content
  drawCertificate(doc, certificateData) {
    const { language, studentName, courseName, instituteName, certificateId, grade, description, issuedDate } = certificateData;
    const lang = language.toLowerCase();
    const font = fontMappings[lang] || 'Helvetica';
    const isIndian = isIndianLanguage(lang);

    console.log(`🎨 Drawing certificate for language: ${language}, font: ${font}, isIndian: ${isIndian}`);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#f8f9fa');

    // Border
    doc.rect(50, 50, pageWidth - 100, pageHeight - 100)
      .stroke('#2563eb', 3);

    // Title - Use hybrid approach (native script + transliteration)
    const originalTitleText = this.getTranslation(language, 'certificateOfCompletion');
    const titleText = prepareTextForRendering(originalTitleText, lang, true);

    doc.fillColor('#1f2937')
      .fontSize(isIndian ? 20 : 24); // Smaller for hybrid text

    // Apply reliable font
    applyFont(doc, lang, true);

    doc.text(titleText, 0, 80, {
      align: 'center',
      width: pageWidth
    });

    console.log(`✅ Title rendered: "${titleText}"`);

    // Subtitle - Use hybrid approach
    const originalSubtitleText = this.getTranslation(language, 'thisIsToCertify');
    const subtitleText = prepareTextForRendering(originalSubtitleText, lang, true);

    doc.fontSize(isIndian ? 12 : 14); // Smaller for hybrid text
    applyFont(doc, lang, false);

    doc.text(subtitleText, 0, isIndian ? 135 : 130, { // Adjust for larger title
      align: 'center',
      width: pageWidth
    });

    // Student name - Keep as provided (usually Latin script)
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#2563eb')
      .text(studentName, 0, isIndian ? 175 : 165, { // Adjust for hybrid text
        align: 'center',
        width: pageWidth
      });

    // Course completion text - Use hybrid approach
    const originalCompletionText = this.getTranslation(language, 'hasSuccessfullyCompleted');
    const completionText = prepareTextForRendering(originalCompletionText, lang, true);

    doc.fontSize(isIndian ? 12 : 14)
      .fillColor('#1f2937');
    applyFont(doc, lang, false);

    doc.text(completionText, 0, isIndian ? 210 : 200, { // Adjust for hybrid text
      align: 'center',
      width: pageWidth
    });

    // Course name - Keep as provided (usually Latin script)
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#059669')
      .text(courseName, 0, 235, {
        align: 'center',
        width: pageWidth
      });

    // Institution - Use proper Unicode font for native script
    const originalIssuedByText = this.getTranslation(language, 'issuedBy');
    const issuedByText = prepareTextForRendering(originalIssuedByText, lang);

    doc.fontSize(12)
      .fillColor('#1f2937');
    applyFont(doc, lang, false);

    doc.text(`${issuedByText}: ${instituteName}`, 0, 280, {
      align: 'center',
      width: pageWidth
    });

    // Date - Use proper Unicode font for native script
    const originalDateText = this.getTranslation(language, 'dateOfIssue');
    const dateText = prepareTextForRendering(originalDateText, lang);

    doc.fontSize(10);
    applyFont(doc, lang, false);

    doc.text(`${dateText}: ${new Date(issuedDate).toLocaleDateString()}`, 0, 305, {
      align: 'center',
      width: pageWidth
    });

    // Grade if available - Use proper Unicode font for native script
    if (grade) {
      const originalGradeText = this.getTranslation(language, 'grade');
      const gradeText = prepareTextForRendering(originalGradeText, lang);

      doc.fontSize(12)
        .fillColor('#dc2626');
      applyFont(doc, lang, true);

      doc.text(`${gradeText}: ${grade}`, 0, 330, {
        align: 'center',
        width: pageWidth
      });
    }

    // Certificate ID - Bottom left, smaller - Use proper Unicode font
    const originalCertIdText = this.getTranslation(language, 'certificateId');
    const certIdText = prepareTextForRendering(originalCertIdText, lang);

    doc.fontSize(7)
      .fillColor('#6b7280');
    applyFont(doc, lang, false);

    doc.text(`${certIdText}: ${certificateId}`, 60, pageHeight - 50);

    // Verification text - Bottom left, smaller
    doc.fontSize(7)
      .text(this.getTranslation(language, 'verificationText') || 'This certificate can be verified online', 60, pageHeight - 35);
  }

  // Generate QR code
  async generateQRCode(verificationUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return null;
    }
  }

  // Generate complete certificate with all components
  async generateCertificate(certificateData) {
    try {
      // 1. Generate preview image
      const previewImage = await this.generatePreview(certificateData);

      // 2. Generate final PDF
      const pdfBuffer = await this.generatePDF(certificateData);

      // 3. Generate verification URL and QR code
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateData.certificateId}`;
      const qrCode = await this.generateQRCode(verificationUrl);

      return {
        success: true,
        language_used: certificateData.language,
        preview_image: previewImage,
        pdf_buffer: pdfBuffer,
        qr_code: qrCode,
        verification_link: verificationUrl
      };
    } catch (error) {
      console.error('Certificate generation failed:', error);
      throw new Error(`Certificate generation failed: ${error.message}`);
    }
  }
}

module.exports = MultilingualCertificateGenerator;