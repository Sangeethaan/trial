import express from 'express';
import Thread from "../models/Thread.js";
import getGeminiApiResponse from "../utils/geminiai.js";

const router = express.Router();

router.post("/test", async(req , res) => {
    try{
        const thread = new Thread({
            threadId : "xyz",
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
        let threads = await Thread.find({}).sort({updatedAt: -1});
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
        let thread = await Thread.findOne({threadId});
        if(!thread){
            res.status(404).send("specified threadId does'nt exists");
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
        let thread = await Thread.findOneAndDelete({threadId});
        res.send("deleted the thread",thread);
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
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      thread = new Thread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getGeminiApiResponse(message); // just pass the prompt

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;