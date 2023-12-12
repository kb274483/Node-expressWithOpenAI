require("dotenv").config();
const OpenAI = require('openai');
const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const port = process.env.PORT || 5000;

app.post("/ask", async (req, res) => {
  const promptMsg = req.body.prompt;

  try {
    if (promptMsg == null) {
      throw new Error("Uh oh, no prompt was provided");
    }

    // const response = await openai.images.generate({
    //   model : "dall-e-3",
    //   prompt : promptMsg,
    //   size : "1024x1024",
    //   quality : "standard",
    //   n : 1,
    // })

    // const response = await openai.chat.completions.create({
    //   messages: [{ role: 'user', content: prompt }],
    //   model: 'gpt-3.5-turbo',
    // });

    return res.status(200).json({
      success: true,
      message: response.data[0].url,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}!!`));