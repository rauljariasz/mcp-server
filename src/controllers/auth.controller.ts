import { Request, Response } from 'express';
import prisma from '../models/user.prisma';
import {
  comparePasswords,
  generateRefresh,
  generateToken,
  hashPassword,
  setVerificationCode,
} from '../services/auth.service';
import { verifyCodeGenerate } from '../utils/verifyCodeGenerate';
import {
  resendCodeService,
  sendCodeForgotPassword,
  sendCodeVerification,
} from '../services/email.service';

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, username, name, last_name } = req.body;

  try {
    // *---------------* //
    // Pre validaciones //
    // *-------------* //
    if (!email || !password || !username || !name || !last_name) {
      res.status(400).json({
        message:
          "Los siguientes campos: 'Correo, contraseña, usuario, nombre, apellido' son obligatorios.",
      });
      return;
    }

    const existingUser = await prisma.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: 'El correo ingresado ya existe.' });
      return;
    }

    const existingUsername = await prisma.findUnique({ where: { username } });

    if (existingUsername) {
      res
        .status(400)
        .json({ message: 'El nombre de usuario ingresado ya existe.' });
      return;
    }

    // *-----------------* //
    // Logica de creación //
    // *---------------* //

    // Codigo de verificación
    const verificationCode = verifyCodeGenerate();
    sendCodeVerification(email, verificationCode);

    const hashedPassword = await hashPassword(password);

    const expiryDate = new Date();
    // Codigo valido por 1 hora.
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Creamos el usuario con el codigo de verificación y la expiración automaticamente.
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
        username,
        name,
        last_name,
        verification_code: verificationCode,
        code_expiry: expiryDate,
      },
    });

    res.status(201).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en el registro',
    });
  }
};

// Inicio de sesión del usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // *---------------* //
    // Pre validaciones //
    // *-------------* //
    if (!email) {
      res.status(400).json({ message: 'El email es obligatorio' });
      return;
    }
    if (!password) {
      res.status(400).json({ message: 'El password es obligatorio' });
      return;
    }

    // *------* //
    // Logica  //
    // *----* //

    const user = await prisma.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: 'Usuario y contraseñas no coinciden' });
      return;
    }

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      res.status(404).json({ message: 'Usuario y contraseñas no coinciden' });
      return;
    }

    // Si coinciden, validamos si esta verificado o no
    if (user?.verified) {
      const {
        password,
        id: userId,
        last_name,
        viewed_classes,
        ...userInfo
      } = user;
      const token = generateToken(user);
      const refresh = generateRefresh(user);
      res.status(200).json({
        data: {
          ...userInfo,
          lastName: last_name,
          viewedClasses: viewed_classes,
          token,
          refresh,
        },
      });
    } else {
      const newCode = verifyCodeGenerate();

      sendCodeVerification(user?.email, newCode);

      setVerificationCode(user?.id, newCode);

      res.status(401).json({
        message: 'Usuario no verificado.',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error en el inicio de sesión, intentalo mas',
    });
  }
};

