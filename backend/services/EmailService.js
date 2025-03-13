import nodemailer from "nodemailer";
import logger from "../utils/logger.js"; 

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

    logger.info(`EmailService initialized for recipient: ${recipientEmail}`);
  }

  async sendEmail() {
    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_MAIL}>`, 
      to: this.recipientEmail, 
      subject: this.emailSubject, 
      text: this.emailMessage,
    };

    try {
      logger.info(`Attempting to send email to ${this.recipientEmail} with subject: "${this.emailSubject}"`);

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${this.recipientEmail} (Message ID: ${info.messageId})`);
      
      return info;
    } catch (error) {
      logger.error(`Failed to send email to ${this.recipientEmail} - Error: ${error.message}`);
      throw new Error("Email could not be sent");
    }
  }
}

export default EmailService;
