import express, { json } from 'express';
import nodemailer from 'nodemailer';
import { sendEmail } from './email/smpt';

const templates =
{
  "en-us": {
    "customer": {
      "reset-password": {
        "subject": "Reset Password Request",
        "heading": "Password Reset",
        "body": [
          { "type": "text", "content": "We received a request to reset your password." },
          { "type": "text", "content": "Please click the button below to sign in to your account." },
          { "type": "button", "text": "Reset Password", "href": "{{resetLink}}" },
          { "type": "text", "content": "If you didn’t request a password reset, you can safely ignore this email." }
        ]
      }
    },
    "csr": {
      "add-location": {
        "heading": "Action Required: User Location Addition Request",
        "body": [
          { "type": "text", "content": "A new request has been submitted to add a location." },
          { "type": "text", "content": "{{customerDetails}}" },
          { "type": "link", "text": "Review the request", "href": "{{reviewLink}}" }
        ]
      }
    }
  }
}

const filterList = (domain) => {
  const domains = ['nviz.com', 'synergy55.com', 'compositesone.com', 'gmail.com'];
  return domains.includes(domain.split('@')[1]);
};

function replacePlaceholders(template, variables) {
  return template.replace(/\{\{(.*?)\}\}/g, (match, variableName) => {
      return variables[variableName.trim()] || match;
  });
}

function renderContentBlocks(body, variables) {
  return body
      .map((block) => {
          switch (block.type) {
              case 'text':
                  return `<p>${replacePlaceholders(block.content, variables)}</p>`;
              case 'button':
                  return `<a href="${replacePlaceholders(
                      block.href,
                      variables
                  )}" style="padding: 10px; background-color: blue; color: white; text-decoration: none;">${
                      block.text
                  }</a>`;
              case 'link':
                  return `<a href="${replacePlaceholders(block.href, variables)}">${block.text}</a>`;
              default:
                  return '';
          }
      })
      .join('');
}

function getEmailContent(type, lang, userType, variables) {
  const template = templates[lang][userType][type];
  return {
      subject: replacePlaceholders(template.subject, variables),
      heading: replacePlaceholders(template.heading, variables),
      body: renderContentBlocks(template.body, variables),
  };
}

const sendEmail = async (req) => {
  const logger = initLogger();
  const { email, type, lang, userType } = req.body;

  logger.info(`Email domain allowed: ${filterList(email)}`);

  const variables = {
      resetLink: "www.google.com",
      customerDetails: "John Doe, 630-555-5555",
  };

  const { subject, heading, body } = getEmailContent(type, lang, userType, variables);
  const user = process.env.USER;
  const pass = process.env.PASS;
  console.log("U ", user.length);
  console.log("P ", pass.length)

  const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
          user: user,
          pass: pass
      },
  });

  const mailOptions = {
      from: 'thisisatestemailforsmtpcomp1@gmail.com',
      to: email,
      subject: subject,
      text: heading + "\n\n" + body.replace(/<[^>]*>?/gm, ""),
      html: `<h1>${heading}</h1>${body}`, 
  };

  try {
      logger.info('Attempting to send message...');
      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', info.response);
      return info;
  } catch (error) {
      logger.error('Error sending email:', error);
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

const app = createServer();

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
