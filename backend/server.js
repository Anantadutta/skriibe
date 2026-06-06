require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { z } = require('zod');
const passport = require('passport');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
let Razorpay;
let razorpay;
const crypto = require('crypto');
const Waitlist = require('./models/Waitlist');
const { sendWaitlistWelcomeEmail } = require('./utils/emailService');

try {
  Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
  });
} catch (err) {
  console.warn("Razorpay module not installed or configured. Payment endpoints will fail until installed.");
}
// WATI WhatsApp Message
const sendWhatsAppMessage = async (phone, name) => {
  const formattedPhone = '91' + phone;
  const url = `${process.env.WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': process.env.WATI_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_name: 'message_template',
      broadcast_name: 'waitlist_onboarding',
      parameters: [
        { name: '1', value: name }
      ]
    })
  });

  const data = await response.json();
  console.log('WATI response:', data);
  return data;
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://www.skriibe.com", "https://skriibe.com", "http://localhost:5173", "http://localhost:5713", "http://localhost:3000", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5713", "http://127.0.0.1:3000", "http://127.0.0.1:5174"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Socket.IO Connection Event
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Attach io to req so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
// Middleware
const allowedOrigins = ["https://www.skriibe.com", "https://skriibe.com","http://localhost:5173", "http://localhost:5713", "http://localhost:3000", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5713", "http://127.0.0.1:3000", "http://127.0.0.1:5174"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Required to handle the "preflight" error from your screenshot
// Required to handle the "preflight" error from your screenshot
app.options('/*splat', cors());
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'skriibe_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

// Database Connection - Serverless friendly
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const conn = await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('MongoDB Connected:', conn.connection.host);
};

// Validation Schemas
const waitlistSchema = z.object({
  name: z.string().min(2),
  instagramHandle: z.string().min(1).refine(val => !val.includes(' '), {
    message: 'invalid instagram handle'
  }),
  email: z.string().email(),
  whatsappNumber: z.string().regex(/^\d+$/, "Phone number must only contain numbers").max(10, "Phone number cannot be longer than 10 digits"),
  expertise: z.string(),
  followerCount: z.string(),
  otherExpertise: z.string().optional(),

});



// API Routes
app.post('/api/waitlist', async (req, res) => {
  console.log('Received waitlist entry request for:', req.body?.email);
  try {
    await connectDB();
    const validatedData = waitlistSchema.parse(req.body);
    console.log('Data validated successfully');

    const existingEntry = await Waitlist.findOne({ email: validatedData.email });
    if (existingEntry) {
      return res.status(400).json({ message: 'Email already registered on waitlist' });
    }

    const newWaitlistEntry = new Waitlist(validatedData);
    const savedEntry = await newWaitlistEntry.save();
    console.log('Waitlist entry saved for:', savedEntry.email);

    // Await email to ensure it sends in serverless environment (Vercel)
    await sendWaitlistWelcomeEmail(savedEntry.email, savedEntry.name).catch(emailError => {
      console.error('Failed to send welcome email:', emailError);
    });
    await sendWhatsAppMessage(savedEntry.whatsappNumber, savedEntry.name).catch(whatsappError => {
  console.error('Failed to send WhatsApp message:', whatsappError);
});

    const position = await Waitlist.countDocuments();
   res.status(201).json({
  success: true,
  message: 'Successfully joined waitlist',
  waitlistNumber: position
  });
  } catch (error) {
    console.error('Waitlist registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/health', async (req, res) => {
  await connectDB();
  res.json({ status: 'ok', dbConnected: isConnected });
});

// --- Razorpay Routes ---
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body; // Amount in paise
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    const options = {
      amount,
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating razorpay order:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature sent' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
// -----------------------

app.get('/test-route-123', (req, res) => res.json({ hello: 'world' }));

const { verifyAdminToken } = require('./middleware/auth');

app.get('/api/admin/me', verifyAdminToken, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/fan-auth', require('./routes/fanAuth'));
app.use('/api/creator', require('./routes/creator'));
app.use('/api/public', require('./routes/public'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/creators', require('./routes/creators'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/admin', require('./routes/admin'));

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} - restarted!`));
module.exports = { app, server, io };