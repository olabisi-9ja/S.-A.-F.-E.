import nodemailer from 'nodemailer';

async function generate() {
  const account = await nodemailer.createTestAccount();
  console.log('--- ETHEREAL CREDENTIALS ---');
  console.log('SMTP_HOST=' + account.smtp.host);
  console.log('SMTP_PORT=' + account.smtp.port);
  console.log('SMTP_USER=' + account.user);
  console.log('SMTP_PASS=' + account.pass);
  console.log('----------------------------');
}

generate();
