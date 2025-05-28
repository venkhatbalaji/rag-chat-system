export default () => ({
  appName: process.env.APP_NAME || 'chat.app',
  env: process.env.NODE_ENV || 'development',
  redirectUrl: process.env.REDIRECT_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT || '3000', 10),
  apiKey: process.env.API_KEY,
  jwt: {
    secret: process.env.API_KEY,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
  },
  cloudflare: {
    isEnabled: process.env.CF_ENABLED === 'true',
    zoneId: process.env.CF_ZONE_ID,
    apiKey: process.env.CF_API_KEY,
    email: process.env.CF_EMAIL,
  },
  slack: {
    isEnabled: process.env.SLACK_ENABLED === 'true',
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
  },
  ratelimit: {
    isEnabled: process.env.RATELIMIT_ENABLED === 'true',
    maxRequestsPerSec: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || '600',
      10,
    ),
    maxSec: parseInt(process.env.RATE_LIMIT_SEC || '1', 10),
    tempBlockDuration: parseInt(
      process.env.RATE_LIMIT_TEMP_BLOCK_DURATION || '5',
      10,
    ),
    abuseThreshold: parseInt(
      process.env.RATE_LIMIT_ABUSE_THRESHOLD || '10',
      10,
    ),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
});
