import 'dotenv/config'; // Loads .env file contents into process.env
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import chatRoutes from "./routes/chat.js";

const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies
app.use("/api",chatRoutes);

// Initialize the Google Gemini client once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Your new POST route using the library
// app.post("/test-gemini", async (req, res) => {
//   try {
//     // 1. Get the prompt from the request body
//     const { prompt } = req.body;

//     // Add a check to ensure a prompt was provided
//     if (!prompt) {
//       return res.status(400).json({ error: 'Prompt is required' });
//     }

//     // 2. Use the library to get the model and generate content
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
    
//     // 3. Send the clean text response back
//     res.json({ text });

//   } catch (err) {
//     console.error('Error generating content:', err);
//     res.status(500).json({ error: "Failed to generate content" });
//   }
// });

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