import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface LoanApplicationData {
  // Personal Information
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  ssn: string;
  primaryId: string;
  idNumber: string;
  // Address Information
  address: string;
  cityStateZip: string;
  housingStatus: string;
  mortgageRent: string;
  // Employment Information
  monthlyIncome: string;
  workplace: string;
  workPhone: string;
  paystubs: string;
  // Additional Information
  message: string;
  addCoApplicant: string;
  // Co-applicant fields
  coFirstName: string;
  coLastName: string;
  coPhone: string;
  coEmail: string;
  coDateOfBirth: string;
  coSsn: string;
  coIncome: string;
  coEmployment: string;
  coCreditScore: string;
}

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Helper function to safely convert any value to string
const safeString = (value: any): string => {
  // Only return 'Not provided' for truly empty/null values
  if (value === null || value === undefined) return 'Not provided';
  
  // Convert to string first
  const stringValue = String(value);
  
  // Only return 'Not provided' if it's completely empty after trimming
  if (stringValue.trim() === '') return 'Not provided';
  
  // Return the actual value, even if it's 0, false, etc.
  return stringValue.trim();
};

// Generate PDF from loan application data
const generateLoanApplicationPDF = (applicationData: LoanApplicationData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        compress: true // Enable compression for smaller file size
      });
      
      const buffers: Buffer[] = [];
      
      // Collect PDF data
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#dc2626').text('🏍️ MOTORCYCLE LOAN APPLICATION', { align: 'center' });
      doc.fontSize(14).fillColor('#666').text('Sportbike FL - Customer Finance Request', { align: 'center' });
      doc.moveDown(2);

      // Helper function to add a section
      const addSection = (title: string, fields: Array<{ label: string; value: any }>) => {
        doc.fontSize(16).fillColor('#dc2626').text(title);
        doc.moveDown(0.5);
        
        fields.forEach(field => {
          const value = safeString(field.value);
          doc.fontSize(11).fillColor('#000');
          doc.text(`${field.label}: `, { continued: true, width: 150 });
          doc.fillColor('#333').text(value);
        });
        doc.moveDown(1);
      };

      // Personal Information
      addSection('PERSONAL INFORMATION', [
        { label: 'First Name', value: applicationData.firstName },
        { label: 'Last Name', value: applicationData.lastName },
        { label: 'Phone Number / Mobile', value: applicationData.phone },
        { label: 'Email', value: applicationData.email },
        { label: 'Date of Birth', value: applicationData.dateOfBirth },
        { label: 'Social Security or ITIN', value: applicationData.ssn },
        { label: 'Primary ID', value: applicationData.primaryId },
        { label: 'ID Number', value: applicationData.idNumber }
      ]);

      // Address Information
      addSection('ADDRESS INFORMATION', [
        { label: 'Current Home Street Address', value: applicationData.address },
        { label: 'City, State, Zipcode', value: applicationData.cityStateZip },
        { label: 'Housing Status', value: applicationData.housingStatus },
        { label: 'Mortgage/Rent Payment', value: applicationData.mortgageRent ? `$${safeString(applicationData.mortgageRent)}` : 'Not provided' }
      ]);

      // Employment Information
      addSection('EMPLOYMENT INFORMATION', [
        { label: 'Monthly Income', value: applicationData.monthlyIncome ? `$${safeString(applicationData.monthlyIncome)}` : 'Not provided' },
        { label: 'Workplace', value: applicationData.workplace },
        { label: 'Work Phone / Business', value: applicationData.workPhone },
        { label: 'Do you have the last 2 paystubs available?', value: applicationData.paystubs }
      ]);


      // Additional Information
      if (safeString(applicationData.message) !== 'Not provided') {
        addSection('ADDITIONAL INFORMATION', [
          { label: 'Message', value: applicationData.message }
        ]);
      }

      // Co-Applicant Information (if applicable)
      if (applicationData.addCoApplicant === 'yes') {
        addSection('CO-APPLICANT INFORMATION', [
          { label: 'Co-Applicant Name', value: `${safeString(applicationData.coFirstName)} ${safeString(applicationData.coLastName)}`.trim() },
          { label: 'Co-Applicant Email', value: applicationData.coEmail },
          { label: 'Co-Applicant Phone', value: applicationData.coPhone },
          { label: 'Co-Applicant Date of Birth', value: applicationData.coDateOfBirth },
          { label: 'Co-Applicant SSN/ITIN', value: applicationData.coSsn },
          { label: 'Co-Applicant Annual Income', value: applicationData.coIncome ? `$${safeString(applicationData.coIncome)}` : 'Not provided' },
          { label: 'Co-Applicant Employment', value: applicationData.coEmployment },
          { label: 'Co-Applicant Credit Score', value: applicationData.coCreditScore }
        ]);
      }

      // Application Details
      addSection('APPLICATION DETAILS', [
        { label: 'Application Date', value: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) },
        { label: 'Co-Applicant Requested', value: applicationData.addCoApplicant === 'yes' ? 'Yes' : 'No' }
      ]);

      // Footer
      doc.fontSize(10).fillColor('#666').text(
        'This loan application was submitted through the Sportbike FL website. Please follow up with the customer within 24 hours.',
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export async function sendLoanApplicationEmail(applicationData: LoanApplicationData) {
  try {
    const transporter = createTransporter();
    
    // Generate PDF attachment
    const pdfBuffer = await generateLoanApplicationPDF(applicationData);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Motorcycle Loan Application</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #dc2626; }
          .value { margin-left: 10px; }
          .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏍️ New Motorcycle Loan Application</h1>
          <p>Sportbike FL - Customer Finance Request</p>
        </div>
        
        <div class="content">
          <h2>Personal Information</h2>
          
          <div class="field">
            <span class="label">First Name:</span>
            <span class="value">${safeString(applicationData.firstName)}</span>
          </div>
          
          <div class="field">
            <span class="label">Last Name:</span>
            <span class="value">${safeString(applicationData.lastName)}</span>
          </div>
          
          <div class="field">
            <span class="label">Phone Number / Mobile:</span>
            <span class="value">${safeString(applicationData.phone)}</span>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${safeString(applicationData.email)}</span>
          </div>
          
          <div class="field">
            <span class="label">Date of Birth:</span>
            <span class="value">${safeString(applicationData.dateOfBirth)}</span>
          </div>
          
          <div class="field">
            <span class="label">Social Security or ITIN:</span>
            <span class="value">${safeString(applicationData.ssn)}</span>
          </div>
          
          <div class="field">
            <span class="label">Primary ID:</span>
            <span class="value">${safeString(applicationData.primaryId)}</span>
          </div>
          
          <div class="field">
            <span class="label">ID Number:</span>
            <span class="value">${safeString(applicationData.idNumber)}</span>
          </div>
          
          <h2>Address Information</h2>
          
          <div class="field">
            <span class="label">Current Home Street Address:</span>
            <span class="value">${safeString(applicationData.address)}</span>
          </div>
          
          <div class="field">
            <span class="label">City, State, Zipcode:</span>
            <span class="value">${safeString(applicationData.cityStateZip)}</span>
          </div>
          
          <div class="field">
            <span class="label">Housing Status:</span>
            <span class="value">${safeString(applicationData.housingStatus)}</span>
          </div>
          
          <div class="field">
            <span class="label">Mortgage/Rent Payment:</span>
            <span class="value">${applicationData.mortgageRent ? '$' + safeString(applicationData.mortgageRent) : 'Not provided'}</span>
          </div>
          
          <h2>Employment Information</h2>
          
          <div class="field">
            <span class="label">Monthly Income:</span>
            <span class="value">${applicationData.monthlyIncome ? '$' + safeString(applicationData.monthlyIncome) : 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Workplace:</span>
            <span class="value">${safeString(applicationData.workplace)}</span>
          </div>
          
          <div class="field">
            <span class="label">Work Phone / Business:</span>
            <span class="value">${safeString(applicationData.workPhone)}</span>
          </div>
          
          <div class="field">
            <span class="label">Do you have the last 2 paystubs available?:</span>
            <span class="value">${safeString(applicationData.paystubs)}</span>
          </div>
          
          ${applicationData.message ? `
          <h2>Additional Information</h2>
          <div class="field">
            <span class="label">Message:</span>
            <span class="value">${applicationData.message}</span>
          </div>
          ` : ''}
          
          ${applicationData.addCoApplicant === 'yes' ? `
          <h2>Co-Applicant Information</h2>
          
          <div class="field">
            <span class="label">Co-Applicant Name:</span>
            <span class="value">${`${safeString(applicationData.coFirstName)} ${safeString(applicationData.coLastName)}`.trim() || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Email:</span>
            <span class="value">${safeString(applicationData.coEmail)}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Phone:</span>
            <span class="value">${safeString(applicationData.coPhone)}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Date of Birth:</span>
            <span class="value">${safeString(applicationData.coDateOfBirth)}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant SSN/ITIN:</span>
            <span class="value">${safeString(applicationData.coSsn)}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Annual Income:</span>
            <span class="value">${applicationData.coIncome ? '$' + safeString(applicationData.coIncome) : 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Employment:</span>
            <span class="value">${safeString(applicationData.coEmployment)}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Credit Score:</span>
            <span class="value">${safeString(applicationData.coCreditScore)}</span>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="label">Application Date:</span>
            <span class="value">${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Sportbike FL</strong></p>
          <p>This loan application was submitted through the Sportbike FL website.</p>
          <p>Please follow up with the customer within 24 hours.</p>
        </div>
      </body>
      </html>
    `;

    const applicantName = `${safeString(applicationData.firstName)} ${safeString(applicationData.lastName)}`.trim();
    const fileName = `Loan_Application_${applicantName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'breezepod.store@gmail.com',
      subject: `🏍️ New Motorcycle Loan Application - ${applicantName}`,
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Loan application email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending loan application email:', error);
    return { success: false, error: error.message };
  }
}