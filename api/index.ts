import { createApp } from "../server/app";
import serverless from "serverless-http";

// Cache app promise to avoid recreation on every request
let cachedAppPromise: Promise<any> | null = null;

const getApp = () => {
  if (!cachedAppPromise) {
    cachedAppPromise = createApp();
  }
  return cachedAppPromise;
};

// Export serverless function handler
export default async (req: any, res: any) => {
  const app = await getApp();
  return serverless(app)(req, res);
};