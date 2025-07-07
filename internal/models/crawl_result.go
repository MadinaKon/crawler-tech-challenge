package models

import (
	"fmt"
	"time"
	"gorm.io/gorm"
)

// CrawlStatus type and constants
// Only allow: queued, running, done, error
//
type CrawlStatus string

const (
	StatusQueued  CrawlStatus = "queued"
	StatusRunning CrawlStatus = "running"
	StatusDone    CrawlStatus = "done"
	StatusError   CrawlStatus = "error"
)

// CrawlResult represents a single crawl result
type CrawlResult struct {
	ID                uint           `json:"id" gorm:"primaryKey"`
	UserID            *uint          `json:"user_id" gorm:"index"` // Nullable for backward compatibility
	User              *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	URL               string         `json:"url" gorm:"type:varchar(500);not null;index:idx_url,length:255"` // Reduced length for index compatibility
	Title             string         `json:"title" gorm:"type:varchar(500)"`
	HTMLVersion       string         `json:"html_version" gorm:"type:varchar(10)"`
	Status            CrawlStatus    `json:"status" gorm:"type:varchar(50);not null;default:'queued';index:idx_status"`
	HeadingCounts     JSON           `json:"heading_counts" gorm:"type:json"` // Store as JSON: {"h1": 2, "h2": 5, ...}
	InternalLinks     int            `json:"internal_links" gorm:"default:0"`
	ExternalLinks     int            `json:"external_links" gorm:"default:0"`
	InaccessibleLinks int            `json:"inaccessible_links" gorm:"default:0"`
	HasLoginForm      bool           `json:"has_login_form" gorm:"default:false"`
	ErrorMessage      string         `json:"error_message" gorm:"type:text"`
    CreatedAt         time.Time      `json:"created_at" gorm:"autoCreateTime"`
    UpdatedAt         time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt         gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	
	// Relationships
	BrokenLinks []BrokenLink `json:"broken_links,omitempty" gorm:"foreignKey:CrawlResultID"`
}

// JSON is a custom type for JSON fields
type JSON []byte

// Value implements the driver.Valuer interface
func (j JSON) Value() (interface{}, error) {
	if j.IsNull() {
		return nil, nil
	}
	return string(j), nil
}

// Scan implements the sql.Scanner interface
func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	s, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into JSON", value)
	}
	*j = append((*j)[0:0], s...)
	return nil
}

// IsNull returns true if the JSON is null
func (j JSON) IsNull() bool {
	return len(j) == 0 || string(j) == "null"
}

// String returns the JSON as a string
func (j JSON) String() string {
	return string(j)
} 