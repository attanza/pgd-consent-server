import { cleanEnv, str, port } from 'envalid';

export const envalidate = () => {
  return cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'test', 'production', 'staging'],
    }),
    PORT: port(),
    DB_URL: str(),
    JWT_SECRET: str(),
    MINIO_ENDPOINT: str(),
    MINIO_PORT: str(),
    MINIO_ACCESS_KEY: str(),
    MINIO_SECRET_KEY: str(),
    MINIO_BUCKET_NAME: str(),
    REDIS_URL: str(),
    REDIS_PORT: port(),
    FRONT_END_URL: str(),
  });
};
