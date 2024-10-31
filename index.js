import express, { json } from 'express';
import nodemailer from 'nodemailer';

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
    if (typeof template === 'string') {
        return template.replace(/\{\{(.*?)\}\}/g, (match, variableName) => {
            return variables[variableName.trim()] || match;
        });
    } else if (Array.isArray(template)) {
        return template.map(item => replacePlaceholders(item, variables));
    } else if (typeof template === 'object' && template !== null) {
        const result = {};
        for (const key in template) {
            result[key] = replacePlaceholders(template[key], variables);
        }
        return result;
    }
    return template;
}


function renderContentBlocks(body, variables) {
    return body
        .map((block) => {
            switch (block.type) {
                case 'text':
                    return `<p>${replacePlaceholders(block.content, variables)}</p>`;
                case 'button':
                    return `<a  href="${replacePlaceholders(
                        block.href,
                        variables
                    )}" style=" text-align: center; max-width: 30%; padding: 10px; background-color: #0F4C8B; color: white; text-decoration: none;"">${
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
    const { email, type, lang, userType } = req.body;

    if (!filterList(email)) {
        console.error(`Email domain: ${email.split('@')[1]} not supported.`);
    }

    console.log(`Email domain allowed: ${filterList(email)}`);

    const variables = {
        resetLink: "www.google.com",
        customerDetails: "John Doe, 630-555-5555",
        requestLink: "www.compositesone.com"
    };

    const { subject, heading, body } = getEmailContent(type, lang, userType, variables);

    const img = "https://www.mmsonline.com/cdn/showrooms/profile/images1/COMPOSITE%20ONE%20NEW.1644250970441.png";


    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'thisisatestemailforsmtpcomp1@gmail.com',
            pass: 'kwce rppd wrod jjfj',
        },
    });

    const mailOptions = {
        from: 'thisisatestemailforsmtpcomp1@gmail.com',
        to: email,
        subject: subject,
        text: heading + "\n\n" + body.replace(/<[^>]*>?/gm, ""),
        html: `<div style="display: flex; flex-direction: column">
                <img src="${img}" 
                    alt="Composites One Logo" 
                    style="width: 150px; height: auto; display: inline-block; margin-right: 10px; vertical-align: middle;">
                <h1>${heading}</h1>
                ${body}
              </div>`
    };

    try {
        console.log('Attempting to send message...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
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
  console.log(`Server is running on http://localhost:${process.env.PORT || 3001}`);
});
