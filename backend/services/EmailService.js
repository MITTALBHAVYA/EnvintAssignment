//EmailService.js
import nodemailer from "nodemailer";
class EmailService {
  constructor({ recipientEmail, emailSubject, emailMessage }) {
    this.recipientEmail = recipientEmail;
    this.emailSubject = emailSubject;
    this.emailMessage = emailMessage;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      service: process.env.SMTP_SERVICE, 
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD, 
      },
    });
  }

  async sendEmail() {
    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_MAIL}>`, 
      to: this.recipientEmail, 
      subject: this.emailSubject, 
      text: this.emailMessage,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId); 
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email could not be sent');
    }
  }
}

export default EmailService;
