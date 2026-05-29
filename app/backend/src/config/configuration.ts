export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.API_PORT ?? '3000', 10),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.POSTGRES_USER ?? 'ecotrack',
    password: process.env.POSTGRES_PASSWORD ?? 'ecotrack',
    name: process.env.POSTGRES_DB ?? 'ecotrack',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  mqtt: {
    url: process.env.MQTT_URL ?? 'mqtt://localhost:1883',
    topic: process.env.MQTT_TOPIC ?? 'ecotrack/measurements',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
    accessTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10),
    refreshTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10),
  },
  simulator: {
    enabled: (process.env.SIMULATOR_ENABLED ?? 'true') === 'true',
    containers: parseInt(process.env.SIMULATOR_CONTAINERS ?? '200', 10),
    intervalMs: parseInt(process.env.SIMULATOR_INTERVAL_MS ?? '15000', 10),
  },
});
