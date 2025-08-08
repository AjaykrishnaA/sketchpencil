module.exports = {
  apps: [
    {
      name: 'spen-fe',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    },
    {
      name: 'spen-hbe',
      cwd: './apps/http-backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/http-backend-error.log',
      out_file: './logs/http-backend-out.log',
      log_file: './logs/http-backend-combined.log',
      time: true
    },
    {
      name: 'spen-wsbe',
      cwd: './apps/ws-backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/ws-backend-error.log',
      out_file: './logs/ws-backend-out.log',
      log_file: './logs/ws-backend-combined.log',
      time: true
    }
  ]
}; 