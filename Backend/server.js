// Backend/server.js
import 'dotenv/config'; // Loads .env file contents into process.env
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';

import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import getGeminiApiResponse from './utils/geminiai.js'; // Utility function

const app = express();
const port = process.env.PORT || 8080;

// Enhanced CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://your-frontend-app-name.onrender.com', // Replace with your actual frontend URL
      process.env.FRONTEND_URL // Add this for flexibility
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'PromptPilot Backend API',
    status: 'running',
    version: '1.0.0'
  });
});

// Guest chat route
app.post('/api/guest-chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send('Message is required');
  }

  try {
    const assistantReply = await getGeminiApiResponse(message);
    res.json({ reply: assistantReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

// Initialize the Google Gemini client once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});



// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

// Connect to DB first, then start server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
      console.log(`Health check available at: http://localhost:${port}/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
