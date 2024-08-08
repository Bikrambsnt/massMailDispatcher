const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');
const emailValidator = require('email-validator');//For validating Email
require('dotenv').config(); //for sensetive data

const app = express();
const port = 5000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file.path;
  const fromEmail = req.body.fromEmail;
  const subject = req.body.subject;
  const message = req.body.message;

  const validEmails = [];
  const invalidEmails = [];

  fs.createReadStream(file)
    .pipe(csv())
    .on('data', (row) => {
      const email = row['emails'];
      if (emailValidator.validate(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      
      // Send preliminary response
      res.json({ invalidEmails, status: 'sending' });

      // Start sending emails after sending the  response
      sendEmails(validEmails, fromEmail, subject, message, () => {
        console.log('All emails processed successfully');
      });
    });
});

function sendEmails(emails, fromEmail, subject, message, callback) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  });

  let emailIndex = 0;

  function sendNextEmail() {
    if (emailIndex >= emails.length) {
      
      console.log('All emails processed successfully');
      callback();
      return;
    }

    const email = emails[emailIndex];
    console.log(`Processing email: ${email}`);
    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: subject,
      text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Error sending to ${email}:`, error);
      } else {
        
        console.log(`Email sent to ${email}: ${info.response}`);
      }

      emailIndex++;
      setTimeout(sendNextEmail, 1000); // Wait 1 second before sending another Email.

    });
  }

  sendNextEmail();
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
