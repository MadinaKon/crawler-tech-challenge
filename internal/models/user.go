package models

import (
	"time"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Email         string         `json:"email" gorm:"type:varchar(255);unique;not null;index"`
	PasswordHash  string         `json:"-" gorm:"type:varchar(255);not null"` // "-" means don't include in JSON
	Name          string         `json:"name" gorm:"type:varchar(255);not null"`
	Role          string         `json:"role" gorm:"type:enum('admin','user');default:'user';index"`
	IsActive      bool           `json:"is_active" gorm:"default:true;index"`
	EmailVerified bool           `json:"email_verified" gorm:"default:false"`
	LastLogin     *time.Time     `json:"last_login"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	
	// Relationships
	CrawlResults []CrawlResult `json:"crawl_results,omitempty" gorm:"foreignKey:UserID"`
	RefreshTokens []RefreshToken `json:"-" gorm:"foreignKey:UserID"`
	APIKeys      []APIKey       `json:"-" gorm:"foreignKey:UserID"`
}

// RefreshToken represents a JWT refresh token
type RefreshToken struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	User      User           `json:"user" gorm:"foreignKey:UserID"`
	TokenHash string         `json:"-" gorm:"type:varchar(255);not null;index"`
	ExpiresAt time.Time      `json:"expires_at"`
	IsRevoked bool           `json:"is_revoked" gorm:"default:false;index"`
	CreatedAt time.Time      `json:"created_at"`
}

// APIKey represents an API key for service-to-service authentication
type APIKey struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	User        User           `json:"user" gorm:"foreignKey:UserID"`
	Name        string         `json:"name" gorm:"type:varchar(255);not null"`
	KeyHash     string         `json:"-" gorm:"type:varchar(255);not null;index"`
	Permissions JSON           `json:"permissions" gorm:"type:json"`
	IsActive    bool           `json:"is_active" gorm:"default:true;index"`
	LastUsed    *time.Time     `json:"last_used"`
	ExpiresAt   *time.Time     `json:"expires_at" gorm:"index"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
} 