import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'safe-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

if (process.env.NODE_ENV === 'production' && process.env.LOGTAIL_SOURCE_TOKEN && process.env.LOGTAIL_SOURCE_TOKEN !== 'placeholder') {
  const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
  logger.add(new LogtailTransport(logtail));
}

export default logger;
