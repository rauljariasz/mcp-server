import bcrypt from 'bcrypt';
import { User } from '../types/user.interface';
import jwt from 'jsonwebtoken';
import users from '../models/user.prisma';

const SAL_ROUNDS: number = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'default';

// Hashear password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SAL_ROUNDS);
};

// Comparar passwords
export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Generación de auth token
export const generateToken = (
  user: Omit<User, 'password' | 'role'>
): string => {
  const { id, email } = user;

  return jwt.sign(
    {
      id,
      email,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Generacion de refresh token
export const generateRefresh = (
  user: Omit<User, 'password' | 'role'>
): string => {
  const { id, email } = user;

  return jwt.sign(
    {
      id,
      email,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Usar en el reenvio del codigo, login y el usuario no este verificado, olvide mi contraseña
// Actualiza el codigo de verificación y la expiración
export const setVerificationCode = async (userId: number, code: string) => {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1); // Código válido por 1 hora

  await users.update({
    where: { id: userId },
    data: {
      verification_code: code,
      code_expiry: expiryDate,
    },
  });
};
