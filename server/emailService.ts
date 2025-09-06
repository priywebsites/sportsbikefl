import nodemailer from 'nodemailer';

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
  coFirstName?: string | null;
  coLastName?: string | null;
  coEmail?: string | null;
  coPhone?: string | null;
  coDateOfBirth?: string | null;
  coSsn?: string | null;
  coIncome?: string | null;
  coEmployment?: string | null;
  coCreditScore?: string | null;
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

export async function sendLoanApplicationEmail(applicationData: LoanApplicationData) {
  try {
    const transporter = createTransporter();

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
            <span class="value">${applicationData.dateOfBirth || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">SSN/ITIN:</span>
            <span class="value">${applicationData.ssn || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Address:</span>
            <span class="value">${applicationData.address || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">City, State, ZIP:</span>
            <span class="value">${applicationData.city || ''} ${applicationData.state || ''} ${applicationData.zipCode || ''}</span>
          </div>
          
          <div class="field">
            <span class="label">ID Type:</span>
            <span class="value">${applicationData.idType || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">ID Number:</span>
            <span class="value">${applicationData.idNumber || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Annual Income:</span>
            <span class="value">$${applicationData.income || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Employment Status:</span>
            <span class="value">${applicationData.employment || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Credit Score Range:</span>
            <span class="value">${applicationData.creditScore || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Has Last 2 Paystubs:</span>
            <span class="value">${applicationData.paystubs || 'Not provided'}</span>
          </div>
          
          <h2>Loan Details</h2>
          
          <div class="field">
            <span class="label">Requested Loan Amount:</span>
            <span class="value">$${applicationData.loanAmount || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Down Payment:</span>
            <span class="value">$${applicationData.downPayment || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Vehicle Interest:</span>
            <span class="value">${applicationData.vehicleInterest || 'Not provided'}</span>
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
            <span class="value">${applicationData.coFirstName || ''} ${applicationData.coLastName || ''}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Email:</span>
            <span class="value">${applicationData.coEmail || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Phone:</span>
            <span class="value">${applicationData.coPhone || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Date of Birth:</span>
            <span class="value">${applicationData.coDateOfBirth || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant SSN/ITIN:</span>
            <span class="value">${applicationData.coSsn || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Annual Income:</span>
            <span class="value">$${applicationData.coIncome || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Employment:</span>
            <span class="value">${applicationData.coEmployment || 'Not provided'}</span>
          </div>
          
          <div class="field">
            <span class="label">Co-Applicant Credit Score:</span>
            <span class="value">${applicationData.coCreditScore || 'Not provided'}</span>
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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'breezepod.store@gmail.com',
      subject: `🏍️ New Motorcycle Loan Application - ${applicationData.firstName} ${applicationData.lastName}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Loan application email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending loan application email:', error);
    return { success: false, error: error.message };
  }
}