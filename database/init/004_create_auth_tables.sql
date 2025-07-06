-- Modify existing users table to add auth-related columns
ALTER TABLE users 
ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user' AFTER name;

ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER is_active;

ALTER TABLE users 
ADD COLUMN last_login TIMESTAMP NULL AFTER email_verified;

ALTER TABLE users 
ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at;

ALTER TABLE users 
ADD INDEX idx_role (role);

ALTER TABLE users 
ADD INDEX idx_email_verified (email_verified);

ALTER TABLE users 
ADD INDEX idx_last_login (last_login);

ALTER TABLE users 
ADD INDEX idx_deleted_at (deleted_at);

-- Create refresh tokens table for JWT refresh mechanism
CREATE TABLE refresh_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_revoked (is_revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create API keys table for service-to-service authentication
CREATE TABLE api_keys (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_key_hash (key_hash),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add user_id to crawl_results table for user ownership
ALTER TABLE crawl_results 
ADD COLUMN user_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;

ALTER TABLE crawl_results 
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE crawl_results 
ADD INDEX idx_user_id (user_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, is_active, email_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'admin@webcrawler.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', TRUE, TRUE);

-- Insert default test user (password: user123)
INSERT INTO users (id, email, password_hash, name, role, is_active, email_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'user@webcrawler.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'user', TRUE, TRUE); 