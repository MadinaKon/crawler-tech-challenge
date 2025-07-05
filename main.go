package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "webcrawler-backend/internal/database"
)

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    database.Connect()

    // Test connection
    sqlDB, err := database.DB.DB()
    if err != nil {
        log.Fatal("Failed to get underlying sql.DB:", err)
    }
    if err := sqlDB.Ping(); err != nil {
        log.Fatal("Failed to ping MySQL:", err)
    }
    log.Println("Connected to MySQL!")

    r := gin.Default()
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "Hello, World!"})
    })
    r.Run("0.0.0.0:8080")
}
