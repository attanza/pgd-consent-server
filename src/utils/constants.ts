import 'dotenv/config';
export const MINIO_URL =
  'http://' +
  process.env.MINIO_ENDPOINT +
  ':' +
  process.env.MINIO_PORT +
  '/' +
  process.env.MINIO_BUCKET_NAME +
  '/';
