package models

import (
	"time"
	"gorm.io/gorm"
)


type BrokenLink struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	CrawlResultID uint           `json:"crawl_result_id" gorm:"not null;index"`
	CrawlResult   CrawlResult    `json:"crawl_result" gorm:"foreignKey:CrawlResultID"`
	URL           string         `json:"url" gorm:"type:varchar(500);not null;index:idx_url,length:255"`
	StatusCode    int            `json:"status_code" gorm:"default:0"`
	ErrorType     string         `json:"error_type" gorm:"type:varchar(100)"` // timeout, 404, 500, etc.
	ErrorMessage  string         `json:"error_message" gorm:"type:text"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
} 