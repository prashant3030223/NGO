const { OpenAI } = require('openai');

let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.error('OpenAI Init Error:', e.message);
}

const analyzeNeed = async (text) => {
  if (!openai) {
    console.warn('⚠️ OpenAI API Key not found or invalid. Using fallback mock analysis.');
    return mockAnalyze(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for a crisis management NGO. Extract structured data from the following report. Return JSON with: location (name and lat/lng estimate if possible), type (food, medical, shelter, education), urgencyScore (0-100), and a brief summary."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ AI Analysis Error:', error.message);
    return mockAnalyze(text);
  }
};

const mockAnalyze = (text) => {
  const lowerText = (text || '').toLowerCase();
  let type = 'general';
  if (lowerText.includes('food') || lowerText.includes('hungry')) type = 'food';
  else if (lowerText.includes('med') || lowerText.includes('hurt') || lowerText.includes('injured')) type = 'medical';
  else if (lowerText.includes('sleep') || lowerText.includes('roof') || lowerText.includes('shelter')) type = 'shelter';

  let score = 50;
  if (lowerText.includes('urgent') || lowerText.includes('critical') || lowerText.includes('dying')) score = 90;
  
  return {
    location: {
      name: "Detected Area (Simulation)",
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1
    },
    type,
    urgencyScore: score,
    summary: (text || '').substring(0, 100) + "..."
  };
};

module.exports = {
  analyzeNeed
};
