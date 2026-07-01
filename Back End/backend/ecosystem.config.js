module.exports = {
  apps: [{
    name: 'safe-backend',
    script: 'server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    error_file: '/var/log/safe-backend/error.log',
    out_file: '/var/log/safe-backend/out.log',
    log_file: '/var/log/safe-backend/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '500M',
  }]
};
