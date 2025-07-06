
package handlers

import (
	"net/http"
	"strconv"
	"time"
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

// GetCrawlResults returns all crawl results
func (h *CrawlHandler) GetCrawlResults(c *gin.Context) {
	var results []models.CrawlResult
	
	// Get query parameters for filtering
	status := c.Query("status")
	limit := c.DefaultQuery("limit", "50")
	offset := c.DefaultQuery("offset", "0")
	
	query := h.db.Model(&models.CrawlResult{})
	
	// Apply status filter if provided
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	// Apply pagination
	limitInt, _ := strconv.Atoi(limit)
	offsetInt, _ := strconv.Atoi(offset)
	
	result := query.Order("created_at DESC").Limit(limitInt).Offset(offsetInt).Find(&results)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	c.JSON(http.StatusOK, results)
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
	
	// Create a new crawl result with pending status
	crawlResult := models.CrawlResult{
		URL:           request.URL,
		Status:        "pending",
	}
	
	if err := h.db.Create(&crawlResult).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, crawlResult)
}

// GetStats returns dashboard statistics
func (h *CrawlHandler) GetStats(c *gin.Context) {
	var stats struct {
		TotalCrawls     int64 `json:"total_crawls"`
		CompletedCrawls int64 `json:"completed_crawls"`
		FailedCrawls    int64 `json:"failed_crawls"`
		PendingCrawls   int64 `json:"pending_crawls"`
		TotalBrokenLinks int64 `json:"total_broken_links"`
	}
	
	// Count by status
	h.db.Model(&models.CrawlResult{}).Count(&stats.TotalCrawls)
	h.db.Model(&models.CrawlResult{}).Where("status = ?", "completed").Count(&stats.CompletedCrawls)
	h.db.Model(&models.CrawlResult{}).Where("status = ?", "failed").Count(&stats.FailedCrawls)
	h.db.Model(&models.CrawlResult{}).Where("status = ?", "pending").Count(&stats.PendingCrawls)
	h.db.Model(&models.BrokenLink{}).Count(&stats.TotalBrokenLinks)
	
	c.JSON(http.StatusOK, stats)
} 