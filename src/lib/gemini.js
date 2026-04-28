import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateBirthdayMessages(name, relationship) {
  if (!genAI) {
    throw new Error('VITE_GEMINI_API_KEY is not configured in .env');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a helpful assistant writing heartfelt birthday wishes. 
The recipient's name is "${name}" and their relationship to the sender is "${relationship}".
Write 3 distinct, short, emotional Swahili messages (1-2 sentences each) for a birthday card.
The first message should be an opening celebration greeting.
The second message should express how special they are.
The third message should be a closing wish for their future.

Format your response EXACTLY as a JSON array of 3 strings, with no markdown, no code blocks, and no extra text.
Example:
["Heri ya kuzaliwa, mpenzi wangu mpendwa!", "Wewe ni nuru inayoangaza maisha yangu kila siku.", "Nakutakia afya njema na mafanikio mengi katika mwaka huu mpya."]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the JSON array. Remove potential markdown wrapping.
    const cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const messages = JSON.parse(cleanText);
    
    if (Array.isArray(messages) && messages.length >= 3) {
      return messages.slice(0, 3);
    } else {
      throw new Error('Invalid format returned by AI');
    }
  } catch (error) {
    console.error('Error generating AI messages:', error);
    // Fallback messages
    return [
      `Siku ya furaha sana, ${name}!`,
      `Wewe ni mtu maalum sana maishani mwangu.`,
      `Nakutakia siku njema, furaha nyingi na fanaka.`
    ];
  }
}
