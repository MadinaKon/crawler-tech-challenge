CREATE TABLE IF NOT EXISTS crawl_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    url VARCHAR(500) NOT NULL,
    title VARCHAR(500),
    html_version VARCHAR(10),
    status ENUM('queued', 'running', 'done', 'error') DEFAULT 'queued',
    
    -- Heading counts stored as JSON
    heading_counts JSON,
    
    -- Link counts
    internal_links INT DEFAULT 0,
    external_links INT DEFAULT 0,
    inaccessible_links INT DEFAULT 0,
    
    -- Additional fields
    has_login_form BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_url (url(255)),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
