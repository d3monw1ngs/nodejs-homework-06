import nodemailer from 'nodemailer';
import 'dotenv/config';

const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

const nodemailerConfig = {
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USER, // email address from .env
        pass: EMAIL_PASSWORD, // email password from .env
    },
};

//  Create the transporter using the configuration above
const transporter = nodemailer.createTransport(nodemailerConfig);

// Function to send email
export const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: EMAIL_USER,
        to,
        subject,
        html: htmlContent,
    };
    try {
        // Use the transporter to send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Error sending email');
    }
};
