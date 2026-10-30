const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

async function testSendEmail() {
    try {
        // Check required environment variables
        const requiredVariables = [
            'SMTP_HOST',
            'SMTP_PORT',
            'SMTP_USER',
            'SMTP_PASSWORD',
            'SMTP_FROM',
            'TEST_EMAIL'
        ];

        for (const variable of requiredVariables) {
            if (!process.env[variable]) {
                throw new Error(`${variable} is missing from .env`);
            }
        }

        // Verify SMTP connection
        console.log('Checking SMTP connection...');

        await transporter.verify();

        console.log('SMTP connection successful!');

        // Send test email
        console.log('Sending test email...');

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.TEST_EMAIL,
            subject: 'RoamiO Email Test',
            text: 'Hello! This is a test email from the RoamiO backend.',
            html: `
                <h2>RoamiO Email Test</h2>
                <p>Hello!</p>
                <p>This is a test email from the RoamiO backend.</p>
                <p>If you received this message, your SMTP configuration is working!</p>
            `
        });

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Recipient:', process.env.TEST_EMAIL);

    } catch (error) {
        console.error('Email test failed:', error.message);
    } finally {
        transporter.close();
    }
}

testSendEmail();