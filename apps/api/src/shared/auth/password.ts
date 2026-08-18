import bcrypt from "bcryptjs";
import { securityConfig } from "../../config/security.js";

export const hashPassword = async (password: string, saltRounds = securityConfig.bcryptSaltRounds): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
