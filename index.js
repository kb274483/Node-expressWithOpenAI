require("dotenv").config();
const OpenAI = require('openai');
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: '20mb' }));

// 設置 CORS
const allowedOrigins = ['https://calm-tor-97039-f2b947cbd8e8.herokuapp.com/#/'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const port = process.env.PORT || 5000;

// 根據收到的圖片，生成圖片的描述文字
app.post("/analyze_images", async (req, res) => {
  try {
    base64Image = req.body.imgBase64;
    const payload = {
      "model": "gpt-4-vision-preview",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "Generate an image prompt based on the content of the image, providing a detailed description of the subject's identity, features, and details. Additionally, provide a brief description of the scene."
            },
            {
              "type": "image_url",
              "image_url": {
                "url": `${base64Image}`
              }
            }
          ]
        }
      ],
      "max_tokens": 300
    }
    const response = await openai.chat.completions.create(payload);
    return res.status(200).json({
      success: true,
      result: response.choices[0].message.content,
    });
  } catch (error) {
    console.log(error.message);
  }
});

// 根據 prompt 生成圖片
app.post("/create_images", async (req, res) => {
  const promptMsg = req.body.prompt;
  try {
    if (promptMsg == null) {
      throw new Error("Uh oh, no prompt was provided");
    }
    const response = await openai.images.generate({
      model : "dall-e-3",
      prompt : promptMsg,
      size : "1024x1024",
      quality : "standard",
      n : 1,
    })
    return res.status(200).json({
      success: true,
      result: response.data[0].url,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}!!`));