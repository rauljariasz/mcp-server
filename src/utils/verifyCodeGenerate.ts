// Función para generar un código de verificación de 6 dígitos
export function verifyCodeGenerate(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
