import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Send SMS via Termii API (Nigerian SMS Gateway)
 * @param {string} to - Recipient phone number (e.g., +2348000000000)
 * @param {string} message - SMS content
 * @returns {Promise<object>} - Termii API response
 */
export async function sendSMS(to, message) {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || 'N-Alert';

  if (!apiKey) {
    console.warn('TERMII_API_KEY not configured. SMS not sent.');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const response = await axios.post(
      'https://api.ng.termii.com/api/sms/send',
      {
        to,
        from: senderId,
        sms: message,
        type: 'plain',
        api_key: apiKey,
        channel: 'generic',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    logger.info('SMS sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('SMS sending failed:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message 
    };
  }
}

/**
 * Send bulk SMS to multiple recipients
 * @param {string[]} recipients - Array of phone numbers
 * @param {string} message - SMS content
 * @returns {Promise<object[]>} - Array of send results
 */
export async function sendBulkSMS(recipients, message) {
  const results = [];

  for (const to of recipients) {
    const result = await sendSMS(to, message);
    results.push({ to, ...result });
    // Rate limiting: wait 100ms between sends
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Send emergency SMS to security personnel
 * @param {string} alertType - Type of alert (emergency, incident, etc.)
 * @param {string} details - Alert details
 * @param {string} location - GPS coordinates
 */
export async function sendEmergencySMS(alertType, details, location) {
  const securityPhones = [
    process.env.SECURITY_PHONE,
    process.env.SECURITY_PHONE_2,
    process.env.SECURITY_PHONE_3,
  ].filter(Boolean);

  const message = ` SAFE SYSTEM ${alertType.toUpperCase()}\n${details}\nLocation: ${location}\n\nLogin to dashboard for details.`;

  return await sendBulkSMS(securityPhones, message);
}
