package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"
	"webcrawler-backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
)

// JWTClaims represents the claims in a JWT token
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthMiddleware handles JWT authentication
type AuthMiddleware struct {
	db          *gorm.DB
	jwtSecret   []byte
	accessTokenExpiry  time.Duration
	refreshTokenExpiry time.Duration
}

// NewAuthMiddleware creates a new auth middleware instance
func NewAuthMiddleware(db *gorm.DB, jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		db:                 db,
		jwtSecret:          []byte(jwtSecret),
		accessTokenExpiry:  15 * time.Minute,  // 15 minutes
		refreshTokenExpiry: 7 * 24 * time.Hour, // 7 days
	}
}

// AuthRequired middleware that requires authentication
func (am *AuthMiddleware) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := am.extractToken(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		claims, err := am.validateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Check if user still exists and is active
		var user models.User
		if err := am.db.First(&user, claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User account is deactivated"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("user", user)

		c.Next()
	}
}

// RoleRequired middleware that requires specific role
func (am *AuthMiddleware) RoleRequired(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// First apply authentication
		am.AuthRequired()(c)
		if c.IsAborted() {
			return
		}

		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role information not found"})
			c.Abort()
			return
		}

		// Check if user has required role
		hasRole := false
		for _, role := range roles {
			if userRole == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// OptionalAuth middleware that doesn't require authentication but sets user info if available
func (am *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := am.extractToken(c)
		if err != nil {
			c.Next()
			return
		}

		claims, err := am.validateToken(token)
		if err != nil {
			c.Next()
			return
		}

		// Check if user still exists and is active
		var user models.User
		if err := am.db.First(&user, claims.UserID).Error; err != nil {
			c.Next()
			return
		}

		if !user.IsActive {
			c.Next()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("user", user)

		c.Next()
	}
}

// GenerateTokens generates access and refresh tokens
func (am *AuthMiddleware) GenerateTokens(user models.User) (string, string, error) {
	// Generate access token
	accessClaims := JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(am.accessTokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "webcrawler-api",
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(am.jwtSecret)
	if err != nil {
		return "", "", err
	}

	// Generate refresh token
	refreshToken := generateRandomString(32)
	refreshTokenHash, err := bcrypt.GenerateFromPassword([]byte(refreshToken), bcrypt.DefaultCost)
	if err != nil {
		return "", "", err
	}

	// Store refresh token in database
	refreshTokenModel := models.RefreshToken{
		UserID:    user.ID,
		TokenHash: string(refreshTokenHash),
		ExpiresAt: time.Now().Add(am.refreshTokenExpiry),
	}

	if err := am.db.Create(&refreshTokenModel).Error; err != nil {
		return "", "", err
	}

	return accessTokenString, refreshToken, nil
}

// ValidateRefreshToken validates a refresh token
func (am *AuthMiddleware) ValidateRefreshToken(refreshToken string, userID uint) (bool, error) {
	var token models.RefreshToken
	err := am.db.Where("user_id = ? AND is_revoked = ? AND expires_at > ?", 
		userID, false, time.Now()).First(&token).Error
	if err != nil {
		return false, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(token.TokenHash), []byte(refreshToken))
	return err == nil, err
}

// RevokeRefreshToken revokes a refresh token
func (am *AuthMiddleware) RevokeRefreshToken(refreshToken string, userID uint) error {
	var token models.RefreshToken
	err := am.db.Where("user_id = ? AND is_revoked = ?", userID, false).First(&token).Error
	if err != nil {
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(token.TokenHash), []byte(refreshToken))
	if err != nil {
		return fmt.Errorf("invalid refresh token")
	}

	return am.db.Model(&token).Update("is_revoked", true).Error
}

// extractToken extracts JWT token from Authorization header
func (am *AuthMiddleware) extractToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("authorization header required")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", fmt.Errorf("invalid authorization header format")
	}

	return parts[1], nil
}

// validateToken validates JWT token and returns claims
func (am *AuthMiddleware) validateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return am.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// generateRandomString generates a random string for refresh tokens
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
} 