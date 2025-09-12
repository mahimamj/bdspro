const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send payment confirmation email
const sendPaymentConfirmation = async (payment) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: payment.email,
      subject: 'Payment Confirmed - BDS PRO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Confirmed!</h2>
          <p>Dear ${payment.name},</p>
          <p>Your payment has been successfully verified and confirmed.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Payment Details</h3>
            <p><strong>Amount:</strong> ${payment.amount} USDT</p>
            <p><strong>Network:</strong> ${payment.network}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">PAID</span></p>
            <p><strong>Confirmed At:</strong> ${new Date(payment.paidAt).toLocaleString()}</p>
            ${payment.txHash ? `<p><strong>Transaction Hash:</strong> ${payment.txHash}</p>` : ''}
          </div>
          
          <p>Thank you for your payment. If you have any questions, please contact our support team.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              BDS PRO Team
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent:', result.messageId);
    return result;

  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

// Send payment submission confirmation
const sendPaymentSubmission = async (payment) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: payment.email,
      subject: 'Payment Submitted - BDS PRO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Submitted Successfully!</h2>
          <p>Dear ${payment.name},</p>
          <p>Your payment has been submitted and is currently under review.</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Payment Details</h3>
            <p><strong>Amount:</strong> ${payment.amount} USDT</p>
            <p><strong>Network:</strong> ${payment.network}</p>
            <p><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">PENDING REVIEW</span></p>
            <p><strong>Submitted At:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
          </div>
          
          <p>We will review your payment and send you a confirmation email once it's verified. This usually takes a few minutes.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              BDS PRO Team
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment submission email sent:', result.messageId);
    return result;

  } catch (error) {
    console.error('Error sending payment submission email:', error);
    throw error;
  }
};

module.exports = {
  sendPaymentConfirmation,
  sendPaymentSubmission
};
