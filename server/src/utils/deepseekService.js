const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let openai;
try {
  openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
  });
} catch (error) {
  console.warn('Warning: Deepseek API not configured. AI-powered messages will be disabled.');
}

const generatePositiveMessage = async (context = {}) => {
  try {
    if (!openai) {
      return context.name 
        ? `Keep up the great work with your ${context.medicineName}, ${context.name}!`
        : "Keep going strong with your medicine routine!";
    }

    console.log('Generating positive message with context:', context);
    
    const prompt = `Generate a short, uplifting message (max 2 sentences) for someone taking their daily medicine. 
    The message should be encouraging and focus on health, well-being, and personal growth.
    ${context.name ? `This message is for ${context.name} who is taking ${context.medicineName}.` : ''}
    Make it personal, warm, and motivating without being overly cheesy.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a compassionate healthcare companion that provides personalized, encouraging messages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "deepseek-chat",
      max_tokens: 100,
      temperature: 0.7
    });

    const message = completion.choices[0].message.content.trim();
    console.log('Generated message:', message);
    return message;
  } catch (error) {
    console.error('Error generating positive message:', error);
    return context.name 
      ? `Keep up the great work with your ${context.medicineName}, ${context.name}!`
      : "Every step you take towards better health is a victory. Keep going strong!";
  }
};

module.exports = {
  generatePositiveMessage
}; 