const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * ⭐🔥 MASTER PREMIUM CERTIFICATE GENERATOR 🔥⭐
 * Creates perfectly aligned, single-page A4 landscape certificates
 * Following exact specifications for premium, modern, luxurious design
 */
class PremiumCertificateGenerator {
  constructor() {
    this.colors = {
      // Master color palette
      royalBlue: '#1e3a8a',
      vibrantBlue: '#2563eb', 
      elegantGreen: '#059669',
      gold: '#d4af37',
      navy: '#1e40af',
      softBackground: '#f9fafb',
      elegantGrey: '#6b7280',
      textDark: '#1f2937',
      lightGrey: '#9ca3af'
    };
  }

  /**
   * Generate master premium certificate PDF
   */
  generatePremiumCertificate(certificate) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          layout: 'landscape',
          margins: { top: 30, bottom: 30, left: 30, right: 30 }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Page dimensions
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 30;

        // 1. BACKGROUND & BORDERS
        this.addBackgroundAndBorders(doc, pageWidth, pageHeight, margin);

        // 2. WATERMARK
        this.addWatermark(doc, certificate.institutionName, pageWidth, pageHeight);

        // 3. HEADER SECTION
        let currentY = this.addHeaderSection(doc, certificate.institutionName, pageWidth, margin);

        // 4. MAIN BODY (with multilingual support)
        currentY = this.addMainBodyMultilingual(doc, certificate, pageWidth, currentY);

        // 5. FOOTER LAYOUT (Three-column)
        this.addFooterLayout(doc, certificate, pageWidth, pageHeight, margin);

        // 6. QR CODE (if verification URL provided)
        await this.addQRCode(doc, certificate, pageWidth, pageHeight, margin);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 1. BORDER & BACKGROUND
   */
  addBackgroundAndBorders(doc, pageWidth, pageHeight, margin) {
    // Soft background tint with subtle texture
    doc.rect(0, 0, pageWidth, pageHeight)
       .fill(this.colors.softBackground);

    // Beautiful double border
    // Outer border: thick multi-color gradient (royal blue → gold → navy)
    const outerBorderWidth = 6;
    
    // Create gradient effect for outer border
    for (let i = 0; i < outerBorderWidth; i++) {
      const progress = i / outerBorderWidth;
      let color;
      
      if (progress < 0.33) {
        color = this.colors.royalBlue;
      } else if (progress < 0.66) {
        color = this.colors.gold;
      } else {
        color = this.colors.navy;
      }
      
      const opacity = 1 - (i / outerBorderWidth) * 0.2;
      
      // Top border
      doc.rect(margin - i, margin - i, pageWidth - 2 * (margin - i), outerBorderWidth)
         .fillColor(color)
         .fillOpacity(opacity)
         .fill();
      
      // Bottom border
      doc.rect(margin - i, pageHeight - margin - outerBorderWidth + i, pageWidth - 2 * (margin - i), outerBorderWidth)
         .fillColor(color)
         .fillOpacity(opacity)
         .fill();
      
      // Left border
      doc.rect(margin - i, margin, outerBorderWidth, pageHeight - 2 * margin)
         .fillColor(color)
         .fillOpacity(opacity)
         .fill();
      
      // Right border
      doc.rect(pageWidth - margin - outerBorderWidth + i, margin, outerBorderWidth, pageHeight - 2 * margin)
         .fillColor(color)
         .fillOpacity(opacity)
         .fill();
    }

    // Inner border: thin gold line
    doc.rect(margin + 20, margin + 20, pageWidth - 2 * (margin + 20), pageHeight - 2 * (margin + 20))
       .lineWidth(2)
       .stroke(this.colors.gold)
       .fillOpacity(1);
  }

  /**
   * 2. WATERMARK
   */
  addWatermark(doc, institutionName, pageWidth, pageHeight) {
    doc.save();
    doc.rotate(45, { origin: [pageWidth / 2, pageHeight / 2] });
    doc.fontSize(72)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .fillOpacity(0.07) // 6-8% opacity
       .text('ABC UNIVERSITY', 0, pageHeight / 2 - 36, { 
         align: 'center',
         width: pageWidth * 1.5
       });
    doc.restore();
    doc.fillOpacity(1); // Reset opacity
  }

