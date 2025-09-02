import 'dotenv/config'; // Loads .env file contents into process.env
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// Initialize the Google Gemini client once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  connectDB();
});

const connectDB = async() => {
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB successfully");
  }catch(err){
    console.log("failed to connect to DB",err);
  }
}