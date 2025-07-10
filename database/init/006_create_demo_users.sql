-- Create demo users for testing
-- These users are for development/testing only and should not be used in production

-- Insert demo admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, is_active) VALUES 
('admin@webcrawler.com', '$2b$10$x/FT8HMKT4q8MgrkkkOvOOouP27y2EHJiZnXzX1liSz0gs/sByMSm', 'Admin User', 'admin', TRUE);

-- Insert demo regular user (password: user123)
INSERT INTO users (email, password_hash, name, role, is_active) VALUES 
('user@webcrawler.com', '$2b$10$5n2DyQscBL2QIHhQ05kCX.7TIucTLc9aE2JtPum7yipr2NtQPffM.', 'Test User', 'user', TRUE); 