// server.js (Node.js)

const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

app.use(bodyParser.json());

// Create a transporter (using Gmail in this example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Your email
    pass: 'your-email-password',   // Your email password
  },
});

// Send email route
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'info@aiseci.com', // Email to send query to
    subject: `Query from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Error sending email");
    }
    res.status(200).send("Email sent successfully");
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
