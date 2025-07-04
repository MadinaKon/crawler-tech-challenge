package main

import (
    "os"
    "log"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
)

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    user := os.Getenv("DB_USER")
    pass := os.Getenv("DB_PASS")
    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")
    name := os.Getenv("DB_NAME")

    dsn := user + ":" + pass + "@tcp(" + host + ":" + port + ")/" + name
    db, err := sql.Open("mysql", dsn)
    if err != nil {
        log.Fatal("Failed to connect to MySQL:", err)
    }
    defer db.Close()

    // Test connection
    if err := db.Ping(); err != nil {
        log.Fatal("Failed to ping MySQL:", err)
    }
    log.Println("Connected to MySQL!")

    r := gin.Default()
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "Hello, World!"})
    })
    r.Run()
}
