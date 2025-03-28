import Email from 'email-templates';
import nodeMailer from 'nodemailer';
import * as Config from '@config';
import { UserInterface } from '@interfaces/User.Interface';
// import SMTPTransport from 'nodemailer/lib/smtp-transport';
// import sgTransport from 'nodemailer-sendgrid-transport';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { logger } from '@utils/logger';
import path from 'path';
import { TokenInterface } from '@interfaces/Token.Interface';
import { EMAIL_TYPE, SendEmail, SendMail } from 'src/config/email.config';
const mailjetTransport = require('nodemailer-mailjet-transport');
const mailgunTransport = require('nodemailer-mailgun-transport');

type EmailTemplate = 'verifyEmail' | 'resetPassword';

class Mailer {
  private email;
  private transporter;
  private templates: Record<EmailTemplate, string> = {
    verifyEmail: 'verify-email',
    resetPassword: 'reset-password',
  };

  // private options = {
  //   auth: {
  //     api_key: Config.SMTP_PASSWORD,
  //   },
  // };

  constructor() {
    this.transporter = Config.OPTIONS.USE_MAILJET
      ? nodeMailer.createTransport(
          mailjetTransport({
            auth: {
              apiKey: Config.MAILJET_KEY,
              apiSecret: Config.MAILJET_SECRET,
            },
          }),
        )
      : Config.OPTIONS.USE_MAILGUN
      ? nodeMailer.createTransport(
          mailgunTransport({
            auth: {
              apiKey: Config.MAILGUN_KEY,
              domain: Config.MAILGUN_DOMAIN,
            },
          }),
        )
      : nodeMailer.createTransport(<SMTPTransport.Options>{
          // service: Config.SMTP_SERVICE,
          host: Config.SMTP_HOSTNAME,
          port: +Config.SMTP_PORT,
          secure: false, // set to false to allow tls
          auth: {
            user: Config.SMTP_USERNAME,
            pass: Config.SMTP_PASSWORD,
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false,
          },
        });

    this.email = new Email({
      send: true,
      transport: this.transporter,
      preview: true, // To preview in the browser
      views: {
        root: path.resolve(__dirname, '../../../email'),
        options: {
          extension: 'hbs',
        },
      },
    });
  }

  async send(to: string | string[], template: EmailTemplate, locals?: Record<string, string>) {
    await this.email.send({
      // from: Config.DOMAIN_EMAIL,
      // to,
      // subject,
      // text,
      // html: this.templates[template],
      template: this.templates[template],
      message: {
        from: Config.DOMAIN_EMAIL,
        to,
      },
      locals: {
        ...locals,
        companyDomain: Config.COMPANY_NAME,
        companyAddress: Config.COMPANY_ADDRESS,
        companyName: Config.COMPANY_NAME,
      },
    });
  }

  async verifyEmail(token: DocType<TokenInterface & { user: DocType<UserInterface> }>) {
    // eslint-disable-next-line no-useless-catch
    try {
      // await this.send(token.user.email, 'verifyEmail', {
      //   token: <string>token.code,
      //   name: token.user.firstName,
      // });

      SendEmail(`${token.user.firstName}`, token.user.email, ` ${<string>token.code}`);
    } catch (error) {
      // throw error;
      logger.error([error]);
    }
  }

  async sendResetPassword(token: DocType<TokenInterface & { user: DocType<UserInterface> }>) {
    // eslint-disable-next-line no-useless-catch
    try {
      // await this.send(token.user.email, 'resetPassword', {
      //   token: <string>token.code,
      //   name: token.user.firstName,
      // });

      SendEmail(`${token.user.firstName}`, token.user.email, `${<string>token.code}`, EMAIL_TYPE.RESET_PASSWORD);
      
    } catch (error) {
      // throw error;
      logger.error([error]);
    }
  }
}

export default Config.OPTIONS.USE_SMTP || Config.OPTIONS.USE_MAILJET || Config.OPTIONS.USE_MAILGUN
  ? new Mailer()
  : null;
