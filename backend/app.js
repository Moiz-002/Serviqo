const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDatabase = require('./connection');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const workersRouter = require('./routes/workers');
const workerRouter = require('./routes/worker');
const jobRouter = require('./routes/job');
const bidRouter = require('./routes/bid');
const messageRouter = require('./routes/message');
const reviewRouter = require('./routes/review');
const adminRouter = require('./routes/admin');
const disputeRouter = require('./routes/dispute');
const notificationRouter = require('./routes/notification');
const { startWhatsAppOtp } = require('./services/whatsapp');
const configureSocketServer = require('./services/socket');

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:3000', 'https://serviqo-three.vercel.app'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/workers', workersRouter);
app.use('/api/worker', workerRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/bids', bidRouter);
app.use('/api/messages', messageRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/admin', adminRouter);
app.use('/api/disputes', disputeRouter);
app.use('/api/notifications', notificationRouter);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function startServer() {
  await connectDatabase(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  startWhatsAppOtp().catch((err) => {
    console.error('WhatsApp OTP service failed to start:', err.message);
  });

  const PORT = process.env.PORT || 5000;
  const server = http.createServer(app);
  configureSocketServer(server, [process.env.FRONTEND_ORIGIN || 'http://localhost:3000', 'https://serviqo-three.vercel.app']);
  return server.listen(PORT, () => {
    console.log(`Serviqo backend running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Backend startup failed:', err.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
