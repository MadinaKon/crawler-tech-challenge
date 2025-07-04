USE webcrawler_db;


SOURCE /docker-entrypoint-initdb.d/001_create_crawl_results.sql;
SOURCE /docker-entrypoint-initdb.d/002_create_broken_links.sql;
SOURCE /docker-entrypoint-initdb.d/003_create_users.sql;


INSERT INTO users (id, email, password_hash, name) VALUES 
('user-1', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User');


INSERT INTO crawl_results (id, url, title, html_version, status, h1_count, h2_count, internal_links, external_links, has_login_form) VALUES 
('result-1', 'https://example.com', 'Example Domain', 'HTML5', 'completed', 1, 3, 15, 5, FALSE),
('result-2', 'https://google.com', 'Google', 'HTML5', 'completed', 1, 2, 25, 10, TRUE),
('result-3', 'https://github.com', 'GitHub', 'HTML5', 'running', 2, 8, 45, 15, TRUE);
