CREATE TABLE broken_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crawl_result_id VARCHAR(36) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    status_code INT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (crawl_result_id) REFERENCES crawl_results(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_crawl_result_id (crawl_result_id),
    INDEX idx_status_code (status_code)
);
