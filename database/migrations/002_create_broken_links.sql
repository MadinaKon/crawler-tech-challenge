CREATE TABLE broken_links (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    crawl_result_id BIGINT UNSIGNED NOT NULL,
    url VARCHAR(500) NOT NULL,
    status_code INT DEFAULT 0,
    error_type VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign key constraint
    FOREIGN KEY (crawl_result_id) REFERENCES crawl_results(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_crawl_result_id (crawl_result_id),
    INDEX idx_url (url(255)),
    INDEX idx_status_code (status_code),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
