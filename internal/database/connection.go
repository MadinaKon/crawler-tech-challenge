package database

import (
    "fmt"
    "log"
    "os"
    "time"
    
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

func Connect() (*gorm.DB, error) {
    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")
    user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASS")
    dbname := os.Getenv("DB_NAME")
    

    if host == "" || port == "" || user == "" || password == "" || dbname == "" {
        return nil, fmt.Errorf("missing required database environment variables")
    }
    
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        user, password, host, port, dbname)
    
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })
    
    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }
    
    // Configure connection pooling
    sqlDB, err := db.DB()
    if err != nil {
        return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
    }
    
    // Set connection pool settings
    sqlDB.SetMaxIdleConns(10)           // Maximum number of idle connections
    sqlDB.SetMaxOpenConns(100)          // Maximum number of open connections
    sqlDB.SetConnMaxLifetime(time.Hour) // Maximum lifetime of a connection
    
    log.Println("Database connected successfully with connection pooling configured")
    return db, nil
}
