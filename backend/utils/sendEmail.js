// const nodemailer = require("nodemailer");
// const ejs = require("ejs");
// const path = require("path");
// const dotenv = require("dotenv");

// dotenv.config();

// // In CommonJS, __dirname is available globally
// // No need for fileURLToPath and dirname imports

// const GoogleSendMail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com", // Fixed typo: "smpt" -> "smtp"
//     port: parseInt("465" || "587"),
//     service: "gmail",
//     auth: {
//       user: "asiri@aiesec.net",
//       pass: "qepxfdccqmvdrgrt",
//     },
//   });

//   const { email, subject, template, data } = options;

//   // Render HTML based on a template
//   const templatePath = path.join(__dirname, "../mails", template);
//   const html = await ejs.renderFile(templatePath, data);
//   const mailOptions = {
//     from: process.env.SMTP_USER || "asiri@aiesec.net", // Added fallback for the from field
//     to: email,
//     subject,
//     html,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = GoogleSendMail;

const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// In CommonJS, __dirname is available globally
// No need for fileURLToPath and dirname imports

const GoogleSendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Fixed typo: "smpt" -> "smtp"
    port: parseInt("465" || "587"),
    service: "gmail",
    auth: {
      user: "eventlink.sliit@gmail.com",
      pass: "utlvrsizwqmwcbtn",
    },
  });

  const { email, subject, template, data } = options;

  // Render HTML based on a template
  const templatePath = path.join(__dirname, "../mails", template);
  const html = await ejs.renderFile(templatePath, data);
  const mailOptions = {
    from: process.env.SMTP_USER || "eventlink.sliit@gmail.com", // Added fallback for the from field
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = GoogleSendMail;