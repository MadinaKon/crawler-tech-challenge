package database

import (
	"log"
	"webcrawler-backend/internal/models"
	"gorm.io/gorm"
)

// DropTables drops existing tables to fix migration issues
func DropTables(db *gorm.DB) error {
	log.Println("Dropping existing tables...")
	
	// Drop tables in correct order (child first, then parent)
	err := db.Migrator().DropTable(&models.BrokenLink{})
	if err != nil {
		return err
	}
	
	err = db.Migrator().DropTable(&models.CrawlResult{})
	if err != nil {
		return err
	}
	
	log.Println("Tables dropped successfully")
	return nil
}

// RunMigrations runs all database migrations
func RunMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// Auto migrate all models
	err := db.AutoMigrate(
		&models.CrawlResult{},
		&models.BrokenLink{},
	)
	
	if err != nil {
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// CreateTables creates the database tables if they don't exist
func CreateTables(db *gorm.DB) error {
	log.Println("Creating database tables...")

	// Create crawl_results table
	err := db.Exec(`
		CREATE TABLE IF NOT EXISTS crawl_results (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			url VARCHAR(500) NOT NULL,
			title VARCHAR(500),
			html_version VARCHAR(10),
			status VARCHAR(50) NOT NULL DEFAULT 'pending',
			heading_counts JSON,
			internal_links INT DEFAULT 0,
			external_links INT DEFAULT 0,
			inaccessible_links INT DEFAULT 0,
			has_login_form BOOLEAN DEFAULT FALSE,
			error_message TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			INDEX idx_url (url(255)),
			INDEX idx_status (status),
			INDEX idx_created_at (created_at),
			INDEX idx_deleted_at (deleted_at)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error

	if err != nil {
		return err
	}

	// Create broken_links table
	err = db.Exec(`
		CREATE TABLE IF NOT EXISTS broken_links (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			crawl_result_id BIGINT UNSIGNED NOT NULL,
			url VARCHAR(500) NOT NULL,
			status_code INT DEFAULT 0,
			error_type VARCHAR(100),
			error_message TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP NULL,
			INDEX idx_crawl_result_id (crawl_result_id),
			INDEX idx_url (url(255)),
			INDEX idx_status_code (status_code),
			INDEX idx_created_at (created_at),
			INDEX idx_deleted_at (deleted_at),
			FOREIGN KEY (crawl_result_id) REFERENCES crawl_results(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`).Error

	if err != nil {
		return err
	}

	log.Println("Database tables created successfully")
	return nil
} 