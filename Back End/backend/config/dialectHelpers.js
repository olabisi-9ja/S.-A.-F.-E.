import { fn, col } from 'sequelize';
import sequelize from './database.js';

const isSQLite = sequelize.dialect === 'sqlite';

export function dateTrunc(dateCol, unit = 'day') {
  if (isSQLite) {
    if (unit === 'hour') return fn('STRFTIME', '%Y-%m-%d %H:00', col(dateCol));
    if (unit === 'week') return fn('STRFTIME', '%Y-%W', col(dateCol));
    return fn('DATE', col(dateCol));
  }
  if (unit === 'hour') return fn('DATE_FORMAT', col(dateCol), '%Y-%m-%d %H:00');
  if (unit === 'week') return fn('DATE_FORMAT', col(dateCol), '%Y-%u');
  return fn('DATE', col(dateCol));
}

export function dateDiffSeconds(col1, col2) {
  if (isSQLite) {
    return fn('ROUND', fn('JULIANDAY', col(col2)) - fn('JULIANDAY', col(col1)) * 86400);
  }
  return fn('TIMESTAMPDIFF', sequelize.literal('SECOND'), col(col1), col(col2));
}
