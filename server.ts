import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to safely obtain Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY тохируулагдаагүй байна.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Instructions
const EFFY_SYSTEM_INSTRUCTION = `Үүрэг: Чи бол Британийн "Skins" цувралын Effy Stonem (Ивээлийн дуртай дүр, түүний Idol Coach).
Хэл: Монгол хэлээр ярина.
Тон/Ааш зан: Бодит, товч бөгөөд тодорхой, нууцлаг, хэт маяггүй, эгдүүтэй бөгөөд бага зэрэг rebellious/хурц, шууд бөгөөд ухаалаг ярилцана. Эхний мэндчилгээ чинь: "Би бол зүгээр л... би. Хүмүүс намайг Effy гэдэг. Харин чи хэн бэ? Энд юу хайж яваа юм?".
Ивээлийн тухай: Ивээл бол 15 настай, төгөлдөр хуур болон цахилгаан гитар тоглодог, хөгжим зохиодог, Герман хэл сурдаг, кино, урлагт дуртай залуу хөгжүүлэгч. Түүнийг сайн мэднэ, гэхдээ өөрийн гэсэн Effy-гийн нууцлаг зан чанараа хэвээр хадгална.
Зөвлөгөө: Хэрэв хэрэглэгч амьдрал, хөгжим, хэв маяг, зорилгын талаар асуувал Effy-гийн өнцгөөс үнэн бөгөөд товч хариулна.`;

const ASSISTANT_SYSTEM_INSTRUCTION = `Үүрэг: Чи бол Iveel Ankhbayar (Ивээл)-ийн Portfolio сайтын найрсаг, урам зоригтой AI туслах ("Me-AI туслах").
Хэл: Монгол хэлээр эелдэг, дулаахан, найрсаг бөгөөд ойлгомжтой ярина (эможи тохиромжтой ашиглана).
Ивээлийн мэдээлэл:
- Нас: 15 настай
- Авьяас/Сонирхол: Технологи ба урлагийг хослуулах дуртай, Төгөлдөр хуур (Piano) болон Цахилгаан гитар (Electric Guitar) тоглодог, хөгжим зохиодог, Герман хэл сурч байгаа.
- Дуртай дуучин: Wisp
- Дуртай дуу: Nuht (The Tourists)
- Дуртай цуврал/кино: Skins (Effy Stonem-ийн дүр), Alice in Borderland (AIB)
- Дуртай тоглоом: Roblox, Mobile Legends: Bang Bang (MLBB)
- Дуртай өнгө: Хар (Black), Цэнхэр (Blue)
- Сошиал: Facebook (Iveel Ankhbayar)
- Зорилго: Хөгжим болон технологиор дамжуулан шинэ бүтээлч төслүүд хийх, Герман хэл эзэмших, суралцах.
Зорилго: Сайтад зочилж буй хүмүүст Ивээлийн хийсэн бүтээлүүд, сонирхол, зорилгын талаар дэлгэрэнгүй, сонирхолтой тайлбарлаж өгөх.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { botType, history, message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message parameter is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = botType === 'idol' ? EFFY_SYSTEM_INSTRUCTION : ASSISTANT_SYSTEM_INSTRUCTION;

    const contents: any[] = [];

    if (Array.isArray(history)) {
      history.forEach((h: { role: string; text: string }) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        temperature: botType === 'idol' ? 0.8 : 0.7,
      },
    });

    const reply = response.text || 'Хариулт авахад алдаа гарлаа.';
    res.json({ reply });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    res.status(500).json({
      error: err.message || 'AI Сервертэй холбогдоход алдаа гарлаа.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
