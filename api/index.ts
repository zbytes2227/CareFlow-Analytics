import { app, initializeDatabase } from '../src/server/app';

// Vercel serverless: initialize DB eagerly at cold start
const ready = initializeDatabase();

export default async function handler(req: any, res: any) {
  await ready;
  return app(req, res);
}
