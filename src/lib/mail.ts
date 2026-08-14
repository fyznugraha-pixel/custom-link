import { Resend } from 'resend';

export const sendOtpEmail = async (email: string, code: string, type: 'register' | 'reset' = 'register') => {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

  const subject = type === 'reset' ? 'Reset Your Password' : 'Your Verification Code';
  const heading = type === 'reset' ? 'Reset your password' : 'Verify your email';
  const textBody = type === 'reset' 
    ? 'You have requested to reset your password. Please use the following OTP code to proceed. This code is valid for 10 minutes.' 
    : 'Thank you for registering. Please use the following OTP code to verify your email address. This code is valid for 10 minutes.';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0f172a; text-align: center;">${heading}</h2>
      <p style="color: #475569; font-size: 16px;">Hello,</p>
      <p style="color: #475569; font-size: 16px;">${textBody}</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${code}</span>
      </div>
      
      <p style="color: #475569; font-size: 14px; text-align: center;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not found. The OTP code is:', code);
      return { success: false, error: 'API_KEY_NOT_FOUND' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Fyurl <noreply@fyurl.fun>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      console.warn('⚠️ Fallback: The OTP code is:', code);
      return { success: false, error };
    }

    console.log('Email sent successfully via Resend:', data);
    console.log(`🔑 OTP CODE FOR ${email}: ${code}`);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    console.warn('⚠️ Fallback: The OTP code is:', code);
    return { success: false, error };
  }
};
