const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// Fallback messages if API fails
const fallbackMessages = [
  "Every dose is a step towards better health. Keep going!",
  "Your dedication to your health is inspiring. Stay strong!",
  "Taking care of yourself is the best investment. You're doing great!",
  "Small steps lead to big changes. Keep up the good work!",
  "Your well-being matters, and you're doing a fantastic job!"
];

const generatePositiveMessage = async (context = {}) => {
  try {
    console.log('Attempting to generate message with Deepseek API...');
    console.log('Context:', context);
    console.log('API Key length:', process.env.DEEPSEEK_API_KEY?.length || 0);
    
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
    console.log('Successfully generated message:', message);
    return message;
  } catch (error) {
    console.error('Error generating message with Deepseek:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Use fallback message
    const fallbackMessage = context.name 
      ? `Keep up the great work with your ${context.medicineName}, ${context.name}! Your dedication to health is inspiring.`
      : fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    
    console.log('Using fallback message:', fallbackMessage);
    return fallbackMessage;
  }
};

module.exports = {
  generatePositiveMessage
}; 