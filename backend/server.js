require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { z } = require('zod');
const Waitlist = require('./models/Waitlist');
const Question = require('./models/Question');
const { sendWelcomeEmail } = require('./utils/emailService');

const app = express();

// Middleware
// Middleware
const allowedOrigins = ["https://www.skriibe.com", "https://skriibe.com","http://localhost:5173"];

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
app.options('/*splat', cors());
app.use(express.json());

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

const questionSchema = z.object({
  creatorId: z.string().min(1, "Creator ID is required"),
  guestEmail: z.string().email("Invalid email address"),
  questionText: z.string().min(5, "Question must be at least 5 characters long"),
  priceCharged: z.number().positive("Price must be positive")
});

// API Routes
app.post('/api/waitlist', async (req, res) => {
  console.log('Received waitlist entry request for email:', req.body?.email);
  try {
    await connectDB();
    const validatedData = waitlistSchema.parse(req.body);

    const existingEntry = await Waitlist.findOne({ email: validatedData.email });
    if (existingEntry) {
      return res.status(400).json({ message: 'Email already registered on waitlist' });
    }

    const newWaitlistEntry = new Waitlist(validatedData);
    const savedEntry = await newWaitlistEntry.save();
    console.log('Waitlist entry saved for email:', savedEntry.email);

    try {
      await sendWelcomeEmail(savedEntry.email, savedEntry.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

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

app.post('/api/questions', async (req, res) => {
  try {
    await connectDB();
    const validatedData = questionSchema.parse(req.body);
    const newQuestion = new Question(validatedData);
    const savedQuestion = await newQuestion.save();
    res.status(201).json({
      success: true,
      message: 'Question submitted successfully',
      questionId: savedQuestion._id
    });
  } catch (error) {
    console.error('Question submission error:', error);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;