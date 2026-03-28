package database

import (
	"database/sql"
	"embed"
	"log"
	"os"
	"sort"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

func InitPostgresDB() *sql.DB {
	dsn := os.Getenv("DB_URL")
	log.Printf("db url: %s", dsn)

	var db *sql.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = sql.Open("pgx", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Connected to db")
				return db
			}
		}

		log.Println("DB not ready, retrying...")
		time.Sleep(2 * time.Second)
	}

	log.Fatalf("Failed to connect to DB: %v", err)
	return nil
}

func RunMigrations(db *sql.DB) {
	entries, err := migrationFiles.ReadDir("migrations")
	if err != nil {
		log.Fatalf("Failed to read migrations: %v", err)
	}

	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		names = append(names, entry.Name())
	}
	sort.Strings(names)

	for _, name := range names {
		query, err := migrationFiles.ReadFile("migrations/" + name)
		if err != nil {
			log.Fatalf("Failed to read migration %s: %v", name, err)
		}

		if _, err := db.Exec(string(query)); err != nil {
			log.Fatalf("Failed to run migration %s: %v", name, err)
		}
	}
}
