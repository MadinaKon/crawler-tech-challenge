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
	"time"
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

func (h *CrawlHandler) ProcessQueuedCrawls(c *gin.Context) {
    var crawl models.CrawlResult
    // Find the oldest queued crawl
    if err := h.db.Where("status = ?", models.StatusQueued).Order("created_at asc").First(&crawl).Error; err != nil {
        c.JSON(200, gin.H{"message": "No queued crawls to process"})
        return
    }

    // Set to running
    if err := h.db.Model(&crawl).Updates(map[string]interface{}{
        "status":   models.StatusRunning,
        "progress": 0,
    }).Error; err != nil {
        c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to set running for crawl %d: %v", crawl.ID, err)})
        return
    }

    // Simulate crawl progress
    success := true
    for i := 20; i <= 100; i += 20 {
        time.Sleep(300 * time.Millisecond) // Simulate work
        if err := h.db.Model(&crawl).Update("progress", i).Error; err != nil {
            success = false
            break
        }
    }

    // Set to done or error
    finalStatus := models.StatusDone
    finalProgress := 100
    if !success {
        finalStatus = models.StatusError
        finalProgress = 0
    }
    if err := h.db.Model(&crawl).Updates(map[string]interface{}{
        "status":   finalStatus,
        "progress": finalProgress,
    }).Error; err != nil {
        c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to finalize crawl %d: %v", crawl.ID, err)})
        return
    }

    c.JSON(200, gin.H{
        "processed": crawl.ID,
        "status":    finalStatus,
        "message":   fmt.Sprintf("Processed crawl %d", crawl.ID),
    })
}

// CrawlSingleURL processes a specific URL by ID
func (h *CrawlHandler) CrawlSingleURL(c *gin.Context) {
	id := c.Param("id")
	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var crawl models.CrawlResult
	if err := h.db.First(&crawl, idUint).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Crawl not found"})
		return
	}

	fmt.Printf("Found crawl ID %d with status: %s\n", crawl.ID, crawl.Status)

	// Allow re-processing if status is done or error
	if crawl.Status == models.StatusDone || crawl.Status == models.StatusError {
		fmt.Printf("Resetting crawl ID %d from status %s to queued\n", crawl.ID, crawl.Status)
		if err := h.db.Model(&crawl).Updates(map[string]interface{}{
			"status":   models.StatusQueued,
			"progress": 0,
		}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset crawl for re-processing"})
			return
		}
		if err := h.db.First(&crawl, idUint).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated crawl"})
			return
		}
		fmt.Printf("Crawl ID %d reset to status: %s\n", crawl.ID, crawl.Status)
	}

	// Set to running
	fmt.Printf("Setting crawl ID %d to running\n", crawl.ID)
	if err := h.db.Model(&crawl).Updates(map[string]interface{}{
		"status":   models.StatusRunning,
		"progress": 0,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set crawl to running"})
		return
	}

	// Simulate crawl progress (for demo; replace with real crawl logic)
	success := true
	for i := 20; i <= 100; i += 20 {
		time.Sleep(2 * time.Second) // Simulate work - increased from 300ms to 2s
		fmt.Printf("Updating crawl ID %d progress to %d%%\n", crawl.ID, i)
		if err := h.db.Model(&crawl).Update("progress", i).Error; err != nil {
			success = false
			break
		}
	}

	// Set to done or error
	finalStatus := models.StatusDone
	finalProgress := 100
	if !success {
		finalStatus = models.StatusError
		finalProgress = 0
	}
	fmt.Printf("Setting crawl ID %d to final status: %s\n", crawl.ID, finalStatus)
	if err := h.db.Model(&crawl).Updates(map[string]interface{}{
		"status":   finalStatus,
		"progress": finalProgress,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to finalize crawl"})
		return
	}

	// Fetch updated crawl
	if err := h.db.First(&crawl, idUint).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated crawl"})
		return
	}

	fmt.Printf("Returning crawl ID %d with final status: %s\n", crawl.ID, crawl.Status)
	c.JSON(http.StatusOK, crawl)
}

// StopCrawlByID stops a crawl by ID
func (h *CrawlHandler) StopCrawlByID(c *gin.Context) {
	id := c.Param("id")
	
	var result models.CrawlResult
	if err := h.db.First(&result, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Crawl not found"})
		return
	}
	
	// Check if user has permission to stop this crawl
	userRole, _ := c.Get("user_role")
	if userRole != "admin" {
		userID, _ := c.Get("user_id")
		if result.UserID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to stop this crawl"})
			return
		}
	}
	
	// Update status to stopped
	if err := h.db.Model(&result).Update("status", "stopped").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stop crawl"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Crawl stopped successfully"})
}

// DeleteCrawlResult deletes a crawl result by ID
func (h *CrawlHandler) DeleteCrawlResult(c *gin.Context) {
	id := c.Param("id")
	
	var result models.CrawlResult
	if err := h.db.First(&result, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Crawl not found"})
		return
	}
	
	// Check if user has permission to delete this crawl
	userRole, _ := c.Get("user_role")
	if userRole != "admin" {
		userID, _ := c.Get("user_id")
		if result.UserID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this crawl"})
			return
		}
	}
	
	// Store crawl details before deletion
	deletedCrawl := gin.H{
		"id":    result.ID,
		"url":   result.URL,
		"title": result.Title,
	}
	
	// Delete the crawl (this will also delete related broken links due to CASCADE)
	if err := h.db.Delete(&result).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete crawl"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Crawl deleted successfully",
		"deleted_crawl": deletedCrawl,
	})
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