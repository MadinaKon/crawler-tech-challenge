USE webcrawler_db;

-- Insert mock crawl_results data
INSERT INTO crawl_results (url, title, html_version, status, heading_counts, internal_links, external_links, inaccessible_links, has_login_form, error_message, created_at, updated_at) VALUES
('https://example.com', 'Example Domain', 'HTML5', 'completed', '{"h1": 1, "h2": 3, "h3": 5, "h4": 2, "h5": 1, "h6": 0}', 15, 8, 2, false, NULL, NOW(), NOW()),
('https://google.com', 'Google', 'HTML5', 'completed', '{"h1": 0, "h2": 0, "h3": 0, "h4": 0, "h5": 0, "h6": 0}', 25, 12, 1, false, NULL, NOW(), NOW()),
('https://github.com', 'GitHub: Let\'s build from here', 'HTML5', 'completed', '{"h1": 2, "h2": 8, "h3": 12, "h4": 6, "h5": 3, "h6": 1}', 45, 20, 3, true, NULL, NOW(), NOW()),
('https://stackoverflow.com', 'Stack Overflow - Where Developers Learn, Share, & Build Careers', 'HTML5', 'completed', '{"h1": 1, "h2": 5, "h3": 10, "h4": 8, "h5": 4, "h6": 2}', 30, 15, 5, true, NULL, NOW(), NOW()),
('https://invalid-url-that-does-not-exist.com', NULL, NULL, 'failed', NULL, 0, 0, 0, false, 'Connection timeout after 30 seconds', NOW(), NOW()),
('https://httpstat.us/404', NULL, NULL, 'failed', NULL, 0, 0, 0, false, 'HTTP 404 - Page not found', NOW(), NOW()),
('https://httpstat.us/500', NULL, NULL, 'failed', NULL, 0, 0, 0, false, 'HTTP 500 - Internal server error', NOW(), NOW()),
('https://medium.com', 'Medium – Where good ideas find you', 'HTML5', 'completed', '{"h1": 1, "h2": 4, "h3": 7, "h4": 3, "h5": 2, "h6": 0}', 22, 18, 4, true, NULL, NOW(), NOW()),
('https://dev.to', 'DEV Community', 'HTML5', 'completed', '{"h1": 1, "h2": 6, "h3": 9, "h4": 5, "h5": 2, "h6": 1}', 28, 14, 2, true, NULL, NOW(), NOW()),
('https://css-tricks.com', 'CSS-Tricks', 'HTML5', 'completed', '{"h1": 1, "h2": 3, "h3": 8, "h4": 4, "h5": 1, "h6": 0}', 35, 16, 3, false, NULL, NOW(), NOW());

-- Insert mock broken_links data
INSERT INTO broken_links (crawl_result_id, url, status_code, error_type, error_message, created_at, updated_at) VALUES
(1, 'https://example.com/broken-link-1', 404, 'not_found', 'Page not found', NOW(), NOW()),
(1, 'https://example.com/broken-link-2', 500, 'server_error', 'Internal server error', NOW(), NOW()),
(2, 'https://google.com/non-existent', 404, 'not_found', 'Page not found', NOW(), NOW()),
(3, 'https://github.com/broken-repo', 404, 'not_found', 'Repository not found', NOW(), NOW()),
(3, 'https://github.com/private-repo', 403, 'forbidden', 'Access forbidden', NOW(), NOW()),
(4, 'https://stackoverflow.com/broken-question', 404, 'not_found', 'Question not found', NOW(), NOW()),
(4, 'https://stackoverflow.com/deleted-answer', 410, 'gone', 'Resource has been deleted', NOW(), NOW()),
(8, 'https://medium.com/broken-article', 404, 'not_found', 'Article not found', NOW(), NOW()),
(9, 'https://dev.to/broken-post', 404, 'not_found', 'Post not found', NOW(), NOW()),
(10, 'https://css-tricks.com/broken-tutorial', 404, 'not_found', 'Tutorial not found', NOW(), NOW());

-- Show the inserted data
SELECT 'crawl_results' as table_name, COUNT(*) as record_count FROM crawl_results
UNION ALL
SELECT 'broken_links' as table_name, COUNT(*) as record_count FROM broken_links; 