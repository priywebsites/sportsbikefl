import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface LoanApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  idType: string;
  idNumber: string;
  income: string;
  employment: string;
  creditScore: string;
  loanAmount: string;
  downPayment: string;
  vehicleInterest: string;
  paystubs: string;
  message: string;
  addCoApplicant: string;
  // Co-applicant fields
  coFirstName: string;
  coLastName: string;
  coEmail: string;
  coPhone: string;
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
  if (value === null || value === undefined) return 'Not provided';
  if (typeof value === 'string' && value.trim() === '') return 'Not provided';
  return String(value).trim() || 'Not provided';
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

      // Primary Applicant Information
      addSection('PRIMARY APPLICANT INFORMATION', [
        { label: 'Name', value: `${safeString(applicationData.firstName)} ${safeString(applicationData.lastName)}` },
        { label: 'Email', value: applicationData.email },
        { label: 'Phone', value: applicationData.phone },
        { label: 'Date of Birth', value: applicationData.dateOfBirth },
        { label: 'SSN/ITIN', value: applicationData.ssn },
        { label: 'Address', value: applicationData.address },
        { label: 'City, State, ZIP', value: `${safeString(applicationData.city)} ${safeString(applicationData.state)} ${safeString(applicationData.zipCode)}`.trim() },
        { label: 'ID Type', value: applicationData.idType },
        { label: 'ID Number', value: applicationData.idNumber },
        { label: 'Annual Income', value: applicationData.income ? `$${applicationData.income}` : 'Not provided' },
        { label: 'Employment Status', value: applicationData.employment },
        { label: 'Credit Score Range', value: applicationData.creditScore },
        { label: 'Has Last 2 Paystubs', value: applicationData.paystubs }
      ]);

      // Loan Details
      addSection('LOAN DETAILS', [
        { label: 'Requested Loan Amount', value: applicationData.loanAmount ? `$${applicationData.loanAmount}` : 'Not provided' },
        { label: 'Down Payment', value: applicationData.downPayment ? `$${applicationData.downPayment}` : 'Not provided' },
        { label: 'Vehicle Interest', value: applicationData.vehicleInterest }
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
          { label: 'Co-Applicant Annual Income', value: applicationData.coIncome ? `$${applicationData.coIncome}` : 'Not provided' },
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
          <h2>Primary Applicant Information</h2>
          
          <div class="field">
            <span class="label">Name:</span>
            <span class="value">${applicationData.firstName} ${applicationData.lastName}</span>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${applicationData.email}</span>
          </div>
          
          <div class="field">
            <span class="label">Phone:</span>
            <span class="value">${applicationData.phone}</span>
          </div>
          
          <div class="field">
            <span class="label">Date of Birth:</span>
            <span class="value">${safeString(applicationData.dateOfBirth)}</span>
          </div>
          
          <div class="field">
            <span class="label">SSN/ITIN:</span>
            <span class="value">${safeString(applicationData.ssn)}</span>
          </div>
          
          <div class="field">
            <span class="label">Address:</span>
            <span class="value">${safeString(applicationData.address)}</span>
          </div>
          
          <div class="field">
            <span class="label">City, State, ZIP:</span>
            <span class="value">${`${safeString(applicationData.city)} ${safeString(applicationData.state)} ${safeString(applicationData.zipCode)}`.trim() || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">ID Type:</span>
            <span class="value">${safeString(applicationData.idType)}</span>
          </div>
          
          <div class="field">
            <span class="label">ID Number:</span>
            <span class="value">${safeString(applicationData.idNumber)}</span>
          </div>
          
          <div class="field">
            <span class="label">Annual Income:</span>
            <span class="value">${applicationData.income ? '$' + safeString(applicationData.income) : 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Employment Status:</span>
            <span class="value">${safeString(applicationData.employment)}</span>
          </div>
          
          <div class="field">
            <span class="label">Credit Score Range:</span>
            <span class="value">${safeString(applicationData.creditScore)}</span>
          </div>
          
          <div class="field">
            <span class="label">Has Last 2 Paystubs:</span>
            <span class="value">${safeString(applicationData.paystubs)}</span>
          </div>
          
          <h2>Loan Details</h2>
          
          <div class="field">
            <span class="label">Requested Loan Amount:</span>
            <span class="value">${applicationData.loanAmount ? '$' + safeString(applicationData.loanAmount) : 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Down Payment:</span>
            <span class="value">${applicationData.downPayment ? '$' + safeString(applicationData.downPayment) : 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Vehicle Interest:</span>
            <span class="value">${safeString(applicationData.vehicleInterest)}</span>
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