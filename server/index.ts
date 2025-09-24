import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

// Development server using the app factory
(async () => {
  const app = await createApp();
  
  // Create HTTP server
  const { createServer } = await import("http");
  const server = createServer(app);

  const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';

  // Root health check for deployment platforms
  app.get("/", (req, res, next) => {
    // Check if this looks like a health check (simple heuristics)
    if (req.headers.accept === '*/*' && !req.headers.referer) {
      return res.status(200).json({ status: "healthy", timestamp: Date.now() });
    }
    next();
  });

  // Setup Vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize database after server starts listening - run in background
    if (isProduction) {
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
