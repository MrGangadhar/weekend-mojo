const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, body) => {
  try {
    // Ensure E.164 format (default to +91 for India if not present)
    let formattedTo = to;
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+91' + formattedTo.replace(/^0+/, '');
    }
    const message = await client.messages.create({
      body,
      to: formattedTo,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return message;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

module.exports = { sendSMS };