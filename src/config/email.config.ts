// https://www.npmjs.com/package/zeptomail

// For ES6
import { COMPANY_ADDRESS, COMPANY_DOMAIN, COMPANY_NAME } from "@config";
import { SendMailClient } from "zeptomail";
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

// For CommonJS
// var { SendMailClient } = require("zeptomail");

export const SendMail = (toName, toEmail, message) => {

    const url = "api.zeptomail.com/";
    const token = "Zoho-enczapikey wSsVR60l8h6lDqcomDKudr09nlVXAQz/FUwr2FKovyP1HvzD88c7xkXOBwKgHvYcRzVuFjYQp7t8yR1RgTRbi9ksylxVCyiF9mqRe1U4J3x17qnvhDzIXmhelhqJKIwMzwRik2djEM1u";

    let client = new SendMailClient({url, token});

    client.sendMail({
        "from": 
        {
            "address": "noreply@afruna.com",
            "name": "noreply"
        },
        "to": 
        [
            {
            "email_address": 
                {
                    "address": toEmail,
                    "name": toName
                }
            }
        ],
        "subject": "Afruna Support",
        "htmlbody": "<div><b> " + message + "</b></div>",
    }).then((resp) => console.log("success")).catch((error) => console.log("error"));

}

export const SendEmail = (toName, toEmail, message, emailType = EMAIL_TYPE.VERIFY_EMAIL) => {

    // Configure the email transporter for Zoho Mail
    let transporter = nodemailer.createTransport({
        host: 'smtp.zeptomail.com',
        port: 587,  // Use 465 for SSL
        secure: false,  // Use true for 465, false for other ports
        auth: {
            user: 'emailapikey',
            pass: 'wSsVR60l8h6lDqcomDKudr09nlVXAQz/FUwr2FKovyP1HvzD88c7xkXOBwKgHvYcRzVuFjYQp7t8yR1RgTRbi9ksylxVCyiF9mqRe1U4J3x17qnvhDzIXmhelhqJKIwMzwRik2djEM1u'
        }
    });

    let subject = '';

    // Configure Handlebars template engine

    switch (emailType)
    {
        case EMAIL_TYPE.VERIFY_EMAIL:

            transporter.use('compile', hbs({
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: path.join(__dirname, 'email/verify-email'),
                    layoutsDir: path.join(__dirname, 'email/verify-email'),
                    defaultLayout: '',
                },
                viewPath: path.join(__dirname, 'email/verify-email'),
                extName: '.hbs'
            }));
        
            subject = "Afruna Email Verification"
        break;

        case EMAIL_TYPE.RESET_PASSWORD:

            transporter.use('compile', hbs({
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: path.join(__dirname, 'email/reset-password'),
                    layoutsDir: path.join(__dirname, 'email/reset-password'),
                    defaultLayout: '',
                },
                viewPath: path.join(__dirname, 'email/reset-password'),
                extName: '.hbs'
            }));

            subject = "Afruna Password Reset"
        
        break;
    }
    
    // Define the email options
    let mailOptions = {
        from: '"Afruna Team" <noreply@afruna.com>',
        to: toEmail,
        subject,
        template: 'html',  // Template file name without extension
        context: {
            name: toName,
            token: message,
            companyDomain: COMPANY_DOMAIN,
            companyName: COMPANY_NAME,
            companyAddress: COMPANY_ADDRESS
        }
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Email sent successfully:', info.response);
    });
};

export enum EMAIL_TYPE {
    VERIFY_EMAIL = "VERIFY_EMAIL",
    RESET_PASSWORD = "RESET_PASSWORD"
}

