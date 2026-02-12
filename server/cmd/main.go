package main

import (
	"os"

	"github.com/conmefo/myfkmusicplayer/server/internal/database"
	"github.com/conmefo/myfkmusicplayer/server/internal/http/handler"
	"github.com/conmefo/myfkmusicplayer/server/internal/http/router"
	"github.com/conmefo/myfkmusicplayer/server/internal/repo"
	"github.com/conmefo/myfkmusicplayer/server/internal/service"
	"github.com/joho/godotenv"
)

func main() {
	db := database.InitPostgresDB()
	userRepo := repo.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	r := router.SetupRouter(userHandler)

	godotenv.Load()
	port := os.Getenv("PORT")
	r.Run(":" + port)
}
