-- Migrate old crawl status values to new ones
UPDATE crawl_results SET status = 'queued' WHERE status = 'pending';
UPDATE crawl_results SET status = 'done' WHERE status = 'completed';
UPDATE crawl_results SET status = 'error' WHERE status = 'failed'; 