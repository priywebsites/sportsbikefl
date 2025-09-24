import express, { type Request, Response, NextFunction } from "express";
import { getIronSession } from "iron-session";
import { registerRoutes } from "./routes";
import { log } from "./vite";

// Session configuration
export interface SessionData {
  userId?: string;
  cartId?: string;
}

// Validate required session password in production
if (process.env.NODE_ENV === 'production' && !process.env.IRON_SESSION_PASSWORD && !process.env.SESSION_SECRET) {
  throw new Error('IRON_SESSION_PASSWORD or SESSION_SECRET is required in production');
}

const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD || process.env.SESSION_SECRET || 'sportbikefl-secret-key-must-be-at-least-32-characters-long',
  cookieName: "sportbikefl-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 24 hours in seconds (not milliseconds)
  },
};

// Session middleware wrapper to make iron-session behave like express-session
const sessionMiddleware = async (req: any, res: any, next: any) => {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    req.session = session;
    next();
  } catch (error) {
    console.error('Session error:', error);
    next(error);
  }
};

export async function createApp(): Promise<express.Express> {
  const app = express();
  
  // Body parsing middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: false, limit: '50mb' }));

  // Logging middleware for API routes
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Session middleware
  app.use(sessionMiddleware);

  // Health check endpoint for Vercel
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: Date.now() });
  });

  app.get("/api/healthz", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: Date.now() });
  });

  // Register all API routes
  await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Server error:', err);
  });

  return app;
}