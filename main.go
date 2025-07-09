package main

import (
	"log"
	"os"
	"runtime"
	"fmt"
	"webcrawler-backend/internal/database"
	"webcrawler-backend/internal/handlers"
	"webcrawler-backend/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
    "time"
    "webcrawler-backend/internal/models"
    "gorm.io/gorm"
)

// logWithLevel logs with a level and context (file, line, function)
func logWithLevel(level string, msg string, args ...interface{}) {
	pc, file, line, ok := runtime.Caller(1)
	funcName := "?"
	if ok {
		funcName = runtime.FuncForPC(pc).Name()
	}
	log.Printf("[%s] (%s:%d %s) %s", level, file, line, funcName, fmt.Sprintf(msg, args...))
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logWithLevel("INFO", "No .env file found, using system environment variables")
	}

	// Get JWT secret from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-super-secret-jwt-key-change-in-production" // Default for development
		logWithLevel("WARN", "Using default JWT secret. Set JWT_SECRET environment variable for production.")
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		logWithLevel("ERROR", "Failed to connect to database: %v", err)
		os.Exit(1)
	}


	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		logWithLevel("ERROR", "Failed to run migrations: %v", err)
		os.Exit(1)
	}


	// Initialize handlers
	crawlHandler := handlers.NewCrawlHandler(db)
	
	// Initialize auth middleware
	authMiddleware := middleware.NewAuthMiddleware(db, jwtSecret)
	
	// Initialize auth handler
	authHandler := handlers.NewAuthHandler(db, authMiddleware)

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Health check endpoint (no auth required)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes (no auth required)
	auth := r.Group("/api/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/register", authHandler.Register)
		auth.POST("/refresh", authMiddleware.AuthRequired(), authHandler.RefreshToken)
		auth.POST("/logout", authMiddleware.AuthRequired(), authHandler.Logout)
	}

	// Protected API routes
	api := r.Group("/api")
	api.Use(authMiddleware.AuthRequired())
	{
		// User profile routes
		api.GET("/profile", authHandler.GetProfile)
		api.PUT("/profile", authHandler.UpdateProfile)
		
		// Crawl routes
		api.GET("/crawls", crawlHandler.GetCrawlResults)
		api.POST("/crawls", crawlHandler.CreateCrawlResult)
		api.GET("/crawls/:id", crawlHandler.GetCrawlResultByID)
		api.GET("/crawls/:id/broken-links", crawlHandler.GetBrokenLinks)
		api.POST("/crawls/:id/process", crawlHandler.CrawlSingleURL)
		api.POST("/crawls/:id/stop", crawlHandler.StopCrawlByID)
		api.DELETE("/crawls/:id", crawlHandler.DeleteCrawlResult)
		api.POST("/crawls/process-all", crawlHandler.ProcessQueuedCrawls)
		api.GET("/stats", crawlHandler.GetStats)
	}

	// Admin routes (admin role required)
	admin := r.Group("/api/admin")
	admin.Use(authMiddleware.RoleRequired("admin"))
	{
		// Add admin-specific routes here
		admin.GET("/users", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Admin endpoint - user management coming soon"})
		})
	}

	// Start background worker to process queued crawls automatically
go func(db *gorm.DB) {
    for {
        var crawl models.CrawlResult
        // Find the oldest crawl with status "queued"
        if err := db.Where("status = ?", models.StatusQueued).Order("created_at asc").First(&crawl).Error; err == nil {
            // Set to running
            db.Model(&crawl).Updates(map[string]interface{}{
                "status":   models.StatusRunning,
                "progress": 0,
            })

            // Simulate crawl progress
            for i := 20; i <= 100; i += 20 {
                time.Sleep(1 * time.Second) // Simulate work
                db.Model(&crawl).Update("progress", i)
            }

            // Set to done
            db.Model(&crawl).Updates(map[string]interface{}{
                "status":   models.StatusDone,
                "progress": 100,
            })
        }
        time.Sleep(2 * time.Second) // Poll every 2 seconds
    }
}(db)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logWithLevel("INFO", "Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		logWithLevel("ERROR", "Failed to start server: %v", err)
		os.Exit(1)
	}
}
