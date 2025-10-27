const crypto = require("crypto");

const algorithm = "aes-256-cbc";                   // Symmetric encryption
const secretKey = process.env.ENCRYPTION_KEY;      // Must be 32 bytes
const ivLength = 16;                               // AES block size

console.log("ENCRYPTION_KEY:", process.env.ENCRYPTION_KEY);


// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;    // store IV with encrypted data
}

// Decrypt function
function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
