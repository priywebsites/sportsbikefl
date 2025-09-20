import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Session configuration - Use different stores for development vs deployment
const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';

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

(async () => {
  // Session configuration must be set up before routes
  if (isProduction) {
    // Try database-backed session store for deployment, fallback to memory store
    try {
      const { default: connectPgSimple } = await import('connect-pg-simple');
      const pgSession = connectPgSimple(session);
      
      app.use(session({
        secret: process.env.SESSION_SECRET || 'sportbikefl-secret-key',
        resave: false,
        saveUninitialized: false,
        store: new pgSession({
          conString: process.env.DATABASE_URL,
          tableName: 'session',
          createTableIfMissing: false // Don't block startup on table creation
        }),
        cookie: {
          secure: true, // Use secure cookies in production
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
      }));
      log("Using PostgreSQL session store");
    } catch (error) {
      log("Failed to initialize PostgreSQL session store, falling back to memory store:", (error as Error).message || String(error));
      const MemStoreSession = MemoryStore(session);
      app.use(session({
        secret: process.env.SESSION_SECRET || 'sportbikefl-secret-key',
        resave: false,
        saveUninitialized: false,
        store: new MemStoreSession({
          checkPeriod: 86400000 // prune expired entries every 24h
        }),
        cookie: {
          secure: true, // Use secure cookies in production
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
      }));
    }
  } else {
    // Use memory store for development
    const MemStoreSession = MemoryStore(session);
    app.use(session({
      secret: process.env.SESSION_SECRET || 'sportbikefl-secret-key',
      resave: false,
      saveUninitialized: true,
      store: new MemStoreSession({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      cookie: {
        secure: false, // Set to false for development
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize database after server starts listening - run in background to not block health checks
    if (isProduction) {
      // Use setImmediate to move seeding to next tick, allowing health checks to work immediately
      setImmediate(async () => {
        try {
          log("Starting database seeding...");
          await seedDatabase();
          log("Database seeding completed");
        } catch (error) {
          console.error("Failed to seed database:", error);
        }
      });
    }
  });
})();
