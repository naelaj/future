// A minimal Express backend to forward image requests to Replicate
// No CORS issues — safe to call from your frontend

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN; // Store in .env
const MODEL_VERSION = "24db8cc60a7b28f7693c5c6e2dcb355d8d6de661a3d9f5ef3ecf960f57c73309"; // AnimeGANv2

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

    if (!prediction || !prediction.urls || !prediction.urls.get) {
      console.error("Invalid Replicate response:", prediction);
      return res.status(500).json({ error: 'Failed to create prediction on Replicate' });
    }

    const predictionUrl = prediction.urls.get;

    // Step 2: Poll until it's done
    let output = null;
    while (!output) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const pollRes = await fetch(predictionUrl, {
        headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
      });
      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded') {
        output = pollData.output;
        break;
      } else if (pollData.status === 'failed') {
        console.error("Replicate processing failed:", pollData);
        return res.status(500).json({ error: 'Image processing failed.' });
      }
    }

    return res.json({ output });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
