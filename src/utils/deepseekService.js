const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const generatePositiveMessage = async (context = {}) => {
  try {
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
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    // Fallback to a personalized default message if API call fails
    return context.name 
      ? `Keep up the great work with your ${context.medicineName}, ${context.name}! Your dedication to health is inspiring.`
      : "Every step you take towards better health is a victory. Keep going strong!";
  }
};

module.exports = {
  generatePositiveMessage
}; 