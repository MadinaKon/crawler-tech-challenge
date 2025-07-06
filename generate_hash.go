package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 10)
	fmt.Printf("admin123: %s\n", string(hash))
	
	hash, _ = bcrypt.GenerateFromPassword([]byte("user123"), 10)
	fmt.Printf("user123: %s\n", string(hash))
} 