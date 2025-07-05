CREATE TABLE crawl_results (
    id VARCHAR(36) PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    title VARCHAR(512),
    html_version VARCHAR(50),
    status ENUM('queued', 'running', 'completed', 'error') DEFAULT 'queued',
    
    -- Heading counts
    h1_count INT DEFAULT 0,
    h2_count INT DEFAULT 0,
    h3_count INT DEFAULT 0,
    h4_count INT DEFAULT 0,
    h5_count INT DEFAULT 0,
    h6_count INT DEFAULT 0,
    
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
    completed_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_url (url(255)),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
