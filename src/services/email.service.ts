import * as nodemailer from 'nodemailer';

// Configura el transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.CORREO}`,
    pass: `${process.env.CORREO_PASS}`,
  },
});

// Función para enviar el código de verificación de registro
export function sendCodeVerification(correoDestino: string, codigo: string) {
  const mailOptions = {
    from: `${process.env.CORREO}`,
    to: correoDestino,
    subject: 'Código de Verificación',
    text: `Tu código de verificación es: ${codigo}`,
  };

  transporter.sendMail(mailOptions, (error: any, info: { response: any }) => {
    if (error) {
      console.log(`${process.env.CORREO}`, `${process.env.CORREO_PASS}`);
      console.error('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
}

// Función para enviar el código de verificación de recuperación de contraseña
export function sendCodeForgotPassword(correoDestino: string, codigo: string) {
  const mailOptions = {
    from: `${process.env.CORREO}`,
    to: correoDestino,
    subject: 'Código de Verificación',
    text: `Ingresa el siguiente codigo para recuperar tu contraseña: ${codigo}`,
  };

  transporter.sendMail(mailOptions, (error: any, info: { response: any }) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
}

// Funcion para reenviar codigo de verificación
export function resendCodeService(correoDestino: string, codigo: string) {
  const mailOptions = {
    from: `${process.env.CORREO}`,
    to: correoDestino,
    subject: 'Código de Verificación',
    text: `Tu nuevo codigo es: ${codigo}`,
  };

  transporter.sendMail(mailOptions, (error: any, info: { response: any }) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
}
