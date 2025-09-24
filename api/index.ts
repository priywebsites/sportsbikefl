import { createApp } from "../server/app";
import serverless from "serverless-http";

// Create Express app
const app = await createApp();

// Export serverless function handler
export default serverless(app);