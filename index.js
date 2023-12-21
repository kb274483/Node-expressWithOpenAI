require("dotenv").config();
const OpenAI = require('openai');
const axios = require('axios');
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: '20mb' }));

// 設置 CORS
const corsOptions = {
  origin: 'https://calm-tor-97039-f2b947cbd8e8.herokuapp.com',
  // origin: 'http://localhost:9000',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const port = process.env.PORT || 5000;

// 根據收到的圖片，生成圖片的描述文字
app.post("/node_ai/analyze_images", async (req, res) => {
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
app.post("/node_ai/create_images", async (req, res) => {
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

app.post("/node_ai/download_images", async (req, res) => {
  const imgUrl = req.body.url;
  const blockSize = 1024 * 1024;
  try {
    const imageResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    const imageData = imageResponse.data;
    let base64Image = '';

    for (let i = 0; i < imageData.length; i += blockSize) {
      const chunk = imageData.slice(i, i + blockSize);
      base64Image += Buffer.from(chunk, 'binary').toString('base64');
    }

    return res.status(200).json({
      success: true,
      result: base64Image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const server = app.listen(port, () =>{
  server.timeout = 300000;
  console.log(`Server is running on port ${port}!!`)
});