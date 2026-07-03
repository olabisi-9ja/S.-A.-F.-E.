import { GoogleGenAI } from '@google/genai';
import { Incident, Alert } from '../models/index.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Gen AI client
const rawApiKey = process.env.GEMINI_API_KEY || 'dummy_key_if_not_provided';
const ai = new GoogleGenAI({
  apiKey: rawApiKey.replace(/^"|"$/g, '')
});

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      return res.status(503).json({ 
        success: false, 
        error: 'AI Chatbot is currently unavailable (GEMINI_API_KEY not configured).' 
      });
    }

    // Fetch live data to provide context to the AI
    const activeIncidents = await Incident.findAll({
      where: { status: ['pending', 'in_progress'] },
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    const activeAlerts = await Alert.findAll({
      where: { resolved: false },
      limit: 5,
      order: [['created_at', 'DESC']]
    });

    // Format the live data into a readable string
    const incidentsContext = activeIncidents.map(inc => 
      `- ${inc.category} (Severity: ${inc.ai_severity_score}): ${inc.description}`
    ).join('\n');

    const alertsContext = activeAlerts.map(alt => 
      `- Alert type ${alt.type} near (${alt.latitude}, ${alt.longitude})`
    ).join('\n');

    // Create the prompt with context
    const systemPrompt = `You are a helpful and intelligent safety assistant for the S.A.F.E KWASU application. 
You answer questions from students, staff, and security admins.
Here is the real live data of the campus right now:

Active Incidents:
${incidentsContext || 'No active incidents.'}

Active Alerts:
${alertsContext || 'No active alerts.'}

Use this data to answer the user's question accurately. If they ask about incidents, tell them what is currently happening. If they ask a general question, provide helpful safety advice. Be concise, professional, and reassuring.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nUser Question: ' + message }] }
      ]
    });

    res.json({
      success: true,
      data: { reply: response.text }
    });

  } catch (error) {
    logger.error('AI Chatbot error:', error);
    
    // Handle invalid API key error gracefully instead of a generic 500
    if (error.status === 400 || (error.message && error.message.includes('API key not valid'))) {
      return res.status(503).json({ 
        success: false, 
        error: 'AI Chatbot is currently unavailable (Invalid GEMINI_API_KEY provided).' 
      });
    }

    res.status(500).json({ success: false, error: 'Failed to process AI chat request.' });
  }
};
