import express, { json } from 'express';
import nodemailer from 'nodemailer';

const templates = {
  "en-us":
  {
      "customer":
      {
          "reset-password":
          {
              "subject" : "Reset Password Request",
              "heading" : "Password Reset",
              "body" : "We received a request to reset your password. Please click the button below to sign in to your account where you will be able to create a new password.",
              "buttonText" : "Reset Password",
              "buttonHref": "__HREF_PLACEHOLDER__"
          }
      },
      "csr":
      {
          "add-location":
              {
                  "heading" : "Action Required: User Location Addition Request",
                  "body" : [
                            "A new request has been submitted by a user to add a location to their account. Please review the details and take the necessary actions.",
                            "__CUSTOMER_DETAILS_PLACEHOLDER__"
                           ],    
                  "link": "_LINK_PLACEHOLDER__"
              },
          "cerft-of-analysis-doc":
              {
                  "heading" : "Action Required: Request for Certificates of Analysis Documents",
                  "body" : {
                              "static-text" : "A purchase has been completed, and the customer has requested certificates of analysis (CoA) documents for the ordered items. Please review the details below and ensure the requested documents are provided.",
                              "customer-details": "__CUSTOMER_DETAILS_PLACEHOLDER__"
                           },
                  "link": "_LINK_PLACEHOLDER__"
              }
      }

  }
}

const filterList = (domain) => {
  const domains = ['nviz.com', 'synergy55.com', 'compositesone.com', 'gmail.com'];
  return domains.includes(domain.split('@')[1]);
};

const getTemplate = (lang, userType, emailType) => {
  return templates[lang][userType][emailType];
};

const getEmailHtml = (template, email) => {
  const { heading, body, buttonText, buttonHref } = template;

  return (
      `<h1> ${heading} </h1>
      ${body}
      <button href=${buttonHref}>${buttonText}</button>`
  );
};

export const sendEmail = async (req) => {
  const { email, type, lang, userType } = req.body;


  const template = getTemplate(lang, userType, type);
  const emailHtml = getEmailHtml(template, email);
  const user = process.env.USER;
  const pass = process.env.PASS;
  console.log("U ", user.length);
  console.log("P ", pass.length)


  const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
          user: user,
          pass: pass,
      },
  });
  
  const mailOptions = {
      from: "thisisatestemailforsmtpcomp1@gmail.com",
      to: email,
      subject: template.subject,
      text: String(template.body),
      html: String(emailHtml),  
  };

  try {
      console.info("Attempting to send message...");
      const info = await transporter.sendMail(mailOptions);
      console.info("Email sent successfully:", info.response);
      return info;
  } catch (error) {
      console.error("Error sending email:", error);
      throw error;
  }
};



function createServer() {
  const app = express();

  app.use(json());
  app.use('/email', async (req, res) => {
    await sendEmail(req)
    res.send("WORKING!");
  });

  return app;
}

const PORT = 3001;
const app = createServer();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
