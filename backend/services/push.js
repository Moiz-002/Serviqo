const User = require('../models/User');

let initialization;
let initialized = false;

function initializeFirebase() {
  if (initialized) return initialization;
  initialized = true;

  initialization = (() => {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccountBase64 && !credentialsPath) {
      console.warn('[push] Firebase credentials are not configured; push notifications are disabled');
      return null;
    }

    try {
      const admin = require('firebase-admin');
      const apps = admin.apps || admin.getApps?.() || [];
      if (apps.length) {
        console.log('[push] Firebase Cloud Messaging ready');
        return { admin, messaging: admin.messaging() };
      }

      const credential = serviceAccountBase64
        ? admin.credential.cert(JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8')))
        : admin.credential.applicationDefault();
      const app = admin.initializeApp({ credential });
      console.log('[push] Firebase Cloud Messaging ready');
      return { admin, messaging: admin.messaging(app) };
    } catch (error) {
      console.warn(`[push] Firebase Cloud Messaging unavailable (${error.message}); push notifications are disabled`);
      return null;
    }
  })();

  return initialization;
}

function stringData(data = {}) {
  return Object.fromEntries(Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => [
      key,
      typeof value === 'string' ? value : (typeof value === 'object' ? JSON.stringify(value) : String(value)),
    ]));
}

async function sendPushToUsers(userIds, { title = '', body = '', data = {} } = {}) {
  const firebase = initializeFirebase();
  if (!firebase) return { sent: 0, failed: 0 };

  const ids = [...new Set((Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean).map(String))];
  if (!ids.length) return { sent: 0, failed: 0 };

  const users = await User.find({ _id: { $in: ids }, isActive: true }).select('+fcmTokens');
  const tokenOwners = new Map();
  for (const user of users) {
    for (const item of user.fcmTokens || []) {
      if (item?.token) {
        const owners = tokenOwners.get(item.token) || [];
        owners.push(String(user._id));
        tokenOwners.set(item.token, owners);
      }
    }
  }
  const tokens = [...tokenOwners.keys()];
  if (!tokens.length) return { sent: 0, failed: 0 };

  const payload = {
    tokens: [],
    notification: { title: String(title).slice(0, 120), body: String(body).slice(0, 500) },
    data: stringData(data),
    android: { priority: 'high', notification: { sound: 'default' } },
    apns: { payload: { aps: { sound: 'default' } } },
  };
  let sent = 0;
  let failed = 0;
  const deadTokens = [];
  for (let offset = 0; offset < tokens.length; offset += 500) {
    const chunk = tokens.slice(offset, offset + 500);
    const result = await firebase.messaging.sendEachForMulticast({ ...payload, tokens: chunk });
    sent += result.successCount || 0;
    failed += result.failureCount || 0;
    result.responses?.forEach((response, index) => {
      if ([
        'messaging/registration-token-not-registered',
        'messaging/invalid-registration-token',
        'messaging/invalid-argument',
      ].includes(response.error?.code)) {
        deadTokens.push(chunk[index]);
      }
    });
  }

  if (deadTokens.length) {
    await User.updateMany(
      { fcmTokens: { $elemMatch: { token: { $in: deadTokens } } } },
      { $pull: { fcmTokens: { token: { $in: deadTokens } } } },
    );
  }
  return { sent, failed };
}

function pushSafely(userIds, payload) {
  void sendPushToUsers(userIds, payload).catch((error) => {
    console.error('[push] Unable to send notification:', error.message);
  });
}

async function registerDeviceToken(userId, token, platform = 'android') {
  const firebase = initializeFirebase();
  if (!firebase || !userId || typeof token !== 'string') return;

  await User.updateMany(
    { _id: { $ne: userId }, fcmTokens: { $elemMatch: { token } } },
    { $pull: { fcmTokens: { token } } },
  );
  await User.updateOne({ _id: userId }, { $pull: { fcmTokens: { token } } });
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        fcmTokens: {
          $each: [{ token, platform, lastSeen: new Date() }],
          $slice: -10,
        },
      },
    },
  );
}

async function removeDeviceToken(userId, token) {
  if (!initializeFirebase() || !userId || typeof token !== 'string') return;
  await User.updateOne({ _id: userId }, { $pull: { fcmTokens: { token } } });
}

module.exports = {
  initializePush: initializeFirebase,
  sendPushToUsers,
  pushSafely,
  registerDeviceToken,
  removeDeviceToken,
};
