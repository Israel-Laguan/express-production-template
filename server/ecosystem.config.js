module.exports = {
  apps: [
    {
      name: 'etl-backend',
      script: './index.js',
      instances: 'max',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
