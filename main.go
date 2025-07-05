
package main

import (
    "log"
    "github.com/gin-gonic/gin"
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
    if err := database.DropTables(db); err != nil {
        log.Fatal("Failed to drop tables:", err)
    }

    // Run database migrations
    if err := database.RunMigrations(db); err != nil {
        log.Fatal("Failed to run database migrations:", err)
    }

    // Initialize handlers
    crawlHandler := handlers.NewCrawlHandler(db)

    r := gin.Default()

    // API routes
    api := r.Group("/api")
    {
        api.GET("/crawls", crawlHandler.GetCrawlResults)
        api.GET("/crawls/:id", crawlHandler.GetCrawlResultByID)
        api.GET("/crawls/:id/broken-links", crawlHandler.GetBrokenLinks)
        api.GET("/stats", crawlHandler.GetStats)
    }

    // Serve static files (React app)
    r.Static("/static", "./dist")
    r.LoadHTMLGlob("dist/*.html")
    
    // Catch-all route to serve React app
    r.NoRoute(func(c *gin.Context) {
        c.File("dist/index.html")
    })

    log.Println("Server starting on :8080")
    r.Run("0.0.0.0:8080")
}
