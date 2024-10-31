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
              { "type": "text", "content": "Hello {{firstName}} {{lastName}}," },
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
    },
    "es-mx": {
    "customer": {
      "reset-password": {
        "subject": "Solicitud de Restablecimiento de Contraseña",
        "heading": "Restablecimiento de Contraseña",
        "template": "t1",
        "body": [
          { "type": "text", "content": "Hemos recibido una solicitud para restablecer tu contraseña." },
          { "type": "text", "content": "Haz clic en el botón de abajo para iniciar sesión en tu cuenta." },
          { "type": "button", "text": "Restablecer Contraseña", "href": "{{resetLink}}" },
          { "type": "text", "content": "Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo." }
        ]
      },
      "create-account": {
        "subject": "Crea una cuenta en Composites One",
        "heading": "Crea una cuenta en Composites One",
        "body": [
          { "type": "text", "content": "Estimado/a {{firstName}} {{lastName}}," },
          { "type": "text", "content": "Hemos recibido tu solicitud para crear una cuenta. Por favor, continúa el proceso haciendo clic en el botón de abajo:" },
          { "type": "button", "text": "Completar Creación de Cuenta", "href": "{{accountCreationLink}}" },
          { "type": "text", "content": "Alternativamente, intenta con este enlace:" },
          { "type": "link", "text": "{{accountCreationLink}}", "href": "{{accountCreationLink}}" }
        ]
      },
      "order-confirmation": {
        "subject": "Tu Pedido ha Sido Enviado Exitosamente",
        "heading": "Tu Pedido ha Sido Enviado Exitosamente",
        "body": [
          { "type": "text", "content": "Hola {{firstName}} {{lastName}}," },
          { "type": "text", "content": "¡Gracias por tu pedido! Nos complace informarte que tu pedido ha sido enviado exitosamente y ahora está siendo procesado." },
          { "type": "text", "content": "Detalles del Pedido:" },
          {
            "type": "list",
            "items": [
              { "label": "Número de Pedido", "value": "{{orderNumber}}" },
              { "label": "Fecha del Pedido", "value": "{{orderDate}}" },
              { "label": "Artículos Pedidos", "value": "{{itemsSummary}}" }
            ]
          },
          { "type": "text", "content": "Recibirás otra notificación una vez que tu pedido haya sido enviado. Mientras tanto, si tienes preguntas o necesitas hacer cambios, por favor contacta a nuestro equipo de soporte." },
          { "type": "text", "content": "¡Gracias por elegir Composites One! Apreciamos tu preferencia." }
        ]
      }
    },
    "csr": {
      "add-location": {
        "heading": "Acción Requerida: Solicitud de Adición de Ubicación de Usuario",
        "template": "t1",
        "body": [
          { "type": "text", "content": "Se ha recibido una nueva solicitud para añadir una ubicación." },
          { "type": "text", "content": "{{customerDetails}}" },
          { "type": "link", "text": "Revisar la solicitud", "href": "{{reviewLink}}" },
          { "type": "button", "text": "Revisar Solicitud", "href": "{{requestLink}}" }
        ]
      },
      "user-login-assistance": {
        "subject": "Acción Requerida: Asistencia de Inicio de Sesión del Usuario Necesaria",
        "heading": "Acción Requerida: Asistencia de Inicio de Sesión del Usuario Necesaria",
        "body": [
          { "type": "text", "content": "Un usuario ha intentado iniciar sesión varias veces con credenciales incorrectas y ha sido bloqueado temporalmente de su cuenta. Por favor, contacta al usuario para ayudarle a resolver el problema." },
          { "type": "text", "content": "Detalles del Usuario:" },
          {
            "type": "list",
            "items": [
              { "label": "Nombre de Usuario", "value": "{{userName}}" },
              { "label": "ID de Cuenta", "value": "{{accountId}}" },
              { "label": "Correo Electrónico", "value": "{{userEmail}}" },
              { "label": "Razón del Bloqueo", "value": "Demasiados intentos fallidos de inicio de sesión" }
            ]
          },
          { "type": "text", "content": "Para ver la cuenta y asistir al usuario, haz clic en el enlace de abajo:" },
          { "type": "button", "text": "Ver Cuenta de Usuario", "href": "{{userAccountLink}}" }
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
    const { email, type, lang, userType, firstName, lastName } = req.body;

    if (!filterList(email)) {
        console.error(`Email domain: ${email.split('@')[1]} not supported.`);
    }

    console.log(`Email domain allowed: ${filterList(email)}`);
    
    const variables = {
        resetLink: "www.google.com",
        customerDetails: "John Doe, 630-555-5555",
        requestLink: "www.compositesone.com",
        accountCreationLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        orderNumber: "UmmmBLAH123",
        orderDate: "2024-10-31",
        itemsSummary: "Sample item summary",
        userAccountLink: "www.useraccountlink.com",
        firstName:  "Nick", 
        lastName: "Albert"   
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

                ${userType === 'customer' ? `
                <div style="max-width: 600px; background-color: #f2f2f2; padding: 15px; text-align: center; margin-top: 20px; border-radius: 5px;">
                    <p style="color: #000; margin: 0;">
                        If you have any additional questions, please email <a href="mailto:support@compositesone.com" style="text-decoration: underline; color: inherit;">support@compositesone.com</a>.
                    </p>
                </div>` : ``}
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
