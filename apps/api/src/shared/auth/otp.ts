import crypto from "node:crypto";

export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const byte = randomBytes[i] ?? 0;
    otp += digits[byte % 10] ?? "0";
  }
  return otp;
};

export const hashOTP = (otp: string) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const verifyOTPHash = (otp: string, hash: string) => {
  const calculated = hashOTP(otp);
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash));
};
