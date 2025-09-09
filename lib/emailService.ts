import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password' // Use App Password for Gmail
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('Sending email to:', options.to);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'BDS PRO <noreply@bdspro.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generatePasswordResetEmail(userName: string, resetLink: string): EmailOptions {
  return {
    to: '', // Will be set when calling
    subject: 'Password Reset Request - BDS PRO',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">BDS PRO</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password for your BDS PRO account. 
            If you made this request, click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px; background: #f0f0f0; padding: 10px; border-radius: 5px;">
            ${resetLink}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 BDS PRO. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Hello ${userName},
      
      We received a request to reset your password for your BDS PRO account.
      
      To reset your password, click this link: ${resetLink}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      BDS PRO Team
    `
  };
}

export function generateWelcomeEmail(userName: string, loginLink: string): EmailOptions {
  return {
    to: '', // Will be set when calling
    subject: 'Welcome to BDS PRO - Your Account is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BDS PRO!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your account is ready</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Welcome to BDS PRO! Your account has been successfully created and you're ready to start your investment journey.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Complete your profile setup</li>
              <li>Explore our investment plans</li>
              <li>Start building your portfolio</li>
              <li>Invite friends and earn rewards</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 BDS PRO. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Hello ${userName},
      
      Welcome to BDS PRO! Your account has been successfully created.
      
      Access your dashboard: ${loginLink}
      
      What's Next?
      - Complete your profile setup
      - Explore our investment plans
      - Start building your portfolio
      - Invite friends and earn rewards
      
      If you have any questions, feel free to contact our support team.
      
      Best regards,
      BDS PRO Team
    `
  };
}
