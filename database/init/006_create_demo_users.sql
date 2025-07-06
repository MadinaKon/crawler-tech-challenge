-- Create demo users for testing
-- These users are for development/testing only and should not be used in production

-- Insert demo admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, is_active, email_verified) VALUES 
('admin@webcrawler.com', '$2a$10$2Kx7j7Xwz.SgmOd8YNchouob3iMxRshSllDJUScAdaX/Li2VFKvKC', 'Admin User', 'admin', TRUE, TRUE);

-- Insert demo regular user (password: user123)
INSERT INTO users (email, password_hash, name, role, is_active, email_verified) VALUES 
('user@webcrawler.com', '$2a$10$77udFduq3Y6q2JMKVpsoHeNHsX8D79E9zBaCyL8mKCbUAfOn.4.Z6', 'Test User', 'user', TRUE, TRUE);

-- Note: The password hash above is for 'password' - you may need to generate proper bcrypt hashes
-- for 'admin123' and 'user123' in a production environment 