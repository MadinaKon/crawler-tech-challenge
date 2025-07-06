-- Allow root user to connect from any host
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;

-- Create the webcrawler user if it doesn't exist
CREATE USER IF NOT EXISTS 'webcrawler'@'%' IDENTIFIED WITH mysql_native_password BY 'webcrawler_pass';
GRANT ALL PRIVILEGES ON webcrawler_db.* TO 'webcrawler'@'%';
FLUSH PRIVILEGES; 