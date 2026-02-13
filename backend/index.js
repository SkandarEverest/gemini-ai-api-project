import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const PORT = 3000;

app.post('/api/chat', async (req, res) => {
  try {
    const { conversation } = req.body;

    // Validasi input
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Conversation must be an array' });
    }

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }]
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstruction:
          'Anda adalah travel assistant, sapa pengguna dan tanyakan mau libur kemana lalu buatkan itinerarynya'
      }
    });

    res.status(200).json({ result: response.text ?? '' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});