module.exports = {
  apps: [
    {
      name: 'photowala-backend',
      script: 'backend/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
