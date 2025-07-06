package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/joho/godotenv"
    "webcrawler-backend/internal/database"
    "webcrawler-backend/internal/handlers"
)

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    // Connect to database using GORM
    db, err := database.Connect()
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    
    // Test connection
    sqlDB, err := db.DB()
    if err != nil {
        log.Fatal("Failed to get underlying sql.DB:", err)
    }
    
    if err := sqlDB.Ping(); err != nil {
        log.Fatal("Failed to ping MySQL:", err)
    }
    log.Println("Connected to MySQL!")

    // Drop existing tables to fix foreign key constraint issues
    // if err := database.DropTables(db); err != nil {
    //     log.Fatal("Failed to drop tables:", err)
    // }

    // Run database migrations
    if err := database.RunMigrations(db); err != nil {
        log.Fatal("Failed to run database migrations:", err)
    }

    // Initialize handlers
    crawlHandler := handlers.NewCrawlHandler(db)

    r := gin.Default()

   // Configure CORS
   config := cors.DefaultConfig()
   config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"}
   config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
   config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
   r.Use(cors.New(config))

    // API routes
    api := r.Group("/api")
    {
        api.GET("/crawls", crawlHandler.GetCrawlResults)
        api.POST("/crawls", crawlHandler.CreateCrawlResult)
        api.GET("/crawls/:id", crawlHandler.GetCrawlResultByID)
        api.GET("/crawls/:id/broken-links", crawlHandler.GetBrokenLinks)
        api.POST("/crawls/process", crawlHandler.ProcessPendingCrawls)
        api.POST("/crawls/:id/crawl", crawlHandler.CrawlSingleURL)
        api.GET("/stats", crawlHandler.GetStats)
    }

    // Note: Frontend is served separately on port 3002
    // Static file serving removed to avoid conflicts with API routes

    log.Println("Server starting on :8080")
    r.Run("0.0.0.0:8080")
}