  /**
   * 3. HEADER SECTION
   */
  addHeaderSection(doc, institutionName, pageWidth, margin) {
    let currentY = margin + 50;

    // University name in small caps with thin golden divider
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor(this.colors.textDark)
       .text(institutionName.toUpperCase(), 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 25;

    // Thin golden divider line beneath
    const lineWidth = pageWidth * 0.25;
    const lineX = (pageWidth - lineWidth) / 2;
    doc.moveTo(lineX, currentY)
       .lineTo(lineX + lineWidth, currentY)
       .lineWidth(1)
       .stroke(this.colors.gold);

    currentY += 35;

    // Main title: CERTIFICATE OF EXCELLENCE
    doc.fontSize(42)
       .font('Helvetica-Bold')
       .fillColor(this.colors.royalBlue)
       .text('CERTIFICATE', 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 50;

    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor(this.colors.elegantGreen)
       .text('OF EXCELLENCE', 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    return currentY + 60;
  }

  /**
   * 4. MAIN BODY
   */
  addMainBody(doc, certificate, pageWidth, currentY) {
    // "This is to certify that" in elegant italic grey
    doc.fontSize(18)
       .font('Helvetica-Oblique')
       .fillColor(this.colors.elegantGrey)
       .text('This is to certify that', 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 40;

    // Student name: Large (32-38px), Bold, Centered, Royal blue, with gold underline
    const studentNameY = currentY;
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor(this.colors.vibrantBlue)
       .text(certificate.studentName, 0, studentNameY, { 
         align: 'center',
         width: pageWidth
       });

    // Small gold underline for elegance
    const nameWidth = doc.widthOfString(certificate.studentName);
    const underlineX = (pageWidth - nameWidth) / 2;
    const underlineY = studentNameY + 45;
    
    doc.moveTo(underlineX, underlineY)
       .lineTo(underlineX + nameWidth, underlineY)
       .lineWidth(2)
       .stroke(this.colors.gold);

    currentY = underlineY + 25;

    // Achievement text centered
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor(this.colors.textDark)
       .text('has demonstrated outstanding achievement in', 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 45;

    // Course/Program name: Bold, 24px, center-aligned with +15px spacing
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(this.colors.textDark)
       .text(certificate.courseName, 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 40;

    // Additional text (like "uhij") - center-aligned and lightly styled
    if (certificate.description) {
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor(this.colors.elegantGrey)
         .text(certificate.description, 0, currentY, { 
           align: 'center',
           width: pageWidth
         });
      currentY += 25;
    }

    // Grade if available
    if (certificate.grade) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(this.colors.textDark)
         .text(`Grade: ${certificate.grade}`, 0, currentY, { 
           align: 'center',
           width: pageWidth
         });
      currentY += 25;
    }

    return currentY;
  }

  /**
   * 5. FOOTER LAYOUT (Three-column alignment) - FIXED ALIGNMENT
   */
  addFooterLayout(doc, certificate, pageWidth, pageHeight, margin) {
    const footerY = pageHeight - 100; // Moved up slightly
    const totalWidth = pageWidth - 2 * margin - 60;
    const columnWidth = totalWidth / 3;
    const startX = margin + 30;

    // Left Column: DATE OF ISSUE, Issue Date, Authorized Signatory
    const leftX = startX;
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor(this.colors.textDark)
       .text('DATE OF ISSUE', leftX, footerY);

    const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(this.colors.textDark)
       .text(issueDate, leftX, footerY + 18);

    // Authorized Signatory line - properly sized
    doc.moveTo(leftX, footerY + 45)
       .lineTo(leftX + columnWidth - 30, footerY + 45)
       .lineWidth(1)
       .stroke(this.colors.textDark);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(this.colors.textDark)
       .text('Authorized Signatory', leftX, footerY + 52);

    // Center Column: Awarded with honor by, University Name, Certificate ID
    const centerX = startX + columnWidth;
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(this.colors.textDark)
       .text('Awarded with honor by', centerX, footerY, { 
         align: 'center',
         width: columnWidth
       });

    // Institution name - truncate if too long
    const institutionName = certificate.institutionName.length > 25 
      ? certificate.institutionName.substring(0, 22) + '...'
      : certificate.institutionName;

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(this.colors.royalBlue)
       .text(institutionName, centerX, footerY + 18, { 
         align: 'center',
         width: columnWidth
       });

    // Certificate ID in small grey text (ensure single line)
    const certId = certificate._id.toString().substring(0, 8) + '...';
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(this.colors.elegantGrey)
       .text(`ID: ${certId}`, centerX, footerY + 40, { 
         align: 'center',
         width: columnWidth
       });

    // Right Column: VALID UNTIL, Expiry Date, Official Seal, QR code
    const rightX = startX + 2 * columnWidth;
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor(this.colors.textDark)
       .text('VALID UNTIL', rightX, footerY);

    // Expiry date (or "Lifetime" if no expiry)
    const expiryText = certificate.expiryDate 
      ? new Date(certificate.expiryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'Lifetime';

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(this.colors.textDark)
       .text(expiryText, rightX, footerY + 18);

    // Official Seal (thin red ring) - better positioned
    const sealX = rightX + columnWidth / 2;
    const sealY = footerY - 20;
    
    doc.circle(sealX, sealY, 18)
       .lineWidth(2)
       .stroke('#dc2626'); // Red ring

    // Institution abbreviation in seal
    const abbrev = certificate.institutionName.split(' ')
                                           .map(word => word[0])
                                           .join('')
                                           .substring(0, 2)
                                           .toUpperCase();

    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#dc2626')
       .text(abbrev, sealX - 8, sealY - 4, { width: 16, align: 'center' });

    // QR code positioned cleanly below - better alignment
    const qrX = rightX + (columnWidth - 35) / 2;
    const qrY = footerY + 35;
    
    doc.rect(qrX, qrY, 35, 35)
       .lineWidth(1)
       .stroke(this.colors.textDark);

    doc.fontSize(7)
       .font('Helvetica')
       .fillColor(this.colors.elegantGrey)
       .text('Scan to verify', rightX, qrY + 40, { 
         width: columnWidth,
         align: 'center'
       });
  }

  /**
   * Add multilingual support
   */
  getTranslation(language, key) {
    const translations = {
      english: {
        certificateOfExcellence: 'CERTIFICATE OF EXCELLENCE',
        thisIsToCertify: 'This is to certify that',
        hasAchieved: 'has demonstrated outstanding achievement in',
        awardedBy: 'Awarded with honor by',
        dateOfIssue: 'DATE OF ISSUE',
        validUntil: 'VALID UNTIL',
        authorizedSignatory: 'Authorized Signatory',
        scanToVerify: 'Scan to verify',
        grade: 'Grade'
      },
      hindi: {
        certificateOfExcellence: 'उत्कृष्टता प्रमाणपत्र',
        thisIsToCertify: 'यह प्रमाणित करता है कि',
        hasAchieved: 'ने उत्कृष्ट उपलब्धि प्राप्त की है',
        awardedBy: 'सम्मान के साथ प्रदान किया गया',
        dateOfIssue: 'जारी करने की तारीख',
        validUntil: 'तक वैध',
        authorizedSignatory: 'अधिकृत हस्ताक्षर',
        scanToVerify: 'सत्यापित करने के लिए स्कैन करें',
        grade: 'ग्रेड'
      },
      punjabi: {
        certificateOfExcellence: 'ਉਤਕਿਰਸ਼ਟਤਾ ਪ੍ਰਮਾਣ ਪੱਤਰ',
        thisIsToCertify: 'ਇਹ ਪ੍ਰਮਾਣਿਤ ਕਰਦਾ ਹੈ ਕਿ',
        hasAchieved: 'ਨੇ ਸ਼ਾਨਦਾਰ ਪ੍ਰਾਪਤੀ ਹਾਸਲ ਕੀਤੀ ਹੈ',
        awardedBy: 'ਸਨਮਾਨ ਨਾਲ ਪ੍ਰਦਾਨ ਕੀਤਾ ਗਿਆ',
        dateOfIssue: 'ਜਾਰੀ ਕਰਨ ਦੀ ਤਾਰੀਖ',
        validUntil: 'ਤੱਕ ਵੈਧ',
        authorizedSignatory: 'ਅਧਿਕਾਰਤ ਦਸਤਖਤ',
        scanToVerify: 'ਸਤਿਆਪਨ ਲਈ ਸਕੈਨ ਕਰੋ',
        grade: 'ਗ੍ਰੇਡ'
      }
    };

    const lang = language?.toLowerCase() || 'english';
    return translations[lang]?.[key] || translations.english[key] || key;
  }

  /**
   * Update main body with multilingual support
   */
  addMainBodyMultilingual(doc, certificate, pageWidth, currentY) {
    const language = certificate.language || 'english';

    // "This is to certify that" in elegant italic grey
    doc.fontSize(18)
       .font('Helvetica-Oblique')
       .fillColor(this.colors.elegantGrey)
       .text(this.getTranslation(language, 'thisIsToCertify'), 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 40;

    // Student name: Large (32-38px), Bold, Centered, Royal blue, with gold underline
    const studentNameY = currentY;
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor(this.colors.vibrantBlue)
       .text(certificate.studentName, 0, studentNameY, { 
         align: 'center',
         width: pageWidth
       });

    // Small gold underline for elegance
    const nameWidth = doc.widthOfString(certificate.studentName);
    const underlineX = (pageWidth - nameWidth) / 2;
    const underlineY = studentNameY + 45;
    
    doc.moveTo(underlineX, underlineY)
       .lineTo(underlineX + nameWidth, underlineY)
       .lineWidth(2)
       .stroke(this.colors.gold);

    currentY = underlineY + 25;

    // Achievement text centered
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor(this.colors.textDark)
       .text(this.getTranslation(language, 'hasAchieved'), 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 45;

    // Course/Program name: Bold, 24px, center-aligned with +15px spacing
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(this.colors.textDark)
       .text(certificate.courseName, 0, currentY, { 
         align: 'center',
         width: pageWidth
       });

    currentY += 40;

    // Additional text (like "uhij") - center-aligned and lightly styled
    if (certificate.description) {
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor(this.colors.elegantGrey)
         .text(certificate.description, 0, currentY, { 
           align: 'center',
           width: pageWidth
         });
      currentY += 25;
    }

    // Grade if available
    if (certificate.grade) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(this.colors.textDark)
         .text(`${this.getTranslation(language, 'grade')}: ${certificate.grade}`, 0, currentY, { 
           align: 'center',
           width: pageWidth
         });
      currentY += 25;
    }

    return currentY;
  }

  /**
   * Add QR Code for certificate verification
   */
  async addQRCode(doc, certificate, pageWidth, pageHeight, margin) {
    try {
      // Generate verification URL
      const verificationUrl = certificate.verificationUrl || 
                             `http://localhost:3000/certificate/${certificate._id}`;
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 80,
        margin: 1,
        color: {
          dark: '#1e40af', // Navy blue
          light: '#ffffff'  // White background
        }
      });
      
      // Convert data URL to buffer
      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      
      // Position QR code in bottom right corner
      const qrSize = 60;
      const qrX = pageWidth - margin - qrSize - 10;
      const qrY = pageHeight - margin - qrSize - 10;
      
      // Add QR code to PDF
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
      
      // Add "Scan to Verify" text below QR code
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor(this.colors.elegantGrey)
         .text('Scan to Verify', qrX - 5, qrY + qrSize + 5, {
           width: qrSize + 10,
           align: 'center'
         });
      
      console.log('✅ QR code added to certificate PDF');
      
    } catch (error) {
      console.error('⚠️ Failed to add QR code to PDF:', error);
      // Continue without QR code if generation fails
    }
  }
}

module.exports = PremiumCertificateGenerator;