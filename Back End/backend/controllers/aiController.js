import { GoogleGenAI } from '@google/genai';
import { Op } from 'sequelize';
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentIncidents = await Incident.findAll({
      where: { created_at: { [Op.gte]: sevenDaysAgo } },
      limit: 20,
      order: [['created_at', 'DESC']]
    });

    const recentAlerts = await Alert.findAll({
      where: { created_at: { [Op.gte]: sevenDaysAgo } },
      limit: 20,
      order: [['created_at', 'DESC']]
    });

    // Format the live data into a readable string
    const incidentsContext = recentIncidents.map(inc => 
      `- [${new Date(inc.created_at).toLocaleDateString()}] ${inc.category} (Status: ${inc.status}, Severity: ${inc.ai_severity_score}): ${inc.description}`
    ).join('\n');

    const alertsContext = recentAlerts.map(alt => 
      `- [${new Date(alt.created_at).toLocaleDateString()}] Alert type ${alt.type} near (${alt.latitude}, ${alt.longitude}) - Resolved: ${alt.resolved}`
    ).join('\n');

    // Create the prompt with context
    const systemPrompt = `You are a helpful and intelligent safety analytical assistant for the S.A.F.E KWASU application. 
You answer questions from students, staff, and security admins.
Here is the real live and recent data of the campus for the last 7 days:

Recent Incidents (Last 7 Days):
${incidentsContext || 'No incidents reported in the last 7 days.'}

Recent Alerts (Last 7 Days):
${alertsContext || 'No alerts triggered in the last 7 days.'}

Use this data to answer the user's question accurately. 
- If they ask about incidents or ask for a report, summarize the recent data provided above. 
- If they ask a general question, provide helpful safety advice. 
- Be concise, professional, and analytical. Identify trends if there are multiple incidents.`;

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
