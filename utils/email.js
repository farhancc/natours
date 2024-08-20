const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText, convert } = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `FARHAN.CC <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid;
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
      // return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // 1)Render Html template for rendering
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject }
    );
    // 2)define mail options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    // 3)create a transport and send mail
    await this.newTransport().sendMail(emailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'welcome to the Natours Family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Reset token(valid :10 min)'
    );
  }
};
// const sendEmail = async (options) => {
//   //1 create a transporter
//   const transport = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   //2 define the mail options
//   const emailOptions = {
//     from: 'Farhan <farhancc123@gmial.com>',
//     to: options.email,
//     subject: options.email,
//     text: options.message,
//   };
//   //3 actually send email
//   await transport.sendMail(emailOptions);
// };
// module.exports = sendEmail;
