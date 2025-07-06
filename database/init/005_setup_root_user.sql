-- Allow root user to connect from any host
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';

-- Create the webcrawler user if it doesn't exist
CREATE USER IF NOT EXISTS 'webcrawler'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_USER_PASSWORD}';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON webcrawler_db.* TO 'webcrawler'@'%';
FLUSH PRIVILEGES; 