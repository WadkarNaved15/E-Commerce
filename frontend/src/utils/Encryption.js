import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Hex.parse(import.meta.env.VITE_ENCRYPTION_KEY);
const iv = CryptoJS.lib.WordArray.random(16);

export const encryptData = (data) => {
  const encrypted = CryptoJS.AES.encrypt(data, key, { iv: iv }).toString();
  return `${encrypted}:${iv.toString(CryptoJS.enc.Hex)}`;
};

export const decryptData = (encryptedDataWithIv) => {
  const [encryptedData, ivHex] = encryptedDataWithIv.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const bytes = CryptoJS.AES.decrypt(encryptedData, key, { iv: iv });
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};
