const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const hasFirebaseCredentials = Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      firebasePrivateKey &&
      process.env.FIREBASE_CLIENT_EMAIL
    );

    if (!hasFirebaseCredentials) {
      console.warn('⚠️ Firebase credentials are not fully configured; notification delivery will be disabled.');
    } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: firebasePrivateKey.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
      })
    });
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

const sendNotification = async (fcmToken, notification) => {
  if (!fcmToken) {
    console.log('No FCM token provided');
    return;
  }
  
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      android: {
        priority: 'high'
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };
    
    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

const sendBulkNotifications = async (fcmTokens, notification) => {
  if (!fcmTokens || fcmTokens.length === 0) {
    return;
  }
  
  try {
    const messages = fcmTokens.map(token => ({
      token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {}
    }));
    
    const response = await admin.messaging().sendAll(messages);
    console.log('Bulk notifications sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};

const sendSMS = async (mobile, message) => {
  try {
    // Using Twilio
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    const response = await client.messages.create({
      body: message,
      to: mobile,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    console.log('SMS sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const info = await transporter.sendMail({
      from: `"Weekend Mojo" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendNotification, sendBulkNotifications, sendSMS, sendEmail };