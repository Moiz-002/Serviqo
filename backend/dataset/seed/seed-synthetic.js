/**
 * Seed the Serviqo synthetic dataset (SMD-2026) into MongoDB.
 *
 * Copy this file to  backend/scripts/seed-synthetic.js  and run from backend/:
 *
 *   node scripts/seed-synthetic.js --data ../dataset/output/mongo           # insert
 *   node scripts/seed-synthetic.js --reset                                   # remove all seeded docs
 *   node scripts/seed-synthetic.js --data ../dataset/output/mongo --reset    # replace
 *
 * - Uses MONGODB_URI from backend/.env (same as the app) and your existing bcrypt + mongoose.
 * - Every seeded document has isSynthetic: true, so --reset never touches real accounts.
 * - All seeded users share the demo password below (it passes isValidPassword()).
 * - Users whose phone/email already exist in the DB are skipped, with their related docs.
 * - Refuses to run when NODE_ENV=production unless --force is given.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDatabase = require('../connection');

const { EJSON } = mongoose.mongo.BSON;
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Serviqo@2026';
const ORDER = ['users', 'jobs', 'bids', 'reviews', 'recommendationfeedbacks', 'conversations', 'messages', 'disputes'];

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true);
}

async function main() {
  const dataDir = arg('--data');
  const reset = Boolean(arg('--reset'));
  if (process.env.NODE_ENV === 'production' && !arg('--force')) {
    throw new Error('NODE_ENV=production: refusing to seed synthetic data (pass --force to override).');
  }
  if (!dataDir && !reset) {
    console.log('Usage: node scripts/seed-synthetic.js --data <path to output/mongo> [--reset]');
    return;
  }

  await connectDatabase(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log(`Connected to database "${db.databaseName}"`);

  if (reset) {
    for (const name of ORDER) {
      const { deletedCount } = await db.collection(name).deleteMany({ isSynthetic: true });
      console.log(`  removed ${deletedCount} synthetic ${name}`);
    }
  }
  if (!dataDir) return;

  const load = (name) => EJSON.parse(fs.readFileSync(path.resolve(dataDir, `${name}.json`), 'utf8'), { relaxed: false });

  // ---- users: hash the shared demo password once, skip clashes with real accounts ----
  const hash = await bcrypt.hash(SEED_PASSWORD, 10);
  let users = load('users');
  const phones = users.map((u) => u.phone);
  const emails = users.filter((u) => u.email).map((u) => u.email);
  const clashes = await db.collection('users')
    .find({ $or: [{ phone: { $in: phones } }, { email: { $in: emails } }] }, { projection: { phone: 1, email: 1 } })
    .toArray();
  const takenPhones = new Set(clashes.map((c) => c.phone));
  const takenEmails = new Set(clashes.map((c) => c.email).filter(Boolean));
  const skippedUsers = new Set();
  users = users.filter((u) => {
    if (takenPhones.has(u.phone) || (u.email && takenEmails.has(u.email))) {
      skippedUsers.add(String(u._id));
      return false;
    }
    u.password = hash;
    return true;
  });

  const refs = ['customer', 'worker', 'assignedWorker', 'raisedBy', 'against', 'sender'];
  const skippedJobs = new Set();
  const skippedConvs = new Set();
  const keep = (doc) => !refs.some((f) => doc[f] && skippedUsers.has(String(doc[f])))
    && !(doc.participants || []).some((p) => skippedUsers.has(String(p)))
    && !(doc.job && skippedJobs.has(String(doc.job)))
    && !(doc.conversation && skippedConvs.has(String(doc.conversation)));

  for (const name of ORDER) {
    let docs = name === 'users' ? users : load(name);
    const before = docs.length;
    docs = docs.filter((d) => {
      const ok = keep(d);
      if (!ok && name === 'jobs') skippedJobs.add(String(d._id));
      if (!ok && name === 'conversations') skippedConvs.add(String(d._id));
      return ok;
    });
    let inserted = 0;
    for (let i = 0; i < docs.length; i += 2000) {
      try {
        const res = await db.collection(name).insertMany(docs.slice(i, i + 2000), { ordered: false });
        inserted += res.insertedCount;
      } catch (error) {
        inserted += error.result?.insertedCount ?? 0;
        console.warn(`  ${name}: some documents were skipped (${error.writeErrors?.length ?? '?'} duplicate-key errors)`);
      }
    }
    console.log(`  inserted ${inserted}/${before} ${name}`);
  }
  console.log(`\nDone. Every seeded customer/worker can log in with password: ${SEED_PASSWORD}`);
  console.log('Find a worker login:   db.users.findOne({ role: "worker", isSynthetic: true, cnicVerified: true }, { phone: 1 })');
}

main()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
