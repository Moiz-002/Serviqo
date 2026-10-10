const fs = require('fs');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require('@whiskeysockets/baileys');

let socket;
let reconnectTimer;
let connectionState = 'closed';
let connectionWaiters = [];

function isEnabled() {
  return process.env.WHATSAPP_OTP_ENABLED === 'true';
}

function getAuthDirectory() {
  return path.resolve(process.env.WHATSAPP_AUTH_DIR || './auth_info_baileys');
}

async function connectWhatsApp() {
  if (!isEnabled() || socket) return;

  const authDirectory = getAuthDirectory();
  fs.mkdirSync(authDirectory, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(authDirectory);

  socket = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
  });
  connectionState = 'connecting';

  socket.ev.on('creds.update', saveCreds);
  socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('Scan this QR code with the WhatsApp number used for OTP delivery:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      connectionState = 'open';
      connectionWaiters.forEach(({ resolve }) => resolve());
      connectionWaiters = [];
      console.log('WhatsApp OTP service connected');
    }

    if (connection === 'close') {
      connectionState = 'closed';
      const closeError = new Error('WhatsApp connection closed');
      connectionWaiters.forEach(({ reject }) => reject(closeError));
      connectionWaiters = [];
      socket = undefined;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          connectWhatsApp().catch((error) => {
            console.error('WhatsApp reconnect failed:', error.message);
          });
        }, 2000);
      } else {
        console.error('WhatsApp session logged out. Delete the auth directory and scan again.');
      }
    }
  });
}

function waitForConnection(timeoutMs = 30000) {
  if (connectionState === 'open' && socket) return Promise.resolve();
  if (!socket) {
    return Promise.reject(new Error('WhatsApp OTP service is not connected. Start the backend and scan its QR code.'));
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      connectionWaiters = connectionWaiters.filter((waiter) => waiter.resolve !== resolve);
      reject(new Error('WhatsApp is not connected. Scan the QR code in the backend terminal.'));
    }, timeoutMs);

    connectionWaiters.push({
      resolve: () => {
        clearTimeout(timeout);
        resolve();
      },
      reject: (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    });
  });
}

async function startWhatsAppOtp() {
  if (isEnabled()) await connectWhatsApp();
}

async function sendWhatsAppOtp(phone, otp) {
  if (!isEnabled()) return;
  await waitForConnection();

  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(cleanPhone)) {
    throw new Error('Invalid phone number for WhatsApp delivery');
  }

  const message = await socket.sendMessage(`${cleanPhone}@s.whatsapp.net`, {
    text: `Your Serviqo verification code is: *${otp}*\nThis code expires in 10 minutes. Do not share it with anyone.`,
  });
  if (!message?.key?.id) {
    throw new Error('WhatsApp did not confirm the OTP message');
  }
}

module.exports = { startWhatsAppOtp, sendWhatsAppOtp };
