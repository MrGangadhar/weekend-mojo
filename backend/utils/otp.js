const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateSecureOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const verifyOTP = (storedOTP, providedOTP, expiryTime) => {
  if (!storedOTP || !providedOTP) return false;
  if (Date.now() > expiryTime) return false;
  return storedOTP === providedOTP;
};

module.exports = { generateOTP, generateSecureOTP, verifyOTP };