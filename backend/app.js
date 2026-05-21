const express = require('express');
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

const app = express();

connectDatabase(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed:', err.message));

app.use(cors({
  origin: ['https://serviqo-three.vercel.app', 'http://localhost:3000'], // Update with your frontend URL
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

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(process.env.PORT, () => {
  console.log(`Serviqo backend running on port ${process.env.PORT}`);
});
