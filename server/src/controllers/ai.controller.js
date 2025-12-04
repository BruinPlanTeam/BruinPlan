const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// basic chat endpoint using openai
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
          content: ` 
          ---
          CONTEXT: You are an expert academic planning assistant for the UCLA Samueli School of Engineering, 
          integrated into a four-year degree planner. 
          ---
          GOAL: Your goal is to help users build a feasible four year plan
          ---
          GUIDELINES:
            - **Brevity**: Keep responses under 100 words. Use bullet points if applicable to condense information.
            - **Tone**: Straight to the point, professional but friendly.
            - **Accuracy**: If you do not know a specific answer to a question, such as course offerings,
            teachers, or course details, explicitly state that you don't know and tell the user to consult an official UCLA source (such as the catalog or myucla) NEVER GUESS.
            - **Scope**: Strictly answer questions regarding degree planning, prerequisites, major requirements, and course sequences. Decline to discuss unrelated topics.
            - **Feasibility**: Check that the user is not attempting a overly challenging workload. If they are, politely suggest they take a lighter course load.
          `
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

