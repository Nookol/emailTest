import express, { json } from 'express';
import nodemailer from 'nodemailer';

const templates =
{
    "en-us": {
      "customer": {
        "reset-password": {
          "subject": "Reset Password Request",
          "heading": "Password Reset",
          "template": "t1",
          "body": [
            { "type": "text", "content": "We received a request to reset your password." },
            { "type": "text", "content": "Please click the button below to sign in to your account." },
            { "type": "button", "text": "Reset Password", "href": "{{resetLink}}" },
            { "type": "text", "content": "If you didn’t request a password reset, you can safely ignore this email." }
          ]
        },
        "create-account": {
          "subject": "Create a Composites One account",
          "heading": "Create a Composites One account",
          "body": [
              { "type": "text", "content": "Dear {{firstName}} {{lastName}}," },
              { "type": "text", "content": "We received your request to create an account. Please continue the process by clicking the button below:" },
              { "type": "button", "text": "Complete Account Creation", "href": "{{accountCreationLink}}" },
              { "type": "text", "content": "Alternatively, try this link:" },
              { "type": "link", "text": "{{accountCreationLink}}", "href": "{{accountCreationLink}}" }
          ]
        },
        "order-confirmation": {
          "subject": "Your Order Has Been Successfully Submitted",
          "heading": "Your Order Has Been Successfully Submitted",
          "body": [
              { "type": "text", "content": "Hello {{userName}}," },
              { "type": "text", "content": "Thank you for your order! We’re excited to let you know that your order has been successfully submitted and is now being processed." },
              { "type": "text", "content": "Order Details:" },
              { 
                  "type": "list",
                  "items": [
                      { "label": "Order Number", "value": "{{orderNumber}}" },
                      { "label": "Order Date", "value": "{{orderDate}}" },
                      { "label": "Items Ordered", "value": "{{itemsSummary}}" }
                  ]
              },
              { "type": "text", "content": "You will receive another notification once your order has been shipped. In the meantime, if you have any questions or need to make changes, please contact our support team." },
              { "type": "text", "content": "Thank you for choosing Composites One. We appreciate your business!" }
          ]
      }
      },
      "csr": {
        "add-location": {
          "heading": "Action Required: User Location Addition Request",
          "template": "t1",
          "body": [
            { "type": "text", "content": "A new request has been submitted to add a location." },
            { "type": "text", "content": "{{customerDetails}}" },
            { "type": "link", "text": "Review the request", "href": "{{reviewLink}}" },
            { "type": "button", "text": "Review Request", "href": "{{requestLink}}" }
          ]
        },
          "user-login-assistance": {
                "subject": "Action Required: User Login Assistance Needed",
                "heading": "Action Required: User Login Assistance Needed",
                "body": [
                    { "type": "text", "content": "A user has attempted to log in multiple times with incorrect credentials and has been temporarily locked out of their account. Please contact the user to assist with resolving the issue." },
                    { "type": "text", "content": "User Details:" },
                    { 
                        "type": "list",
                        "items": [
                            { "label": "User Name", "value": "{{userName}}" },
                            { "label": "Account ID", "value": "{{accountId}}" },
                            { "label": "Email", "value": "{{userEmail}}" },
                            { "label": "Lockout Reason", "value": "Too many failed login attempts" }
                        ]
                    },
                    { "type": "text", "content": "To view the account and assist the user, please click the link below:" },
                    { "type": "button", "text": "View User Account", "href": "{{userAccountLink}}" }
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
                    return `<a href="${replacePlaceholders(
                        block.href,
                        variables
                    )}" style="background-color: #104c8c; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">${
                        block.text
                    }</a>`;
                case 'link':
                    return `<a href="${replacePlaceholders(block.href, variables)}">${block.text}</a>`;
                case 'list':
                    return `
                        <ul style="list-style-type: none; padding: 0;">
                            ${block.items
                                .map(
                                    item => `<li><strong>${item.label}:</strong> ${replacePlaceholders(item.value, variables)}</li>`
                                )
                                .join('')}
                        </ul>
                    `;
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
        html: `<div style="padding: 20px; font-family: Arial, sans-serif; text-align: left;">
                <div style="width: 150px; height: 80px; background-image: url('${img}'); background-size: contain; background-repeat: no-repeat; background-position: left; margin-bottom: 10px;"></div>
                
                <h1 style="font-size: 24px; color: #333; margin: 0 0 10px 0;">${heading}</h1>
                
                <div style="max-width: 600px; text-align: left;">
                    ${body}
                </div>

                
                <div style="text-align: center; margin-top: 20px;">
                    <p style="background-color: #f2f2f2; padding: 30x; display: inline-block; color: #000; border-radius: 5px;">
                        If you have any additional questions, please email <a href="mailto:support@compositesone.com" style="text-decoration: underline;">support@compositesone.com</a>.
                    </p>
                </div>
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
