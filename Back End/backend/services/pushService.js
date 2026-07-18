import { Expo } from 'expo-server-sdk';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

const expo = new Expo();

/**
 * Send an Expo push notification to a single user by id.
 * Best-effort: never throws, so it can safely be fired-and-forgotten
 * alongside the existing in-app Notification.create() calls.
 */
export async function pushToUser(userId, { title, body, data = {} }) {
  try {
    if (!userId) return;
    const user = await User.findByPk(userId, { attributes: ['push_token'] });
    const token = user?.push_token;
    if (!token || !Expo.isExpoPushToken(token)) return;

    const messages = [
      {
        to: token,
        sound: 'default',
        priority: 'high',
        title,
        body,
        data,
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (error) {
    logger.info('Push notification failed (non-fatal):', error.message);
  }
}

/**
 * Send the same push notification to many users at once.
 */
export async function pushToUsers(userIds, payload) {
  await Promise.all((userIds || []).map((id) => pushToUser(id, payload)));
}

/**
 * Push to every security_admin / super_admin user.
 */
export async function pushToAdmins(payload) {
  try {
    const { Op } = await import('sequelize');
    const admins = await User.findAll({
      where: { role: { [Op.in]: ['security_admin', 'super_admin'] } },
      attributes: ['id'],
    });
    await pushToUsers(admins.map((a) => a.id), payload);
  } catch (error) {
    logger.info('Push to admins failed (non-fatal):', error.message);
  }
}
