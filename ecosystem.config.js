// PM2 Ecosystem Configuration
// For managing multiple customer chatbots on Hetzner server

module.exports = {
  apps: [
    // Template - copy and modify for each customer
    {
      name: 'chatbot-kunde1',
      script: 'server.js',
      cwd: '/var/www/chatbots/kunde1-chatbot',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_file: '/var/log/pm2/chatbot-kunde1.log',
      error_file: '/var/log/pm2/chatbot-kunde1-error.log',
      out_file: '/var/log/pm2/chatbot-kunde1-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    
    {
      name: 'chatbot-kunde2', 
      script: 'server.js',
      cwd: '/var/www/chatbots/kunde2-chatbot',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      log_file: '/var/log/pm2/chatbot-kunde2.log',
      error_file: '/var/log/pm2/chatbot-kunde2-error.log',
      out_file: '/var/log/pm2/chatbot-kunde2-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    }
    
    // Add more customers as needed...
  ]
};

// Usage:
// pm2 start ecosystem.config.js
// pm2 restart all
// pm2 stop all
// pm2 logs
// pm2 monit
