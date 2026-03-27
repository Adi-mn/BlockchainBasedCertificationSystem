const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadFont = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '..', 'fonts', filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      console.log(`❌ Failed to download ${filename}: ${err.message}`);
      reject(err);
    });
  });
};

const downloadAllFonts = async () => {
  console.log('📥 DOWNLOADING GOOGLE NOTO UNICODE FONTS');
  console.log('='.repeat(50));
  
  const fonts = [
    {
      name: 'Devanagari (Hindi/Marathi)',
      filename: 'NotoSansDevanagari-Regular.ttf',
      url: 'https://github.com/notofonts/devanagari/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansDevanagari-Regular.ttf'
    },
    {
      name: 'Tamil',
      filename: 'NotoSansTamil-Regular.ttf',
      url: 'https://github.com/notofonts/tamil/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansTamil-Regular.ttf'
    },
    {
      name: 'Telugu',
      filename: 'NotoSansTelugu-Regular.ttf',
      url: 'https://github.com/notofonts/telugu/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansTelugu-Regular.ttf'
    },
    {
      name: 'Kannada',
      filename: 'NotoSansKannada-Regular.ttf',
      url: 'https://github.com/notofonts/kannada/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansKannada-Regular.ttf'
    },
    {
      name: 'Malayalam',
      filename: 'NotoSansMalayalam-Regular.ttf',
      url: 'https://github.com/notofonts/malayalam/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansMalayalam-Regular.ttf'
    },
    {
      name: 'Gujarati',
      filename: 'NotoSansGujarati-Regular.ttf',
      url: 'https://github.com/notofonts/gujarati/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansGujarati-Regular.ttf'
    },
    {
      name: 'Bengali',
      filename: 'NotoSansBengali-Regular.ttf',
      url: 'https://github.com/notofonts/bengali/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansBengali-Regular.ttf'
    },
    {
      name: 'Gurmukhi (Punjabi)',
      filename: 'NotoSansGurmukhi-Regular.ttf',
      url: 'https://github.com/notofonts/gurmukhi/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansGurmukhi-Regular.ttf'
    },
    {
      name: 'Arabic (Urdu)',
      filename: 'NotoSansArabic-Regular.ttf',
      url: 'https://github.com/notofonts/arabic/raw/main/fonts/ttf/unhinted/instance_ttf/NotoSansArabic-Regular.ttf'
    }
  ];
  
  console.log(`📋 Downloading ${fonts.length} Unicode fonts...\n`);
  
  for (const font of fonts) {
    try {
      console.log(`📥 Downloading ${font.name}...`);
      await downloadFont(font.url, font.filename);
    } catch (error) {
      console.log(`⚠️ Skipping ${font.name} due to error`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 FONT DOWNLOAD SUMMARY:');
  
  // Check which fonts were successfully downloaded
  const fontsDir = path.join(__dirname, '..', 'fonts');
  const downloadedFiles = fs.readdirSync(fontsDir).filter(file => file.endsWith('.ttf'));
  
  console.log(`✅ Successfully downloaded: ${downloadedFiles.length} fonts`);
  downloadedFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  if (downloadedFiles.length > 0) {
    console.log('\n🎉 UNICODE FONTS READY!');
    console.log('   Indian languages will now render properly in certificates');
    console.log('   No more garbled text for Hindi, Tamil, Gujarati, etc.');
  } else {
    console.log('\n⚠️ NO FONTS DOWNLOADED');
    console.log('   System will fall back to Times-Roman font');
    console.log('   Some Indian characters may still appear garbled');
  }
};

downloadAllFonts().catch(console.error);