// Verificación de usuario
export const verify = async (req: Request, res: Response): Promise<void> => {
  const { email, verification_code } = req.body;

  try {
    // *---------------* //
    // Pre validaciones //
    // *-------------* //
    if (!email || !verification_code) {
      res.status(400).json({
        message: 'Correo y codigo de verificación son necesarios',
      });
      return;
    }

    // *---------------------* //
    // Logica de verificacion //
    // *-------------------* //
    const user = await prisma.findUnique({
      where: { email },
    });

    // Si no existe el usuario, responde con error.
    if (!user) {
      res.status(404).json({
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Validamos si el codigo esta expirado o no.
    const expiryTime = user?.code_expiry;
    const now = new Date();

    if (!expiryTime) {
      res.status(403).json({
        message: 'El usuario no tiene codigo de expiración.',
      });
      return;
    }

    // Si el código esta vencido, mandamos uno nuevo al correo directamente.
    if (now > expiryTime) {
      const newCode = verifyCodeGenerate();

      sendCodeVerification(user?.email, newCode);

      setVerificationCode(user?.id, newCode);

      res.status(400).json({
        message:
          'El código de verificación enviado esta vencido, te hemos enviado uno nuevo a tu correo.',
      });
    } else {
      const saveCode = user?.verification_code;

      if (saveCode === verification_code) {
        const token = generateToken(user);
        const refresh = generateRefresh(user);

        // Si todo esta OK, cambiamos los siguientes parametros del usuario y devolvemos
        await prisma.update({
          where: { id: user.id },
          data: {
            verified: true,
            verification_code: null,
            code_expiry: null,
          },
        });

        const { password, id, ...userInfo } = user;

        res.status(200).json({
          message: 'Tu cuenta ha sido verificada correctamente.',
          data: {
            ...userInfo,
            verified: true,
            verification_code: null,
            code_expiry: null,
            token,
            refresh,
          },
        });
      } else {
        res.status(400).json({
          message:
            'El código introducido es incorrecto, verifica y vuelve a intentarlo.',
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error la verifiación.',
    });
  }
};

// Olvide mi contraseña
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    // *---------------* //
    // Pre validaciones //
    // *-------------* //
    if (!email) {
      res.status(400).json({
        message: 'Correo electronico necesario.',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //
    const findUser = await prisma.findUnique({
      where: { email },
    });

    if (!findUser) {
      res.status(404).json({
        message: 'Correo electronico no encontrado.',
      });
      return;
    }

    // Generamos un nuevo codigo y una fecha de expiración.
    const newCode = verifyCodeGenerate();
    sendCodeForgotPassword(email, newCode);

    const expiryDate = new Date();
    // Codigo valido por 1 hora.
    expiryDate.setHours(expiryDate.getHours() + 1);

    await prisma.update({
      where: { email },
      data: {
        verification_code: newCode,
        code_expiry: expiryDate,
      },
    });

    res.status(200).json({
      message: 'Hemos enviado un codigo de verificación a tu correo.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error, por favor intenta mas tarde.',
    });
  }
};

// Verificación de usuario
export const recoveryPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, verification_code, password } = req.body;

  try {
    // *---------------* //
    // Pre validaciones //
    // *-------------* //
    if (!email || !verification_code || !password) {
      res.status(400).json({
        message: 'Correo, contraseña y codigo de verificación son necesarios',
      });
      return;
    }

    // *---------------------* //
    // Logica de verificacion //
    // *-------------------* //
    const user = await prisma.findUnique({
      where: { email },
    });

    // Si no existe el usuario, responde con error.
    if (!user) {
      res.status(404).json({
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Validamos si el codigo esta expirado o no.
    const expiryTime = user?.code_expiry;
    const now = new Date();

    if (!expiryTime) {
      res.status(403).json({
        message: 'El usuario no tiene codigo de expiración.',
      });
      return;
    }

    // Si el código esta vencido, mandamos uno nuevo al correo directamente.
    if (now > expiryTime) {
      const newCode = verifyCodeGenerate();

      sendCodeForgotPassword(user?.email, newCode);

      setVerificationCode(user?.id, newCode);

      res.status(400).json({
        message:
          'El código de verificación enviado esta vencido, hemos enviado uno nuevo a tu correo.',
      });
    } else {
      const saveCode = user?.verification_code;

      if (saveCode === verification_code) {
        const newPassword = await hashPassword(password);

        // Si todo esta OK, cambiamos los siguientes parametros del usuario y devolvemos
        await prisma.update({
          where: { email: user?.email },
          data: {
            password: newPassword,
            code_expiry: null,
            verification_code: null,
          },
        });

        res.status(200).json({
          message: 'Tu contraseña ha sido actualizada correctamente.',
        });
      } else {
        res.status(400).json({
          message:
            'El código introducido es incorrecto, verifica y vuelve a intentarlo.',
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error, intentalo mas tarde.',
    });
  }
};

// Verificación de usuario
export const resendCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    // *---------------* //
    // Pre validaciones //
    // *-------------* //
    if (!email) {
      res.status(400).json({
        message: 'Correo electronico necesario.',
      });
      return;
    }

    // *-----* //
    // Logica //
    // *---* //
    const findUser = await prisma.findUnique({
      where: { email },
    });

    if (!findUser) {
      res.status(404).json({
        message: 'Correo electronico no encontrado.',
      });
      return;
    }

    // Generamos un nuevo codigo y una fecha de expiración.
    const newCode = verifyCodeGenerate();
    resendCodeService(email, newCode);

    const expiryDate = new Date();
    // Codigo valido por 1 hora.
    expiryDate.setHours(expiryDate.getHours() + 1);

    await prisma.update({
      where: { email },
      data: {
        verification_code: newCode,
        code_expiry: expiryDate,
      },
    });

    res.status(200).json({
      message: 'Código reenviado correctamente.',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hubo un error, por favor intenta mas tarde.',
    });
  }
};
