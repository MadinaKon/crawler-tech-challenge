package handlers

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"webcrawler-backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CrawlHandler handles crawl-related API requests
type CrawlHandler struct {
	db *gorm.DB
}

// NewCrawlHandler creates a new crawl handler
func NewCrawlHandler(db *gorm.DB) *CrawlHandler {
	return &CrawlHandler{db: db}
}

// GetCrawlResults returns all crawl results with enhanced filtering
func (h *CrawlHandler) GetCrawlResults(c *gin.Context) {
	// Get query parameters
	status := c.Query("status")
	url := c.Query("url")
	title := c.Query("title")
	hasLoginForm := c.Query("has_login_form")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")
	limit := c.DefaultQuery("limit", "50")
	offset := c.DefaultQuery("offset", "0")

	// Validate sort order
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Validate sort by field
	allowedSortFields := map[string]bool{
		"created_at": true,
		"updated_at": true,
		"url":        true,
		"title":      true,
		"status":     true,
	}
	if !allowedSortFields[sortBy] {
		sortBy = "created_at"
	}

	var results []models.CrawlResult
	query := h.db.Model(&models.CrawlResult{})

	// Check if user is authenticated and get their role
	userRole, exists := c.Get("user_role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Apply user-based filtering (non-admin users only see their own crawls)
	if userRole != "admin" {
		userID, _ := c.Get("user_id")
		query = query.Where("user_id = ?", userID)
	}

	// Apply filters
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if url != "" {
		query = query.Where("url LIKE ?", "%"+url+"%")
	}
	if title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if hasLoginForm != "" {
		hasLogin := hasLoginForm == "true"
		query = query.Where("has_login_form = ?", hasLogin)
	}
	if dateFrom != "" {
		query = query.Where("created_at >= ?", dateFrom)
	}
	if dateTo != "" {
		query = query.Where("created_at <= ?", dateTo)
	}

	// Apply sorting
	sortDirection := "DESC"
	if sortOrder == "asc" {
		sortDirection = "ASC"
	}
	query = query.Order(sortBy + " " + sortDirection)
	
	// Apply pagination
	limitInt, _ := strconv.Atoi(limit)
	offsetInt, _ := strconv.Atoi(offset)
	
	// Limit maximum results to prevent performance issues
	if limitInt > 100 {
		limitInt = 100
	}
	
	result := query.Limit(limitInt).Offset(offsetInt).Find(&results)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	// Get total count for pagination
	var totalCount int64
	countQuery := h.db.Model(&models.CrawlResult{})
	
	// Apply same filters to count query
	if exists && userRole != "admin" {
		userID, _ := c.Get("user_id")
		countQuery = countQuery.Where("user_id = ?", userID)
	}
	if status != "" {
		countQuery = countQuery.Where("status = ?", status)
	}
	if url != "" {
		countQuery = countQuery.Where("url LIKE ?", "%"+url+"%")
	}
	if title != "" {
		countQuery = countQuery.Where("title LIKE ?", "%"+title+"%")
	}
	if hasLoginForm != "" {
		hasLogin := hasLoginForm == "true"
		countQuery = countQuery.Where("has_login_form = ?", hasLogin)
	}
	if dateFrom != "" {
		countQuery = countQuery.Where("created_at >= ?", dateFrom)
	}
	if dateTo != "" {
		countQuery = countQuery.Where("created_at <= ?", dateTo)
	}
	
	countQuery.Count(&totalCount)
	
	response := gin.H{
		"data": results,
		"pagination": gin.H{
			"total":   totalCount,
			"limit":   limitInt,
			"offset":  offsetInt,
			"has_more": offsetInt+limitInt < int(totalCount),
		},
		"filters": gin.H{
			"status":        status,
			"url":           url,
			"title":         title,
			"has_login_form": hasLoginForm,
			"date_from":     dateFrom,
			"date_to":       dateTo,
			"sort_by":       sortBy,
			"sort_order":    sortOrder,
		},
	}
	
	c.JSON(http.StatusOK, response)
}

// GetCrawlResultByID returns a specific crawl result with its broken links
func (h *CrawlHandler) GetCrawlResultByID(c *gin.Context) {
	id := c.Param("id")
	
	var result models.CrawlResult
	if err := h.db.Preload("BrokenLinks").First(&result, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Crawl result not found"})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetBrokenLinks returns broken links for a specific crawl result
func (h *CrawlHandler) GetBrokenLinks(c *gin.Context) {
	crawlResultID := c.Param("id")
	
	var brokenLinks []models.BrokenLink
	result := h.db.Where("crawl_result_id = ?", crawlResultID).Find(&brokenLinks)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	c.JSON(http.StatusOK, brokenLinks)
}

// CreateCrawlResult creates a new crawl result
func (h *CrawlHandler) CreateCrawlResult(c *gin.Context) {
	var request struct {
		URL string `json:"url" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL is required"})
		return
	}
	
	// Normalize and validate URL
	normalizedURL, err := h.normalizeAndValidateURL(request.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid URL: %v", err)})
		return
	}
	
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	
	// Check for duplicate URL for this user
	var existingCrawl models.CrawlResult
	if err := h.db.Where("url = ? AND user_id = ?", normalizedURL, userID).First(&existingCrawl).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "URL already exists in crawl queue for this user",
			"existing_id": existingCrawl.ID,
			"existing_status": existingCrawl.Status,
		})
		return
	} else if err != gorm.ErrRecordNotFound {
		// Database error occurred
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error while checking for duplicates"})
		return
	}
	
	// Create a new crawl result with queued status
	userIDUint := userID.(uint)
	crawlResult := models.CrawlResult{
		URL:           normalizedURL,
		Status:        models.StatusQueued,
		UserID:        &userIDUint,
	}
	
	if err := h.db.Create(&crawlResult).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, crawlResult)
}

// normalizeAndValidateURL validates and normalizes the URL format
func (h *CrawlHandler) normalizeAndValidateURL(inputURL string) (string, error) {
	// Trim whitespace
	urlStr := strings.TrimSpace(inputURL)
	
	// Add scheme if missing
	if !strings.HasPrefix(urlStr, "http://") && !strings.HasPrefix(urlStr, "https://") {
		urlStr = "https://" + urlStr
	}
	
	// Parse URL to validate format
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return "", fmt.Errorf("invalid URL format: %v", err)
	}
	
	// Validate required URL components
	if parsedURL.Scheme == "" {
		return "", fmt.Errorf("URL scheme is required")
	}
	
	if parsedURL.Host == "" {
		return "", fmt.Errorf("URL host is required")
	}
	
	// Only allow HTTP and HTTPS schemes
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return "", fmt.Errorf("only HTTP and HTTPS schemes are supported")
	}
	
	// Normalize the URL (remove default ports, etc.)
	normalizedURL := parsedURL.String()
	
	// Remove trailing slash for consistency
	normalizedURL = strings.TrimSuffix(normalizedURL, "/")
	
	return normalizedURL, nil
}

// ProcessPendingCrawls triggers processing of all pending crawl results
func (h *CrawlHandler) ProcessPendingCrawls(c *gin.Context) {
	// For now, just return a message that crawling is not implemented
	c.JSON(http.StatusOK, gin.H{"message": "Crawling functionality not yet implemented"})
}

// CrawlSingleURL processes a specific URL by ID
func (h *CrawlHandler) CrawlSingleURL(c *gin.Context) {
	id := c.Param("id")
	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	
	// For now, just return a message that crawling is not implemented
	c.JSON(http.StatusOK, gin.H{"message": "Crawling functionality not yet implemented", "id": idUint})
}

// GetStats returns dashboard statistics
func (h *CrawlHandler) GetStats(c *gin.Context) {
	var stats struct {
		TotalCrawls     int64 `json:"total_crawls"`
		DoneCrawls      int64 `json:"done_crawls"`
		ErrorCrawls     int64 `json:"error_crawls"`
		QueuedCrawls    int64 `json:"queued_crawls"`
		RunningCrawls   int64 `json:"running_crawls"`
		TotalBrokenLinks int64 `json:"total_broken_links"`
	}
	
	// Count by status
	h.db.Model(&models.CrawlResult{}).Count(&stats.TotalCrawls)
	h.db.Model(&models.CrawlResult{}).Where("status = ?", models.StatusDone).Count(&stats.DoneCrawls)
	h.db.Model(&models.CrawlResult{}).Where("status = ?", models.StatusError).Count(&stats.ErrorCrawls)
	h.db.Model(&models.CrawlResult{}).Where("status = ?", models.StatusQueued).Count(&stats.QueuedCrawls)
	h.db.Model(&models.CrawlResult{}).Where("status = ?", models.StatusRunning).Count(&stats.RunningCrawls)
	h.db.Model(&models.BrokenLink{}).Count(&stats.TotalBrokenLinks)
	
	c.JSON(http.StatusOK, stats)
} 