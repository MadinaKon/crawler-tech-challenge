-- Use the database (should already be created by 00-create-database.sql)
USE webcrawler_db;

-- Create tables
SOURCE /docker-entrypoint-initdb.d/001_create_crawl_results.sql;
SOURCE /docker-entrypoint-initdb.d/002_create_broken_links.sql;
SOURCE /docker-entrypoint-initdb.d/003_create_users.sql;

-- Insert users
INSERT INTO users (id, email, password_hash, name) VALUES 
('user-1', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User');

-- Insert sample crawl results
INSERT INTO crawl_results (url, title, html_version, status, heading_counts, internal_links, external_links, has_login_form) VALUES 
('https://example.com', 'Example Domain', 'HTML5', 'completed', '{"h1": 1, "h2": 3, "h3": 0, "h4": 0, "h5": 0, "h6": 0}', 15, 5, FALSE),
('https://google.com', 'Google', 'HTML5', 'completed', '{"h1": 1, "h2": 2, "h3": 0, "h4": 0, "h5": 0, "h6": 0}', 25, 10, TRUE),
('https://github.com', 'GitHub', 'HTML5', 'pending', '{"h1": 2, "h2": 8, "h3": 0, "h4": 0, "h5": 0, "h6": 0}', 45, 15, TRUE);
