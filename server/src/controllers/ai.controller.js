const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Basic chat endpoint using OpenAI
 */
async function chat(req, res) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required' 
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful UCLA degree planning assistant. Help students with course selection, prerequisites, and building their 4-year academic plans. Be concise and friendly.'
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiMessage = completion.choices[0].message;

    return res.status(200).json({
      role: aiMessage.role,
      content: aiMessage.content
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
}

module.exports = {
  chat
};

