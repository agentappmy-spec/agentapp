import { Resend } from 'resend';

// We use the proxy path defined in vite.config.js
// This prevents CORS issues during local development
const RESEND_API_URL = '/api/resend/emails';
const API_KEY = 're_X1HM7cz6_PrsUE2wmMkJGj9PvTM45oNJ3';

/**
 * Send an email via Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<any>}
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const response = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                from: 'AgentApp <system@mail.agentapp.my>', // Verified domain
                to: [to],
                subject: subject,
                html: html
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send email');
        }

        return await response.json();
    } catch (error) {
        console.error('Email Service Error:', error);
        throw error;
    }
};

/**
 * Common Email Template with inline styles for compatibility
 */
const getEmailTemplate = (header, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        @media only screen and (max-width: 620px) {
            table.body h1 { font-size: 28px !important; margin-bottom: 10px !important; }
            table.body p, table.body ul, table.body ol, table.body td, table.body span, table.body a { font-size: 16px !important; }
            table.body .wrapper, table.body .article { padding: 10px !important; }
            table.body .content { padding: 0 !important; }
            table.body .container { padding: 0 !important; width: 100% !important; }
            table.body .main { border-left-width: 0 !important; border-radius: 0 !important; border-right-width: 0 !important; }
        }
    </style>
</head>
<body style="background-color: #f6f9fc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f9fc;">
        <tr>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;">
                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                    
                    <!-- START CENTERED WHITE CONTAINER -->
                    <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 8px; width: 100%;">
                        
                        <!-- START HEADER -->
                        <tr>
                            <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                                    <tr>
                                        <td style="font-family: sans-serif; font-size: 24px; font-weight: bold; vertical-align: top; text-align: center; color: #4f46e5; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
                                            <span style="font-size: 24px;">🛡️ AgentApp</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- END HEADER -->

                        <tr>
                            <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                                    <tr>
                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
                                            ${bodyContent}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <!-- END CENTERED WHITE CONTAINER -->

                    <!-- START FOOTER -->
                    <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                            <tr>
                                <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;">
                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">AgentApp Inc, Kuala Lumpur, Malaysia</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <!-- END FOOTER -->

                </div>
            </td>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Send OTP Email
 * @param {string} email 
 * @param {string} otp 
 */
export const sendOtpEmail = async (email, otp) => {
    const html = getEmailTemplate('Secure Login', `
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hi there,</p>
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You requested a One-Time Password (OTP) to login to <b>AgentApp</b>.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;">
            <tbody>
                <tr>
                    <td align="center" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                            <tbody>
                                <tr>
                                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #f3f4f6; border-radius: 5px; text-align: center;">
                                        <div style="display: inline-block; color: #1f2937; background-color: #f3f4f6; border: solid 1px #e5e7eb; border-radius: 5px; box-sizing: border-box; cursor: pointer; font-size: 32px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; letter-spacing: 8px;">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">This code is valid for 10 minutes. Please do not share this code with anyone.</p>
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If you didn't request this, you can safely ignore this email.</p>
    `);

    return sendEmail(email, 'Your Logic Code', html);
};

/**
 * Send Welcome Email
 * @param {string} email 
 * @param {string} name 
 */
export const sendWelcomeEmail = async (email, name) => {
    const html = getEmailTemplate('Welcome!', `
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welcome, <b>${name}</b>! 🎉</p>
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">We are thrilled to have you on board. AgentApp is designed to help you organize your contacts, track deals, and close more sales.</p>
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Here are a few things you can do to get started:</p>
        <ul style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            <li>Import your existing contacts</li>
            <li>Set up your public profile page</li>
            <li>Connect your WhatsApp for one-click messages</li>
        </ul>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;">
            <tbody>
                <tr>
                    <td align="center" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                            <tbody>
                                <tr>
                                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #4f46e5; border-radius: 5px; text-align: center;">
                                        <a href="http://localhost:5173" target="_blank" style="display: inline-block; color: #ffffff; background-color: #4f46e5; border: solid 1px #4f46e5; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #4f46e5;">Go to Dashboard</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Good luck!</p>
    `);
    return sendEmail(email, 'Welcome to AgentApp!', html);
};
