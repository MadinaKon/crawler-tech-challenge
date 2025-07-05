USE webcrawler_db;


SELECT * FROM crawl_results ORDER BY created_at DESC;


SELECT status, COUNT(*) as count 
FROM crawl_results 
GROUP BY status;


SELECT 
    id,
    url,
    title,
    html_version,
    internal_links,
    external_links,
    inaccessible_links,
    has_login_form,
    created_at
FROM crawl_results 
WHERE status = 'completed'
ORDER BY created_at DESC;


SELECT 
    id,
    url,
    status,
    error_message,
    created_at
FROM crawl_results 
WHERE status = 'failed'
ORDER BY created_at DESC;


SELECT 
    bl.id,
    bl.url,
    bl.status_code,
    bl.error_type,
    bl.error_message,
    cr.url as crawl_url
FROM broken_links bl
JOIN crawl_results cr ON bl.crawl_result_id = cr.id
ORDER BY bl.created_at DESC;


SELECT 
    error_type,
    COUNT(*) as count
FROM broken_links 
GROUP BY error_type
ORDER BY count DESC;


SELECT 
    cr.id,
    cr.url,
    cr.title,
    cr.status,
    cr.internal_links,
    cr.external_links,
    cr.inaccessible_links,
    COUNT(bl.id) as broken_links_count
FROM crawl_results cr
LEFT JOIN broken_links bl ON cr.id = bl.crawl_result_id
GROUP BY cr.id
ORDER BY cr.created_at DESC;


SELECT 
    id,
    url,
    title,
    has_login_form,
    created_at
FROM crawl_results 
WHERE has_login_form = true
ORDER BY created_at DESC;


SELECT 
    id,
    url,
    title,
    JSON_EXTRACT(heading_counts, '$.h1') as h1_count,
    JSON_EXTRACT(heading_counts, '$.h2') as h2_count,
    JSON_EXTRACT(heading_counts, '$.h3') as h3_count,
    JSON_EXTRACT(heading_counts, '$.h4') as h4_count,
    JSON_EXTRACT(heading_counts, '$.h5') as h5_count,
    JSON_EXTRACT(heading_counts, '$.h6') as h6_count
FROM crawl_results 
WHERE status = 'completed' AND heading_counts IS NOT NULL
ORDER BY created_at DESC;


SELECT 
    'crawl_results' as table_name,
    COUNT(*) as record_count
FROM crawl_results 
WHERE created_at >= NOW() - INTERVAL 24 HOUR
UNION ALL
SELECT 
    'broken_links' as table_name,
    COUNT(*) as record_count
FROM broken_links 
WHERE created_at >= NOW() - INTERVAL 24 HOUR;