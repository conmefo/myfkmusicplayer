package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

func InitPostgresDB() *sql.DB {
	godotenv.Load()

	dsn := os.Getenv("DB_URL")

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("Failed to create DB handle: %v", err)
	}

	log.Println("Connected to db")
	return db
}
