import express from 'express';
import Thread from "../models/Thread.js";
import getGeminiApiResponse from "../utils/geminiai.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post("/test", async(req , res) => {
    try{
        const thread = new Thread({
            threadId : "xyz",
            userId: req.user._id,
            title : "sample thread"
        });

        const response = await thread.save();
        res.send(response);
    }catch(err){
        console.log(err);
        res.status(500).send("failed to save data to db");
    }
});

router.get("/thread", async(req,res) => {
    try{
        // Only get threads for the authenticated user
        let threads = await Thread.find({ userId: req.user._id }).sort({updatedAt: -1});
        console.log(threads);
        res.send(threads);

    }catch(err){
        console.log(err);
        res.status(500).send("failed to fetch data from DB");
    }
});

router.get("/thread/:threadId", async (req,res) => {
    let {threadId} = req.params;
    try{
        // Only get thread if it belongs to the authenticated user
        let thread = await Thread.findOne({threadId, userId: req.user._id});
        if(!thread){
            res.status(404).send("specified threadId doesn't exist or you don't have access");
        }
        res.send(thread.messages);
        
    }catch(err){
        console.log(err);
        res.status(500).send("failed to fetch particular data from DB");
    }
})

router.delete("/thread/:threadId", async(req,res) => {
    let {threadId} = req.params;
    try{
        // Only delete thread if it belongs to the authenticated user
        let thread = await Thread.findOneAndDelete({threadId, userId: req.user._id});
        if(!thread){
            return res.status(404).send("Thread not found or you don't have access");
        }
        res.send("deleted the thread");
    }catch(err){
        console.log(err);
        res.status(500).send("failed to delete data from DB");
    }
})

router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).send("Necessary details not found");
  }

  try {
    let thread = await Thread.findOne({ threadId, userId: req.user._id });

    if (!thread) {
      thread = new Thread({
        threadId,
        userId: req.user._id,
        title: message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getGeminiApiResponse(message);

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;