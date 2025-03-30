import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_VERSION = "24db8cc60a7b28f7693c5c6e2dcb355d8d6de661a3d9f5ef3ecf960f57c73309"; // cjwbw/animeganv2

app.post('/generate', async (req, res) => {
  const imageUrl = req.body.image;
  if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

  try {
    // Step 1: Create prediction
    const predictionRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: { image: imageUrl }
      })
    });

    const prediction = await predictionRes.json();
    const predictionUrl = prediction.urls.get;

    // Step 2: Poll until complete
    let output = null;
    while (!output) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(predictionUrl, {
        headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
      });
      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded') {
        output = pollData.output;
        break;
      } else if (pollData.status === 'failed') {
        return res.status(500).json({ error: 'Generation failed.' });
      }
    }

    return res.json({ output });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
