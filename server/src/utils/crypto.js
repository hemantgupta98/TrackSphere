import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";

function getEncryptionKey() {
  const secret = process.env.HARDWARE_SECRET_KEY;

  if (!secret) {
    throw new Error("HARDWARE_SECRET_KEY is required for password encryption.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encryptText(value) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export { encryptText };
